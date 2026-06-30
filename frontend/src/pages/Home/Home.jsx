import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

/* ── Animación fade-in al entrar en viewport ── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ── Count-up animado ── */
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const duration = 1800
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target])
  return <span ref={ref}>{count}{suffix}</span>
}

/* ── Card de dashboard flotante (hero derecha) ── */
function DashboardCard() {
  return (
    <div style={{ animation: 'float 4s ease-in-out infinite' }}
      className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Panel JTools</span>
        <span className="h-2 w-2 rounded-full bg-esmeralda shadow-[0_0_6px_#00C896]" />
      </div>
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Ventas hoy', value: '$4.280.000', up: true },
          { label: 'Productos', value: '1.342', up: true },
          { label: 'Clientes', value: '89', up: false },
          { label: 'Pedidos', value: '23', up: true },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-[10px] text-white/40 mb-1">{m.label}</p>
            <p className="text-sm font-bold text-white">{m.value}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${m.up ? 'text-esmeralda' : 'text-red-400'}`}>
              {m.up ? '▲ +12%' : '▼ -3%'}
            </p>
          </div>
        ))}
      </div>
      {/* Barra de progreso */}
      <div className="mb-1 flex justify-between text-[10px] text-white/40">
        <span>Meta mensual</span><span>68%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div className="h-1.5 rounded-full bg-esmeralda" style={{ width: '68%' }} />
      </div>
      {/* Mini gráfica de barras */}
      <div className="mt-4 flex items-end gap-1 h-10">
        {[30, 55, 40, 70, 50, 85, 68].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-esmeralda/30"
            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <p className="text-[9px] text-white/20 mt-1 text-right">Últimos 7 días</p>
    </div>
  )
}

export default function Home() {
  const [benefRef, benefVisible] = useReveal()
  const [prodRef, prodVisible] = useReveal()
  const [statsRef, statsVisible] = useReveal()
  const [ctaRef, ctaVisible] = useReveal()

  return (
    <main className="bg-neblina overflow-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-screen bg-noche flex items-center overflow-hidden">

        {/* Patrón de grid de fondo */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(#00C896 1px, transparent 1px), linear-gradient(90deg, #00C896 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00C896, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00C896, transparent 70%)' }} />

        <div className="relative mx-auto max-w-6xl px-6 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Texto */}
            <div style={{ animation: 'slideUp 0.8s ease both' }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-esmeralda/30 bg-esmeralda/10 px-4 py-1.5 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-esmeralda shadow-[0_0_6px_#00C896]" />
                <span className="text-xs font-semibold text-esmeralda tracking-wide uppercase">
                  Software colombiano 🇨🇴
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
                Gestiona tu<br />
                negocio con<br />
                <span className="text-esmeralda" style={{ textShadow: '0 0 40px rgba(0,200,150,0.3)' }}>
                  software real.
                </span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
                JTool Enterprise centraliza tus herramientas en un solo lugar.
                Diseñado para repuesteras, barberías y negocios colombianos que quieren crecer.
              </p>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/contacto"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-esmeralda px-7 py-4 font-bold text-noche text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ boxShadow: '0 0 0 0 rgba(0,200,150,0)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(0,200,150,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0,200,150,0)'}
                >
                  Empezar gratis
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/productos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 font-semibold text-white text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40"
                >
                  Ver productos
                </Link>
              </div>

              {/* Mini stats */}
              <div className="flex gap-8">
                {[
                  { n: '3', label: 'Productos' },
                  { n: '+50', label: 'En lista de espera' },
                  { n: '100%', label: 'Colombiano' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-white">{s.n}</p>
                    <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard flotante */}
            <div className="hidden lg:flex justify-center" style={{ animation: 'slideUp 0.8s 0.2s ease both' }}>
              <DashboardCard />
            </div>
          </div>
        </div>

        {/* Curva inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" fill="#F5F7FA" />
          </svg>
        </div>
      </section>

      {/* ══════════════ POR QUÉ JTOOL ══════════════ */}
      <section ref={benefRef} className="bg-neblina py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${benefVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xs font-bold tracking-widest text-esmeralda uppercase mb-3">Por qué elegirnos</p>
            <h2 className="text-4xl font-black text-grafito leading-tight">
              Software que entiende<br />
              <span className="text-noche">cómo trabaja Colombia</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                ),
                title: 'Multi-producto',
                desc: 'Una sola plataforma con todas las herramientas que necesita tu negocio.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                ),
                title: 'Hecho en Colombia',
                desc: 'Diseñado para la realidad del mercado colombiano, en tu idioma y zona horaria.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                ),
                title: 'Seguro y confiable',
                desc: 'Infraestructura robusta con respaldo automático y cifrado de datos.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                ),
                title: 'Escala contigo',
                desc: 'Desde un local hasta múltiples sedes — JTool Enterprise crece a tu ritmo.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`group rounded-2xl bg-white border border-grafito/10 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-esmeralda/30 ${benefVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="mb-5 h-12 w-12 rounded-xl bg-esmeralda/10 text-esmeralda flex items-center justify-center transition-all duration-300 group-hover:bg-esmeralda group-hover:text-noche">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-grafito mb-2">{item.title}</h3>
                <p className="text-sm text-grafito/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRODUCTOS ══════════════ */}
      <section ref={prodRef} className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${prodVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xs font-bold tracking-widest text-esmeralda uppercase mb-3">Nuestros productos</p>
            <h2 className="text-4xl font-black text-grafito">
              Una suite completa<br />
              <span className="text-noche">para tu industria</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'JTools',
                tag: 'Disponible',
                tagColor: 'bg-esmeralda/10 text-esmeralda border-esmeralda/20',
                dot: 'bg-esmeralda shadow-[0_0_6px_#00C896]',
                desc: 'Sistema completo de gestión para repuesteras: inventario, ventas, compras, producción y más.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                ),
                available: true,
              },
              {
                name: 'BarberPro',
                tag: 'Próximamente',
                tagColor: 'bg-profundo/10 text-profundo border-profundo/20',
                dot: 'bg-profundo',
                desc: 'Agendamiento de turnos, control de citas, inventario de productos y gestión de personal para barberías.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                ),
                available: false,
              },
              {
                name: 'CatalogApp',
                tag: 'En desarrollo',
                tagColor: 'bg-naranja/10 text-naranja border-naranja/20',
                dot: 'bg-naranja',
                desc: 'Catálogo digital para mostrar tus productos y servicios, con gestión de pedidos y clientes.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                ),
                available: false,
              },
            ].map((p, i) => (
              <div
                key={p.name}
                className={`group relative rounded-2xl border border-grafito/10 bg-neblina p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-esmeralda/20 overflow-hidden ${prodVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Línea superior hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-esmeralda scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="mb-6 h-14 w-14 rounded-2xl bg-noche text-esmeralda flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  {p.icon}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-black text-grafito">{p.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${p.tagColor}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                    {p.tag}
                  </span>
                </div>

                <p className="text-sm text-grafito/60 leading-relaxed mb-6">{p.desc}</p>

                <button
                  disabled={!p.available}
                  className={`w-full rounded-xl py-3 text-sm font-bold transition-all duration-300 ${
                    p.available
                      ? 'bg-esmeralda text-noche hover:shadow-lg hover:shadow-esmeralda/30'
                      : 'bg-grafito/10 text-grafito/40 cursor-not-allowed'
                  }`}
                >
                  {p.available ? 'Ir a JTools →' : 'Notificarme cuando esté listo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ ESTADÍSTICAS ══════════════ */}
      <section ref={statsRef} className="bg-noche py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(#00C896 1px, transparent 1px), linear-gradient(90deg, #00C896 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-black text-white">
              Construido con propósito,<br />
              <span className="text-esmeralda">respaldado por números</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { target: 3, suffix: '', label: 'Productos en la suite', sub: 'JTools, BarberPro, CatalogApp' },
              { target: 50, suffix: '+', label: 'Negocios en lista de espera', sub: 'Listos para empezar' },
              { target: 100, suffix: '%', label: 'Colombiano', sub: 'Desarrollado en Medellín' },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <p className="text-6xl font-black text-esmeralda mb-2" style={{ textShadow: '0 0 30px rgba(0,200,150,0.3)' }}>
                  <CountUp target={s.target} suffix={s.suffix} />
                </p>
                <p className="text-white font-bold text-lg mb-1">{s.label}</p>
                <p className="text-white/40 text-sm">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section ref={ctaRef} className="bg-neblina py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className={`transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xs font-bold tracking-widest text-esmeralda uppercase mb-4">¿Listo para empezar?</p>
            <h2 className="text-4xl sm:text-5xl font-black text-grafito leading-tight mb-6">
              Lleva tu negocio al<br />
              <span className="text-noche">siguiente nivel</span>
            </h2>
            <p className="text-grafito/60 text-lg mb-10">
              Únete a la lista de espera y sé de los primeros en acceder a JTool Enterprise.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-2xl bg-noche px-10 py-5 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-noche/30"
            >
              Empezar gratis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-grafito/40 text-sm mt-4">Sin tarjeta de crédito. Sin contratos.</p>
          </div>
        </div>
      </section>

      {/* ══════════════ KEYFRAMES ══════════════ */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}