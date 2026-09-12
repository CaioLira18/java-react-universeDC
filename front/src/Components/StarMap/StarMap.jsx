import React, { useEffect, useMemo, useState } from 'react'
import './StarMap.css'

const STAR_COUNT = 90;

export const StarMap = () => {

  const [planets, setPlanets] = useState([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState(null);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/planets`)
      .then(r => r.json())
      .then(data => setPlanets(data || []))
      .catch(console.error);
  }, []);

  // estrelas de fundo geradas uma unica vez, posicao e brilho aleatorios
  const backgroundStars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, index) => ({
      id: index,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 6,
      duration: Math.random() * 3 + 2.5,
    }));
  }, []);

  const selectedPlanet = planets.find((planet) => planet.id === selectedPlanetId);

  return (
    <div className="starMapPage">
      <div className="starMapNebula">
        <span className="starMapNebulaBlob starMapNebulaBlob--1" />
        <span className="starMapNebulaBlob starMapNebulaBlob--2" />
        <span className="starMapNebulaBlob starMapNebulaBlob--3" />
      </div>

      <div className="starMapStars">
        {backgroundStars.map((star) => (
          <span
            key={star.id}
            className="starMapStar"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="starMapHeader">
        <h1>Mapa Estelar</h1>
        <p>Os principais planetas e setores do Universo DC</p>
      </div>

      <div className="starMapCanvas">
        {planets.map((planet) => (
          <button
            key={planet.id}
            type="button"
            className={`starMapPlanet${planet.id === selectedPlanetId ? ' active' : ''}`}
            style={{
              top: `${planet.positionY ?? 50}%`,
              left: `${planet.positionX ?? 50}%`,
              '--planet-color': planet.color || '#8c6dfb',
              '--planet-size': `${(planet.size || 1) * 48}px`,
            }}
            onClick={() => setSelectedPlanetId(planet.id)}
            aria-label={planet.name}
          >
            <span className="starMapPlanetGlow" />
            <span className="starMapPlanetOrb">
              {planet.image && <img src={planet.image} alt="" />}
            </span>
            <span className="starMapPlanetLabel">{planet.name}</span>
          </button>
        ))}
      </div>

      {selectedPlanet && (
        <>
          <div
            className="starMapOverlay"
            onClick={() => setSelectedPlanetId(null)}
          />
          <aside className="starMapDetails">
            <button
              type="button"
              className="starMapDetailsClose"
              onClick={() => setSelectedPlanetId(null)}
              aria-label="Fechar"
            >
              ×
            </button>

            {selectedPlanet.image && (
              <div className="starMapDetailsImage">
                <img src={selectedPlanet.image} alt={selectedPlanet.name} />
              </div>
            )}

            <h2>{selectedPlanet.name}</h2>
            {selectedPlanet.sector && (
              <span className="starMapDetailsSector">{selectedPlanet.sector}</span>
            )}
            {selectedPlanet.description && <p>{selectedPlanet.description}</p>}

            {selectedPlanet.notableResidents && (
              <div className="starMapDetailsResidents">
                <span className="starMapDetailsLabel">Habitantes notáveis</span>
                <p>{selectedPlanet.notableResidents}</p>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  )
}
