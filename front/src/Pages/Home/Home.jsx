import React, { useState, useEffect } from 'react'
import { SlideCharacter } from '../../Components/Slides/Character/SlideCharacter'
import './Home.css'
export const Home = () => {

  const [movies, setMovies] = useState([]);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
      fetch(`${API_URL}/movies`)
        .then(r => r.json())
        .then(data => setMovies(data))
        .catch(console.error);
    }, []);

  return (
    <div className="home">
      <div className="slideCharacter">
        <SlideCharacter />
      </div>

      <section className="movie__section">
        <h2 className="movie__section-title">Filmes</h2>
        <div className="movie__section-cards">
          {movies.map((movie) => (
            <div key={movie.id} className="movie__card">
              <img src={movie.verticalImage} alt={movie.title} />
              <h3>{movie.title}</h3>
            </div>
          ))}
        </div>
      </section>
      <div className="space"></div>
    </div>
  )
}

