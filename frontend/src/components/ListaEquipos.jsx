function ListaEquipos({ equipos }) {
  if (equipos.length === 0) return <p>No hay equipos registrados</p>

  return (
    <ul className="lista">
      {equipos.map((eq) => (
        <li key={eq.id}>
          <strong>{eq.codigo}</strong> — {eq.nombre}
          <span className="detalle">{eq.ubicacion}</span>
        </li>
      ))}
    </ul>
  )
}

export default ListaEquipos
