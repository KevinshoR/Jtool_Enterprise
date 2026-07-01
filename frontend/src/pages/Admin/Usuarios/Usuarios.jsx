import { useEffect, useState } from 'react'
import { adminService } from '../../../services/adminService'

function Usuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService
      .getUsers()
      .then(setUsers)
      .catch(() => setError('No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-noche mb-1">Usuarios</h1>
      <p className="text-grafito/60 mb-8">Todos los usuarios registrados en la plataforma</p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neblina text-grafito/60 text-left">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Correo</th>
              <th className="px-6 py-4 font-medium">Rol</th>
              <th className="px-6 py-4 font-medium">Empresa</th>
              <th className="px-6 py-4 font-medium">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {!loading && users.map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-6 py-4 text-noche font-medium">{u.name}</td>
                <td className="px-6 py-4 text-grafito/70">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    u.role === 'admin' ? 'bg-esmeralda/15 text-esmeralda' : 'bg-black/5 text-grafito/70'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-grafito/70">{u.company_name || '—'}</td>
                <td className="px-6 py-4 text-grafito/50">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-grafito/50">Cargando...</p>}
        {!loading && users.length === 0 && <p className="p-6 text-grafito/50">Aún no hay usuarios.</p>}
      </div>
    </div>
  )
}

export default Usuarios