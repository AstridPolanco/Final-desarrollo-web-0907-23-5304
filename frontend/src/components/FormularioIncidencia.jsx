import { useState } from 'react'

function FormularioIncidencia({ equipos, onCrear }) {
  const [equipoId, setEquipoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState(null)

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError(null)
    try {
      await onCrear(Number(equipoId), descripcion)
      setEquipoId('')
      setDescripcion('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form className="tarjeta" onSubmit={manejarEnvio}>
      <h2>Registrar incidencia</h2>
      <label htmlFor="equipo">Equipo</label>
      <select
        id="equipo"
        value={equipoId}
        onChange={(e) => setEquipoId(e.target.value)}
        required
      >
        <option value="">Selecciona un equipo…</option>
        {equipos.map((eq) => (
          <option key={eq.id} value={eq.id}>
            {eq.codigo} — {eq.nombre}
          </option>
        ))}
      </select>
      <label htmlFor="descripcion">Descripción</label>
      <textarea
        id="descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button>Registrar</button>
    </form>
  )
}

export default FormularioIncidencia