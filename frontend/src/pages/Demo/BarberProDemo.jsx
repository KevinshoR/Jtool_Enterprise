import { useState } from 'react'
import DemoBanner from '../../components/Demo/DemoBanner'

const initialCitas = [
  { id: 1, cliente: 'Andrés Gómez', servicio: 'Corte clásico', hora: '10:00 AM', estado: 'confirmada' },
  { id: 2, cliente: 'Laura Pérez', servicio: 'Barba + corte', hora: '11:30 AM', estado: 'confirmada' },
  { id: 3, cliente: 'Julián Restrepo', servicio: 'Corte niño', hora: '1:00 PM', estado: 'pendiente' },
]

const initialClientes = [
  { id: 1, nombre: 'Andrés Gómez', telefono: '300 123 4567', visitas: 8 },
  { id: 2, nombre: 'Laura Pérez', telefono: '301 987 6543', visitas: 3 },
]

const initialServicios = [
  { id: 1, nombre: 'Corte clásico', precio: 25000, duracion: '30 min' },
  { id: 2, nombre: 'Barba + corte', precio: 40000, duracion: '45 min' },
  { id: 3, nombre: 'Corte niño', precio: 18000, duracion: '25 min' },
]

const estadoStyles = {
  confirmada: 'bg-esmeralda/15 text-esmeralda',
  pendiente: 'bg-naranja/15 text-naranja',
  cancelada: 'bg-red-500/15 text-red-500',
}

function formatCOP(v) {
  return `$${Number(v).toLocaleString('es-CO')}`
}

function BarberProDemo() {
  const [tab, setTab] = useState('citas')
  const [citas, setCitas] = useState(initialCitas)
  const [clientes, setClientes] = useState(initialClientes)
  const [servicios, setServicios] = useState(initialServicios)

  const [nuevaCita, setNuevaCita] = useState({ cliente: '', servicio: servicios[0].nombre, hora: '' })
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '' })
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', duracion: '' })

  function addCita(e) {
    e.preventDefault()
    if (!nuevaCita.cliente || !nuevaCita.hora) return
    setCitas([...citas, { id: Date.now(), ...nuevaCita, estado: 'pendiente' }])
    setNuevaCita({ cliente: '', servicio: servicios[0].nombre, hora: '' })
  }

  function cicleEstado(id) {
    const orden = ['pendiente', 'confirmada', 'cancelada']
    setCitas(citas.map((c) => {
      if (c.id !== id) return c
      const next = orden[(orden.indexOf(c.estado) + 1) % orden.length]
      return { ...c, estado: next }
    }))
  }

  function addCliente(e) {
    e.preventDefault()
    if (!nuevoCliente.nombre) return
    setClientes([...clientes, { id: Date.now(), ...nuevoCliente, visitas: 0 }])
    setNuevoCliente({ nombre: '', telefono: '' })
  }

  function addServicio(e) {
    e.preventDefault()
    if (!nuevoServicio.nombre || !nuevoServicio.precio) return
    setServicios([...servicios, { id: Date.now(), ...nuevoServicio, precio: Number(nuevoServicio.precio) }])
    setNuevoServicio({ nombre: '', precio: '', duracion: '' })
  }

  const tabs = [
    { key: 'citas', label: 'Citas' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'servicios', label: 'Servicios' },
  ]

  return (
    <div className="min-h-screen bg-neblina">
      <DemoBanner productName="BarberPro" />

      <div className="flex">
        <aside className="w-56 shrink-0 min-h-[calc(100vh-49px)] bg-noche border-r border-white/10 p-4">
          <div className="px-2 py-4 mb-2">
            <span className="text-white font-bold">Barber<span className="text-naranja">Pro</span></span>
          </div>
          <nav className="flex flex-col gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-left rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-naranja text-noche font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {tab === 'citas' && (
            <div>
              <h1 className="text-2xl font-bold text-noche mb-1">Citas de hoy</h1>
              <p className="text-grafito/60 mb-6">Tocá el estado de una cita para cambiarlo</p>

              <form onSubmit={addCita} className="mb-6 flex flex-wrap gap-3 bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                <input
                  placeholder="Nombre del cliente"
                  value={nuevaCita.cliente}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, cliente: e.target.value })}
                  className="flex-1 min-w-[160px] rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <select
                  value={nuevaCita.servicio}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, servicio: e.target.value })}
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                >
                  {servicios.map((s) => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
                <input
                  placeholder="Hora (ej. 3:00 PM)"
                  value={nuevaCita.hora}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                  className="w-40 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <button type="submit" className="rounded-xl bg-naranja px-5 py-2.5 text-sm font-bold text-noche hover:scale-105 transition-transform">
                  Agendar
                </button>
              </form>

              <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
                {citas.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4 border-b border-black/5 last:border-0">
                    <div>
                      <p className="font-semibold text-noche">{c.cliente}</p>
                      <p className="text-sm text-grafito/60">{c.servicio} · {c.hora}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => cicleEstado(c.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${estadoStyles[c.estado]}`}
                      >
                        {c.estado}
                      </button>
                      <button
                        onClick={() => setCitas(citas.filter((x) => x.id !== c.id))}
                        className="text-grafito/30 hover:text-red-500 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {citas.length === 0 && <p className="p-6 text-grafito/50 text-center">No hay citas agendadas.</p>}
              </div>
            </div>
          )}

          {tab === 'clientes' && (
            <div>
              <h1 className="text-2xl font-bold text-noche mb-1">Clientes</h1>
              <p className="text-grafito/60 mb-6">Tu base de clientes frecuentes</p>

              <form onSubmit={addCliente} className="mb-6 flex flex-wrap gap-3 bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                <input
                  placeholder="Nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  className="flex-1 min-w-[160px] rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <input
                  placeholder="Teléfono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  className="w-48 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <button type="submit" className="rounded-xl bg-naranja px-5 py-2.5 text-sm font-bold text-noche hover:scale-105 transition-transform">
                  Agregar
                </button>
              </form>

              <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
                {clientes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4 border-b border-black/5 last:border-0">
                    <div>
                      <p className="font-semibold text-noche">{c.nombre}</p>
                      <p className="text-sm text-grafito/60">{c.telefono} · {c.visitas} visitas</p>
                    </div>
                    <button
                      onClick={() => setClientes(clientes.filter((x) => x.id !== c.id))}
                      className="text-grafito/30 hover:text-red-500 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'servicios' && (
            <div>
              <h1 className="text-2xl font-bold text-noche mb-1">Servicios</h1>
              <p className="text-grafito/60 mb-6">Lo que ofrece tu barbería</p>

              <form onSubmit={addServicio} className="mb-6 flex flex-wrap gap-3 bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                <input
                  placeholder="Nombre del servicio"
                  value={nuevoServicio.nombre}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                  className="flex-1 min-w-[160px] rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <input
                  placeholder="Precio COP"
                  type="number"
                  value={nuevoServicio.precio}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })}
                  className="w-36 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <input
                  placeholder="Duración"
                  value={nuevoServicio.duracion}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, duracion: e.target.value })}
                  className="w-32 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-naranja"
                />
                <button type="submit" className="rounded-xl bg-naranja px-5 py-2.5 text-sm font-bold text-noche hover:scale-105 transition-transform">
                  Agregar
                </button>
              </form>

              <div className="grid gap-4 sm:grid-cols-2">
                {servicios.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-2xl bg-white border border-black/5 p-5 shadow-sm">
                    <div>
                      <p className="font-semibold text-noche">{s.nombre}</p>
                      <p className="text-sm text-grafito/60">{s.duracion}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-naranja">{formatCOP(s.precio)}</span>
                      <button
                        onClick={() => setServicios(servicios.filter((x) => x.id !== s.id))}
                        className="text-grafito/30 hover:text-red-500 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default BarberProDemo