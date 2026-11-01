import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './CharacterSection.css'

const HOME_CHARACTER_LIMIT = 10

export const CharacterSection = () => {

  const [characters, setCharacters] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/characters/page?page=0&size=${HOME_CHARACTER_LIMIT}`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then(data => {
        setCharacters(data.content);
        setStatus('ready');
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error(err);
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <section id="personagens" className="character__section">
      <div className="character__section-heading">
        <h2 className="character__section-title">
          <span>Personagens</span>
        </h2>
      </div>

      {status === 'loading' && (
        <div className="character__section-cards" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="character__card character__card--skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="character__message">
          Não foi possível carregar os personagens. Verifique se a API está rodando em {API_URL}.
        </p>
      )}

      {status === 'ready' && (
        <div className="character__section-cards" aria-label="Carrossel de personagens">
          {characters.map((character) => (
            <Link to={`/characters/${character.id}`} key={character.id} className="character__card">
              <img
                src={character.background}
                alt={character.name}
                className="character__card-image"
              />
              <h3 className="character__card-name">{character.name}</h3>
            </Link>
          ))}
        </div>
      )}
      {status === 'ready' && characters.length > 0 && (
        <div className="character__section-footer">
          <Link to="/characters" className="character__section-all">
            Ver todos os personagens
          </Link>
        </div>
      )}
    </section>
  )
}

export default CharacterSection;
