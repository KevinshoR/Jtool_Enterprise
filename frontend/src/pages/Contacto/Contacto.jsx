import { useEffect, useState } from 'react'
import { Mail, MapPin, Clock } from 'lucide-react'
import api from '../../services/api'

const initialForm = {
  name: '',
  email: '',
  company: '',
  productCode: '',
  message: '',
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Contacto() {
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api
      .get('/products')
      .then(({ data }) => setProductos(data))
      .catch(() => setProductos([]))
  }, [])

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Ingresa tu nombre'
    if (!form.email.trim()) next.email = 'Ingresa tu correo'
    else if (!isEmailValid(form.email)) next.email = 'Ingresa un correo válido'
    if (!form.message.trim()) next.message = 'Cuéntanos qué necesitas'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      // TODO: conectar con el endpoint real de contacto (POST /contact) cuando exista
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSuccess(true)
      setForm(initialForm)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Formulario */}
          <div className="rounded-2xl bg-white border border-grafito/10 p-8 shadow-sm">
            {success ? (
              <div className="rounded-xl bg-esmeralda/10 border border-esmeralda/30 text-esmeralda text-sm px-5 py-4">
                Gracias, te contactaremos pronto.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-grafito/70 mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange('name')}
                      className={`w-full rounded-xl bg-neblina border px-4 py-3 text-grafito outline-none transition-colors focus:border-esmeralda ${
                        errors.name ? 'border-red-400' : 'border-grafito/10'
                      }`}
                      placeholder="Tu nombre"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-sm text-grafito/70 mb-1 block">Correo electrónico</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      className={`w-full rounded-xl bg-neblina border px-4 py-3 text-grafito outline-none transition-colors focus:border-esmeralda ${
                        errors.email ? 'border-red-400' : 'border-grafito/10'
                      }`}
                      placeholder="tucorreo@ejemplo.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-grafito/70 mb-1 block">Empresa (opcional)</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={handleChange('company')}
                    className="w-full rounded-xl bg-neblina border border-grafito/10 px-4 py-3 text-grafito outline-none transition-colors focus:border-esmeralda"
                    placeholder="Nombre de tu empresa"
                  />
                </div>

                <div>
                  <label className="text-sm text-grafito/70 mb-1 block">¿Qué programa te interesa?</label>
                  <select
                    value={form.productCode}
                    onChange={handleChange('productCode')}
                    className="w-full rounded-xl bg-neblina border border-grafito/10 px-4 py-3 text-grafito outline-none transition-colors focus:border-esmeralda"
                  >
                    <option value="">Selecciona un programa</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-grafito/70 mb-1 block">Mensaje</label>
                  <textarea
                    value={form.message}
                    onChange={handleChange('message')}
                    rows={5}
                    className={`w-full rounded-xl bg-neblina border px-4 py-3 text-grafito outline-none transition-colors focus:border-esmeralda resize-none ${
                      errors.message ? 'border-red-400' : 'border-grafito/10'
                    }`}
                    placeholder="Cuéntanos qué necesita tu negocio"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-xl bg-esmeralda px-5 py-3 text-sm font-bold text-noche transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>

          {/* Info de contacto */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-noche text-white p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-esmeralda/15 flex items-center justify-center text-esmeralda">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest">Correo</p>
                  <a href="mailto:contacto@jtool.com" className="text-sm font-semibold hover:text-esmeralda transition-colors">
                    contacto@jtool.com
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-verdesuave p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-esmeralda/15 flex items-center justify-center text-esmeralda">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-grafito/50 uppercase tracking-widest">Ubicación</p>
                  <p className="text-sm font-semibold text-noche">Medellín, Colombia</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-grafito/10 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-esmeralda/15 flex items-center justify-center text-esmeralda">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-grafito/50 uppercase tracking-widest">Horario de atención</p>
                  <p className="text-sm font-semibold text-noche">Lunes a viernes, 8:00 a.m. – 6:00 p.m.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Contacto
