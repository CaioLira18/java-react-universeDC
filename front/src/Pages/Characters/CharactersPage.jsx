import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './CharactersPage.css'

// ajuste se a rota da página de detalhe for diferente (ex.: '/characters')
const DETAIL_ROUTE = '/characters';
const API_URL = 'http://localhost:8080';

export const CharactersPage = () => {

  const [characters, setCharacters] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/characters`)
      .then(r => r.json())
      .then(data => {
        const sorted = [...data].sort((a, b) =>
          String(a.name).localeCompare(String(b.name), 'pt-BR')
        );
        setCharacters(sorted);
        setStatus('ready');
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, []);

  const visible = characters.filter((c) =>
    String(c.name || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <main className="charlist">
      <header className="charlist__header">
        <h1 className="charlist__title">Todos os personagens</h1>
        {status === 'ready' && (
          <p className="charlist__count">
            {visible.length} de {characters.length} heróis e vilões
          </p>
        )}
        <input
          type="search"
          className="charlist__search"
          placeholder="Buscar personagem"
          aria-label="Buscar personagem"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {status === 'loading' && (
        <div className="charlist__grid" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="charlist__card charlist__card--skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="charlist__message">
          Não foi possível carregar os personagens. Verifique se a API está rodando em {API_URL}.
        </p>
      )}

      {status === 'ready' && visible.length === 0 && (
        <p className="charlist__message">
          {characters.length === 0
            ? 'Nenhum personagem cadastrado ainda.'
            : `Nenhum personagem encontrado para "${search}".`}
        </p>
      )}

      {status === 'ready' && visible.length > 0 && (
        <ul className="charlist__grid">
          {visible.map((character) => (
            <li key={character.id}>
              <Link to={`${DETAIL_ROUTE}/${character.id}`} className="charlist__card">
                <img
                  src={character.background}
                  alt=""
                  className="charlist__image"
                  loading="lazy"
                />
                <span className="charlist__name">{character.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default CharactersPage;
