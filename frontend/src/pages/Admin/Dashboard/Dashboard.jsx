import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  Zap,
  Package,
  Plus,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import { adminService } from '../../../services/adminService'
import { useAuth } from '../../../context/AuthContext'

/* ────────────────────────────────────────────
   Utilidades
──────────────────────────────────────────── */

function saludoPorHora() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function fechaLarga() {
  const f = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return f.charAt(0).toUpperCase() + f.slice(1)
}

function fechaCorta(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

const avatarPalette = [
  'bg-esmeralda/15 text-esmeralda',
  'bg-naranja/15 text-naranja',
  'bg-profundo/15 text-profundo',
]

function avatarColor(nombre = '') {
  let acc = 0
  for (const c of nombre) acc += c.charCodeAt(0)
  return avatarPalette[acc % avatarPalette.length]
}

const statusStyles = {
  active: { label: 'Activa', cls: 'bg-esmeralda/15 text-esmeralda' },
  trial: { label: 'Prueba', cls: 'bg-naranja/15 text-naranja' },
  inactive: { label: 'Inactiva', cls: 'bg-grafito/10 text-grafito/50' },
}

const roleStyles = {
  admin: { label: 'Admin', cls: 'bg-noche text-white' },
  client: { label: 'Cliente', cls: 'bg-esmeralda/15 text-esmeralda' },
}

/* ────────────────────────────────────────────
   Count-up animado (respeta reduced motion)
──────────────────────────────────────────── */

function CountUp({ value = 0 }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || value === 0) {
      setDisplay(value)
      return
    }
    const duration = 1100
    const start = performance.now()
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * value))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value])

  return <>{display.toLocaleString('es-CO')}</>
}

/* ────────────────────────────────────────────
   Tarjeta de métrica (vidrio, sobre panel noche)
──────────────────────────────────────────── */

function StatGlass({ icon: Icon, label, value, hint, delay = 0 }) {
  return (
    <div
      className="deck-item group rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm p-5 transition-all duration-300 hover:bg-white/[0.1] hover:border-esmeralda/40 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {label}
        </p>
        <div className="rounded-lg bg-esmeralda/10 p-2 text-esmeralda transition-transform duration-300 group-hover:scale-110">
          <Icon size={15} />
        </div>
      </div>
      <p className="mt-3 text-4xl font-black tracking-tight text-white tabular-nums">
        <CountUp value={value} />
      </p>
      {hint && <p className="mt-1.5 text-xs text-white/35">{hint}</p>}
    </div>
  )
}

/* ────────────────────────────────────────────
   Skeletons de carga
──────────────────────────────────────────── */

function SkeletonBar({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} rounded-lg bg-grafito/8 animate-pulse`} />
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-10 w-10 rounded-xl bg-grafito/8 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonBar w="w-2/5" />
        <SkeletonBar w="w-1/4" h="h-3" />
      </div>
      <SkeletonBar w="w-16" h="h-6" />
    </div>
  )
}

/* ────────────────────────────────────────────
   Dashboard
──────────────────────────────────────────── */

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const firstName = user?.name?.split(' ')[0]

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const [s, c, u] = await Promise.all([
        adminService.getStats(),
        adminService.getCompanies(),
        adminService.getUsers(),
      ])
      setStats(s)
      setCompanies(c)
      setUsers(u)
    } catch {
      setError('No se pudieron cargar los datos del panel. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const empresasRecientes = companies.slice(0, 5)
  const usuariosRecientes = users.slice(0, 6)

  return (
    <div className="mx-auto max-w-6xl">
      {/* Animaciones locales del panel */}
      <style>{`
        @keyframes deck-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .deck-item { animation: deck-in .55s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .deck-item { animation: none; }
        }
      `}</style>

      {/* ── Panel de comando (hero oscuro) ── */}
      <section className="deck-item relative overflow-hidden rounded-3xl bg-noche p-8 shadow-2xl shadow-noche/20">
        {/* Glow ambiental */}
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #00C896 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 h-72 w-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1A3F5C 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-esmeralda shadow-[0_0_8px_#00C896] animate-pulse" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-esmeralda">
                Centro de comando
              </p>
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
              {saludoPorHora()}, {firstName} 👋
            </h1>
            <p className="mt-1.5 text-sm text-white/50">{fechaLarga()} · Así va JTool Enterprise</p>
          </div>

          <button
            onClick={() => load(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.07] border border-white/10 px-4 py-2.5 text-xs font-bold text-white/70 transition-all duration-300 hover:bg-white/[0.12] hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="relative mt-6 rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Métricas */}
        <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[132px] rounded-2xl bg-white/[0.05] border border-white/10 animate-pulse" />
            ))
          ) : (
            <>
              <StatGlass
                icon={Users}
                label="Usuarios"
                value={stats?.totalUsers ?? 0}
                delay={80}
              />
              <StatGlass
                icon={Building2}
                label="Empresas"
                value={stats?.totalCompanies ?? 0}
                hint={stats?.totalCompanies === 0 ? 'Registra la primera en Clientes' : null}
                delay={160}
              />
              <StatGlass
                icon={Zap}
                label="Suscripciones activas"
                value={stats?.activeSubscriptions ?? 0}
                hint={stats?.activeSubscriptions === 0 ? 'Asigna un programa a una empresa' : null}
                delay={240}
              />
              <StatGlass
                icon={Package}
                label="Programas"
                value={stats?.totalProducts ?? 0}
                delay={320}
              />
            </>
          )}
        </div>
      </section>

      {/* ── Cuerpo: empresas + columna lateral ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Empresas recientes */}
        <section
          className="deck-item rounded-3xl bg-white border border-black/5 shadow-sm"
          style={{ animationDelay: '180ms' }}
        >
          <div className="flex items-center justify-between px-7 pt-6 pb-2">
            <div>
              <h2 className="font-display text-lg font-bold text-noche">Empresas recientes</h2>
              <p className="text-xs text-grafito/45 mt-0.5">Últimos clientes registrados y sus programas</p>
            </div>
            <Link
              to="/admin/clientes"
              className="group inline-flex items-center gap-1 text-xs font-bold text-esmeralda hover:underline"
            >
              Ver todas
              <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="px-7 pb-6">
            {loading ? (
              <div className="divide-y divide-grafito/5">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : empresasRecientes.length === 0 ? (
              <div className="my-6 rounded-2xl border-2 border-dashed border-grafito/10 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-verdesuave text-esmeralda">
                  <Building2 size={20} />
                </div>
                <p className="mt-4 font-semibold text-noche">Aún no hay empresas registradas</p>
                <p className="mt-1 text-sm text-grafito/50">
                  Registra tu primer cliente y asígnale sus programas.
                </p>
                <Link
                  to="/admin/clientes"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-esmeralda px-5 py-2.5 text-sm font-bold text-noche transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-esmeralda/30"
                >
                  <Plus size={15} />
                  Registrar empresa
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-grafito/5">
                {empresasRecientes.map((c) => {
                  const st = statusStyles[c.status] || statusStyles.active
                  const productosActivos = (c.products || []).filter((p) => p.status === 'active')
                  return (
                    <div key={c.id} className="flex items-center gap-4 py-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${avatarColor(c.name)}`}>
                        {iniciales(c.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-noche">{c.name}</p>
                        <p className="truncate text-xs text-grafito/45">
                          {productosActivos.length > 0
                            ? productosActivos.map((p) => p.name).join(' · ')
                            : 'Sin programas asignados'}
                        </p>
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-[11px] text-grafito/40">{fechaCorta(c.created_at)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Columna lateral */}
        <div className="flex flex-col gap-6">
          {/* Acciones rápidas */}
          <section
            className="deck-item rounded-3xl bg-white border border-black/5 p-7 shadow-sm"
            style={{ animationDelay: '260ms' }}
          >
            <h2 className="font-display text-lg font-bold text-noche">Acciones rápidas</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                to="/admin/clientes"
                className="group flex items-center justify-between rounded-2xl bg-noche px-5 py-4 transition-all duration-300 hover:bg-profundo"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-esmeralda text-noche">
                    <Plus size={15} />
                  </span>
                  Registrar empresa
                </span>
                <ArrowUpRight size={15} className="text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-esmeralda" />
              </Link>

              <Link
                to="/admin/usuarios"
                className="group flex items-center justify-between rounded-2xl bg-neblina border border-grafito/10 px-5 py-4 transition-all duration-300 hover:border-esmeralda/40"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-noche">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-esmeralda/12 text-esmeralda">
                    <Users size={15} />
                  </span>
                  Gestionar usuarios
                </span>
                <ArrowUpRight size={15} className="text-grafito/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-esmeralda" />
              </Link>
            </div>
          </section>

          {/* Últimos usuarios */}
          <section
            className="deck-item flex-1 rounded-3xl bg-white border border-black/5 p-7 shadow-sm"
            style={{ animationDelay: '340ms' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-noche">Últimos usuarios</h2>
              <Link
                to="/admin/usuarios"
                className="group inline-flex items-center gap-1 text-xs font-bold text-esmeralda hover:underline"
              >
                Ver todos
                <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="mt-3">
              {loading ? (
                <div className="divide-y divide-grafito/5">
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : usuariosRecientes.length === 0 ? (
                <p className="py-8 text-center text-sm text-grafito/45">
                  Todavía no hay usuarios registrados.
                </p>
              ) : (
                <div className="divide-y divide-grafito/5">
                  {usuariosRecientes.map((u) => {
                    const rol = roleStyles[u.role] || { label: u.role, cls: 'bg-grafito/10 text-grafito/60' }
                    return (
                      <div key={u.id} className="flex items-center gap-3 py-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${avatarColor(u.name)}`}>
                          {iniciales(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-noche">{u.name}</p>
                          <p className="truncate text-xs text-grafito/45">
                            {u.company_name || u.email}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${rol.cls}`}>
                          {rol.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Dashboard