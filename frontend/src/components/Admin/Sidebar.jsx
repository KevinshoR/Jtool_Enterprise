import { useAuth } from '../../context/AuthContext'
import { NavLink, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/clientes', label: 'Clientes' },
]

function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-noche border-r border-white/10 flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-white font-bold text-lg">
          JTool <span className="text-esmeralda">Admin</span>
        </span>
      </div>

      <div className="px-4 pt-4">
  <Link
    to="/"
    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors w-fit"
  >
    <ArrowLeft size={16} />
    Volver al sitio
  </Link>
</div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-esmeralda text-noche font-bold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-white/10">
        <p className="text-white/40 text-xs px-2 mb-3">{user?.name} · {user?.email}</p>
        <button
          onClick={logout}
          className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar