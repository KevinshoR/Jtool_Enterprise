import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ArrowLeft, Building2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

/*
 * Onboarding (/empezar): tras registrarse, el usuario crea su empresa
 * y elige un plan. Arranca con 14 días de prueba gratis.
 */

function formatCOP(v) {
  return `$${Number(v).toLocaleString('es-CO')}`
}

function Empezar() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [paso, setPaso] = useState(1)
  const [planes, setPlanes] = useState([])
  const [productos, setProductos] = useState([])
  const [empresa, setEmpresa] = useState({ companyName: '', nit: '', phone: '' })
  const [planId, setPlanId] = useState(null)
  const [productIds, setProductIds] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  const planActual = planes.find((p) => p.id === planId)
  const requiereSeleccion = planActual && planActual.max_products > 0 && planActual.max_products < 99

  function elegirPlan(id) {
    setPlanId(id)
    setProductIds([])
  }

  function toggleProducto(id) {
    setProductIds((actuales) => {
      if (actuales.includes(id)) return actuales.filter((pid) => pid !== id)
      if (planActual && actuales.length >= planActual.max_products) return actuales
      return [...actuales, id]
    })
  }

  /* Si ya tiene empresa, no debe estar aquí */
  useEffect(() => {
    api
      .get('/me/overview')
      .then(({ data }) => {
        if (data.company) navigate('/dashboard', { replace: true })
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [navigate])

  useEffect(() => {
    api
      .get('/plans')
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : []
        setPlanes(lista)
        const destacado = lista.find((p) => p.is_featured)
        if (destacado) setPlanId(destacado.id)
      })
      .catch(() => setError('No pudimos cargar los planes. Refresca la página.'))

    api
      .get('/products')
      .then(({ data }) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function irAPaso2(e) {
    e.preventDefault()
    if (empresa.companyName.trim().length < 2) {
      return setError('El nombre de tu negocio es requerido (mínimo 2 caracteres)')
    }
    setError('')
    setPaso(2)
  }

  async function crear() {
    if (!planId) return setError('Elige un plan para continuar')
    if (requiereSeleccion && productIds.length < 1) {
      return setError('Elige al menos un programa para continuar')
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/onboarding', { ...empresa, planId, productIds: requiereSeleccion ? productIds : undefined })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos crear tu empresa. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none transition-colors focus:border-esmeralda placeholder:text-white/25'

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-noche">
        <p className="text-white/40 text-sm">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-noche px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Branding + progreso */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-esmeralda font-black text-noche text-lg">
            JT
          </div>
          <h1 className="font-display text-3xl font-black text-white">
            {paso === 1 ? `¡Bienvenido, ${user?.name?.split(' ')[0]}!` : 'Elige tu plan'}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {paso === 1
              ? 'Cuéntanos de tu negocio para dejar todo listo.'
              : 'Empiezas con 14 días de prueba gratis — sin tarjeta de crédito.'}
          </p>

          {/* Indicador de pasos */}
          <div className="mx-auto mt-6 flex max-w-xs items-center gap-2">
            {[1, 2].map((n) => (
              <div key={n} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${
                    paso >= n ? 'bg-esmeralda text-noche' : 'bg-white/10 text-white/40'
                  }`}
                >
                  {paso > n ? <Check size={13} strokeWidth={3.5} /> : n}
                </span>
                {n === 1 && (
                  <span className={`h-0.5 flex-1 rounded-full ${paso > 1 ? 'bg-esmeralda' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-3.5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ── Paso 1: datos del negocio ── */}
        {paso === 1 && (
          <form
            onSubmit={irAPaso2}
            className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-esmeralda/15 text-esmeralda">
                <Building2 size={18} />
              </span>
              <p className="text-sm font-bold text-white">Datos de tu negocio</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-white/60">Nombre del negocio *</label>
                <input
                  className={inputCls}
                  placeholder="Ej: Barbería El Patrón"
                  value={empresa.companyName}
                  onChange={(e) => setEmpresa({ ...empresa, companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/60">NIT (opcional)</label>
                <input
                  className={inputCls}
                  placeholder="900.123.456-7"
                  value={empresa.nit}
                  onChange={(e) => setEmpresa({ ...empresa, nit: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/60">Teléfono (opcional)</label>
                <input
                  className={inputCls}
                  placeholder="300 123 4567"
                  value={empresa.phone}
                  onChange={(e) => setEmpresa({ ...empresa, phone: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-esmeralda px-5 py-3.5 text-sm font-black text-noche transition-all duration-300 hover:scale-[1.02]"
              >
                Continuar
                <ArrowRight size={15} strokeWidth={3} />
              </button>
            </div>
          </form>
        )}

        {/* ── Paso 2: elegir plan ── */}
        {paso === 2 && (
          <div>
            <div className="grid gap-4 md:grid-cols-3">
              {planes.map((plan) => {
                const activo = planId === plan.id
                return (
                  <button
                    key={plan.id}
                    onClick={() => elegirPlan(plan.id)}
                    className={`relative rounded-3xl border p-6 text-left transition-all duration-300 ${
                      activo
                        ? 'border-esmeralda bg-esmeralda/10 scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    {plan.is_featured && (
                      <span className="absolute -top-2.5 left-5 rounded-full bg-esmeralda px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-noche">
                        Recomendado
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">{plan.name}</p>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                          activo ? 'border-esmeralda bg-esmeralda text-noche' : 'border-white/25'
                        }`}
                      >
                        {activo && <Check size={11} strokeWidth={4} />}
                      </span>
                    </div>
                    <p className="mt-3">
                      <span className="font-display text-2xl font-black text-white">
                        {formatCOP(plan.price_monthly)}
                      </span>
                      <span className="text-xs text-white/40"> /mes</span>
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">{plan.description}</p>
                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                            <Check size={12} strokeWidth={3} className="mt-0.5 shrink-0 text-esmeralda" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                )
              })}
            </div>

            {planActual && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                {planActual.max_products >= 99 ? (
                  <p className="text-sm font-bold text-white">
                    Incluye los {productos.length || 3} programas
                  </p>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Elige tus programas</p>
                      <span className="text-xs font-semibold text-white/50">
                        {productIds.length} de {planActual.max_products} elegidos
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {productos.map((producto) => {
                        const elegido = productIds.includes(producto.id)
                        const deshabilitado = !elegido && productIds.length >= planActual.max_products
                        return (
                          <button
                            key={producto.id}
                            type="button"
                            onClick={() => toggleProducto(producto.id)}
                            disabled={deshabilitado}
                            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                              elegido
                                ? 'border-esmeralda bg-esmeralda/10'
                                : deshabilitado
                                  ? 'border-white/5 opacity-40'
                                  : 'border-white/10 hover:border-white/25'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                elegido ? 'border-esmeralda bg-esmeralda text-noche' : 'border-white/25'
                              }`}
                            >
                              {elegido && <Check size={11} strokeWidth={4} />}
                            </span>
                            <span>
                              <p className="text-sm font-bold text-white">{producto.name}</p>
                              {producto.tagline && (
                                <p className="mt-1 text-xs leading-relaxed text-white/45">{producto.tagline}</p>
                              )}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-esmeralda/25 bg-esmeralda/5 px-5 py-4 text-center">
              <p className="text-xs text-white/60">
                🎁 <strong className="text-esmeralda">14 días de prueba gratis</strong> con el plan que
                elijas. No pedimos tarjeta — pagas solo si decides quedarte.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={() => setPaso(1)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>
              <button
                onClick={crear}
                disabled={loading || !planId || (requiereSeleccion && productIds.length < 1)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-esmeralda px-5 py-3.5 text-sm font-black text-noche transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 sm:flex-none sm:px-10"
              >
                {loading ? 'Creando tu cuenta...' : 'Empezar mi prueba gratis'}
                {!loading && <ArrowRight size={15} strokeWidth={3} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Empezar