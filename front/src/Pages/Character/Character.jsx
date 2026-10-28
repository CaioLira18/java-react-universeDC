import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import './Character.css'

export const Character = () => {

  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(false);
  const appearanceSectionRef = useRef(null)
  const gameSectionRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    setError(false);
    fetch(`${API_URL}/characters/${id}`)
      .then(r => r.json())
      .then(data => {
        setCharacter(data);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, [id]);

  useEffect(() => {
    if (!character || !('IntersectionObserver' in window)) return undefined

    const sections = [appearanceSectionRef.current, gameSectionRef.current].filter(Boolean)
    if (sections.length === 0) return undefined

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('characterGames--visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12 })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [character])

  if (error) {
    return (
      <div className="characterPage characterPage--empty">
        <p className="characterMessage">
          Não foi possível carregar este personagem. Verifique se a API está rodando em {API_URL}.
        </p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="characterPage characterPage--empty" aria-busy="true">
        <p className="characterMessage">Carregando herói...</p>
      </div>
    );
  }

  const appearances = character.appearances || [];
  const gameAppearances = character.gameAppearances || [];

  const details = [
    { label: 'Nome verdadeiro', value: character.true_name },
    { label: 'Poderes', value: character.powers },
    { label: 'Planeta', value: character.planet },
    {
      label: 'Primeira aparição',
      value: character.first_appearance
        ? `${character.first_appearance}${character.first_appearance_year ? ` (${character.first_appearance_year})` : ''}`
        : character.first_appearance_year,
    },
  ].filter((detail) => detail.value);

  return (
    <div
      className="characterPage"
      style={{ '--character-backdrop': `url(${character.background})` }}
    >
      <div className="characterBackdrop" />

      <div className="characterHero">
        <img src={character.background} alt={character.name} />
        <div className="characterHeroOverlay" />
      </div>

      <div className="characterContent">
        <div className="characterMain">
          <div className="flexCharacter">
            <div className="characterInfo">
              <h1>{character.name}</h1>
              <p className="characterNarration">{character.description}</p>
            </div>
          </div>

          {details.length > 0 && (
            <dl className="characterDetails">
              {details.map((detail) => (
                <div className="characterDetailItem" key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {character.verticalmage && (
          <div className="imageVerticalCharacter">
            <img src={character.verticalmage} alt={character.name} />
          </div>
        )}

        {appearances.length > 0 && (
          <section
            ref={appearanceSectionRef}
            className="characterGames"
            aria-labelledby="characterAppearancesTitle"
          >
            <h2 className="characterGames__title" id="characterAppearancesTitle">
              {character.name} em filmes e séries
            </h2>
            <div className="characterGames__grid">
              {appearances.map((appearance) => {
                const content = appearance.content;
                const contentType = content.movieLogo !== undefined ? 'Filme' : 'Série';
                return (
                  <article
                    className="characterGames__card"
                    key={appearance.id}
                  >
                    <img
                      src={appearance.characterImage}
                      alt={`${character.name} em ${content.title}`}
                      loading="lazy"
                    />
                    <span>{content.title}</span>
                    <small className="characterAppearanceType">{contentType}</small>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {gameAppearances.length > 0 && (
          <section
            ref={gameSectionRef}
            className="characterGames"
            aria-labelledby="characterGamesTitle"
          >
            <h2 className="characterGames__title" id="characterGamesTitle">
              {character.name} nos jogos
            </h2>
            <div className="characterGames__grid">
              {gameAppearances.map((appearance) => (
                  <article key={appearance.id} className="characterGames__card">
                    <img
                      src={appearance.characterImage}
                      alt={`${character.name} em ${appearance.game?.title || 'um jogo'}`}
                      loading="lazy"
                    />
                    <span>{appearance.game?.title || 'Jogo'}</span>
                  </article>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
