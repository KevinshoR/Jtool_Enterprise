import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

/*
 * Recuperación de contraseña en 2 pasos:
 *  1. El usuario ingresa su correo → se envía un código de 6 dígitos.
 *  2. Ingresa el código + su nueva contraseña.
 */
function RecuperarPassword() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function enviarCodigo(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setInfo(data.message)
      setPaso(2)
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos enviar el código. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function cambiarPassword(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', { email, code, newPassword })
      setInfo(data.message)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos cambiar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-xl bg-neblina border border-grafito/10 px-4 py-3 text-grafito outline-none transition-colors focus:border-esmeralda'

  return (
    <main className="min-h-screen bg-noche flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-esmeralda font-black text-noche text-lg">
            JT
          </div>
          <p className="font-bold text-white text-lg">JTool Enterprise</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h1 className="text-xl font-black text-noche">
            {paso === 1 ? 'Recupera tu contraseña' : 'Revisa tu correo'}
          </h1>
          <p className="mt-1.5 text-sm text-grafito/55">
            {paso === 1
              ? 'Te enviaremos un código de 6 dígitos a tu correo registrado.'
              : `Enviamos un código a ${email}. Vence en 15 minutos.`}
          </p>

          {info && paso === 2 && (
            <div className="mt-4 rounded-xl bg-esmeralda/10 border border-esmeralda/30 px-4 py-3 text-xs text-noche">
              {info}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {paso === 1 ? (
            <form onSubmit={enviarCodigo} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-grafito/70">Correo electrónico</label>
                <input
                  type="email"
                  required
                  className={inputCls}
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-xl bg-esmeralda px-5 py-3 text-sm font-black text-noche transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          ) : (
            <form onSubmit={cambiarPassword} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-grafito/70">Código de 6 dígitos</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className={`${inputCls} text-center font-mono text-xl tracking-[0.5em]`}
                  placeholder="······"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-grafito/70">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  className={inputCls}
                  placeholder="Mínimo 8 caracteres, mayúscula, número y símbolo"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="mt-1 rounded-xl bg-esmeralda px-5 py-3 text-sm font-black text-noche transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaso(1)
                  setError('')
                  setInfo('')
                }}
                className="text-xs font-semibold text-grafito/50 hover:text-noche transition-colors"
              >
                ¿No te llegó? Revisa spam o solicita otro código
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          <Link to="/login" className="text-esmeralda hover:underline">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RecuperarPassword