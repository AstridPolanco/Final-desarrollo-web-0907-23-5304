import { Router } from 'express';
import { requiereSesion } from '../middlewares/auth.js';

export function equiposRoutes({ Equipo }) {
  const router = Router();
  router.get('/', requiereSesion, async (req, res) => {
    res.json(await Equipo.findAll({ order: [['codigo', 'ASC']] }));
  });
  return router;
}