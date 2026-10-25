import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './GroupsPage.css'

const API_URL = 'http://localhost:8080'

export const GroupsPage = () => {
  const [groups, setGroups] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadGroups = async () => {
      try {
        const response = await fetch(`${API_URL}/groups`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar as equipes`)
        setGroups(await response.json())
        setStatus('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('Não foi possível carregar as equipes.', error)
        setStatus('error')
      }
    }

    loadGroups()
    return () => controller.abort()
  }, [])

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return groups
      .filter((group) => (
        `${group.name || ''} ${group.description || ''} ${group.groupType || ''} ${group.universe || ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(query)
      ))
      .sort((first, second) => (
        (first.displayOrder ?? 0) - (second.displayOrder ?? 0)
        || String(first.name || '').localeCompare(String(second.name || ''), 'pt-BR')
      ))
  }, [groups, search])

  return (
    <main className="groupsPage">
      <header className="groupsPage__header">
        <p className="groupsPage__eyebrow">Heróis unidos por uma causa</p>
        <h1 className="groupsPage__title">Equipes da DC</h1>
        <p className="groupsPage__intro">
          Conheça as equipes, suas histórias e os personagens que lutam lado a lado.
        </p>
        <label className="groupsPage__search-label">
          <span className="groupsPage__sr-only">Buscar equipes</span>
          <input
            className="groupsPage__search"
            type="search"
            placeholder="Buscar equipe"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {status === 'ready' && (
          <p className="groupsPage__count">{filteredGroups.length} de {groups.length} equipes</p>
        )}
      </header>

      {status === 'loading' && (
        <div className="groupsPage__message" role="status" aria-live="polite">
          Carregando equipes...
        </div>
      )}

      {status === 'error' && (
        <div className="groupsPage__message" role="alert">
          Não foi possível carregar as equipes. Verifique se a API está rodando em {API_URL}.
        </div>
      )}

      {status === 'ready' && filteredGroups.length === 0 && (
        <div className="groupsPage__message">
          {groups.length === 0
            ? 'Nenhuma equipe publicada no momento.'
            : `Nenhuma equipe encontrada para "${search}".`}
        </div>
      )}

      {status === 'ready' && filteredGroups.length > 0 && (
        <ul className="groupsPage__grid">
          {filteredGroups.map((group) => (
            <li className="groupsPage__item" key={group.id}>
              <Link className="groupsPage__card" to={`/groups/${group.id}`}>
                <div className="groupsPage__banner">
                  {group.banner ? (
                    <img src={group.banner} alt="" loading="lazy" />
                  ) : (
                    <span className="groupsPage__banner-fallback">{group.name}</span>
                  )}
                  {group.groupType && <span className="groupsPage__type">{group.groupType}</span>}
                </div>
                <div className="groupsPage__content">
                  <h2 className="groupsPage__name">{group.name}</h2>
                  <p className="groupsPage__meta">
                    {group.universe || 'Universo DC'}
                    {' · '}
                    {group.characters?.length || 0} personagens
                  </p>
                  {group.description && <p className="groupsPage__description">{group.description}</p>}
                  <span className="groupsPage__details-link">Conhecer equipe</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default GroupsPage
