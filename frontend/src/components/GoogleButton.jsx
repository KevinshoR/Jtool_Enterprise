import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
 * GoogleButton — "Continuar con Google" para Login y Registro.
 *
 * Usa Google Identity Services (GIS). Requiere en frontend/.env:
 *   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
 *
 * Flujo: Google entrega un credential → lo mandamos a POST /auth/google →
 * el backend lo verifica con Google, crea la cuenta si no existe y devuelve
 * nuestro JWT. Después redirige según el rol (admin → /admin, resto → /dashboard).
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

/* Carga el script de Google una sola vez, compartido entre instancias */
let gsiPromise = null
function loadGsi() {
  if (gsiPromise) return gsiPromise
  gsiPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In'))
    document.head.appendChild(script)
  })
  return gsiPromise
}

function GoogleButton() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const buttonRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!CLIENT_ID) {
      setError('Google Sign-In no está configurado')
      return
    }

    let cancelled = false

    loadGsi()
      .then(() => {
        if (cancelled || !buttonRef.current) return

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              setError('')
              const data = await loginWithGoogle(credential)
              navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
            } catch (err) {
              setError(
                err?.response?.data?.message || 'No pudimos iniciar sesión con Google. Intenta de nuevo.'
              )
            }
          },
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          locale: 'es',
          width: 320,
        })
      })
      .catch(() => setError('No se pudo cargar Google Sign-In'))

    return () => {
      cancelled = true
    }
  }, [loginWithGoogle, navigate])

  if (!CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Divisor "o" */}
      <div className="my-4 flex w-full items-center gap-3">
        <span className="h-px flex-1 bg-grafito/10" />
        <span className="text-xs font-semibold text-grafito/40">o</span>
        <span className="h-px flex-1 bg-grafito/10" />
      </div>

      <div ref={buttonRef} className="flex justify-center" />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default GoogleButton