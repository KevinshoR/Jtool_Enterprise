import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Building2, KeyRound, LogOut, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

/*
 * Configuración (/configuracion): la cuenta del usuario en un solo lugar.
 * - Datos personales y ROL (Super Administrador / Cliente)
 * - Empresa, plan y estado de la suscripción (solo clientes)
 * - Seguridad (cambio de contraseña por código al correo)
 * - Cerrar sesión
 */

const ROLES = {
  admin: { label: 'Super Administrador', cls: 'bg-noche text-white' },
  client: { label: 'Cliente', cls: 'bg-esmeralda/15 text-esmeralda' },
  user: { label: 'Cliente', cls: 'bg-esmeralda/15 text-esmeralda' },
}

const ESTADOS_SUB = {
  trial: { label: 'Prueba gratis', cls: 'bg-esmeralda/15 text-esmeralda' },
  active: { label: 'Activa', cls: 'bg-esmeralda/15 text-esmeralda' },
  expired: { label: 'Vencida', cls: 'bg-red-500/10 text-red-600' },
  cancelled: { label: 'Cancelada', cls: 'bg-grafito/10 text-grafito/60' },
}

function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Card({ icon: Icon, titulo, children, accion }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-esmeralda/10 text-esmeralda">
            <Icon size={17} />
          </span>
          <h2 className="font-bold text-noche">{titulo}</h2>
        </div>
        {accion}
      </div>
      {children}
    </section>
  )
}

function Configuracion() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  const esAdmin = user?.role === 'admin'
  const rol = ROLES[user?.role] || { label: user?.role || 'Usuario', cls: 'bg-grafito/10 text-grafito/60' }

  useEffect(() => {
    if (esAdmin) {
      setLoading(false)
      return
    }
    api
      .get('/me/overview')
      .then(({ data }) => setOverview(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [esAdmin])

  function cerrarSesion() {
    logout()
    navigate('/')
  }

  const sub = overview?.subscription
  const estadoSub = sub ? ESTADOS_SUB[sub.status] || ESTADOS_SUB.cancelled : null

  return (
    <main className="min-h-screen bg-neblina px-6 pt-28 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-noche">Configuración</h1>
          <p className="mt-1 text-sm text-grafito/60">Tu cuenta, tu plan y tu seguridad en un solo lugar.</p>
        </div>

        <div className="flex flex-col gap-5">
          {/* ── Tu cuenta ── */}
          <Card icon={Shield} titulo="Tu cuenta">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-noche font-black text-white text-lg">
                {iniciales(user?.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-noche">{user?.name}</p>
                <p className="truncate text-sm text-grafito/55">{user?.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${rol.cls}`}>
                {rol.label}
              </span>
            </div>
            {esAdmin && (
              <div className="mt-5 rounded-xl bg-noche px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-white/70">
                    Tienes acceso total a la plataforma: empresas, usuarios y suscripciones.
                  </p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-esmeralda px-4 py-2 text-xs font-black text-noche transition-transform hover:scale-105"
                  >
                    Ir al panel admin
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* ── Empresa y plan (solo clientes) ── */}
          {!esAdmin && (
            <Card
              icon={Building2}
              titulo="Tu empresa y plan"
              accion={
                sub?.status === 'expired' && (
                  <Link
                    to="/contacto"
                    className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
                  >
                    Renovar
                  </Link>
                )
              }
            >
              {loading ? (
                <div className="h-20 animate-pulse rounded-xl bg-grafito/8" />
              ) : overview?.company ? (
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-grafito/40">Empresa</dt>
                    <dd className="font-medium text-noche">{overview.company.name}</dd>
                  </div>
                  <div>
                    <dt className="text-grafito/40">NIT</dt>
                    <dd className="font-medium text-noche">{overview.company.nit || 'No registrado'}</dd>
                  </div>
                  <div>
                    <dt className="text-grafito/40">Plan</dt>
                    <dd className="font-medium text-noche">{sub?.plan_name || 'Sin plan'}</dd>
                  </div>
                  <div>
                    <dt className="text-grafito/40">Estado de la suscripción</dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      {estadoSub && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${estadoSub.cls}`}>
                          {estadoSub.label}
                        </span>
                      )}
                      {sub && (sub.status === 'trial' || sub.status === 'active') && (
                        <span className="text-xs text-grafito/50">
                          vence el {formatFecha(sub.current_period_end)}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-grafito/55">Todavía no has registrado tu empresa.</p>
                  <Link
                    to="/empezar"
                    className="rounded-lg bg-esmeralda px-4 py-2 text-xs font-black text-noche transition-transform hover:scale-105"
                  >
                    Registrar mi negocio
                  </Link>
                </div>
              )}
            </Card>
          )}

          {/* ── Seguridad ── */}
          <Card icon={KeyRound} titulo="Seguridad">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-noche">Contraseña</p>
                <p className="mt-0.5 text-xs text-grafito/50">
                  Te enviamos un código a tu correo para cambiarla de forma segura.
                </p>
              </div>
              <Link
                to="/recuperar"
                className="rounded-xl border border-grafito/15 px-4 py-2.5 text-xs font-bold text-noche transition-colors hover:border-esmeralda/50 hover:text-esmeralda"
              >
                Cambiar contraseña
              </Link>
            </div>
          </Card>

          {/* ── Sesión ── */}
          <Card icon={LogOut} titulo="Sesión">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-grafito/55">Cierra tu sesión en este dispositivo.</p>
              <button
                onClick={cerrarSesion}
                className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/20"
              >
                Cerrar sesión
              </button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default Configuracion