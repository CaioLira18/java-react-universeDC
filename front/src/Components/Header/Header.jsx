import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

export const Header = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigate = useNavigate()

  return (
    <div className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="headerContainer">
        <div className="logoHeader" onClick={() => navigate('/')}>
          <img
            src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/DCUniverse.png"
            alt="Logo"
          />
        </div>

        <nav className="navHeader">
          <ul>
            <li><Link to="/characters">Characters</Link></li>
            <li><Link to="/movies">Movies</Link></li>
            <li><Link to="/series">Series</Link></li>
            <li><Link to="/planets">Planets</Link></li>
          </ul>
        </nav>

        <div className="login">
          <button className="loginButton">Faça Login</button>
        </div>
      </div>
    </div>
  )
}
