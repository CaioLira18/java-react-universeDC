import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './Character.css'

export const Character = () => {

  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [selectedAppearanceId, setSelectedAppearanceId] = useState('');
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/characters/${id}`)
      .then(r => r.json())
      .then(data => {
        setCharacter(data);
        if (data.appearances && data.appearances.length > 0) {
          setSelectedAppearanceId(data.appearances[0].id);
        }
      })
      .catch(console.error);
  }, [id]);

  if (!character) return null;

  const appearances = character.appearances || [];
  const selectedAppearance = appearances.find(
    (appearance) => appearance.id === selectedAppearanceId
  );

  // se nao tiver nenhuma aparicao cadastrada, cai pro background padrao do personagem
  const displayImage = selectedAppearance
    ? selectedAppearance.characterImage
    : character.background;

  // Movie tem "movieLogo", Series tem "serieLogo" - usamos isso pra rotular a opcao
  const getContentLabel = (content) => {
    const type = content.movieLogo !== undefined ? 'Filme' : 'Série';
    return `${content.title} (${type})`;
  };

  const getContentLogo = (content) => content.movieLogo || content.serieLogo;

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
        <img key={displayImage} src={displayImage} alt={character.name} />
        <div className="characterHeroOverlay" />
      </div>

      <div className="characterContent">
        <div className="characterMain">
          <div className="flexCharacter">
            <div className="characterInfo">
              <h1>{character.name}</h1>
              <p>{character.description}</p>
            </div>
          </div>

          {appearances.length > 0 && (
            <div className="characterAppearanceSelect">
              <span className="characterAppearanceLabel">Ver personagem em</span>
              <div className="characterLogoRow">
                {appearances.map((appearance) => {
                  const logo = getContentLogo(appearance.content);
                  const isActive = appearance.id === selectedAppearanceId;
                  return (
                    <button
                      key={appearance.id}
                      type="button"
                      className={`characterLogoButton${isActive ? ' active' : ''}`}
                      onClick={() => setSelectedAppearanceId(appearance.id)}
                      aria-pressed={isActive}
                      aria-label={getContentLabel(appearance.content)}
                      title={getContentLabel(appearance.content)}
                    >
                      {logo ? (
                        <img src={logo} alt={getContentLabel(appearance.content)} />
                      ) : (
                        <span className="characterLogoFallback">
                          {appearance.content.title}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
      </div>
    </div>
  )
}
