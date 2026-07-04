import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Wrench, Scissors, Store, Wallet, LayoutGrid } from 'lucide-react'
import api from '../../services/api'

/*
 * Catálogo de programas escalable por TIPO DE NEGOCIO.
 * - Todo sale de la API (agregar un programa en la BD = aparece aquí solo).
 * - Barra de búsqueda + panel de filtros avanzados (categoría y estado).
 * - Pensado para crecer de 3 a 50+ programas sin verse saturado.
 */

// Metadatos visuales de cada categoría (lo único "fijo": el look de cada tipo)
const CATEGORIAS = {
  todos:     { label: 'Todos',      icon: LayoutGrid },
  comercio:  { label: 'Comercio',   icon: Store },
  servicios: { label: 'Servicios',  icon: Scissors },
  talleres:  { label: 'Talleres',   icon: Wrench },
  finanzas:  { label: 'Finanzas',   icon: Wallet },
}

const ESTADOS = {
  available:   { label: 'Disponible',    cls: 'bg-esmeralda/10 text-esmeralda border-esmeralda/25', dot: 'bg-esmeralda' },
  demo:        { label: 'Demo',          cls: 'bg-profundo/10 text-profundo border-profundo/25',    dot: 'bg-profundo' },
  development: { label: 'En desarrollo', cls: 'bg-amber-100 text-amber-700 border-amber-200',        dot: 'bg-amber-500' },
}

function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('todos')
  const [estado, setEstado] = useState('todos') // filtro avanzado
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  useEffect(() => {
    api
      .get('/products')
      .then(({ data }) => setProductos(data))
      .catch(() => setError('No pudimos cargar los programas en este momento'))
      .finally(() => setLoading(false))
  }, [])

  // Categorías que realmente existen en los datos (para no mostrar tabs vacías)
  const categoriasConDatos = useMemo(() => {
    const presentes = new Set(productos.map((p) => p.category).filter(Boolean))
    return ['todos', ...Object.keys(CATEGORIAS).filter((c) => c !== 'todos' && presentes.has(c))]
  }, [productos])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    return productos.filter((p) => {
      if (categoria !== 'todos' && p.category !== categoria) return false
      if (estado !== 'todos' && (p.status || 'available') !== estado) return false
      if (q) {
        const texto = `${p.name} ${p.tagline || ''} ${p.target_audience || ''} ${p.description || ''}`.toLowerCase()
        if (!texto.includes(q)) return false
      }
      return true
    })
  }, [productos, search, categoria, estado])

  const hayFiltroActivo = categoria !== 'todos' || estado !== 'todos' || search

  function limpiar() {
    setSearch('')
    setCategoria('todos')
    setEstado('todos')
  }

  return (
    <main className="min-h-screen bg-neblina">
      {/* Hero */}
      <section className="bg-noche pt-32 pb-14 px-6">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-esmeralda">La suite</p>
          <h1 className="font-display text-4xl font-black tracking-tight text-white">
            Un programa para cada negocio
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Elige por tipo de negocio. Activas solo lo que necesitas y sumas más a medida que creces.
          </p>
        </div>
      </section>

      {/* Barra de búsqueda + filtros (sticky para que acompañe el scroll) */}
      <section className="sticky top-0 z-30 border-b border-grafito/10 bg-neblina/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador */}
            <div className="relative min-w-[200px] flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grafito/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca por negocio: barbería, taller, tienda..."
                className="w-full rounded-xl border border-grafito/15 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-esmeralda"
              />
            </div>

            {/* Botón de más filtros */}
            <button
              onClick={() => setFiltrosAbiertos((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                filtrosAbiertos || estado !== 'todos'
                  ? 'border-esmeralda bg-esmeralda/10 text-esmeralda'
                  : 'border-grafito/15 bg-white text-grafito hover:border-grafito/30'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {estado !== 'todos' && <span className="h-1.5 w-1.5 rounded-full bg-esmeralda" />}
            </button>

            {hayFiltroActivo && (
              <button onClick={limpiar} className="inline-flex items-center gap-1 text-sm font-semibold text-grafito/50 hover:text-noche">
                <X size={14} /> Limpiar
              </button>
            )}
          </div>

          {/* Tabs de categoría (siempre visibles) */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categoriasConDatos.map((cat) => {
              const meta = CATEGORIAS[cat]
              const Icon = meta.icon
              const activo = categoria === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    activo ? 'bg-noche text-white' : 'bg-white border border-grafito/15 text-grafito/60 hover:text-noche'
                  }`}
                >
                  <Icon size={14} />
                  {meta.label}
                </button>
              )
            })}
          </div>

          {/* Panel de filtros avanzados (desplegable) */}
          {filtrosAbiertos && (
            <div className="mt-3 rounded-xl border border-grafito/10 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grafito/40">Estado del programa</p>
              <div className="flex flex-wrap gap-2">
                {['todos', ...Object.keys(ESTADOS)].map((e) => (
                  <button
                    key={e}
                    onClick={() => setEstado(e)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      estado === e ? 'bg-esmeralda text-noche' : 'bg-neblina text-grafito/60 hover:text-noche'
                    }`}
                  >
                    {e === 'todos' ? 'Todos' : ESTADOS[e].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grilla de resultados */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {error && (
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-grafito/8" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-grafito/15 py-16 text-center">
            <p className="font-semibold text-noche">No encontramos programas con esos filtros</p>
            <p className="mt-1 text-sm text-grafito/50">Prueba con otro término o quita los filtros.</p>
            <button onClick={limpiar} className="mt-4 rounded-xl bg-noche px-5 py-2.5 text-sm font-bold text-white hover:bg-profundo">
              Ver todos los programas
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-grafito/50">
              {filtrados.length} {filtrados.length === 1 ? 'programa' : 'programas'}
              {categoria !== 'todos' && ` en ${CATEGORIAS[categoria].label}`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((p) => {
                const est = ESTADOS[p.status] || ESTADOS.available
                return (
                  <Link
                    key={p.id}
                    to={`/productos/${p.code}`}
                    className="group flex flex-col rounded-2xl border border-grafito/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-esmeralda/30 hover:shadow-xl"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-esmeralda/10 font-black text-esmeralda transition-transform duration-300 group-hover:scale-110">
                        {p.name.charAt(0)}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${est.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${est.dot}`} />
                        {est.label}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-noche">{p.name}</h2>
                    {p.target_audience && (
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-grafito/40">
                        {p.target_audience}
                      </p>
                    )}
                    <p className="mt-2 flex-1 text-sm text-grafito/60">{p.tagline || p.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-esmeralda">
                      Ver detalles
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default Productos
