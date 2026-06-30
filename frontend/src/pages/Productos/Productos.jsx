const productos = [
  { nombre: 'JTool CRM', desc: 'Gestiona clientes, oportunidades y ventas en un solo lugar.' },
  { nombre: 'JTool Facturación', desc: 'Emite facturas electrónicas conforme a la DIAN sin complicaciones.' },
  { nombre: 'JTool Inventario', desc: 'Controla tu stock en tiempo real y evita quiebres de inventario.' },
  { nombre: 'JTool Analytics', desc: 'Visualiza el rendimiento de tu negocio con tableros claros.' },
]

function Productos() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-noche">Nuestros productos</h1>
        <p className="mt-3 max-w-2xl text-lg text-grafito/70">
          Una suite modular que crece con tu empresa. Activa solo lo que necesitas.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {productos.map((p) => (
            <article key={p.nombre} className="rounded-2xl border border-grafito/10 p-8 transition-shadow hover:shadow-lg">
              <h2 className="text-xl font-bold text-noche">{p.nombre}</h2>
              <p className="mt-2 text-grafito/70">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Productos
