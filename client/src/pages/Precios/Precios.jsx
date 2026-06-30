import { Link } from 'react-router-dom'

const planes = [
  {
    nombre: 'Emprende',
    precio: '$0',
    periodo: '/mes',
    desc: 'Para empezar y validar tu idea.',
    features: ['1 usuario', 'Módulo CRM', 'Soporte por correo'],
    destacado: false,
  },
  {
    nombre: 'Pyme',
    precio: '$89.000',
    periodo: '/mes',
    desc: 'Para equipos en crecimiento.',
    features: ['Hasta 10 usuarios', 'CRM + Facturación', 'Soporte prioritario'],
    destacado: true,
  },
  {
    nombre: 'Enterprise',
    precio: 'Personalizado',
    periodo: '',
    desc: 'Para operaciones a gran escala.',
    features: ['Usuarios ilimitados', 'Suite completa', 'Gerente de cuenta dedicado'],
    destacado: false,
  },
]

function Precios() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-noche">Precios simples y transparentes</h1>
          <p className="mt-3 text-lg text-grafito/70">Sin sorpresas. Cambia o cancela cuando quieras.</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {planes.map((plan) => (
            <div
              key={plan.nombre}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.destacado
                  ? 'border-esmeralda bg-noche text-white shadow-xl'
                  : 'border-grafito/10 bg-white text-grafito'
              }`}
            >
              {plan.destacado && (
                <span className="mb-4 self-start rounded-full bg-esmeralda px-3 py-1 text-xs font-semibold text-noche">
                  Más popular
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.nombre}</h2>
              <p className={`mt-1 text-sm ${plan.destacado ? 'text-white/70' : 'text-grafito/60'}`}>
                {plan.desc}
              </p>
              <p className="mt-6 text-3xl font-extrabold">
                {plan.precio}
                <span className={`text-base font-medium ${plan.destacado ? 'text-white/60' : 'text-grafito/50'}`}>
                  {plan.periodo}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-esmeralda">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contacto"
                className={`mt-8 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                  plan.destacado ? 'bg-esmeralda text-noche' : 'bg-noche text-white'
                }`}
              >
                Empezar gratis
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Precios
