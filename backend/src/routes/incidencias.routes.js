import { Router } from 'express';
import { body } from 'express-validator';
import { requiereSesion } from '../middlewares/auth.js';
import { revisarErrores } from '../middlewares/errores.js';

export function incidenciasRoutes({ Incidencia, Equipo, Usuario }) {
  const router = Router();
  router.use(requiereSesion);

  const incluir = [
    { model: Equipo, attributes: ['id', 'codigo', 'nombre'] },
    { model: Usuario, as: 'registradaPor', attributes: ['id', 'nombre'] },
    { model: Usuario, as: 'cerradaPor', attributes: ['id', 'nombre'] },
  ];

  router.get('/', async (req, res) => {
    res.json(await Incidencia.findAll({ include: incluir, order: [['id', 'DESC']] }));
  });

  router.post(
    '/',
    body('equipoId').isInt({ min: 1 }).withMessage('Selecciona un equipo').toInt(),
    body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria'),
    revisarErrores,
    async (req, res) => {
      const equipo = await Equipo.findByPk(req.body.equipoId);
      if (!equipo) return res.status(400).json({ errores: ['El equipo no existe'] });

      // El usuario sale de la SESIÓN, nunca del cuerpo de la petición.
      const nueva = await Incidencia.create({
        equipoId: equipo.id,
        descripcion: req.body.descripcion,
        usuarioId: req.session.usuarioId,
      });
      res.status(201).json(await Incidencia.findByPk(nueva.id, { include: incluir }));
    },
  );

  // REGLA DE NEGOCIO: solo cierra quien la registró o un técnico.
  router.patch('/:id/cerrar', async (req, res) => {
    const incidencia = await Incidencia.findByPk(req.params.id);
    if (!incidencia) return res.status(404).json({ error: 'No se encontró la incidencia' });

    const esDuenio = incidencia.usuarioId === req.session.usuarioId;
    const esTecnico = req.session.rol === 'tecnico';
    if (!esDuenio && !esTecnico) {
      return res.status(403).json({ error: 'No tienes permiso para cerrar esta incidencia' });
    }
    if (incidencia.estado === 'cerrada') {
      return res.status(409).json({ error: 'La incidencia ya está cerrada' });
    }

    incidencia.estado = 'cerrada';
    incidencia.cerradaPorId = req.session.usuarioId;
    incidencia.cerradaEn = new Date();
    await incidencia.save();
    res.json(await Incidencia.findByPk(incidencia.id, { include: incluir }));
  });

  return router;
}