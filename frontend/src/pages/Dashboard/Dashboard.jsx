import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

/*
 * Dashboard del cliente: consume GET /api/me/overview.
 * - Sin empresa → redirige al onboarding (/empezar).
 * - Muestra la suscripción real (trial con días restantes, activa,
 *   vencida o cancelada) y los productos con su acceso verdadero.
 */

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function BannerSuscripcion({ sub }) {
  if (!sub) return null

  if (sub.status === 'trial') {
    const urgente = sub.days_left <= 3
    return (
      <div
        className={`mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${
          urgente ? 'border-red-500/30 bg-red-500/5' : 'border-esmeralda/30 bg-esmeralda/5'
        }`}
      >
        <p className="text-sm text-noche">
          🎁 Estás en tu <strong>prueba gratis</strong> del plan {sub.plan_name} —{' '}
          <strong className={urgente ? 'text-red-600' : 'text-esmeralda'}>
            {sub.days_left === 0
              ? 'vence hoy'
              : `${sub.days_left} ${sub.days_left === 1 ? 'día restante' : 'días restantes'}`}
          </strong>
        </p>
        <Link
          to="/contacto"
          className="rounded-xl bg-noche px-4 py-2 text-xs font-bold text-white transition-all hover:bg-profundo"
        >
          Activar mi plan
        </Link>
      </div>
    )
  }

  if (sub.status === 'active') {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-5 py-4">
        <p className="text-sm text-grafito/70">
          Plan <strong className="text-noche">{sub.plan_name}</strong> activo · se renueva el{' '}
          <strong className="text-noche">{formatFecha(sub.current_period_end)}</strong>
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-esmeralda/10 px-3 py-1 text-[11px] font-bold text-esmeralda">
          <span className="h-1.5 w-1.5 rounded-full bg-esmeralda" />
          AL DÍA
        </span>
      </div>
    )
  }

  if (sub.status === 'expired') {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4">
        <p className="text-sm text-noche">
          ⚠️ Tu suscripción del plan {sub.plan_name} <strong className="text-red-600">venció</strong> — tus
          programas están pausados, pero tus datos siguen a salvo.
        </p>
        <Link
          to="/contacto"
          className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700"
        >
          Renovar ahora
        </Link>
      </div>
    )
  }

  // cancelled (aún dentro del período pagado)
  return (
    <div className="mb-8 rounded-2xl border border-grafito/15 bg-white px-5 py-4">
      <p className="text-sm text-grafito/70">
        Tu suscripción está <strong className="text-noche">cancelada</strong>. Conservas el acceso hasta el{' '}
        <strong className="text-noche">{formatFecha(sub.current_period_end)}</strong>. Si cambias de
        opinión,{' '}
        <Link to="/contacto" className="font-bold text-esmeralda hover:underline">
          escríbenos
        </Link>
        .
      </p>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/me/overview')
      .then(({ data }) => setData(data))
      .catch(() => setError('No pudimos cargar tu información. Refresca la página.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neblina pt-28 px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-grafito/10" />
          <div className="mt-8 h-16 animate-pulse rounded-2xl bg-grafito/10" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-grafito/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* Usuario sin empresa → al onboarding */
  if (!error && data && !data.company) {
    return <Navigate to="/empezar" replace />
  }

  const sub = data?.subscription

  return (
    <div className="min-h-screen bg-neblina pt-28 px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-noche">Hola, {user?.name} 👋</h1>
          <p className="text-grafito/60 text-sm mt-1">
            Panel de <strong className="text-noche">{data?.company?.name}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <BannerSuscripcion sub={sub} />

        {/* Programas */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.products || []).map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md ${
                p.has_access ? 'border-esmeralda/25 bg-white' : 'border-black/5 bg-white opacity-80'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-noche">{p.name}</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    p.has_access ? 'bg-esmeralda/15 text-esmeralda' : 'bg-grafito/10 text-grafito/50'
                  }`}
                >
                  {p.has_access ? 'Incluido' : 'No incluido'}
                </span>
              </div>
              <p className="text-sm text-grafito/60">{p.tagline || p.description}</p>

              {p.has_access ? (
                <Link
                  to={`/productos/${p.code}`}
                  className="mt-5 block w-full rounded-xl bg-noche px-4 py-2.5 text-center text-sm font-bold text-white transition-all duration-300 hover:bg-profundo"
                >
                  Abrir programa
                </Link>
              ) : (
                <Link
                  to="/contacto"
                  className="mt-5 block w-full rounded-xl border border-grafito/15 px-4 py-2.5 text-center text-sm font-bold text-grafito/50 transition-colors hover:border-esmeralda/40 hover:text-noche"
                >
                  Agregar a mi plan
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Datos de la cuenta */}
        <div className="mt-10 rounded-2xl bg-white border border-black/5 p-6">
          <h3 className="font-bold text-noche mb-3">Datos de tu cuenta</h3>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-grafito/40">Nombre</dt>
              <dd className="font-medium text-noche">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-grafito/40">Correo</dt>
              <dd className="font-medium text-noche">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-grafito/40">Empresa</dt>
              <dd className="font-medium text-noche">{data?.company?.name}</dd>
            </div>
            <div>
              <dt className="text-grafito/40">Plan</dt>
              <dd className="font-medium text-noche">{sub?.plan_name || 'Sin plan'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Dashboard