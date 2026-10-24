import React, { useState, useEffect } from 'react'
import './Home.css'
import { CharacterSection } from '../../Components/Character/CharacterSection';
import { MovieSecction } from '../../Components/Movie/MovieSecction';

export const Home = () => {

  const [homeSlides, setHomeSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/home-slides`)
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar os destaques`)
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setHomeSlides(data)
      })
      .catch((error) => {
        console.error('Não foi possível carregar os destaques da página inicial.', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const activeSlide = homeSlides[activeSlideIndex]
  const showSlide = (index) => {
    setActiveSlideIndex((index + homeSlides.length) % homeSlides.length)
  }

  return (
    <div className="home">

      <div className="backgroundImage">
        <img src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/zoom-de-quadrinhos-amarelos-abstratos_1409-923.avif" alt="" />
      </div>

      {activeSlide ? (
        <header className="hero hero--featured" aria-roledescription="carrossel">
          <div
            className="hero__slide-background"
            style={{ backgroundImage: `url("${activeSlide.image}")` }}
          />
          <div className="hero__slide-overlay" />
          <div className="hero__slide-content" aria-live="polite">
            {activeSlide.subtitle && <p className="hero__bubble">{activeSlide.subtitle}</p>}
            <h1 className="hero__title hero__title--single">
              <span className="hero__title-line">{activeSlide.title}</span>
            </h1>
            {activeSlide.description && <p className="hero__subtitle">{activeSlide.description}</p>}
            {activeSlide.buttonText && activeSlide.buttonLink && (
              <a href={activeSlide.buttonLink} className="hero__cta">
                {activeSlide.buttonText}
              </a>
            )}
          </div>
          {homeSlides.length > 1 && (
            <div className="hero__slide-controls" aria-label="Navegação dos destaques">
              <button type="button" onClick={() => showSlide(activeSlideIndex - 1)} aria-label="Destaque anterior">
                Anterior
              </button>
              <div className="hero__slide-indicators">
                {homeSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={index === activeSlideIndex ? 'active' : ''}
                    aria-label={`Mostrar destaque ${index + 1}: ${slide.title}`}
                    aria-pressed={index === activeSlideIndex}
                    onClick={() => showSlide(index)}
                  />
                ))}
              </div>
              <button type="button" onClick={() => showSlide(activeSlideIndex + 1)} aria-label="Próximo destaque">
                Próximo
              </button>
            </div>
          )}
        </header>
      ) : (
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
      )}

      <div className="characterSection">
        <CharacterSection />
      </div>

      <MovieSecction />

      <div className="space"></div>
    </div>
  )
}
