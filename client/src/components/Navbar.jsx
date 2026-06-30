import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/precios', label: 'Precios' },
  { to: '/contacto', label: 'Contacto' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-esmeralda ${
      isActive ? 'text-esmeralda' : 'text-white/80'
    }`

  return (
    <header className="sticky top-0 z-50 bg-noche/95 backdrop-blur border-b border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-esmeralda font-extrabold text-noche">
            JT
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            JTool <span className="text-esmeralda">Enterprise</span>
          </span>
        </Link>

        {/* Links escritorio */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.to === '/'} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA escritorio */}
        <Link
          to="/contacto"
          className="hidden rounded-lg bg-esmeralda px-5 py-2.5 text-sm font-semibold text-noche transition-transform hover:scale-105 md:inline-block"
        >
          Empezar gratis
        </Link>

        {/* Botón móvil */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          className="text-white md:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Menú móvil */}
      {open && (
        <div className="border-t border-white/10 bg-noche px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/contacto"
                onClick={() => setOpen(false)}
                className="inline-block rounded-lg bg-esmeralda px-5 py-2.5 text-sm font-semibold text-noche"
              >
                Empezar gratis
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar
