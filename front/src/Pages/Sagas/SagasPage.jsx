import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './SagasPage.css'

const API_URL = 'http://localhost:8080'

const getSagaPeriod = (saga) => {
  if (saga.startYear && saga.endYear) return `${saga.startYear} – ${saga.endYear}`
  if (saga.startYear) return `A partir de ${saga.startYear}`
  if (saga.endYear) return `Até ${saga.endYear}`
  return 'Período não informado'
}

export const SagasPage = () => {
  const [sagas, setSagas] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadSagas = async () => {
      try {
        const response = await fetch(`${API_URL}/sagas`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar as sagas`)
        setSagas(await response.json())
        setStatus('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('Não foi possível carregar as sagas.', error)
        setStatus('error')
      }
    }

    loadSagas()
    return () => controller.abort()
  }, [])

  const filteredSagas = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return sagas
      .filter((saga) =>
        `${saga.name || ''} ${saga.description || ''}`.toLocaleLowerCase('pt-BR').includes(query)
      )
      .sort((a, b) => (
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        || String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')
      ))
  }, [sagas, search])

  return (
    <main className="sagasPage">
      <header className="sagasPage__header">
        <p className="sagasPage__eyebrow">Histórias que definem eras</p>
        <h1 className="sagasPage__title">Sagas da DC</h1>
        <p className="sagasPage__intro">
          Explore diferentes fases e universos da DC, cada um com suas próprias versões,
          origens e caminhos para os heróis.
        </p>
        <label className="sagasPage__search-label">
          <span className="sagasPage__sr-only">Buscar sagas</span>
          <input
            className="sagasPage__search"
            type="search"
            placeholder="Buscar saga"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {status === 'ready' && (
          <p className="sagasPage__count">
            {filteredSagas.length} de {sagas.length} sagas
          </p>
        )}
      </header>

      {status === 'loading' && (
        <div className="sagasPage__message" role="status" aria-live="polite">
          Carregando sagas...
        </div>
      )}

      {status === 'error' && (
        <div className="sagasPage__message" role="alert">
          Não foi possível carregar as sagas. Verifique se a API está rodando em {API_URL}.
        </div>
      )}

      {status === 'ready' && filteredSagas.length === 0 && (
        <div className="sagasPage__message">
          {sagas.length === 0
            ? 'Nenhuma saga publicada no momento.'
            : `Nenhuma saga encontrada para "${search}".`}
        </div>
      )}

      {status === 'ready' && filteredSagas.length > 0 && (
        <ul className="sagasPage__grid">
          {filteredSagas.map((saga) => (
            <li className="sagasPage__item" key={saga.id}>
              <Link className="sagasPage__card" to={`/sagas/${saga.id}`}>
                <div className="sagasPage__banner">
                  {saga.banner ? (
                    <img src={saga.banner} alt="" loading="lazy" />
                  ) : (
                    <span className="sagasPage__banner-fallback">{saga.name}</span>
                  )}
                  <span className="sagasPage__period">{getSagaPeriod(saga)}</span>
                </div>
                <div className="sagasPage__content">
                  <h2 className="sagasPage__name">{saga.name}</h2>
                  {saga.description && <p className="sagasPage__description">{saga.description}</p>}
                  <span className="sagasPage__details-link">Explorar saga</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default SagasPage
