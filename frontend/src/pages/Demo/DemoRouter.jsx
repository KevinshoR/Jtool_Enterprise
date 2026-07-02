import { useParams, Link } from 'react-router-dom'
import BarberProDemo from './BarberProDemo'

// Cuando armemos el demo de JTools y CatalogApp, se agregan acá
const demos = {
  barberpro: BarberProDemo,
}

function DemoRouter() {
  const { code } = useParams()
  const DemoComponent = demos[code]

  if (!DemoComponent) {
    return (
      <main className="min-h-screen bg-noche flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-white/60">Todavía no tenemos un demo interactivo para este programa.</p>
          <Link to="/productos" className="mt-4 inline-block text-esmeralda hover:underline">
            ← Volver a programas
          </Link>
        </div>
      </main>
    )
  }

  return <DemoComponent />
}

export default DemoRouter