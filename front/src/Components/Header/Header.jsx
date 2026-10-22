import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Header.css'

const NAV_LINKS = [
  { to: '/characters', label: 'Characters' },
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/planets', label: 'Planets' },
]

export const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Esc fecha o menu no celular
  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={`header${scrolled || menuOpen ? ' header--scrolled' : ''}`}
    >
      <div className="headerContainer">
        <Link to="/" className="logoHeader" onClick={closeMenu} aria-label="Ir para a página inicial">
          <img
            src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/DCUniverse.png"
            alt="DC Universe"
          />
        </Link>

        <nav
          id="mainNav"
          className={`navHeader${menuOpen ? ' navHeader--open' : ''}`}
          aria-label="Navegação principal"
        >
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="login">
          <button type="button" className="loginButton">Faça Login</button>
        </div>

        <button
          type="button"
          className="menuToggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mainNav"
        >
          {menuOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>
    </header>
  )
}

export default Header
