import React, { useEffect, useMemo, useRef, useState } from 'react'
import './StarMap.css'

const API_URL = 'http://localhost:8080';

// escala as coordenadas do banco (livres, ex.: -20 a 20) pra pixels na cena CSS 3D
const SCALE = 34;

function Planet3D({ planet, isActive, onSelect, onHover }) {
  const x = (planet.positionX ?? 0) * SCALE;
  const y = (planet.positionY ?? 0) * SCALE;
  const z = (planet.positionZ ?? 0) * SCALE;
  const size = (planet.size || 1) * 60;
  const color = planet.color || '#8c6dfb';

  return (
    <div
      className="starMapPlanet3d"
      role="button"
      tabIndex={0}
      aria-label={`Inspecionar ${planet.name}`}
      style={{
        transform: `translate3d(${x}px, ${-y}px, ${z}px)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(planet.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(planet.id);
        }
      }}
      onMouseEnter={() => onHover(planet)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(planet)}
      onBlur={() => onHover(null)}
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
  const [mapStatus, setMapStatus] = useState('loading');
  const [selectedPlanetId, setSelectedPlanetId] = useState(null);
  const [selectedPlanetImage, setSelectedPlanetImage] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragState = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadPlanets = async () => {
      try {
        const response = await fetch(`${API_URL}/planets`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar os planetas`);
        const data = await response.json();
        setPlanets(Array.isArray(data) ? data : []);
        setMapStatus('ready');
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Não foi possível carregar os planetas.', error);
        setMapStatus('error');
      }
    };

    loadPlanets();
    return () => controller.abort();
  }, []);

  const selectedPlanet = planets.find((planet) => planet.id === selectedPlanetId);
  const planetGallery = selectedPlanet
    ? [...new Set([selectedPlanet.image, ...(selectedPlanet.images || [])].filter(Boolean))]
    : [];
  const activePlanetImage = planetGallery.includes(selectedPlanetImage)
    ? selectedPlanetImage
    : planetGallery[0];
  const readoutPlanet = hoveredPlanet || selectedPlanet;

  const filteredPlanets = useMemo(
    () => planets.filter((planet) =>
      String(planet.name || '').toLocaleLowerCase('pt-BR').includes(searchTerm.toLocaleLowerCase('pt-BR'))
    ),
    [planets, searchTerm]
  );

  const handlePointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('.starMapPlanet3d')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    setPan({ x: drag.panX + dx, y: drag.panY + dy });
  };

  const handlePointerUp = (e) => {
    if (dragState.current?.pointerId !== e.pointerId) return;
    dragState.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const bounds = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - bounds.left - bounds.width / 2;
    const cursorY = e.clientY - bounds.top - bounds.height / 2;
    const zoomFactor = Math.exp(-e.deltaY * 0.001);
    const nextZoom = Math.max(0.5, Math.min(2.5, zoom * zoomFactor));
    const scale = nextZoom / zoom;
    setPan((currentPan) => ({
      x: cursorX - (cursorX - currentPan.x) * scale,
      y: cursorY - (cursorY - currentPan.y) * scale,
    }));
    setZoom(nextZoom);
  };

  const adjustZoom = (factor) => {
    setZoom((currentZoom) => Math.max(0.5, Math.min(2.5, currentZoom * factor)));
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="starMapPage">
      <header className="starMapToolbar">
        <div className="starMapHeading">
          <p className="starMapEyebrow">Explore o cosmos DC</p>
          <h1 className="starMapTitle">Mapa do Multiverso</h1>
          <p className="starMapSubtitle">Planetas, mundos e lugares lendários</p>
        </div>

        <div
          className="starMapSearch"
          onMouseDown={(e) => {
            if (e.target !== searchInputRef.current) {
              e.preventDefault();
              searchInputRef.current?.focus();
            }
          }}
        >
          <span className="searchPlanetsIcon" aria-hidden="true">⌕</span>
          <input
            ref={searchInputRef}
            type="search"
            aria-label="Buscar planeta"
            placeholder="Buscar planeta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm.trim() !== '' && (
            <div className="starMapSearchResults">
              {filteredPlanets.length === 0 && (
                <div className="starMapSearchEmpty">Nenhum planeta encontrado</div>
              )}
              {filteredPlanets.map((planet) => (
                <button
                  type="button"
                  key={planet.id}
                  className="starMapSearchResult"
                  onClick={() => {
                    setSelectedPlanetId(planet.id);
                    setSelectedPlanetImage(null);
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

        <div className="starMapControls" aria-label="Controles do mapa">
          <button type="button" onClick={() => adjustZoom(1.2)} aria-label="Aumentar zoom">+</button>
          <span className="starMapZoomValue" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => adjustZoom(1 / 1.2)} aria-label="Diminuir zoom">−</button>
          <button className="starMapReset" type="button" onClick={resetView}>Centralizar</button>
        </div>
      </header>

      <div
        className="starMapCanvasWrapper"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={(e) => {
          if (dragState.current?.pointerId === e.pointerId) dragState.current = null;
        }}
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
              transform: `scale(${zoom})`,
            }}
          >
            {filteredPlanets.map((planet) => (
              <Planet3D
                key={planet.id}
                planet={planet}
                isActive={planet.id === selectedPlanetId}
                onSelect={(planetId) => {
                  setSelectedPlanetId(planetId);
                  setSelectedPlanetImage(null);
                }}
                onHover={setHoveredPlanet}
              />
            ))}
          </div>
        </div>

        {(mapStatus !== 'ready' || planets.length === 0) && (
          <div className="starMapCanvasMessage" role={mapStatus === 'error' ? 'alert' : 'status'}>
            {mapStatus === 'loading'
              ? 'Carregando mundos...'
              : mapStatus === 'error'
                ? 'Não foi possível carregar os planetas. Verifique se a API está disponível.'
                : 'Ainda não há planetas cadastrados.'}
          </div>
        )}

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
          ARRASTE O ESPAÇO VAZIO PARA MOVER • ROLE PARA ZOOM • SELECIONE UM PLANETA
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

            {activePlanetImage && (
              <div className="starMapDetailsImage">
                <img src={activePlanetImage} alt={selectedPlanet.name} />
              </div>
            )}

            <h2>{selectedPlanet.name}</h2>
            {selectedPlanet.sector && (
              <span className="starMapDetailsSector">{selectedPlanet.sector}</span>
            )}
            {selectedPlanet.description && <p>{selectedPlanet.description}</p>}

            {planetGallery.length > 1 && (
              <div className="starMapDetailsGallery" aria-label={`Imagens de ${selectedPlanet.name}`}>
                {planetGallery.map((image, index) => (
                  <button
                    className={`starMapDetailsGalleryItem${image === activePlanetImage ? ' active' : ''}`}
                    type="button"
                    key={image}
                    onClick={() => setSelectedPlanetImage(image)}
                    aria-label={`Exibir imagem ${index + 1} de ${selectedPlanet.name}`}
                    aria-pressed={image === activePlanetImage}
                  >
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

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
