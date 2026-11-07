# Incidencias del laboratorio

Aplicación web para registrar incidencias técnicas de los equipos de un laboratorio.

**Stack:** Node.js + Express + Sequelize (SQLite) en el backend, React + Vite en el frontend,
sesión mediante cookie (`express-session`).

## Funcionalidades

- Login con sesión en cookie y dos roles: `usuario` y `tecnico`.
- Listado de equipos.
- Formulario para registrar una incidencia (equipo y descripción).
- Regla de negocio: una incidencia solo la cierra quien la registró o un técnico.
  Se verifica en el backend (`PATCH /incidencias/:id/cerrar`), no solo en la interfaz.

## Cómo ejecutarlo

Necesitas Node.js 20 o superior. Abre **dos terminales**.

### 1. Backend

```
cd backend
npm install
```

Crea el archivo `backend/.env` a partir de `backend/.env.example`:

```
PORT=3000
SESSION_SECRET=escribe_una_cadena_larga_y_aleatoria
DB_STORAGE=./data/lab.sqlite
```

Luego:

```
npm run dev
```

Debe imprimir `API en http://localhost:3000`. Al primer arranque se crean la base de datos
y los datos de prueba.

### 2. Frontend

```
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| usuario | astrid@lab.test | astrid1234 |
| usuario | sofia@lab.test | sofia1234 |
| tecnico | tec@lab.test | tec1234 |

Para probar la regla de cierre: entra como Astrid, registra una incidencia, cierra sesión y
entra como Sofia (no debería poder cerrarla); luego entra como el técnico (sí puede).

## Pruebas

```
cd backend
npm test
```

## Estructura

```
backend/    API (rutas, middlewares, modelos, seed, pruebas)
frontend/   Interfaz en React
decisiones.md   Decisiones del proyecto
prompts.md      Prompts utilizados
```

## Notas

- Base de datos SQLite: no requiere instalar ningún servidor.
- `secure: false` en la cookie es solo para desarrollo; en producción se usaría HTTPS.
