import bcrypt from 'bcrypt';

export async function sembrar({ Usuario, Equipo }) {
  if ((await Usuario.count()) > 0) return;

  const hash = (p) => bcrypt.hash(p, 10);
  await Usuario.bulkCreate([
    { nombre: 'Astrid Usuario', email: 'astrid@lab.test', passwordHash: await hash('astrid1234'), rol: 'usuario' },
    { nombre: 'Sofia Usuario', email: 'sofia@lab.test', passwordHash: await hash('sofia1234'), rol: 'usuario' },
    { nombre: 'Mario Técnica', email: 'tec@lab.test', passwordHash: await hash('tec1234'), rol: 'tecnico' },
  ]);

  await Equipo.bulkCreate([
    { codigo: 'PC-01', nombre: 'Computadora Dell', ubicacion: 'Laboratorio A' },
    { codigo: 'PC-02', nombre: 'Computadora HP', ubicacion: 'Laboratorio A' },
    { codigo: 'PRY-01', nombre: 'Proyector Epson', ubicacion: 'Laboratorio B' },
    { codigo: 'SW-01', nombre: 'Switch de red', ubicacion: 'Cuarto de redes' },
  ]);
}
