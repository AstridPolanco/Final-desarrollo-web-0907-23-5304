
export function puedeCerrar(incidencia, usuario) {
  if (incidencia.estado !== 'abierta') return false
  return usuario.rol === 'tecnico' || incidencia.registradaPor?.id === usuario.id
}

function ListaIncidencias({ incidencias, usuario, onCerrar }) {
  if (incidencias.length === 0) return <p>No hay incidencias registradas</p>

  return (
    <ul className="lista">
      {incidencias.map((inc) => (
        <li key={inc.id}>
          <div>
            <strong>{inc.equipo?.codigo}</strong> — {inc.descripcion}
            <span className="detalle">
              Registrada por {inc.registradaPor?.nombre}
              {inc.estado === 'cerrada' && ` · Cerrada por ${inc.cerradaPor?.nombre}`}
            </span>
          </div>
          <div className="acciones">
            <span className={`estado ${inc.estado}`}>{inc.estado}</span>
            {puedeCerrar(inc, usuario) && (
              <button onClick={() => onCerrar(inc.id)}>Cerrar</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListaIncidencias