import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/productos', label: 'Productos' },
  { to: '/precios', label: 'Precios' },
  { to: '/contacto', label: 'Contacto' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-esmeralda after:transition-all after:duration-300 ${
      isActive
        ? 'text-esmeralda after:w-full'
        : 'text-white/70 hover:text-white after:w-0 hover:after:w-full'
    }`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-noche/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <div className="relative h-10 w-10 rounded-xl bg-esmeralda flex items-center justify-center font-black text-noche text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            JT
            <div className="absolute inset-0 rounded-xl bg-esmeralda opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-base tracking-tight">
              JTool <span className="text-esmeralda">Enterprise</span>
            </span>
            <span className="text-white/40 text-[10px] tracking-widest uppercase">Software colombiano</span>
          </div>
        </Link>

        {/* Links escritorio */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA escritorio */}
        <Link
          to="/contacto"
          className="hidden md:inline-flex items-center gap-2 rounded-xl bg-esmeralda px-5 py-2.5 text-sm font-bold text-noche transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-esmeralda/30"
        >
          Empezar gratis
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Botón móvil */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          className="text-white md:hidden p-1 transition-transform duration-300 hover:scale-110"
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
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-white/10 bg-noche/98 backdrop-blur-md px-6 py-6">
          <ul className="flex flex-col gap-5">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium transition-colors duration-200 ${
                      isActive ? 'text-esmeralda' : 'text-white/70 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 border-t border-white/10">
              <Link
                to="/contacto"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-esmeralda px-5 py-3 text-sm font-bold text-noche"
              >
                Empezar gratis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Navbar