import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import api from '../../services/api'
import GoogleButton from '../../components/GoogleButton'

const rules = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Un número', test: (p) => /[0-9]/.test(p) },
  { label: 'Un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function Registro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isPasswordValid = rules.every((rule) => rule.test(password))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isPasswordValid) {
      setError('Tu contraseña no cumple todos los requisitos')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noche px-6 py-24">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
        <p className="text-white/50 text-sm mb-6">Regístrate en JTool Enterprise</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/70 mb-1 block">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-esmeralda transition-colors"
              placeholder="Tu nombre"
            />
          </div>

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
                placeholder="Crea una contraseña segura"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-esmeralda transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {rules.map((rule) => {
                  const passed = rule.test(password)
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passed ? 'text-esmeralda' : 'text-white/40'
                      }`}
                    >
                      {passed ? <Check size={14} /> : <X size={14} />}
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="mt-2 rounded-xl bg-esmeralda px-5 py-3 text-sm font-bold text-noche transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <GoogleButton />

        <p className="text-white/40 text-xs mt-6 text-center">
          ¿Ya tienes cuenta? <Link to="/login" className="text-esmeralda hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default Registro