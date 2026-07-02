import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

function Dashboard() {
  const { user } = useAuth()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // TODO: reemplazar por el endpoint real de "productos de la empresa" cuando exista
    // (ej. GET /companies/:id/products) para reflejar el estado de contratación real.
    api
      .get('/products')
      .then(({ data }) => setProductos(data))
      .catch(() => setError('No pudimos cargar tus productos en este momento'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-neblina pt-28 px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-noche">
            Hola, {user?.name} 👋
          </h1>
          <p className="text-grafito/60 text-sm mt-1">
            Este es tu panel de JTool Enterprise. Desde aquí accederás a tus productos.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-grafito/50">Cargando tus productos...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((p) => {
              const activo = p.status === 'active'
              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-noche">{p.name}</h2>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        activo
                          ? 'bg-esmeralda/15 text-esmeralda'
                          : 'bg-grafito/10 text-grafito/50'
                      }`}
                    >
                      {activo ? 'Activo' : 'No contratado'}
                    </span>
                  </div>
                  <p className="text-sm text-grafito/60">{p.tagline || p.description}</p>
                  <button
                    disabled={!activo}
                    className="mt-5 w-full rounded-xl bg-noche px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-profundo disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {activo ? 'Entrar' : 'Aún no disponible'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-white border border-black/5 p-6">
          <h3 className="font-bold text-noche mb-3">Datos de tu cuenta</h3>
          <dl className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-grafito/40">Nombre</dt>
              <dd className="text-noche font-medium">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-grafito/40">Correo</dt>
              <dd className="text-noche font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-grafito/40">Rol</dt>
              <dd className="text-noche font-medium capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Dashboard