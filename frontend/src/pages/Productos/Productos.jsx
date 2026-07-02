import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/products')
      .then(({ data }) => setProductos(data))
      .catch(() => setError('No pudimos cargar los programas en este momento'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-neblina">
      {/* Franja oscura para que el navbar transparente siempre tenga contraste */}
      <section className="bg-noche pt-32 pb-16 px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Nuestros programas</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Una suite modular que crece con tu negocio. Activa solo lo que necesitas, cuando lo necesitas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {error && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-grafito/50">Cargando programas...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((p) => (
              <article
                key={p.id}
                className="flex flex-col rounded-2xl border border-grafito/10 bg-white p-8 transition-shadow hover:shadow-lg"
              >
                <div className="h-11 w-11 rounded-xl bg-esmeralda/10 flex items-center justify-center font-black text-esmeralda mb-4">
                  {p.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-noche">{p.name}</h2>
                <p className="mt-2 text-grafito/70 flex-1">{p.description}</p>
                <Link
  key={p.id}
  to={`/productos/${p.code}`}
  className="flex flex-col rounded-2xl border border-grafito/10 bg-white p-8 transition-shadow hover:shadow-lg"
>
  <div className="h-11 w-11 rounded-xl bg-esmeralda/10 flex items-center justify-center font-black text-esmeralda mb-4">
    {p.name.charAt(0)}
  </div>
  <h2 className="text-xl font-bold text-noche">{p.name}</h2>
  <p className="mt-2 text-grafito/70 flex-1">{p.tagline || p.description}</p>
  <span className="mt-6 text-sm font-semibold text-esmeralda w-fit">
    Ver detalles →
  </span>
</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Productos