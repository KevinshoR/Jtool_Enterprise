import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-neblina">
      <Sidebar />
      <main
        className="flex-1 p-8 relative"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(14,42,71,0.06) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout