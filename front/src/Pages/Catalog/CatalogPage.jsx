import React, { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './CatalogPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const PAGE_SIZE = 24
const SEARCH_DEBOUNCE_MS = 300

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'movie', label: 'Filmes' },
  { id: 'series', label: 'Séries' },
  { id: 'game', label: 'Jogos' },
]

const TYPE_LABEL = { movie: 'Filme', series: 'Série', game: 'Jogo' }
const TYPE_ROUTE = { movie: 'movies', series: 'series', game: 'games' }

const parseCategory = (value) =>
  CATEGORIES.some((item) => item.id === value) ? value : 'all'

// gera [0, 'gap-3', 4, 5, 6, 'gap-19', 20] a partir da página atual (0-based)
const buildPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const sorted = [...new Set([0, total - 1, current - 1, current, current + 1])]
    .filter((p) => p >= 0 && p < total)
    .sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(`gap-${p}`)
    result.push(p)
  })
  return result
}

const CatalogCard = ({ item }) => (
  <li className={`catalog__item catalog__item--${item.type}`}>
    <Link to={`/${TYPE_ROUTE[item.type]}/${item.id}`} className="catalog__card">
      {item.image ? (
        <img
          className="catalog__image"
          src={item.image}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
        />
      ) : (
        <span className="catalog__image-fallback" aria-hidden="true">
          {item.title}
        </span>
      )}
      <span className="catalog__name">{item.title}</span>
      <span className="catalog__type">{TYPE_LABEL[item.type]}</span>
    </Link>
  </li>
)

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [fetching, setFetching] = useState(false) // trocando de página/filtro com dados já na tela
  const [category, setCategory] = useState(parseCategory(searchParams.get('category')))
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState((searchParams.get('search') || '').trim())
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const hasLoadedOnce = useRef(false)

  // mantém categoria/busca em sincronia quando a URL muda (ex.: busca vinda do menu)
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setCategory(parseCategory(searchParams.get('category')))
    setPage(0)
  }, [searchParams])

  // debounce da busca: só consulta a API depois que a pessoa para de digitar
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search])

  // busca a página atual no backend
  useEffect(() => {
    const controller = new AbortController()
    if (hasLoadedOnce.current) setFetching(true)

    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      search: debouncedSearch,
      category,
    })

    fetch(`${API_URL}/catalog/page?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar o catálogo`)
        return response.json()
      })
      .then((data) => {
        const content = data.content ?? []
        const total = data.totalElements ?? content.length
        setItems(content)
        setTotalElements(total)
        setTotalPages(data.totalPages ?? Math.ceil(total / PAGE_SIZE))
        setStatus('ready')
        setFetching(false)
        hasLoadedOnce.current = true
      })
      .catch((error) => {
        if (error.name === 'AbortError') return // substituída por uma requisição mais nova
        console.error('Não foi possível carregar o catálogo.', error)
        setStatus('error')
        setFetching(false)
      })

    return () => controller.abort()
  }, [page, category, debouncedSearch])

  const goToPage = (p) => {
    if (p < 0 || p >= totalPages || p === page) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageList = buildPageList(page, totalPages)

  return (
    <main className="catalog">
      <header className="catalog__header">
        <h1 className="catalog__title">Filmes, séries e jogos</h1>
        {status === 'ready' && (
          <p className="catalog__count" aria-live="polite">
            {debouncedSearch
              ? `${totalElements} ${totalElements === 1 ? 'encontrado' : 'encontrados'}`
              : `${totalElements} títulos`}
            {totalPages > 1 && ` · página ${page + 1} de ${totalPages}`}
          </p>
        )}
        <label className="catalog__search-label">
          <span className="catalog__sr-only">Buscar no catálogo</span>
          <input
            className="catalog__search"
            type="search"
            placeholder="Buscar título"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="catalog__filters" aria-label="Filtrar por categoria">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`catalog__filter${category === item.id ? ' catalog__filter--active' : ''}`}
              aria-pressed={category === item.id}
              onClick={() => {
                setCategory(item.id)
                setPage(0)
                const nextParams = {}
                if (item.id !== 'all') nextParams.category = item.id
                if (search.trim()) nextParams.search = search.trim()
                setSearchParams(nextParams)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {status === 'loading' && (
        <ul className="catalog__grid" aria-busy="true" aria-label="Carregando catálogo">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="catalog__skeleton" />
          ))}
        </ul>
      )}

      {status === 'error' && (
        <p className="catalog__message">
          Não foi possível carregar filmes, séries e jogos. Verifique se a API está rodando em {API_URL}.
        </p>
      )}

      {status === 'ready' && items.length === 0 && (
        <p className="catalog__message">
          {debouncedSearch
            ? `Nenhum título encontrado para "${debouncedSearch}".`
            : 'Nenhum título cadastrado ainda.'}
        </p>
      )}

      {status === 'ready' && items.length > 0 && (
        <>
          <ul
            className={`catalog__grid${fetching ? ' catalog__grid--fetching' : ''}`}
            aria-busy={fetching}
          >
            {items.map((item) => (
              <CatalogCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="catalog__pager" aria-label="Paginação">
              <button
                type="button"
                className="catalog__pager-btn catalog__pager-btn--nav"
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
              >
                ‹ Anterior
              </button>

              <ul className="catalog__pager-pages">
                {pageList.map((p) =>
                  typeof p === 'string' ? (
                    <li key={p} className="catalog__pager-gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={p}>
                      <button
                        type="button"
                        className={`catalog__pager-btn${p === page ? ' is-current' : ''}`}
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
                className="catalog__pager-btn catalog__pager-btn--nav"
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

export default CatalogPage
