import React, { useState, useEffect, useRef } from 'react'
import './Home.css'
import { CharacterSection } from '../../Components/Character/CharacterSection';
import { MovieSecction } from '../../Components/Movie/MovieSecction';
import { GameSection } from '../../Components/Game/GameSection';

const SLIDE_INTERVAL_MS = 6000
const SLIDE_TRANSITION_MS = 1100

export const Home = () => {

  const [homeSlides, setHomeSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [transitionFromSlide, setTransitionFromSlide] = useState(null)
  const previousSlideRef = useRef(null)
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

  useEffect(() => {
    if (homeSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timeoutId = window.setTimeout(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex + 1) % homeSlides.length)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activeSlideIndex, homeSlides.length])

  const activeSlide = homeSlides[activeSlideIndex]

  useEffect(() => {
    if (!activeSlide) return undefined

    const previousSlide = previousSlideRef.current
    previousSlideRef.current = activeSlide
    if (!previousSlide || previousSlide.id === activeSlide.id) return undefined

    setTransitionFromSlide(previousSlide)
    const timeoutId = window.setTimeout(() => setTransitionFromSlide(null), SLIDE_TRANSITION_MS)
    return () => window.clearTimeout(timeoutId)
  }, [activeSlide])

  const showSlide = (index) => {
    setActiveSlideIndex((index + homeSlides.length) % homeSlides.length)
  }

  return (
    <div className="home">

      <div className="backgroundImage">
        <img src="https://wallpapercave.com/wp/wp3979958.jpg" alt="" />
      </div>

      {activeSlide ? (
        <header className="hero hero--featured" aria-roledescription="carrossel">
          {transitionFromSlide && (
            <div
              key={`previous-${transitionFromSlide.id}`}
              className="hero__slide-background hero__slide-background--previous"
              style={{ backgroundImage: `url("${transitionFromSlide.image}")` }}
              aria-hidden="true"
            />
          )}
          <div
            key={activeSlide.id}
            className="hero__slide-background"
            style={{ backgroundImage: `url("${activeSlide.image}")` }}
          />
          <div className="hero__slide-overlay" />
          <div key={`content-${activeSlide.id}`} className="hero__slide-content" aria-live="polite">
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
            <div className="hero__slide-controls">
              <div className="hero__slide-indicators" aria-label="Selecionar destaque">
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

      <div className="homeSections">
        <div className="characterSection">
          <CharacterSection />
        </div>
        <MovieSecction />
        <GameSection />
      </div>

      <div className="space"></div>
    </div>
  )
}
