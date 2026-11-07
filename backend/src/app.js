import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import { authRoutes } from './routes/auth.routes.js';
import { equiposRoutes } from './routes/equipos.routes.js';
import { incidenciasRoutes } from './routes/incidencias.routes.js';
import { manejadorErrores } from './middlewares/errores.js';


export function crearApp(bd, { secreto = config.sessionSecret } = {}) {
  if (!secreto) throw new Error('Falta SESSION_SECRET');
  const app = express();
  app.use(express.json());

  app.use(
    session({
      secret: secreto,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true, // JavaScript del navegador no puede leer la cookie
        sameSite: 'lax',
        secure: false, // true en producción con HTTPS
        maxAge: 1000 * 60 * 60,
      },
    }),
  );

  app.use('/auth', authRoutes(bd));
  app.use('/equipos', equiposRoutes(bd));
  app.use('/incidencias', incidenciasRoutes(bd));
  app.use(manejadorErrores);
  return app;
}