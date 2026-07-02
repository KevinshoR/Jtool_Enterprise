import { Link } from 'react-router-dom'

function DemoBanner({ productName }) {
  return (
    <div className="sticky top-0 z-50 bg-esmeralda text-noche px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span>
        🧪 Estás probando <strong>{productName}</strong> en modo demo — nada de lo que hagas aquí se guarda.
      </span>
      <div className="flex gap-2 shrink-0">
        <Link
          to="/precios"
          className="rounded-lg bg-noche text-white px-4 py-1.5 text-xs font-bold hover:scale-105 transition-transform"
        >
          Quiero mi cuenta
        </Link>
        <Link
          to="/productos"
          className="rounded-lg bg-noche/10 px-4 py-1.5 text-xs font-bold hover:bg-noche/20 transition-colors"
        >
          Salir del demo
        </Link>
      </div>
    </div>
  )
}

export default DemoBanner