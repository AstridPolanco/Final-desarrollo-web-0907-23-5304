import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';
import { crearBd } from './db.js';
import { sembrar } from './seed.js';
import { crearApp } from './app.js';

if (config.dbStorage !== ':memory:') mkdirSync(dirname(config.dbStorage), { recursive: true });

const bd = crearBd(config.dbStorage);
await bd.sequelize.sync();
await sembrar(bd);

crearApp(bd).listen(config.puerto, () =>
  console.log(`API en http://localhost:${config.puerto}`),
);