import { useEffect, useState } from 'react'
import PlansModal from './PlansModal'

/*
 * DemoTimer — límite de tiempo para los demos interactivos.
 *
 * Flujo:
 *  1. Al entrar, arranca un contador de `minutes` minutos (persistido en
 *     localStorage: refrescar la página NO reinicia el tiempo).
 *  2. Al agotarse: modal de planes con opción de continuar `extraMinutes` más.
 *  3. Al agotarse la extensión: modal bloqueante — solo "Ver planes" o salir.
 *
 * Uso: <DemoTimer demoCode="barberpro" minutes={10} extraMinutes={5} />
 *
 * Para reiniciar el demo durante pruebas (consola del navegador):
 *   localStorage.removeItem('demo_deadline_barberpro')
 *   localStorage.removeItem('demo_extended_barberpro')
 */
function DemoTimer({ demoCode, minutes = 10, extraMinutes = 5 }) {
  const deadlineKey = `demo_deadline_${demoCode}`
  const extendedKey = `demo_extended_${demoCode}`

  const [deadline, setDeadline] = useState(() => {
    const stored = Number(localStorage.getItem(deadlineKey))
    if (stored && stored > Date.now()) return stored
    if (stored && stored <= Date.now()) return stored // ya venció: respetarlo
    const fresh = Date.now() + minutes * 60000
    localStorage.setItem(deadlineKey, String(fresh))
    return fresh
  })
  const [extended, setExtended] = useState(
    () => localStorage.getItem(extendedKey) === '1'
  )
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const restante = Math.max(0, deadline - now)
  const vencido = restante === 0
  const min = Math.floor(restante / 60000)
  const seg = Math.floor((restante % 60000) / 1000)
  const urgente = restante < 2 * 60000

  function continuar() {
    const nuevo = Date.now() + extraMinutes * 60000
    localStorage.setItem(deadlineKey, String(nuevo))
    localStorage.setItem(extendedKey, '1')
    setDeadline(nuevo)
    setExtended(true)
  }

  return (
    <>
      {/* Chip flotante con el tiempo restante */}
      {!vencido && (
        <div
          className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-full border px-4 py-2.5 shadow-xl backdrop-blur-md transition-colors duration-500 ${
            urgente
              ? 'border-red-500/50 bg-red-500/15 text-red-400'
              : 'border-white/15 bg-noche/85 text-white'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${urgente ? 'bg-red-400' : 'bg-esmeralda'} animate-pulse`} />
          <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Demo</span>
          <span className="font-mono text-sm font-black tabular-nums">
            {String(min).padStart(2, '0')}:{String(seg).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Primer vencimiento: puede extender */}
      <PlansModal
        open={vencido && !extended}
        title="Se acabaron tus 10 minutos de prueba"
        subtitle="Así de rápido se organiza un negocio. ¿Quieres tu propia cuenta con tus datos de verdad?"
        allowContinue
        continueLabel={`Seguir explorando ${extraMinutes} min más`}
        onContinue={continuar}
      />

      {/* Segundo vencimiento: bloqueo definitivo */}
      <PlansModal
        open={vencido && extended}
        title="El demo terminó — tu negocio apenas empieza"
        subtitle="Ya viste cómo funciona. Activa tu plan y en minutos estás trabajando con datos reales."
        allowContinue={false}
      />
    </>
  )
}

export default DemoTimer