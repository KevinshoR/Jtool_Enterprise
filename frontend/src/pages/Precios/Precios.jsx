import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function formatCOP(value) {
  return `$${Number(value).toLocaleString('es-CO')}`
}

function Precios() {
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [annual, setAnnual] = useState(true)

  useEffect(() => {
    api
      .get('/plans')
      .then(({ data }) => setPlanes(data))
      .catch(() => setError('No pudimos cargar los planes en este momento'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-neblina">
      <section className="bg-noche pt-32 pb-16 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Precios simples y transparentes</h1>
          <p className="mt-3 text-lg text-white/60">Sin sorpresas. Cambia o cancela cuando quieras.</p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/5 border border-white/10 p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                !annual ? 'bg-esmeralda text-noche' : 'text-white/60 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                annual ? 'bg-esmeralda text-noche' : 'text-white/60 hover:text-white'
              }`}
            >
              Anual <span className="text-xs opacity-80">(ahorra 20%)</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {error && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-grafito/50 text-center">Cargando planes...</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-3 items-start">
            {planes.map((plan) => {
              const price = annual ? plan.price_annual : plan.price_monthly
              const periodLabel = annual ? '/año' : '/mes'

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-2xl border p-8 ${
                    plan.is_featured
                      ? 'border-esmeralda bg-noche text-white shadow-xl md:-translate-y-3'
                      : 'border-grafito/10 bg-white text-grafito'
                  }`}
                >
                  {plan.is_featured && (
                    <span className="mb-4 self-start rounded-full bg-esmeralda px-3 py-1 text-xs font-semibold text-noche">
                      Más popular
                    </span>
                  )}
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <p className={`mt-1 text-sm ${plan.is_featured ? 'text-white/70' : 'text-grafito/60'}`}>
                    {plan.description}
                  </p>
                  <p className="mt-6 text-3xl font-extrabold">
                    {formatCOP(price)}
                    <span className={`text-base font-medium ${plan.is_featured ? 'text-white/60' : 'text-grafito/50'}`}>
                      {' '}{periodLabel}
                    </span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {plan.products.length === 0 ? (
                      <li className={plan.is_featured ? 'text-white/50' : 'text-grafito/40'}>
                        Programas por definir
                      </li>
                    ) : (
                      plan.products.map((p) => (
                        <li key={p.id} className="flex items-center gap-2">
                          <span className="text-esmeralda">✓</span>
                          {p.name}
                        </li>
                      ))
                    )}
                  </ul>

                  <Link
                    to="/contacto"
                    className={`mt-8 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                      plan.is_featured ? 'bg-esmeralda text-noche' : 'bg-noche text-white'
                    }`}
                  >
                    Empezar ahora
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Precios