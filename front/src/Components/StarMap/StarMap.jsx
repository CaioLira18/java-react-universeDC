import React, { useEffect, useMemo, useRef, useState } from 'react'
import './StarMap.css'

const API_URL = 'http://localhost:8080';

// escala as coordenadas do banco (livres, ex.: -20 a 20) pra pixels na cena CSS 3D
const SCALE = 34;

function Planet3D({ planet, isActive, onSelect, onHover, rotation }) {
  const x = (planet.positionX ?? 0) * SCALE;
  const y = (planet.positionY ?? 0) * SCALE;
  const z = (planet.positionZ ?? 0) * SCALE;
  const size = (planet.size || 1) * 60;
  const color = planet.color || '#8c6dfb';

  return (
    <div
      className="starMapPlanet3d"
      style={{
        // translada pra posição no espaço, depois contra-rotaciona (billboard)
        // pra sempre encarar a câmera, cancelando o giro aplicado na cena
        transform: `translate3d(${x}px, ${-y}px, ${z}px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(planet.id);
      }}
      onMouseEnter={() => onHover(planet)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={`starMapOrbitRing${isActive ? ' active' : ''}`} style={{ borderColor: `${color}55` }} />
      <div
        className={`starMapPlanetSphere${isActive ? ' active' : ''}`}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 30%, ${color}, ${color}33 70%, transparent 100%)`,
          boxShadow: isActive
            ? `0 0 ${size * 0.9}px ${color}aa, 0 0 ${size * 0.3}px ${color}`
            : `0 0 ${size * 0.5}px ${color}66`,
        }}
      />
      <span className={`starMapPlanetLabel3d${isActive ? ' active' : ''}`}>
        <i className="starMapLabelBracket">[</i>
        {planet.name}
        <i className="starMapLabelBracket">]</i>
      </span>
    </div>
  );
}

export const StarMap = () => {
  const [planets, setPlanets] = useState([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  // rotação da câmera (tilt) + posição livre no plano (pan) — os dois combinados no drag
  const [rotation, setRotation] = useState({ x: -15, y: -25 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragState = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/planets`)
      .then(r => r.json())
      .then(data => setPlanets(data || []))
      .catch(console.error);
  }, []);

  // rotação automática contínua da cena — some enquanto o usuário arrasta
  // (dragState.current !== null) e volta suavemente quando ele solta
  useEffect(() => {
    const AUTO_ROTATE_SPEED = 6; // graus por segundo
    let frameId;
    let lastTime = performance.now();

    const tick = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!dragState.current) {
        setRotation((prev) => ({
          ...prev,
          y: prev.y + AUTO_ROTATE_SPEED * dt,
        }));
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const selectedPlanet = planets.find((planet) => planet.id === selectedPlanetId);
  const readoutPlanet = hoveredPlanet || selectedPlanet;

  // busca deriva de "planets" via useMemo — nunca sobrescreve o estado original
  const filteredPlanets = useMemo(
    () => planets.filter((planet) =>
      planet.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [planets, searchTerm]
  );

  const handlePointerDown = (e) => {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setRotation({
      x: Math.max(-80, Math.min(80, dragState.current.rotX - dy * 0.15)),
      y: dragState.current.rotY + dx * 0.15,
    });
    setPan({
      x: dragState.current.panX + dx / zoom,
      y: dragState.current.panY + dy / zoom,
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.4, Math.min(2.2, z - e.deltaY * 0.001)));
  };

  return (
    <div className="starMapPage">
      {/* busca flutuante: digitar filtra a lista abaixo, clicar num resultado seleciona o planeta */}
      <div
        className="starMapSearch"
        onMouseDown={(e) => {
          // clicar em qualquer parte da barra (ícone, padding) foca o input;
          // sem isso só clicar exatamente em cima do texto funcionava
          if (e.target !== searchInputRef.current) {
            e.preventDefault();
            searchInputRef.current?.focus();
          }
        }}
      >
        <span className="searchPlanetsIcon">⌕</span>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="buscar objeto estelar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm.trim() !== '' && (
          <div className="starMapSearchResults">
            {filteredPlanets.length === 0 && (
              <div className="starMapSearchEmpty">nenhum objeto encontrado</div>
            )}
            {filteredPlanets.map((planet) => (
              <button
                type="button"
                key={planet.id}
                className="starMapSearchResult"
                onClick={() => {
                  setSelectedPlanetId(planet.id);
                  setSearchTerm('');
                }}
              >
                <span
                  className="starMapSearchResultDot"
                  style={{ background: planet.color || '#8c6dfb' }}
                />
                {planet.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="starMapCanvasWrapper"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="starMapStarsBg">
          <div
            className="starMapStarsLayer far"
            style={{ backgroundPosition: `${pan.x * 0.05}px ${pan.y * 0.05}px` }}
          />
          <div
            className="starMapStarsLayer mid"
            style={{ backgroundPosition: `${pan.x * 0.14}px ${pan.y * 0.14}px` }}
          />
          <div
            className="starMapStarsLayer near"
            style={{ backgroundPosition: `${pan.x * 0.26}px ${pan.y * 0.26}px` }}
          />
        </div>
        <div className="starMapVignette" />

        {/* reticle central, estilo cockpit */}
        <div className="starMapReticle">
          <span className="starMapReticleCorner tl" />
          <span className="starMapReticleCorner tr" />
          <span className="starMapReticleCorner bl" />
          <span className="starMapReticleCorner br" />
        </div>

        {/* camada de pan: move a câmera livremente em X/Y, sem limite */}
        <div
          className="starMapPanLayer"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
          }}
        >
          <div
            className="starMapScene"
            style={{
              transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
          >
            {filteredPlanets.map((planet) => (
              <Planet3D
                key={planet.id}
                planet={planet}
                isActive={planet.id === selectedPlanetId}
                onSelect={setSelectedPlanetId}
                onHover={setHoveredPlanet}
                rotation={rotation}
              />
            ))}
          </div>
        </div>

        {/* readout inferior esquerdo, tipo telemetria */}
        <div className="starMapHud starMapHudReadout">
          {readoutPlanet ? (
            <>
              <div className="starMapReadoutName">{readoutPlanet.name}</div>
              <div className="starMapReadoutLine">SETOR: {readoutPlanet.sector || '—'}</div>
              <div className="starMapReadoutLine">
                XYZ: {(readoutPlanet.positionX ?? 0).toFixed(1)} / {(readoutPlanet.positionY ?? 0).toFixed(1)} / {(readoutPlanet.positionZ ?? 0).toFixed(1)}
              </div>
            </>
          ) : (
            <>
              <div className="starMapReadoutLine">OBJETOS EM CENA: {filteredPlanets.length}</div>
              <div className="starMapReadoutLine">ZOOM: {(zoom * 100).toFixed(0)}%</div>
            </>
          )}
        </div>

        <div className="starMapHud starMapHudHint">
          ARRASTE PARA NAVEGAR • ROLE PARA ZOOM • CLIQUE PARA INSPECIONAR
        </div>
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
