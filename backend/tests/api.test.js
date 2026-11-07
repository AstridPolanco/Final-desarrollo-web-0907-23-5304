import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearBd } from '../src/db.js';
import { sembrar } from '../src/seed.js';
import { crearApp } from '../src/app.js';

let servidor, base, bd;

before(async () => {
  bd = crearBd(':memory:');
  await bd.sequelize.sync();
  await sembrar(bd);
  servidor = crearApp(bd, { secreto: 'secreto-de-prueba' }).listen(0, '127.0.0.1');
  await new Promise((r) => servidor.on('listening', r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  servidor.close();
  await bd.sequelize.close();
});

// Inicia sesión y devuelve la cookie para reenviarla en las siguientes peticiones.
async function login(email, password) {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get('set-cookie')?.split(';')[0];
  return { res, cookie };
}

const api = (cookie) => (ruta, opciones = {}) =>
  fetch(`${base}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
  });

describe('Login y sesión', () => {
  it('credenciales correctas → 200, rol y cookie httpOnly', async () => {
    const { res, cookie } = await login('ana@lab.test', 'ana1234');
    assert.equal(res.status, 200);
    assert.equal((await res.json()).rol, 'usuario');
    assert.ok(cookie, 'debe enviar la cookie de sesión');
    assert.match(res.headers.get('set-cookie'), /HttpOnly/i);
  });

  it('contraseña incorrecta → 401', async () => {
    const { res } = await login('ana@lab.test', 'mala');
    assert.equal(res.status, 401);
  });

  it('/auth/me devuelve el rol de la sesión', async () => {
    const { cookie } = await login('tecnico@lab.test', 'tec1234');
    const res = await api(cookie)('/auth/me');
    assert.equal((await res.json()).rol, 'tecnico');
  });

  it('sin cookie no se puede listar equipos → 401', async () => {
    const res = await api()('/equipos');
    assert.equal(res.status, 401);
  });

  it('logout destruye la sesión', async () => {
    const { cookie } = await login('ana@lab.test', 'ana1234');
    await api(cookie)('/auth/logout', { method: 'POST' });
    assert.equal((await api(cookie)('/auth/me')).status, 401);
  });
});

describe('Equipos e incidencias', () => {
  it('lista equipos con sesión', async () => {
    const { cookie } = await login('ana@lab.test', 'ana1234');
    const res = await api(cookie)('/equipos');
    assert.equal(res.status, 200);
    assert.ok((await res.json()).length >= 1);
  });

  it('validación: descripción vacía → 400', async () => {
    const { cookie } = await login('ana@lab.test', 'ana1234');
    const res = await api(cookie)('/incidencias', {
      method: 'POST',
      body: JSON.stringify({ equipoId: 1, descripcion: '   ' }),
    });
    assert.equal(res.status, 400);
  });

  it('crea una incidencia asociada al usuario de la sesión → 201', async () => {
    const { cookie } = await login('ana@lab.test', 'ana1234');
    const res = await api(cookie)('/incidencias', {
      method: 'POST',
      // Aunque intente mandar otro usuarioId, se ignora: manda la sesión.
      body: JSON.stringify({ equipoId: 1, descripcion: 'No enciende', usuarioId: 99 }),
    });
    assert.equal(res.status, 201);
    const inc = await res.json();
    assert.equal(inc.estado, 'abierta');
    assert.equal(inc.registradaPor.nombre, 'Ana Usuario');
  });
});

describe('Regla de cierre (verificada en el backend)', () => {
  async function crearComoAna(descripcion) {
    const { cookie } = await login('ana@lab.test', 'ana1234');
    const res = await api(cookie)('/incidencias', {
      method: 'POST',
      body: JSON.stringify({ equipoId: 2, descripcion }),
    });
    return res.json();
  }

  it('sin sesión → 401', async () => {
    const inc = await crearComoAna('Pantalla rota');
    const res = await api()(`/incidencias/${inc.id}/cerrar`, { method: 'PATCH' });
    assert.equal(res.status, 401);
  });

  it('otro usuario (no técnico) → 403 y la incidencia sigue abierta', async () => {
    const inc = await crearComoAna('Teclado sin teclas');
    const { cookie } = await login('luis@lab.test', 'luis1234');
    const res = await api(cookie)(`/incidencias/${inc.id}/cerrar`, { method: 'PATCH' });
    assert.equal(res.status, 403);
    assert.equal((await bd.Incidencia.findByPk(inc.id)).estado, 'abierta');
  });

  it('quien la registró puede cerrarla → 200', async () => {
    const inc = await crearComoAna('Mouse dañado');
    const { cookie } = await login('ana@lab.test', 'ana1234');
    const res = await api(cookie)(`/incidencias/${inc.id}/cerrar`, { method: 'PATCH' });
    assert.equal(res.status, 200);
    const cerrada = await res.json();
    assert.equal(cerrada.estado, 'cerrada');
    assert.equal(cerrada.cerradaPor.nombre, 'Ana Usuario');
  });

  it('un técnico puede cerrar la de otro → 200', async () => {
    const inc = await crearComoAna('Sin internet');
    const { cookie } = await login('tecnico@lab.test', 'tec1234');
    const res = await api(cookie)(`/incidencias/${inc.id}/cerrar`, { method: 'PATCH' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).cerradaPor.nombre, 'Tania Técnica');
  });

  it('cerrar dos veces → 409', async () => {
    const inc = await crearComoAna('Ruido en ventilador');
    const { cookie } = await login('ana@lab.test', 'ana1234');
    await api(cookie)(`/incidencias/${inc.id}/cerrar`, { method: 'PATCH' });
    const res = await api(cookie)(`/incidencias/${inc.id}/cerrar`, { method: 'PATCH' });
    assert.equal(res.status, 409);
  });

  it('id inexistente → 404', async () => {
    const { cookie } = await login('tecnico@lab.test', 'tec1234');
    const res = await api(cookie)('/incidencias/9999/cerrar', { method: 'PATCH' });
    assert.equal(res.status, 404);
  });
});

describe('Configuración', () => {
  it('crearApp sin SESSION_SECRET lanza error (no hay secreto por defecto)', () => {
    assert.throws(() => crearApp(bd, { secreto: undefined }), /SESSION_SECRET/);
  });
});