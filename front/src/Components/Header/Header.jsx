import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AUTH_CHANGED_EVENT, AUTH_KEY, notifyAuthChanged } from '../../auth'
import './Header.css'

const API_URL = 'http://localhost:8080'

const NAV_LINKS = [
  { to: '/characters', label: 'Personagens' },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/sagas', label: 'Sagas' },
  { to: '/groups', label: 'Equipes' },
  { to: '/planets', label: 'Planetas' },
]

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler os dados de autenticação salvos.', error)
    return null
  }
}

export const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getStoredUser)
  const [profileImageFailed, setProfileImageFailed] = useState(false)
  const authToken = user?.token

  const navigate = useNavigate()

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

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser())
      setProfileImageFailed(false)
    }

    window.addEventListener(AUTH_CHANGED_EVENT, syncUser)
    window.addEventListener('storage', syncUser)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser)
      window.removeEventListener('storage', syncUser)
    }
  }, [])

  useEffect(() => {
    if (!authToken) return undefined

    let cancelled = false
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao carregar o perfil`)
        }

        const profile = await response.json()
        const currentUser = getStoredUser()
        if (cancelled || currentUser?.token !== authToken) return

        const updatedUser = {
          ...currentUser,
          id: profile.id,
          name: profile.name,
          email: profile.email,
          imageUrl: profile.imageUrl,
          role: profile.role,
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser))
        setUser(updatedUser)
        setProfileImageFailed(false)
        console.info('Perfil carregado da API:', {
          id: profile.id,
          imageUrl: profile.imageUrl,
        })
      } catch (error) {
        if (!cancelled) {
          console.error('Não foi possível atualizar os dados do perfil.', error)
        }
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [authToken])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
    setProfileImageFailed(false)
    notifyAuthChanged()
    closeMenu()
    navigate('/')
  }

  const profileInitial = user?.name?.trim().charAt(0).toUpperCase() || '?'
  const profileImageUrl = typeof user?.imageUrl === 'string' ? user.imageUrl.trim() : ''

  return (
    <header
      className={`header${scrolled || menuOpen ? ' header--scrolled' : ''}`}
    >
      <div className="headerContainer">
        <Link to="/" className="logoHeader" onClick={closeMenu} aria-label="Ir para a página inicial">
          <img
            src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/logos/DCUniverse.png"
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
          {user ? (
            <div className="headerProfile">
              <div className="headerProfile__identity">
                <div className="headerProfile__identityContent">
                  {profileImageUrl && !profileImageFailed ? (
                    <img
                      className="headerProfile__image"
                      src={profileImageUrl}
                      alt=""
                      onError={() => {
                        console.error('Não foi possível carregar a imagem de perfil:', profileImageUrl)
                        setProfileImageFailed(true)
                      }}
                    />
                  ) : (
                    <span className="headerProfile__fallback" aria-hidden="true">
                      {profileInitial}
                    </span>
                  )}
                  <span className="headerProfile__name">{user.name || user.email}</span>
                </div>
              </div>
              <select
                className="headerQuickNav__select"
                value=""
                onChange={(event) => {
                  if (event.target.value) {
                    navigate(event.target.value)
                    closeMenu()
                  }
                }}
                aria-label="Navegação rápida"
              >
                <option value="" disabled>Navegar</option>
                <option value="/profile">Meu perfil</option>
                <option value="/admin">Painel Admin</option>
              </select>
              <button onClick={handleLogout} type="button" className="loginButton">Sair</button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} type="button" className="loginButton">Faça Login</button>
          )}
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
