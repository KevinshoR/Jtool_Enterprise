import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Wrench,
  Scissors,
  Store,
  Check,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react'
import api from '../../services/api'

/* ════════════════════════════════════════════
   Utilidades
════════════════════════════════════════════ */

function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function formatCOP(value) {
  return `$${Number(value).toLocaleString('es-CO')}`
}

const reveal = (visible, delay = 0) =>
  `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
    .concat(delay ? '' : '')

/* ════════════════════════════════════════════
   HERO · Panel interactivo por tipo de negocio
════════════════════════════════════════════ */

const negocios = [
  {
    id: 'repuestera',
    label: 'Repuestera',
    icon: Wrench,
    producto: 'JTools',
    code: 'jtools',
  },
  {
    id: 'barberia',
    label: 'Barbería',
    icon: Scissors,
    producto: 'BarberPro',
    code: 'barberpro',
  },
  {
    id: 'comercio',
    label: 'Comercio',
    icon: Store,
    producto: 'CatalogApp',
    code: 'catalogapp',
  },
]

function PanelRepuestera() {
  const items = [
    { ref: 'REF-8842', nombre: 'Pastillas de freno', stock: 24, precio: 86000 },
    { ref: 'REF-1077', nombre: 'Filtro de aceite', stock: 3, precio: 32000, bajo: true },
    { ref: 'REF-5530', nombre: 'Bujía iridium', stock: 48, precio: 41000 },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-white">Inventario · JRepuestos</p>
        <span className="rounded-full bg-esmeralda/15 px-2.5 py-0.5 text-[10px] font-bold text-esmeralda">
          En vivo
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <div
            key={it.ref}
            className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5"
          >
            <span className="font-mono text-[10px] text-esmeralda/80 shrink-0">{it.ref}</span>
            <span className="flex-1 truncate text-xs text-white/80">{it.nombre}</span>
            <span
              className={`font-mono text-[10px] shrink-0 ${it.bajo ? 'text-naranja' : 'text-white/40'}`}
            >
              {it.stock} und{it.bajo && ' ⚠'}
            </span>
            <span className="font-mono text-[11px] font-bold text-white shrink-0">
              {formatCOP(it.precio)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-esmeralda px-4 py-2.5">
        <span className="text-xs font-bold text-noche">+ Registrar venta</span>
        <span className="font-mono text-[10px] text-noche/60">F2</span>
      </div>
    </div>
  )
}

function PanelBarberia() {
  const citas = [
    { hora: '9:00', cliente: 'Carlos M.', servicio: 'Corte + barba', ok: true },
    { hora: '9:45', cliente: null },
    { hora: '10:30', cliente: 'Julián R.', servicio: 'Fade clásico', ok: true },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-white">Agenda de hoy · BarberPro</p>
        <span className="font-mono text-[10px] text-white/40">8/12 citas</span>
      </div>
      <div className="flex flex-col gap-2">
        {citas.map((c) => (
          <div
            key={c.hora}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
              c.cliente
                ? 'bg-white/5 border-white/10'
                : 'border-dashed border-esmeralda/40 bg-esmeralda/5'
            }`}
          >
            <span className="font-mono text-[11px] font-bold text-white/70 shrink-0 w-10">
              {c.hora}
            </span>
            {c.cliente ? (
              <>
                <span className="flex-1 truncate text-xs text-white/80">{c.cliente}</span>
                <span className="text-[10px] text-white/40 shrink-0">{c.servicio}</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-esmeralda/20 text-esmeralda shrink-0">
                  <Check size={9} strokeWidth={3.5} />
                </span>
              </>
            ) : (
              <span className="flex-1 text-xs font-semibold text-esmeralda">
                Espacio disponible — reservar
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
        <div className="h-1.5 rounded-full bg-esmeralda transition-all duration-1000" style={{ width: '66%' }} />
      </div>
      <p className="mt-1.5 text-right font-mono text-[9px] text-white/30">Ocupación del día · 66%</p>
    </div>
  )
}

function PanelComercio() {
  const productos = [
    { nombre: 'Camiseta oversize', precio: 65000 },
    { nombre: 'Gorra snapback', precio: 48000 },
    { nombre: 'Tenis urbanos', precio: 189000 },
    { nombre: 'Riñonera', precio: 55000 },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-white">Catálogo público · CatalogApp</p>
        <span className="rounded-full bg-naranja/15 px-2.5 py-0.5 text-[10px] font-bold text-naranja">
          Pedido nuevo
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {productos.map((p) => (
          <div key={p.nombre} className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="mb-2 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/[0.02]" />
            <p className="truncate text-[11px] font-semibold text-white/80">{p.nombre}</p>
            <p className="font-mono text-[10px] text-esmeralda">{formatCOP(p.precio)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] text-white/40">
        Pedido <span className="text-white/70">#124</span> · 3 artículos · hace 2 min
      </p>
    </div>
  )
}

const paneles = {
  repuestera: PanelRepuestera,
  barberia: PanelBarberia,
  comercio: PanelComercio,
}

function HeroPanel() {
  const [activo, setActivo] = useState('repuestera')
  const [manual, setManual] = useState(false)

  useEffect(() => {
    if (manual) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const timer = setInterval(() => {
      setActivo((prev) => {
        const i = negocios.findIndex((n) => n.id === prev)
        return negocios[(i + 1) % negocios.length].id
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [manual])

  const negocio = negocios.find((n) => n.id === activo)
  const Panel = paneles[activo]

  return (
    <div className="w-full max-w-md">
      {/* Pestañas: ¿qué negocio tienes? */}
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/35">
        ¿Qué negocio tienes?
      </p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {negocios.map((n) => {
          const Icon = n.icon
          const isActive = n.id === activo
          return (
            <button
              key={n.id}
              onClick={() => {
                setActivo(n.id)
                setManual(true)
              }}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'border-esmeralda/60 bg-esmeralda/10 text-esmeralda'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {n.label}
              {isActive && !manual && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 overflow-hidden rounded-full bg-white/10">
                  <span className="tab-progress block h-full bg-esmeralda" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Ventana del producto */}
      <div
        className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-sm"
        style={{ animation: 'float 5s ease-in-out infinite' }}
      >
        {/* Chrome de la ventana */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-esmeralda/60" />
          </div>
          <span className="font-mono text-[10px] text-white/30">
            {negocio.producto.toLowerCase()}.jtool.com.co
          </span>
        </div>
        <div key={activo} className="panel-swap p-5">
          <Panel />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-white/35">
        Esto es <span className="font-bold text-esmeralda">{negocio.producto}</span> — uno de los
        programas de la suite.{' '}
        <Link to={`/productos/${negocio.code}`} className="text-white/60 underline underline-offset-2 hover:text-white">
          Conócelo
        </Link>
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════
   Sección · Del cuaderno al panel
════════════════════════════════════════════ */

function DelCuadernoAlPanel() {
  const [ref, visible] = useReveal()
  const cuentas = [
    { texto: 'pastillas freno .... 24', valor: '86.000' },
    { texto: 'filtro aceite ...... ¿3?', valor: '32.000' },
    { texto: 'fiado don Jairo', valor: '150.000' },
    { texto: 'TOTAL DÍA (creo)', valor: '???' },
  ]
  return (
    <section ref={ref} className="bg-white py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className={`text-center mb-14 ${reveal(visible)}`}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-esmeralda">
            La historia de siempre
          </p>
          <h2 className="font-display text-4xl font-black leading-tight text-grafito">
            Del cuaderno<br />
            <span className="text-noche">al panel de control</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-grafito/60">
            JTool nació detrás del mostrador de una repuestera en Medellín, donde el inventario
            vivía en un cuaderno y las cuentas se hacían de memoria. Sabemos exactamente qué duele.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* El cuaderno */}
          <div
            className={`mx-auto w-full max-w-sm ${reveal(visible)}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div
              className="relative rounded-lg border border-grafito/15 bg-[#FFFDF6] p-6 shadow-xl"
              style={{
                transform: 'rotate(-1.8deg)',
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 27px, rgba(26,63,92,0.12) 28px)',
              }}
            >
              {/* Espiral */}
              <div className="absolute -left-2 top-4 bottom-4 flex flex-col justify-between">
                {[...Array(6)].map((_, i) => (
                  <span key={i} className="h-3.5 w-3.5 rounded-full border-2 border-grafito/25 bg-white" />
                ))}
              </div>
              <p className="mb-4 pl-4 font-mono text-xs font-bold uppercase tracking-wide text-profundo/70">
                Martes — cuentas
              </p>
              <div className="flex flex-col gap-[13px] pl-4">
                {cuentas.map((c) => (
                  <div key={c.texto} className="flex justify-between font-mono text-[13px] text-profundo/80">
                    <span>{c.texto}</span>
                    <span className="font-bold">{c.valor}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 pl-4 font-mono text-[11px] italic text-naranja/80">
                * revisar mañana si alcanza el filtro
              </p>
            </div>
          </div>

          {/* Flecha */}
          <div className={`flex justify-center ${reveal(visible)}`} style={{ transitionDelay: '250ms' }}>
            <div className="flex h-14 w-14 rotate-90 items-center justify-center rounded-full bg-esmeralda text-noche shadow-lg shadow-esmeralda/30 lg:rotate-0">
              <ArrowRight size={22} strokeWidth={3} />
            </div>
          </div>

          {/* El panel */}
          <div
            className={`mx-auto w-full max-w-sm ${reveal(visible)}`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="rounded-2xl bg-noche p-6 shadow-2xl shadow-noche/25">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold text-white">Cierre del día</p>
                <span className="rounded-full bg-esmeralda/15 px-2.5 py-0.5 text-[10px] font-bold text-esmeralda">
                  Cuadrado ✓
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { k: 'Pastillas de freno', v: '24 und', ok: true },
                  { k: 'Filtro de aceite', v: '3 und · pedir ya', alerta: true },
                  { k: 'Crédito — Don Jairo', v: '$150.000', ok: true },
                ].map((r) => (
                  <div
                    key={r.k}
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-2.5"
                  >
                    <span className="text-xs text-white/75">{r.k}</span>
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        r.alerta ? 'text-naranja' : 'text-esmeralda'
                      }`}
                    >
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-esmeralda/10 border border-esmeralda/25 px-4 py-3">
                <span className="text-xs font-bold text-white">Total del día</span>
                <span className="font-mono text-sm font-black text-esmeralda">$1.284.500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Sección · Productos de la suite
════════════════════════════════════════════ */

const productosSuite = [
  {
    name: 'JTools',
    code: 'jtools',
    tag: 'Disponible',
    tagCls: 'bg-esmeralda/10 text-esmeralda border-esmeralda/25',
    dot: 'bg-esmeralda shadow-[0_0_6px_#00C896]',
    icon: Wrench,
    iconCls: 'bg-esmeralda text-noche',
    desc: 'Inventario, ventas, compras, proveedores y producción para repuesteras. El programa con el que nació todo.',
    para: 'Repuesteras y almacenes de autopartes',
  },
  {
    name: 'BarberPro',
    code: 'barberpro',
    tag: 'Demo disponible',
    tagCls: 'bg-profundo/10 text-profundo border-profundo/25',
    dot: 'bg-profundo',
    icon: Scissors,
    iconCls: 'bg-profundo text-white',
    desc: 'Agenda de citas, servicios, barberos y caja diaria. Tu barbería organizada desde el celular.',
    para: 'Barberías y salones',
  },
  {
    name: 'CatalogApp',
    code: 'catalogapp',
    tag: 'En desarrollo',
    tagCls: 'bg-naranja/10 text-naranja border-naranja/25',
    dot: 'bg-naranja',
    icon: Store,
    iconCls: 'bg-naranja text-noche',
    desc: 'Catálogo digital con pedidos en línea para que tus clientes compren sin que tengas página web.',
    para: 'Tiendas y comercios',
  },
]

function Productos() {
  const [ref, visible] = useReveal()
  return (
    <section ref={ref} className="bg-neblina py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className={`mb-14 flex flex-wrap items-end justify-between gap-6 ${reveal(visible)}`}>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-esmeralda">
              La suite
            </p>
            <h2 className="font-display text-4xl font-black leading-tight text-grafito">
              Un programa para<br />
              <span className="text-noche">cada tipo de negocio</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-grafito/55">
            Tu suscripción activa los programas que necesitas. Empiezas con uno y sumas más cuando
            tu negocio crezca.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {productosSuite.map((p, i) => {
            const Icon = p.icon
            return (
              <Link
                key={p.code}
                to={`/productos/${p.code}`}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-grafito/10 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-esmeralda/30 hover:shadow-2xl ${reveal(visible)}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 bg-esmeralda transition-transform duration-500 group-hover:scale-x-100" />
                <div className="mb-6 flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${p.iconCls}`}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${p.tagCls}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                    {p.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-black text-grafito">{p.name}</h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-grafito/40">
                  {p.para}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-grafito/60">{p.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-esmeralda">
                  Ver programa
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Sección · Cómo funciona + planes reales
════════════════════════════════════════════ */

function ComoFunciona() {
  const [ref, visible] = useReveal()
  const [planes, setPlanes] = useState([])

  useEffect(() => {
    api
      .get('/plans')
      .then(({ data }) => setPlanes(Array.isArray(data) ? data : []))
      .catch(() => setPlanes([]))
  }, [])

  const pasos = [
    {
      n: '1',
      titulo: 'Elige tu plan',
      desc: 'Una suscripción mensual en pesos, sin licencias eternas ni letra pequeña.',
    },
    {
      n: '2',
      titulo: 'Activa tus programas',
      desc: 'Te configuramos los programas que tu negocio necesita. Sin instalaciones raras.',
    },
    {
      n: '3',
      titulo: 'Trabaja desde donde sea',
      desc: 'Computador, tablet o celular. Tus datos seguros y disponibles siempre.',
    },
  ]

  return (
    <section ref={ref} className="relative overflow-hidden bg-noche py-24">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(#00C896 1px, transparent 1px), linear-gradient(90deg, #00C896 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className={`mb-14 text-center ${reveal(visible)}`}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-esmeralda">
            Cómo funciona
          </p>
          <h2 className="font-display text-4xl font-black text-white">
            Suscríbete y trabaja.<br />
            <span className="text-esmeralda">Así de simple.</span>
          </h2>
        </div>

        {/* Pasos (secuencia real: por eso van numerados) */}
        <div className="grid gap-6 sm:grid-cols-3">
          {pasos.map((p, i) => (
            <div
              key={p.n}
              className={`rounded-3xl border border-white/10 bg-white/[0.04] p-7 ${reveal(visible)}`}
              style={{ transitionDelay: `${i * 130}ms` }}
            >
              <span className="font-mono text-3xl font-black text-esmeralda/40">{p.n}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-white">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Teaser de planes reales (se oculta si la API falla) */}
        {planes.length > 0 && (
          <div className={`mt-14 ${reveal(visible)}`} style={{ transitionDelay: '300ms' }}>
            <div className="grid gap-4 sm:grid-cols-3">
              {planes.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                    plan.is_featured
                      ? 'border-esmeralda/50 bg-esmeralda/[0.07]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  {plan.is_featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-esmeralda px-3 py-1 text-[10px] font-black uppercase tracking-wide text-noche">
                      Recomendado
                    </span>
                  )}
                  <p className="text-sm font-bold text-white">{plan.name}</p>
                  <p className="mt-3">
                    <span className="font-display text-3xl font-black text-white">
                      {formatCOP(plan.price_monthly)}
                    </span>
                    <span className="text-sm text-white/40"> /mes</span>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">{plan.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/precios"
                className="inline-flex items-center gap-2 rounded-xl bg-esmeralda px-7 py-3.5 text-sm font-bold text-noche transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-esmeralda/30"
              >
                Comparar planes completos
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Sección · Manifiesto
════════════════════════════════════════════ */

function Manifiesto() {
  const [ref, visible] = useReveal()
  return (
    <section ref={ref} className="bg-white py-24">
      <div className={`mx-auto max-w-3xl px-6 text-center ${reveal(visible)}`}>
        <span className="font-display text-6xl font-black leading-none text-esmeralda">"</span>
        <p className="font-display text-2xl font-bold leading-snug text-grafito sm:text-3xl">
          No somos una startup de Silicon Valley. Somos un equipo de Medellín que vio a los negocios
          de barrio llevar las cuentas en un cuaderno — y decidió que merecían el mismo software que
          las grandes empresas, a un precio que sí pueden pagar.
        </p>
        <div className="mx-auto mt-8 h-1 w-14 rounded-full bg-esmeralda" />
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-grafito/40">
          El equipo de JTool Enterprise · Medellín, Colombia
        </p>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Sección · Preguntas frecuentes
════════════════════════════════════════════ */

const faqs = [
  {
    q: '¿Necesito tarjeta de crédito para empezar?',
    a: 'No. Puedes crear tu cuenta y conocer la plataforma sin ingresar ningún método de pago. Solo pagas cuando decides activar tu plan.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. La suscripción es mes a mes, sin cláusulas de permanencia. Si cancelas, tus datos quedan disponibles para exportar.',
  },
  {
    q: '¿Funciona en el celular?',
    a: 'Sí. La plataforma funciona en computador, tablet y celular. Puedes atender el negocio desde el mostrador o desde tu casa.',
  },
  {
    q: '¿Qué pasa con mis datos?',
    a: 'Son tuyos y solo tuyos. Usamos cifrado, copias de seguridad automáticas y nunca compartimos tu información con terceros.',
  },
]

function FAQ() {
  const [ref, visible] = useReveal()
  const [abierta, setAbierta] = useState(0)
  return (
    <section ref={ref} className="bg-neblina py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className={`mb-12 text-center ${reveal(visible)}`}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-esmeralda">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-4xl font-black text-grafito">
            Lo que todos preguntan<br />
            <span className="text-noche">antes de empezar</span>
          </h2>
        </div>

        <div className={`flex flex-col gap-3 ${reveal(visible)}`} style={{ transitionDelay: '150ms' }}>
          {faqs.map((f, i) => {
            const open = abierta === i
            return (
              <div
                key={f.q}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
                  open ? 'border-esmeralda/40' : 'border-grafito/10'
                }`}
              >
                <button
                  onClick={() => setAbierta(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-bold text-noche sm:text-base">{f.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      open ? 'bg-esmeralda text-noche rotate-180' : 'bg-neblina text-grafito/50'
                    }`}
                  >
                    {open ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-grafito/60">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Sección · CTA final
════════════════════════════════════════════ */

function CTAFinal() {
  const [ref, visible] = useReveal()
  return (
    <section ref={ref} className="bg-neblina px-6 pb-24">
      <div
        className={`relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-noche px-8 py-16 text-center shadow-2xl shadow-noche/25 sm:px-16 ${reveal(visible)}`}
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #00C896, transparent 70%)' }}
        />
        <p className="relative mb-4 text-xs font-bold uppercase tracking-widest text-esmeralda">
          Tu negocio te lo va a agradecer
        </p>
        <h2 className="relative font-display text-4xl font-black leading-tight text-white sm:text-5xl">
          Deja el cuaderno.<br />
          Quédate con el control.
        </h2>
        <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/precios"
            className="inline-flex items-center gap-2 rounded-2xl bg-esmeralda px-8 py-4 text-sm font-black text-noche transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-esmeralda/30"
          >
            Ver planes y precios
            <ArrowRight size={16} strokeWidth={3} />
          </Link>
          <Link
            to="/demo/barberpro"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/5"
          >
            Probar la demo en vivo
          </Link>
        </div>
        <p className="relative mt-5 text-xs text-white/35">
          Sin tarjeta de crédito · Cancela cuando quieras · Soporte en español
        </p>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   HOME
════════════════════════════════════════════ */

export default function Home() {
  return (
    <main className="overflow-hidden bg-neblina">
      {/* ══════════ HERO ══════════ */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-noche">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#00C896 1px, transparent 1px), linear-gradient(90deg, #00C896 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="absolute left-1/4 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00C896, transparent 70%)' }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
            {/* Texto */}
            <div style={{ animation: 'slideUp 0.8s ease both' }}>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-esmeralda/30 bg-esmeralda/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-esmeralda shadow-[0_0_6px_#00C896]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-esmeralda">
                  Suite empresarial · Hecha en Medellín 🇨🇴
                </span>
              </div>

              <h1 className="font-display text-[2.7rem] font-black leading-[1.04] tracking-tight text-white sm:text-6xl">
                Maneja tu negocio
                <br />
                como las grandes,
                <br />
                <span className="text-esmeralda" style={{ textShadow: '0 0 40px rgba(0,200,150,0.3)' }}>
                  pagando como las pequeñas.
                </span>
              </h1>

              <p className="mb-10 mt-6 max-w-md text-lg leading-relaxed text-white/60">
                Una suscripción mensual activa los programas que tu repuestera, barbería o comercio
                necesita. Sin licencias eternas, sin instalaciones raras, sin sorpresas.
              </p>

              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/precios"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-esmeralda px-7 py-4 text-sm font-black text-noche transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,200,150,0.4)]"
                >
                  Ver planes y precios
                  <ArrowRight size={16} strokeWidth={3} />
                </Link>
                <Link
                  to="/demo/barberpro"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                >
                  Probar la demo en vivo
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {['3 programas, 1 suscripción', 'Precios en pesos colombianos', 'Soporte en español'].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-2 text-xs font-semibold text-white/45">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-esmeralda/15 text-esmeralda">
                        <Check size={9} strokeWidth={3.5} />
                      </span>
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Panel interactivo */}
            <div
              className="hidden justify-center lg:flex"
              style={{ animation: 'slideUp 0.8s 0.25s ease both' }}
            >
              <HeroPanel />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" fill="#FFFFFF" />
          </svg>
        </div>
      </section>

      {/* Panel interactivo en móvil (debajo del hero) */}
      <section className="bg-noche px-6 pb-16 lg:hidden -mt-1">
        <div className="mx-auto flex max-w-md justify-center">
          <HeroPanel />
        </div>
      </section>

      <DelCuadernoAlPanel />
      <Productos />
      <ComoFunciona />
      <Manifiesto />
      <FAQ />
      <CTAFinal />

      {/* ══════════ KEYFRAMES ══════════ */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tabProgress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .tab-progress { animation: tabProgress 5s linear both; }
        @keyframes panelSwap {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .panel-swap { animation: panelSwap .45s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .tab-progress, .panel-swap { animation: none; }
        }
      `}</style>
    </main>
  )
}