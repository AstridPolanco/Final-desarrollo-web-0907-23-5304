import { validationResult } from 'express-validator';

export function revisarErrores(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array().map((e) => e.msg) });
  }
  next();
}

export function manejadorErrores(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
}