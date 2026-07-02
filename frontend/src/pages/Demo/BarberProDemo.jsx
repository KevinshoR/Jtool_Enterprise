import { useEffect, useRef, useState } from 'react'
import DemoBanner from '../../components/Demo/DemoBanner'
import DemoTimer from '../../components/Demo/DemoTimer'
import PlansModal from '../../components/Demo/PlansModal'

/* ═══════════════════════════════════════════════════════════
   Demo de Barbersoft — réplica fiel de la interfaz real.
   Todo vive en el estado de React: al salir o refrescar, se borra.
   (El único dato persistido es el temporizador del demo.)
═══════════════════════════════════════════════════════════ */

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

function hoyLargo() {
  const f = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return f.toUpperCase()
}

/* ── Sistema de estados (idéntico al real) ── */
const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  confirmed: { label: 'Confirmada', color: '#5B8DEF', bg: 'rgba(91,141,239,0.12)' },
  done:      { label: 'Completada', color: '#4CAF7D', bg: 'rgba(76,175,125,0.12)' },
  cancelled: { label: 'Cancelada',  color: '#E05252', bg: 'rgba(224,82,82,0.12)' },
}
const TRANSITIONS = {
  pending: ['confirmed', 'done', 'cancelled'],
  confirmed: ['done', 'cancelled'],
  done: [],
  cancelled: [],
}

/* ── Datos de arranque del sandbox ── */
const seedBarberos = [
  { id: 1, nombre: 'Miguel Ángel', especialidad: 'Fade y diseño' },
  { id: 2, nombre: 'Sebastián', especialidad: 'Barba clásica' },
  { id: 3, nombre: 'Valentina', especialidad: 'Color y estilo' },
]

const seedServicios = [
  { id: 1, nombre: 'Corte clásico', duracion: 30, precio: 25000 },
  { id: 2, nombre: 'Fade + diseño', duracion: 40, precio: 32000 },
  { id: 3, nombre: 'Barba completa', duracion: 25, precio: 20000 },
  { id: 4, nombre: 'Corte + barba', duracion: 50, precio: 40000 },
]

const seedCitas = [
  { id: 1, hora: '09:00', cliente: 'Carlos Mejía', servicioId: 4, barberoId: 1, status: 'done' },
  { id: 2, hora: '10:00', cliente: 'Julián Restrepo', servicioId: 2, barberoId: 1, status: 'confirmed' },
  { id: 3, hora: '10:30', cliente: 'Andrés Gómez', servicioId: 1, barberoId: 2, status: 'confirmed' },
  { id: 4, hora: '11:30', cliente: 'Samuel Torres', servicioId: 3, barberoId: 2, status: 'pending' },
  { id: 5, hora: '14:00', cliente: 'Daniel Cardona', servicioId: 4, barberoId: 3, status: 'pending' },
]

/* ── Toast (réplica del real) ── */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  const c =
    type === 'success'
      ? { bg: 'rgba(76,175,125,0.12)', border: 'rgba(76,175,125,0.4)', color: '#4CAF7D', icon: '✓' }
      : { bg: 'rgba(224,82,82,0.12)', border: 'rgba(224,82,82,0.4)', color: '#E05252', icon: '✕' }
  return (
    <div
      className="bp-fade-up"
      style={{
        position: 'fixed', top: 80, right: 24, zIndex: 90,
        background: c.bg, border: `1px solid ${c.border}`, color: c.color,
        borderRadius: 10, padding: '14px 20px', fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 10, minWidth: 260,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      {message}
      <button
        onClick={onClose}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, opacity: 0.6 }}
      >
        ×
      </button>
    </div>
  )
}

/* ── Selector de estado con transiciones (réplica del real) ── */
function StatusSelector({ status, onUpdate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = STATUS_CONFIG[status]
  const options = TRANSITIONS[status]

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [])

  const pill = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: current.bg, border: `1px solid ${current.color}44`, borderRadius: 20, padding: '5px 12px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: current.color }} />
      <span style={{ color: current.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
        {current.label.toUpperCase()}
      </span>
      {options.length > 0 && <span style={{ color: current.color, fontSize: 9, opacity: 0.7 }}>▾</span>}
    </span>
  )

  if (options.length === 0) return pill

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        {pill}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#1F1F1F', border: '1px solid #2A2A2A', borderRadius: 10, padding: 6, zIndex: 70, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
          {options.map((opt) => {
            const cfg = STATUS_CONFIG[opt]
            return (
              <button
                key={opt}
                onClick={() => { onUpdate(opt); setOpen(false) }}
                className="bp-menu-item"
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', color: cfg.color, fontSize: 12, fontWeight: 600, textAlign: 'left' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Campos de formulario ── */
const inputStyle = {
  width: '100%', background: '#1F1F1F', color: '#F5F0E8',
  border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 14px',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
}
const labelStyle = {
  display: 'block', color: '#B8B0A0', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.08em', marginBottom: 6,
}
const errorStyle = { color: '#E05252', fontSize: 11, marginTop: 4 }

function Field({ label, error, children }) {
  return (
    <div style={{ flex: 1, minWidth: 150 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════ */

export default function BarberProDemo() {
  const [tab, setTab] = useState('inicio')
  const [citas, setCitas] = useState(seedCitas)
  const [barberos, setBarberos] = useState(seedBarberos)
  const [servicios, setServicios] = useState(seedServicios)
  const [toast, setToast] = useState(null)
  const [copied, setCopied] = useState(false)
  const [lockedFeature, setLockedFeature] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  /* ── formularios ── */
  const [showCitaForm, setShowCitaForm] = useState(false)
  const [citaForm, setCitaForm] = useState({ cliente: '', hora: '', servicioId: 1, barberoId: 1 })
  const [citaErrors, setCitaErrors] = useState({})

  const [showBarberoForm, setShowBarberoForm] = useState(false)
  const [barberoForm, setBarberoForm] = useState({ nombre: '', especialidad: '' })
  const [barberoError, setBarberoError] = useState('')

  const [showServicioForm, setShowServicioForm] = useState(false)
  const [servicioForm, setServicioForm] = useState({ nombre: '', duracion: '', precio: '' })
  const [servicioErrors, setServicioErrors] = useState({})

  /* ── helpers ── */
  const servicioDe = (id) => servicios.find((s) => s.id === Number(id))
  const barberoDe = (id) => barberos.find((b) => b.id === Number(id))

  const pendientes = citas.filter((c) => c.status === 'pending').length
  const confirmadas = citas.filter((c) => c.status === 'confirmed').length
  const cajaDia = citas
    .filter((c) => c.status === 'done')
    .reduce((acc, c) => acc + (servicioDe(c.servicioId)?.precio || 0), 0)

  /* ── acciones ── */
  function crearCita(e) {
    e.preventDefault()
    const errs = {}
    if (!citaForm.cliente.trim()) errs.cliente = 'El nombre del cliente es obligatorio'
    if (!citaForm.hora) errs.hora = 'La hora es obligatoria'
    setCitaErrors(errs)
    if (Object.keys(errs).length) return
    setCitas([...citas, { id: Date.now(), ...citaForm, status: 'pending' }].sort((a, b) => a.hora.localeCompare(b.hora)))
    setCitaForm({ cliente: '', hora: '', servicioId: servicios[0]?.id ?? 1, barberoId: barberos[0]?.id ?? 1 })
    setShowCitaForm(false)
    showToast('Cita agendada correctamente')
  }

  function actualizarEstado(id, status) {
    setCitas(citas.map((c) => (c.id === id ? { ...c, status } : c)))
    showToast(`Cita marcada como ${STATUS_CONFIG[status].label.toLowerCase()}`)
  }

  function crearBarbero(e) {
    e.preventDefault()
    const n = barberoForm.nombre.trim()
    if (!n) return setBarberoError('El nombre es obligatorio')
    if (n.length < 2) return setBarberoError('El nombre debe tener al menos 2 caracteres')
    if (n.length > 60) return setBarberoError('El nombre no puede superar 60 caracteres')
    setBarberoError('')
    setBarberos([...barberos, { id: Date.now(), nombre: n, especialidad: barberoForm.especialidad.trim() || 'General' }])
    setBarberoForm({ nombre: '', especialidad: '' })
    setShowBarberoForm(false)
    showToast('Barbero agregado al equipo')
  }

  function eliminarBarbero(id) {
    setBarberos(barberos.filter((b) => b.id !== id))
    showToast('Barbero eliminado', 'error')
  }

  function crearServicio(e) {
    e.preventDefault()
    const errs = {}
    const f = servicioForm
    if (!f.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    else if (f.nombre.trim().length < 2) errs.nombre = 'Mínimo 2 caracteres'
    if (!f.duracion) errs.duracion = 'La duración es obligatoria'
    else if (Number(f.duracion) < 5) errs.duracion = 'Mínimo 5 minutos'
    else if (Number(f.duracion) > 480) errs.duracion = 'Máximo 480 minutos'
    if (!f.precio) errs.precio = 'El precio es obligatorio'
    else if (Number(f.precio) < 0) errs.precio = 'El precio no puede ser negativo'
    setServicioErrors(errs)
    if (Object.keys(errs).length) return
    setServicios([...servicios, { id: Date.now(), nombre: f.nombre.trim(), duracion: Number(f.duracion), precio: Number(f.precio) }])
    setServicioForm({ nombre: '', duracion: '', precio: '' })
    setShowServicioForm(false)
    showToast('Servicio creado correctamente')
  }

  function copiarLink() {
    navigator.clipboard.writeText('https://barbersoft.app/reservar/el-patron')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── navegación (Horarios y Reportes son gancho premium) ── */
  const navLinks = [
    { key: 'inicio', label: 'Inicio', icon: '⌂' },
    { key: 'citas', label: 'Citas', icon: '◷' },
    { key: 'barberos', label: 'Barberos', icon: '◈' },
    { key: 'servicios', label: 'Servicios', icon: '✦' },
    { key: 'horarios', label: 'Horarios', icon: '◑', locked: true },
    { key: 'reportes', label: 'Reportes', icon: '◎', locked: true },
  ]

  const btnGold = {
    background: '#C9A84C', color: '#0D0D0D', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
    cursor: 'pointer', fontFamily: 'inherit',
  }
  const btnGhost = {
    background: '#1F1F1F', color: '#B8B0A0', border: '1px solid #2A2A2A', borderRadius: 8,
    padding: '10px 20px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
    cursor: 'pointer', fontFamily: 'inherit',
  }
  const card = {
    background: '#161616', border: '1px solid #2A2A2A', borderRadius: 14, padding: 24,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#F5F0E8', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        .bp-serif { font-family: 'Playfair Display', serif; }
        @keyframes bpFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .bp-fade-up { animation: bpFadeUp .4s ease both; }
        .bp-menu-item:hover { background: #2A2A2A; }
        .bp-nav:hover { color: #F5F0E8 !important; }
        .bp-hover-gold:hover { border-color: #C9A84C55 !important; }
        input[type="time"].bp-input::-webkit-calendar-picker-indicator { filter: invert(0.8); }
      `}</style>

      <DemoBanner productName="Barbersoft" />
      <DemoTimer demoCode="barberpro" minutes={10} extraMinutes={5} />

      {/* ── Navbar réplica ── */}
      <nav style={{ background: '#161616', borderBottom: '1px solid #2A2A2A', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#C9A84C', fontSize: 20 }}>✂</span>
          <span className="bp-serif" style={{ fontWeight: 900, fontSize: 18, letterSpacing: '0.02em' }}>
            Barber<span style={{ color: '#C9A84C' }}>soft</span>
          </span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map((l) => {
            const active = tab === l.key
            return (
              <button
                key={l.key}
                className="bp-nav"
                onClick={() => (l.locked ? setLockedFeature(l.label) : setTab(l.key))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                  borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
                  color: active ? '#C9A84C' : '#B8B0A0', padding: '20px 14px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'color .2s',
                }}
              >
                <span style={{ fontSize: 14 }}>{l.icon}</span>
                <span className="bp-nav-label">{l.label}</span>
                {l.locked && <span style={{ fontSize: 10, color: '#C9A84C' }}>◆</span>}
              </button>
            )
          })}
        </div>

        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>MODO DEMO</span>
        </span>
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* ════════ INICIO ════════ */}
        {tab === 'inicio' && (
          <div className="bp-fade-up">
            <p style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>
              {hoyLargo()}
            </p>
            <h1 className="bp-serif" style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Hola, El Patrón
            </h1>

            {/* Link público de reservas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, background: '#161616', border: '1px solid #2A2A2A', borderRadius: 10, padding: '10px 16px', width: 'fit-content', maxWidth: '100%' }}>
              <span style={{ color: '#B8B0A0', fontSize: 12 }}>🔗</span>
              <span style={{ color: '#B8B0A0', fontSize: 12, fontFamily: 'monospace' }}>
                /reservar/el-patron
              </span>
              <button
                onClick={copiarLink}
                style={{ background: copied ? 'rgba(76,175,125,0.15)' : '#1F1F1F', border: `1px solid ${copied ? 'rgba(76,175,125,0.3)' : '#2A2A2A'}`, color: copied ? '#4CAF7D' : '#B8B0A0', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit', transition: 'all .2s' }}
              >
                {copied ? '✓ COPIADO' : 'COPIAR'}
              </button>
            </div>
            <p style={{ color: '#B8B0A0', fontSize: 12, marginTop: 8, opacity: 0.7 }}>
              Tus clientes agendan solos desde este enlace — sin llamadas, sin WhatsApp a las 10 p.m.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 32 }}>
              {[
                { label: 'CITAS HOY', value: citas.length, color: '#C9A84C' },
                { label: 'PENDIENTES', value: pendientes, color: '#E8C97A' },
                { label: 'CONFIRMADAS', value: confirmadas, color: '#4CAF7D' },
                { label: 'CAJA DEL DÍA', value: formatPrice(cajaDia), color: '#F5F0E8' },
              ].map((s) => (
                <div key={s.label} style={card}>
                  <p style={{ color: '#B8B0A0', fontSize: 10, letterSpacing: '0.1em', fontWeight: 700 }}>{s.label}</p>
                  <p className="bp-serif" style={{ color: s.color, fontSize: 30, fontWeight: 900, marginTop: 8 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Agenda de hoy */}
            <div style={{ ...card, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 className="bp-serif" style={{ fontSize: 20, fontWeight: 700 }}>Agenda de hoy</h2>
                <button onClick={() => setTab('citas')} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit' }}>
                  VER TODAS →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {citas.slice(0, 4).map((c) => {
                  const cfg = STATUS_CONFIG[c.status]
                  return (
                    <div key={c.id} className="bp-hover-gold" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#1F1F1F', border: '1px solid #2A2A2A', borderRadius: 10, padding: '12px 16px', transition: 'border-color .2s' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#C9A84C', width: 46 }}>{c.hora}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cliente}</p>
                        <p style={{ fontSize: 12, color: '#B8B0A0' }}>
                          {servicioDe(c.servicioId)?.nombre} · {barberoDe(c.barberoId)?.nombre}
                        </p>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: cfg.bg, borderRadius: 20, padding: '4px 10px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                        <span style={{ color: cfg.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>{cfg.label.toUpperCase()}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════ CITAS ════════ */}
        {tab === 'citas' && (
          <div className="bp-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <h1 className="bp-serif" style={{ fontSize: 34, fontWeight: 900 }}>Citas</h1>
              <button style={btnGold} onClick={() => setShowCitaForm((v) => !v)}>
                {showCitaForm ? 'CANCELAR' : '+ NUEVA CITA'}
              </button>
            </div>

            {showCitaForm && (
              <form onSubmit={crearCita} className="bp-fade-up" style={{ ...card, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <Field label="CLIENTE" error={citaErrors.cliente}>
                    <input className="bp-input" style={inputStyle} placeholder="Nombre del cliente" value={citaForm.cliente} onChange={(e) => setCitaForm({ ...citaForm, cliente: e.target.value })} />
                  </Field>
                  <Field label="HORA" error={citaErrors.hora}>
                    <input className="bp-input" type="time" style={inputStyle} value={citaForm.hora} onChange={(e) => setCitaForm({ ...citaForm, hora: e.target.value })} />
                  </Field>
                  <Field label="SERVICIO">
                    <select style={inputStyle} value={citaForm.servicioId} onChange={(e) => setCitaForm({ ...citaForm, servicioId: Number(e.target.value) })}>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id} style={{ background: '#1F1F1F' }}>{s.nombre} — {formatPrice(s.precio)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="BARBERO">
                    <select style={inputStyle} value={citaForm.barberoId} onChange={(e) => setCitaForm({ ...citaForm, barberoId: Number(e.target.value) })}>
                      {barberos.map((b) => (
                        <option key={b.id} value={b.id} style={{ background: '#1F1F1F' }}>{b.nombre}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <button type="submit" style={{ ...btnGold, marginTop: 18 }}>AGENDAR CITA</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {citas.map((c) => (
                <div key={c.id} className="bp-hover-gold" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#161616', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 18px', transition: 'border-color .2s' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#C9A84C', width: 50 }}>{c.hora}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{c.cliente}</p>
                    <p style={{ fontSize: 12, color: '#B8B0A0', marginTop: 2 }}>
                      {servicioDe(c.servicioId)?.nombre} · {barberoDe(c.barberoId)?.nombre} ·{' '}
                      <span style={{ color: '#C9A84C' }}>{formatPrice(servicioDe(c.servicioId)?.precio || 0)}</span>
                    </p>
                  </div>
                  <StatusSelector status={c.status} onUpdate={(s) => actualizarEstado(c.id, s)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ BARBEROS ════════ */}
        {tab === 'barberos' && (
          <div className="bp-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <h1 className="bp-serif" style={{ fontSize: 34, fontWeight: 900 }}>Barberos</h1>
              <button style={btnGold} onClick={() => setShowBarberoForm((v) => !v)}>
                {showBarberoForm ? 'CANCELAR' : '+ NUEVO BARBERO'}
              </button>
            </div>

            {showBarberoForm && (
              <form onSubmit={crearBarbero} className="bp-fade-up" style={{ ...card, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <Field label="NOMBRE" error={barberoError}>
                    <input style={inputStyle} placeholder="Nombre del barbero" value={barberoForm.nombre} onChange={(e) => setBarberoForm({ ...barberoForm, nombre: e.target.value })} />
                  </Field>
                  <Field label="ESPECIALIDAD">
                    <input style={inputStyle} placeholder="Ej: Fade y diseño" value={barberoForm.especialidad} onChange={(e) => setBarberoForm({ ...barberoForm, especialidad: e.target.value })} />
                  </Field>
                </div>
                <button type="submit" style={{ ...btnGold, marginTop: 18 }}>AGREGAR</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {barberos.map((b) => {
                const citasHoy = citas.filter((c) => c.barberoId === b.id && c.status !== 'cancelled').length
                return (
                  <div key={b.id} className="bp-hover-gold" style={{ ...card, transition: 'border-color .2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="bp-serif" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C', fontSize: 16, fontWeight: 900 }}>
                        {b.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700 }}>{b.nombre}</p>
                        <p style={{ fontSize: 12, color: '#B8B0A0' }}>{b.especialidad}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid #2A2A2A' }}>
                      <span style={{ fontSize: 12, color: '#B8B0A0' }}>
                        <span style={{ color: '#C9A84C', fontWeight: 700 }}>{citasHoy}</span> citas hoy
                      </span>
                      <button onClick={() => eliminarBarbero(b.id)} style={{ background: 'none', border: 'none', color: '#E05252', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit', opacity: 0.8 }}>
                        ELIMINAR
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ════════ SERVICIOS ════════ */}
        {tab === 'servicios' && (
          <div className="bp-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <h1 className="bp-serif" style={{ fontSize: 34, fontWeight: 900 }}>Servicios</h1>
              <button style={btnGold} onClick={() => setShowServicioForm((v) => !v)}>
                {showServicioForm ? 'CANCELAR' : '+ NUEVO SERVICIO'}
              </button>
            </div>

            {showServicioForm && (
              <form onSubmit={crearServicio} className="bp-fade-up" style={{ ...card, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <Field label="NOMBRE" error={servicioErrors.nombre}>
                    <input style={inputStyle} placeholder="Ej: Corte premium" value={servicioForm.nombre} onChange={(e) => setServicioForm({ ...servicioForm, nombre: e.target.value })} />
                  </Field>
                  <Field label="DURACIÓN (MIN)" error={servicioErrors.duracion}>
                    <input style={inputStyle} type="number" placeholder="30" value={servicioForm.duracion} onChange={(e) => setServicioForm({ ...servicioForm, duracion: e.target.value })} />
                  </Field>
                  <Field label="PRECIO (COP)" error={servicioErrors.precio}>
                    <input style={inputStyle} type="number" placeholder="25000" value={servicioForm.precio} onChange={(e) => setServicioForm({ ...servicioForm, precio: e.target.value })} />
                  </Field>
                </div>
                <button type="submit" style={{ ...btnGold, marginTop: 18 }}>CREAR SERVICIO</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {servicios.map((s) => (
                <div key={s.id} className="bp-hover-gold" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#161616', border: '1px solid #2A2A2A', borderRadius: 12, padding: '16px 20px', transition: 'border-color .2s' }}>
                  <span style={{ color: '#C9A84C', fontSize: 16 }}>✦</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{s.nombre}</p>
                    <p style={{ fontSize: 12, color: '#B8B0A0', marginTop: 2 }}>{s.duracion} minutos</p>
                  </div>
                  <span className="bp-serif" style={{ color: '#C9A84C', fontSize: 18, fontWeight: 900 }}>
                    {formatPrice(s.precio)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Gancho premium: Horarios / Reportes */}
      <PlansModal
        open={!!lockedFeature}
        title={`${lockedFeature || ''} está en la versión completa`}
        subtitle="En tu cuenta real configuras horarios de atención, recordatorios automáticos y reportes de ingresos por barbero."
        allowContinue
        continueLabel="Seguir en el demo"
        onContinue={() => setLockedFeature(null)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}