import { useEffect, useState } from 'react'
import { Users, Building2, Zap, Package } from 'lucide-react'
import { adminService } from '../../../services/adminService'
import { useAuth } from '../../../context/AuthContext'
import StatCard from '../../../components/Admin/StatCard'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService
      .getStats()
      .then(setStats)
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  const firstName = user?.name?.split(' ')[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-noche mb-1">Hola, {firstName} 👋</h1>
        <p className="text-grafito/60">Esto es lo que está pasando en JTool Enterprise hoy</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-grafito/50">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Usuarios totales" value={stats.totalUsers} icon={Users} accent="esmeralda" />
          <StatCard
            label="Empresas cliente"
            value={stats.totalCompanies}
            icon={Building2}
            accent="profundo"
            hint={stats.totalCompanies === 0 ? 'Registra tu primera empresa en Clientes' : null}
          />
          <StatCard
            label="Suscripciones activas"
            value={stats.activeSubscriptions}
            icon={Zap}
            accent="esmeralda"
            hint={stats.activeSubscriptions === 0 ? 'Asigna un programa a una empresa' : null}
          />
          <StatCard label="Programas disponibles" value={stats.totalProducts} icon={Package} accent="naranja" />
        </div>
      )}
    </div>
  )
}

export default Dashboard