
async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    credentials: 'same-origin',
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
  })

  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const mensaje = datos.error ?? datos.errores?.join('. ') ?? `Error ${respuesta.status}`
    const error = new Error(mensaje)
    error.status = respuesta.status
    throw error
  }
  return datos
}

export const login = (email, password) =>
  pedir('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const logout = () => pedir('/auth/logout', { method: 'POST' })

export const obtenerSesion = () => pedir('/auth/me')

export const listarEquipos = () => pedir('/equipos')

export const listarIncidencias = () => pedir('/incidencias')

export const crearIncidencia = (equipoId, descripcion) =>
  pedir('/incidencias', {
    method: 'POST',
    body: JSON.stringify({ equipoId, descripcion }),
  })

export const cerrarIncidencia = (id) =>
  pedir(`/incidencias/${id}/cerrar`, { method: 'PATCH' })