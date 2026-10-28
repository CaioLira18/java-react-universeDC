import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Movie.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const Movie = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    setStatus('loading');
    fetch(`${API_URL}/movies/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then(data => {
        setMovie(data);
        setStatus('ready');
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, [id]);

  if (status !== 'ready') {
    return (
      <div className="moviepage moviepage--empty" aria-busy={status === 'loading'}>
        <p className="moviepage__message">
          {status === 'loading'
            ? 'Carregando filme...'
            : `Não foi possível carregar este filme. Verifique se a API está rodando em ${API_URL}.`}
        </p>
      </div>
    );
  }

  // Campos opcionais: só aparecem se existirem no JSON do filme.
  // Para mostrar outro campo da entidade, adicione uma linha aqui.
  const details = [
    { label: 'Lançamento', value: movie.releaseDate || movie.release_date || movie.year },
    { label: 'Direção', value: movie.director },
    { label: 'Duração', value: movie.duration },
    { label: 'Classificação', value: movie.rating },
  ].filter((detail) => detail.value);

  const heroImage = movie.banner;
  const backdrop = heroImage || movie.verticalImage;

  return (
    <div
      className="moviepage"
      style={backdrop ? { '--movie-backdrop': `url(${backdrop})` } : undefined}
    >
      <div className="moviepage__backdrop" />

      {heroImage && (
        <div className="moviepage__hero">
          <img src={heroImage} alt="" />
          <div className="moviepage__hero-overlay" />
        </div>
      )}

      <div className={`moviepage__content${heroImage ? '' : ' moviepage__content--no-hero'}`}>
        <button type="button" className="moviepage__back" onClick={() => navigate(-1)}>
          Voltar
        </button>

        <div className="moviepage__layout">
          {movie.verticalImage && (
            <div className="moviepage__poster">
              <img src={movie.verticalImage} alt={`Pôster de ${movie.title}`} />
              <span className="moviepage__tag">Filme</span>
            </div>
          )}

          <div className="moviepage__info">
            <h1 className="moviepage__title">{movie.title}</h1>

            {movie.description && (
              <p className="moviepage__narration">{movie.description}</p>
            )}

            {details.length > 0 && (
              <dl className="moviepage__details">
                {details.map((detail) => (
                  <div className="moviepage__detail" key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        {movie.images?.length > 0 && (
          <section className="moviepage__gallery" aria-label={`Imagens de ${movie.title}`}>
            <h2 className="moviepage__gallery-title">Galeria</h2>
            <div className="moviepage__gallery-grid">
              {movie.images.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${movie.title} — imagem ${index + 1}`} loading="lazy" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Movie
