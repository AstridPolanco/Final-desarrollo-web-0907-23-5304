import { Router } from 'express';
import bcrypt from 'bcrypt';
import { body } from 'express-validator';
import { revisarErrores } from '../middlewares/errores.js';

export function authRoutes({ Usuario }) {
  const router = Router();

  router.post(
    '/login',
    body('email').trim().isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    revisarErrores,
    async (req, res) => {
      const usuario = await Usuario.findOne({ where: { email: req.body.email } });
      const ok = usuario && (await bcrypt.compare(req.body.password, usuario.passwordHash));
      // Mismo mensaje para email o clave incorrectos: no revelamos cuál falló.
      if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

      req.session.regenerate((err) => {
        if (err) return res.status(500).json({ error: 'No se pudo iniciar sesión' });
        req.session.usuarioId = usuario.id;
        req.session.rol = usuario.rol; // la sesión distingue el rol
        res.json({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol });
      });
    },
  );

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(204).end();
    });
  });

  router.get('/me', async (req, res) => {
    if (!req.session?.usuarioId) return res.status(401).json({ error: 'Sin sesión' });
    const u = await Usuario.findByPk(req.session.usuarioId);
    if (!u) return res.status(401).json({ error: 'Sin sesión' });
    res.json({ id: u.id, nombre: u.nombre, rol: u.rol });
  });

  return router;
}