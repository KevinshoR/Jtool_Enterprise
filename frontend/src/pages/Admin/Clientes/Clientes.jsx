import { useEffect, useState } from 'react'
import { adminService } from '../../../services/adminService'

const statusStyles = {
  active: 'bg-esmeralda/15 text-esmeralda',
  trial: 'bg-naranja/15 text-naranja',
  inactive: 'bg-black/10 text-grafito/60',
  suspended: 'bg-red-500/15 text-red-500',
}

function Clientes() {
  const [companies, setCompanies] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', nit: '', email: '', phone: '' })
  const [assignForm, setAssignForm] = useState({}) // { [companyId]: product_id }
  const [saving, setSaving] = useState(false)

  function loadData() {
    setLoading(true)
    Promise.all([adminService.getCompanies(), adminService.getProducts()])
      .then(([c, p]) => {
        setCompanies(c)
        setProducts(p)
      })
      .catch(() => setError('No se pudieron cargar las empresas'))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  async function handleCreateCompany(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await adminService.createCompany(form)
      setForm({ name: '', nit: '', email: '', phone: '' })
      setShowForm(false)
      loadData()
    } catch {
      setError('No se pudo crear la empresa')
    } finally {
      setSaving(false)
    }
  }

  async function handleAssign(companyId) {
    const productId = assignForm[companyId]
    if (!productId) return
    try {
      await adminService.assignProduct(companyId, { product_id: productId, status: 'active' })
      loadData()
    } catch {
      setError('No se pudo asignar el producto')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-noche mb-1">Clientes</h1>
          <p className="text-grafito/60">Empresas y los programas que tienen contratados</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-esmeralda px-5 py-3 text-sm font-bold text-noche hover:scale-[1.02] transition-transform"
        >
          {showForm ? 'Cancelar' : '+ Nueva empresa'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateCompany}
          className="mb-8 rounded-2xl bg-white border border-black/5 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Nombre de la empresa"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-esmeralda"
          />
          <input
            placeholder="NIT"
            value={form.nit}
            onChange={(e) => setForm({ ...form, nit: e.target.value })}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-esmeralda"
          />
          <input
            placeholder="Correo de contacto"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-esmeralda"
          />
          <input
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-esmeralda"
          />
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 rounded-xl bg-noche px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar empresa'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-grafito/50">Cargando...</p>
      ) : companies.length === 0 ? (
        <p className="text-grafito/50">Aún no hay empresas registradas.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {companies.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-noche">{c.name}</h3>
                  <p className="text-grafito/50 text-xs">{c.nit || 'Sin NIT'} · {c.email || 'Sin correo'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[c.status] || statusStyles.inactive}`}>
                  {c.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {c.products.length === 0 ? (
                  <span className="text-grafito/40 text-xs">Sin programas contratados</span>
                ) : (
                  c.products.map((p) => (
                    <span
                      key={p.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[p.status] || statusStyles.inactive}`}
                    >
                      {p.name}
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-black/5">
                <select
                  value={assignForm[c.id] || ''}
                  onChange={(e) => setAssignForm({ ...assignForm, [c.id]: e.target.value })}
                  className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-xs outline-none focus:border-esmeralda"
                >
                  <option value="">Asignar programa...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(c.id)}
                  className="rounded-xl bg-esmeralda/15 text-esmeralda px-4 py-2 text-xs font-bold hover:bg-esmeralda/25 transition-colors"
                >
                  Asignar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clientes