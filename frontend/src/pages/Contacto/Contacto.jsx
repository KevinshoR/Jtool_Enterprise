function Contacto() {
  return (
    <main className="min-h-screen bg-neblina">
      <section className="bg-noche pt-32 pb-16 px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Contáctanos</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Contanos qué necesita tu negocio y te ayudamos a elegir el plan correcto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl bg-white border border-grafito/10 p-10 text-center shadow-sm">
          <p className="text-grafito/70">Formulario de contacto — próximamente</p>
          <p className="mt-2 text-sm text-grafito/50">
            Mientras tanto escribinos a{' '}
            <a href="mailto:contacto@jtool.com" className="text-esmeralda hover:underline">
              contacto@jtool.com
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Contacto