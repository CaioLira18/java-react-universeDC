import React, { useState, useEffect } from 'react'
import { SlideCharacter } from '../../Components/Slides/Character/SlideCharacter'
import './Home.css'
import { CharacterSection } from '../../Components/Character/CharacterSection';
import { MovieSecction } from '../../Components/Movie/MovieSecction';

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

      <div className="backgroundImage">
        <img src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/zoom-de-quadrinhos-amarelos-abstratos_1409-923.avif" alt="" />
      </div>

      <header className="hero">
        <p className="hero__bubble">Bem-vindo, herói!</p>
        <h1 className="hero__title">
          <span className="hero__title-line">Heróis.</span>
          <span className="hero__title-line">Vilões.</span>
          <span className="hero__title-line">Lendas.</span>
        </h1>
        <p className="hero__subtitle">
          Explore personagens, filmes, séries e planetas do universo DC.
        </p>
        <a href="#personagens" className="hero__cta">Ver personagens</a>
      </header>

      <div className="characterSection">
        <CharacterSection />
      </div>

      <MovieSecction />

      <div className="space"></div>
    </div>
  )
}
