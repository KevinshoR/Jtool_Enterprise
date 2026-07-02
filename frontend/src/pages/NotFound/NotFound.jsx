import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-noche px-6 text-center">
      <div>
        <p className="text-esmeralda font-black text-6xl tracking-tight">404</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
          Esta página no existe
        </h1>
        <p className="mt-3 max-w-md mx-auto text-white/60">
          Puede que el enlace esté roto o que la página se haya movido. Volvamos a un lugar conocido.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-esmeralda px-6 py-3 text-sm font-bold text-noche transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-esmeralda/30"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

export default NotFound
