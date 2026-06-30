import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-white">
      {/* Hero */}
      <section className="bg-noche text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-block rounded-full bg-esmeralda/15 px-4 py-1.5 text-sm font-medium text-esmeralda">
            Software empresarial hecho en Colombia 🇨🇴
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Impulsa tu empresa con las herramientas de{' '}
            <span className="text-esmeralda">JTool Enterprise</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Centraliza tus operaciones, automatiza procesos y toma mejores decisiones
            con nuestra suite SaaS todo en uno.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/contacto"
              className="rounded-lg bg-esmeralda px-7 py-3.5 font-semibold text-noche transition-transform hover:scale-105"
            >
              Empezar gratis
            </Link>
            <Link
              to="/productos"
              className="rounded-lg border border-white/20 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: 'Rápido de implementar', desc: 'Configura tu cuenta y empieza a operar en minutos, sin instalaciones.' },
            { title: 'Seguro y confiable', desc: 'Infraestructura robusta con respaldo y cifrado de tus datos.' },
            { title: 'Soporte local', desc: 'Equipo colombiano listo para acompañarte en tu idioma y zona horaria.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-grafito/10 p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-esmeralda/10 text-esmeralda font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-grafito">{item.title}</h3>
              <p className="mt-2 text-grafito/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
