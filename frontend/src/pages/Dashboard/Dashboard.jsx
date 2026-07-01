import { useAuth } from '../../context/AuthContext'

const modules = [
  {
    name: 'JTools',
    description: 'Gestión de repuestos para JRepuestos',
    status: 'Activo',
  },
  {
    name: 'Barbershop Manager',
    description: 'Gestión de citas y servicios para barberías',
    status: 'Próximamente',
  },
  {
    name: 'Catálogo',
    description: 'Catálogo y vitrina de productos para negocios',
    status: 'Próximamente',
  },
]

function Dashboard() {
  const { user } = useAuth()

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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-noche">{mod.name}</h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    mod.status === 'Activo'
                      ? 'bg-esmeralda/15 text-esmeralda'
                      : 'bg-grafito/10 text-grafito/50'
                  }`}
                >
                  {mod.status}
                </span>
              </div>
              <p className="text-sm text-grafito/60">{mod.description}</p>
              <button
                disabled={mod.status !== 'Activo'}
                className="mt-5 w-full rounded-xl bg-noche px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-profundo disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mod.status === 'Activo' ? 'Entrar' : 'Aún no disponible'}
              </button>
            </div>
          ))}
        </div>

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