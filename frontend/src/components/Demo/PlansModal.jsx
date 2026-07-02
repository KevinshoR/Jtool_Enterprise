import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function formatCOP(v) {
  return `$${Number(v).toLocaleString('es-CO')}`
}

/*
 * Modal de planes reutilizable para los demos.
 *
 * Props:
 *  - open:           boolean, controla visibilidad
 *  - title:          título grande del modal
 *  - subtitle:       texto de apoyo
 *  - allowContinue:  si true, muestra el botón secundario para seguir en el demo
 *  - continueLabel:  texto del botón secundario
 *  - onContinue:     callback del botón secundario
 *  - exitTo:         ruta del enlace "salir" cuando NO se permite continuar (default /productos)
 */
function PlansModal({
  open,
  title = '¿Te gustó lo que viste?',
  subtitle = 'Activa tu cuenta y empieza a trabajar con datos reales hoy mismo.',
  allowContinue = false,
  continueLabel = 'Seguir explorando',
  onContinue,
  exitTo = '/productos',
}) {
  const [planes, setPlanes] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!open || loaded) return
    api
      .get('/plans')
      .then(({ data }) => setPlanes(Array.isArray(data) ? data : []))
      .catch(() => setPlanes([]))
      .finally(() => setLoaded(true))
  }, [open, loaded])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Cabecera */}
        <div className="bg-noche px-8 pb-8 pt-9 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-esmeralda font-black text-noche">
            JT
          </div>
          <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{subtitle}</p>
        </div>

        {/* Planes */}
        <div className="px-8 py-7">
          {planes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {planes.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-4 text-center ${
                    plan.is_featured
                      ? 'border-esmeralda bg-esmeralda/5'
                      : 'border-grafito/10 bg-neblina'
                  }`}
                >
                  {plan.is_featured && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-esmeralda px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-noche">
                      Recomendado
                    </span>
                  )}
                  <p className="text-xs font-bold text-noche">{plan.name}</p>
                  <p className="mt-1.5">
                    <span className="font-display text-xl font-black text-noche">
                      {formatCOP(plan.price_monthly)}
                    </span>
                    <span className="text-[11px] text-grafito/40"> /mes</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-grafito/60">
              Planes desde <strong className="text-noche">$79.000/mes</strong> en pesos colombianos —
              sin permanencia y con soporte en español.
            </p>
          )}

          {/* Acciones */}
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/precios"
              className="inline-flex w-full items-center justify-center rounded-xl bg-esmeralda px-7 py-3.5 text-sm font-black text-noche transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-esmeralda/30 sm:w-auto"
            >
              Ver planes completos →
            </Link>
            {allowContinue ? (
              <button
                onClick={onContinue}
                className="w-full rounded-xl border border-grafito/15 px-7 py-3.5 text-sm font-bold text-grafito/60 transition-colors hover:border-grafito/30 hover:text-noche sm:w-auto"
              >
                {continueLabel}
              </button>
            ) : (
              <Link
                to={exitTo}
                className="w-full rounded-xl border border-grafito/15 px-7 py-3.5 text-center text-sm font-bold text-grafito/60 transition-colors hover:border-grafito/30 hover:text-noche sm:w-auto"
              >
                Salir del demo
              </Link>
            )}
          </div>
          <p className="mt-4 text-center text-[11px] text-grafito/35">
            Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlansModal