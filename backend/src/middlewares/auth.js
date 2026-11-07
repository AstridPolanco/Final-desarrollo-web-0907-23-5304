export function requiereSesion(req, res, next) {
  if (!req.session?.usuarioId) {
    return res.status(401).json({ error: 'Se debe iniciar sesión' });
  }
  next();
}
