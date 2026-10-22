import React, { useEffect, useState } from 'react'
import './MovieSecction.css'
import { useNavigate } from 'react-router-dom';
export const MovieSecction = () => {

  const [movies, setMovies] = useState([]);
  const API_URL = 'http://localhost:8080';
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/movies`)
      .then(r => r.json())
      .then(data => setMovies(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <section className="movie__section">
        <h2 className="movie__section-title">Filmes</h2>
        <div className="movie__section-cards">
          {movies.map((movie) => (
            <div key={movie.id} className="movie__card" onClick={() => navigate(`/movies/${movie.id}`)}>
              <img src={movie.verticalImage} alt={movie.title} />
              <span className="movieTag">Filme</span>
              <h3>{movie.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
