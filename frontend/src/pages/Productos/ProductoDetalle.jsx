import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

// Programas que ya tienen demo interactivo conectado
const demosDisponibles = ['barberpro']

function ProductoDetalle() {
  const { code } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get(`/products/${code}`)
      .then(({ data }) => setProducto(data))
      .catch(() => setError('No encontramos este programa'))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <main className="min-h-screen bg-neblina pt-32 text-center text-grafito/50">
        Cargando...
      </main>
    )
  }

  if (error || !producto) {
    return (
      <main className="min-h-screen bg-neblina pt-32 px-6 text-center">
        <p className="text-grafito/70">{error || 'Programa no encontrado'}</p>
        <Link to="/productos" className="mt-4 inline-block text-esmeralda hover:underline">
          ← Volver a programas
        </Link>
      </main>
    )
  }

  const tieneDemo = demosDisponibles.includes(producto.code)

  return (
    <main className="min-h-screen bg-neblina">
      {/* Hero */}
      <section className="bg-noche pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl">
          <Link to="/productos" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            ← Todos los programas
          </Link>

          <div className="mt-6 h-14 w-14 rounded-2xl bg-esmeralda flex items-center justify-center font-black text-noche text-xl">
            {producto.name.charAt(0)}
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white">{producto.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">{producto.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {tieneDemo && (
              <Link
                to={`/demo/${producto.code}`}
                className="rounded-xl bg-white text-noche px-6 py-3 text-sm font-bold hover:scale-105 transition-transform"
              >
                Probar demo interactivo
              </Link>
            )}
            <Link
              to="/precios"
              className="rounded-xl bg-esmeralda px-6 py-3 text-sm font-bold text-noche hover:scale-105 transition-transform"
            >
              Ver planes disponibles
            </Link>
            <Link
              to="/contacto"
              className="rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Solicitar una demo
            </Link>
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="rounded-2xl bg-esmeralda/10 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-esmeralda">Para quién es</p>
          <p className="mt-2 text-lg text-noche font-medium">{producto.target_audience}</p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-2xl font-bold text-noche mb-6">Qué incluye</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(producto.features || []).map((f) => (
            <div key={f} className="flex items-start gap-3 rounded-xl bg-white border border-black/5 p-5 shadow-sm">
              <span className="mt-0.5 text-esmeralda font-bold">✓</span>
              <span className="text-grafito/80">{f}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default ProductoDetalle