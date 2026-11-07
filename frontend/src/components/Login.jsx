import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await onLogin(email, password)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="tarjeta login" onSubmit={manejarEnvio}>
      <h2>Iniciar sesión</h2>
      <label htmlFor="email">Correo</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
    </form>
  )
}

export default Login