import React, { useState, useEffect } from 'react'
import './CharacterSection.css'
import { useNavigate } from 'react-router-dom';

export const CharacterSection = () => {

  const [characters, setCharacters] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/characters`)
      .then(r => r.json())
      .then(data => {
        setCharacters(data);
        setStatus('ready');
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, []);

  const navigate = useNavigate();

  return (
    <section id="personagens" className="character__section">
      <h2 className="character__section-title">
        <span>Personagens</span>
      </h2>

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
        <div className="character__section-cards">
          {characters.map((character) => (
            <article onClick={() => navigate(`/characters/${character.id}`)} key={character.id} className="character__card">
              <img
                src={character.background}
                alt={character.name}
                className="character__card-image"
              />
              <h3 className="character__card-name">{character.name}</h3>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default CharacterSection;
