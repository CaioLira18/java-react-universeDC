import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './MovieSecction.css'

const HOME_MOVIE_LIMIT = 10

export const MovieSecction = () => {

  const [movies, setMovies] = useState([]);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/movies`)
      .then(r => r.json())
      .then(data => setMovies(data))
      .catch(console.error);
  }, []);

  return (
    <section className="movie__section">
      <div className="movie__section-heading">
        <h2 className="movie__section-title">Filmes</h2>
      </div>
      <div className="movie__section-cards" aria-label="Carrossel de filmes">
        {movies.slice(0, HOME_MOVIE_LIMIT).map((movie) => (
          <Link key={movie.id} to={`/movies/${movie.id}`} className="movie__card">
            {movie.verticalImage && (
              <img src={movie.verticalImage} alt={movie.title} />
            )}
            <span className="movieTag">Filme</span>
            <h3>{movie.title}</h3>
          </Link>
        ))}
      </div>
      <div className="movie__section-footer">
        <Link to="/catalog?category=movie" className="movie__section-all">
          Ver todos os filmes
        </Link>
      </div>
    </section>
  )
}
