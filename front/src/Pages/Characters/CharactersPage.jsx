import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './CharactersPage.css'

// ajuste se a rota da página de detalhe for diferente (ex.: '/characters')
const DETAIL_ROUTE = '/characters';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const PAGE_SIZE = 18;
const SEARCH_DEBOUNCE_MS = 300;

// gera [1, '…', 4, 5, 6, '…', 20] a partir da página atual (0-based)
const buildPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap-' + p);
    result.push(p);
  });
  return result;
};

export const CharactersPage = () => {

  const [characters, setCharacters] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [fetching, setFetching] = useState(false); // trocando de página/busca com dados já na tela
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const searchRef = useRef(null);
  const hasLoadedOnce = useRef(false);

  // atalho: apertar "/" foca a busca (se não estiver digitando em outro campo)
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // debounce da busca: só consulta a API depois que a pessoa para de digitar
  useEffect(() => {
    const id = setTimeout(() => {
      const term = search.trim();
      setDebouncedSearch((prev) => {
        if (prev !== term) setPage(0); // nova busca volta para a primeira página
        return term;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // busca a página atual no backend
  useEffect(() => {
    const controller = new AbortController();
    if (hasLoadedOnce.current) setFetching(true);

    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      search: debouncedSearch,
    });

    fetch(`${API_URL}/characters/page?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const content = data.content ?? [];
        const total = data.totalElements ?? content.length;
        setCharacters(content);
        setTotalElements(total);
        setTotalPages(data.totalPages ?? Math.ceil(total / PAGE_SIZE));
        setStatus('ready');
        setFetching(false);
        hasLoadedOnce.current = true;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // requisição substituída por outra mais nova
        console.error(err);
        setStatus('error');
        setFetching(false);
      });

    return () => controller.abort();
  }, [page, debouncedSearch]);

  const goToPage = (p) => {
    if (p < 0 || p >= totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch((prev) => {
      if (prev !== '') setPage(0);
      return '';
    });
  };

  const pageList = buildPageList(page, totalPages);

  return (
    <main className="charlist">
      <header className="charlist__header">
        <h1 className="charlist__title">Todos os personagens</h1>
        {status === 'ready' && (
          <p className="charlist__count" aria-live="polite">
            {debouncedSearch
              ? `${totalElements} ${totalElements === 1 ? 'encontrado' : 'encontrados'}`
              : `${totalElements} heróis e vilões`}
            {totalPages > 1 && ` · página ${page + 1} de ${totalPages}`}
          </p>
        )}
        <div className="charlist__searchbox">
          <span className="charlist__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <circle cx="10" cy="10" r="6.5" />
              <path d="M15 15l6 6" />
            </svg>
          </span>

          <input
            ref={searchRef}
            type="search"
            className="charlist__search"
            placeholder="Buscar personagem (ex.: Batman)"
            aria-label="Buscar personagem"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
          />

          {search ? (
            <button
              type="button"
              className="charlist__search-clear"
              aria-label="Limpar busca"
              onClick={() => {
                clearSearch();
                searchRef.current?.focus();
              }}
            >
              ×
            </button>
          ) : (
            <kbd className="charlist__search-hint" aria-hidden="true">/</kbd>
          )}
        </div>
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

      {status === 'ready' && characters.length === 0 && (
        <p className="charlist__message">
          {debouncedSearch
            ? `Nenhum personagem encontrado para "${debouncedSearch}".`
            : 'Nenhum personagem cadastrado ainda.'}
        </p>
      )}

      {status === 'ready' && characters.length > 0 && (
        <>
          <ul
            className={`charlist__grid${fetching ? ' charlist__grid--fetching' : ''}`}
            aria-busy={fetching}
          >
            {characters.map((character) => (
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

          {totalPages > 1 && (
            <nav className="charlist__pager" aria-label="Paginação">
              <button
                type="button"
                className="charlist__pager-btn charlist__pager-btn--nav"
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
              >
                ‹ Anterior
              </button>

              <ul className="charlist__pager-pages">
                {pageList.map((p) =>
                  typeof p === 'string' ? (
                    <li key={p} className="charlist__pager-gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={p}>
                      <button
                        type="button"
                        className={`charlist__pager-btn${p === page ? ' is-current' : ''}`}
                        onClick={() => goToPage(p)}
                        aria-label={`Página ${p + 1}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p + 1}
                      </button>
                    </li>
                  )
                )}
              </ul>

              <button
                type="button"
                className="charlist__pager-btn charlist__pager-btn--nav"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Próxima ›
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}

export default CharactersPage;
