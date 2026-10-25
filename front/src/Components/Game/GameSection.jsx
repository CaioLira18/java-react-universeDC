import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './GameSection.css'

const HOME_GAME_LIMIT = 5
const API_URL = 'http://localhost:8080'

export const GameSection = () => {
  const [games, setGames] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    fetch(`${API_URL}/games`)
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar os jogos`)
        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        setGames(data)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Não foi possível carregar os jogos da página inicial.', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="game__section">
      <div className="game__section-heading">
        <h2 className="game__section-title">Jogos</h2>
      </div>

      {status === 'loading' && (
        <div className="game__section-cards" aria-busy="true" aria-label="Carregando jogos">
          {[0, 1, 2].map((index) => (
            <div key={index} className="game__card game__card--skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="game__section-message">
          Não foi possível carregar os jogos. Verifique se a API está rodando em {API_URL}.
        </p>
      )}

      {status === 'ready' && games.length === 0 && (
        <p className="game__section-message">Nenhum jogo cadastrado ainda.</p>
      )}

      {status === 'ready' && games.length > 0 && (
        <div className="game__section-cards" aria-label="Carrossel de jogos">
          {games.slice(0, HOME_GAME_LIMIT).map((game) => (
            <Link key={game.id} to={`/games/${game.id}`} className="game__card">
              {game.gameLogo ? (
                <img src={game.gameLogo} alt="" loading="lazy" />
              ) : (
                <span className="game__card-fallback" aria-hidden="true">DC</span>
              )}
              <span className="game__card-tag">Jogo</span>
              <h3>{game.title}</h3>
            </Link>
          ))}
        </div>
      )}

      {status === 'ready' && games.length > 0 && (
        <div className="game__section-footer">
          <Link to="/catalog?category=game" className="game__section-all">
            Ver mais jogos
          </Link>
        </div>
      )}
    </section>
  )
}

export default GameSection
