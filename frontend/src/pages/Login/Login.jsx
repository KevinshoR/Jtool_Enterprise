import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noche px-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
        <p className="text-white/50 text-sm mb-6">Accede a tu cuenta de JTool Enterprise</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/70 mb-1 block">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-esmeralda transition-colors"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-esmeralda transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-esmeralda px-5 py-3 text-sm font-bold text-noche transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-white/40 text-xs mt-6 text-center">
          ¿No tienes cuenta? <Link to="/contacto" className="text-esmeralda hover:underline">Contáctanos</Link>
        </p>
      </div>
    </div>
  )
}

export default Login