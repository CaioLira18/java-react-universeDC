import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './CatalogPage.css'

const API_URL = 'http://localhost:8080'

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'movie', label: 'Filmes' },
  { id: 'series', label: 'Séries' },
  { id: 'game', label: 'Jogos' },
]

const getImage = (item, type) => {
  if (type === 'movie') return item.verticalImage
  if (type === 'series') return item.serieLogo
  return item.gameLogo
}

const CatalogCard = ({ item, type }) => {
  const image = getImage(item, type)
  const content = (
    <>
      {image ? (
        <img
          className="catalog__image"
          src={image}
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
      <span className="catalog__type">
        {type === 'movie' ? 'Filme' : type === 'series' ? 'Série' : 'Jogo'}
      </span>
    </>
  )

  return (
    <li className={`catalog__item catalog__item--${type}`}>
      <Link to={`/${type === 'movie' ? 'movies' : type === 'series' ? 'series' : 'games'}/${item.id}`} className="catalog__card">
        {content}
      </Link>
    </li>
  )
}

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [catalog, setCatalog] = useState([])
  const [status, setStatus] = useState('loading')
  const requestedCategory = searchParams.get('category')
  const [category, setCategory] = useState(
    CATEGORIES.some((item) => item.id === requestedCategory) ? requestedCategory : 'all'
  )
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const endpoints = [
          ['movie', '/movies'],
          ['series', '/series'],
          ['game', '/games'],
        ]
        const results = await Promise.all(
          endpoints.map(async ([type, path]) => {
            const response = await fetch(`${API_URL}${path}`)
            if (!response.ok) throw new Error(`Erro ${response.status} ao carregar ${path}`)
            const items = await response.json()
            return items.map((item) => ({ ...item, type }))
          })
        )
        setCatalog(results.flat())
        setStatus('ready')
      } catch (error) {
        console.error('Não foi possível carregar o catálogo.', error)
        setStatus('error')
      }
    }

    loadCatalog()
  }, [])

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return catalog
      .filter((item) => category === 'all' || item.type === category)
      .filter((item) => String(item.title || '').toLocaleLowerCase('pt-BR').includes(query))
      .sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'))
  }, [catalog, category, search])

  return (
    <main className="catalog">
      <header className="catalog__header">
        <h1 className="catalog__title">Filmes, séries e jogos</h1>
        {status === 'ready' && (
          <p className="catalog__count">
            {filteredCatalog.length} de {catalog.length} títulos
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
                setSearchParams(item.id === 'all' ? {} : { category: item.id })
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

      {status === 'ready' && filteredCatalog.length === 0 && (
        <p className="catalog__message">
          {catalog.length === 0
            ? 'Nenhum título cadastrado ainda.'
            : `Nenhum título encontrado para "${search}".`}
        </p>
      )}

      {status === 'ready' && filteredCatalog.length > 0 && (
        <ul className="catalog__grid">
          {filteredCatalog.map((item) => (
            <CatalogCard key={`${item.type}-${item.id}`} item={item} type={item.type} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default CatalogPage
