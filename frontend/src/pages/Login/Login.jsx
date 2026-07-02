import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    const data = await login(email, password)
    navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) {
    setError(err.response?.data?.message || 'Error al iniciar sesión')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-noche px-6 py-24">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-esmeralda flex items-center justify-center font-black text-noche text-lg">
            JT
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            JTool <span className="text-esmeralda">Enterprise</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
        <p className="text-white/50 text-sm mb-6">Ingresa a tu cuenta de JTool Enterprise</p>

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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white outline-none focus:border-esmeralda transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              {/* TODO: conectar flujo real de recuperación de contraseña */}
              <a href="#" className="text-xs text-white/40 hover:text-esmeralda transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
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
          ¿No tienes cuenta? <Link to="/registro" className="text-esmeralda hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

export default Login