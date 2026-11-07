import { useCallback, useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import ListaEquipos from './components/ListaEquipos.jsx'
import FormularioIncidencia from './components/FormularioIncidencia.jsx'
import ListaIncidencias from './components/ListaIncidencia.jsx'
import * as api from './services/api.js'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)
  const [equipos, setEquipos] = useState([])
  const [incidencias, setIncidencias] = useState([])
  const [error, setError] = useState(null)

  // Al abrir la app: ¿ya hay una sesión (cookie) activa?
  useEffect(() => {
    api
      .obtenerSesion()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false))
  }, [])

  const cargarDatos = useCallback(async () => {
    try {
      const [eqs, incs] = await Promise.all([api.listarEquipos(), api.listarIncidencias()])
      setEquipos(eqs)
      setIncidencias(incs)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (usuario) cargarDatos()
  }, [usuario, cargarDatos])

  async function iniciarSesion(email, password) {
    setUsuario(await api.login(email, password))
  }

  async function cerrarSesion() {
    await api.logout()
    setUsuario(null)
    setEquipos([])
    setIncidencias([])
  }

  async function crear(equipoId, descripcion) {
    const nueva = await api.crearIncidencia(equipoId, descripcion)
    setIncidencias([nueva, ...incidencias])
  }

  async function cerrar(id) {
    try {
      const cerrada = await api.cerrarIncidencia(id)
      setIncidencias(incidencias.map((i) => (i.id === id ? cerrada : i)))
      setError(null)
    } catch (e) {
      setError(e.message) // por ejemplo, el 403 del backend
    }
  }

  if (verificando) return <p className="centrado">Cargando…</p>

  if (!usuario) {
    return (
      <main>
        <h1>Incidencias del laboratorio</h1>
        <Login onLogin={iniciarSesion} />
      </main>
    )
  }

  return (
    <main>
      <header>
        <h1>Incidencias del laboratorio</h1>
        <div>
          <span>
            {usuario.nombre} · <em>{usuario.rol}</em>
          </span>
          <button onClick={cerrarSesion}>Salir</button>
        </div>
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <section>
        <FormularioIncidencia equipos={equipos} onCrear={crear} />
      </section>
      <section>
        <h2>Incidencias</h2>
        <ListaIncidencias incidencias={incidencias} usuario={usuario} onCerrar={cerrar} />
      </section>
      <section>
        <h2>Equipos</h2>
        <ListaEquipos equipos={equipos} />
      </section>
    </main>
  )
}

export default App