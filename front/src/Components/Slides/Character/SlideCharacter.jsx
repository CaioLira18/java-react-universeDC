import React, {useEffect, useState } from 'react'
import './SlideCharacter.css'
import { useNavigate } from 'react-router-dom';


export const SlideCharacter = () => {

  const [characters, setCharacters] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/characters`)
      .then(r => r.json())
      .then(data => setCharacters(data))
      .catch(console.error);
  }, []);

  // troca de slide automaticamente a cada 6 segundos
  useEffect(() => {
    if (characters.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % characters.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [characters]);

  if (characters.length === 0) return null;

  const activeCharacter = characters[activeIndex];

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % characters.length);
  };


  return (
    <div className="slideCharacter">
      <div className="slideCharacterCard">
        <img
          key={activeCharacter.id}
          src={activeCharacter.background}
          alt={activeCharacter.name}
        />
        <div className="slideCharacterOverlay" />

        <div className="informationsCharacters">
          <h2>{activeCharacter.name}</h2>
          <p>{activeCharacter.description}</p>
          <button className="buttonCharacter" onClick={() => navigate(`/characters/${activeCharacter.id}`)}>
            Ver mais
          </button>
        </div>

        <button
          className="slideArrow slideArrowLeft"
          onClick={goToPrevious}
          aria-label="Personagem anterior"
        >
          ‹
        </button>
        <button
          className="slideArrow slideArrowRight"
          onClick={goToNext}
          aria-label="Próximo personagem"
        >
          ›
        </button>

        <div className="slideDots">
          {characters.map((character, index) => (
            <button
              key={character.id}
              className={`slideDot ${index === activeIndex ? 'slideDotActive' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver ${character.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
