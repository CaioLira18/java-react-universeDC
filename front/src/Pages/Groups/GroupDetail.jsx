import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './GroupDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const GroupDetail = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadGroup = async () => {
      setStatus('loading')
      try {
        const response = await fetch(`${API_URL}/groups/${id}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar a equipe`)
        setGroup(await response.json())
        setStatus('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('Não foi possível carregar a equipe.', error)
        setStatus('error')
      }
    }

    loadGroup()
    return () => controller.abort()
  }, [id])

  if (status !== 'ready') {
    return (
      <main className="groupDetail groupDetail--message" aria-busy={status === 'loading'}>
        <p className="groupDetail__notice" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'loading'
            ? 'Carregando equipe...'
            : 'Não foi possível carregar esta equipe. Ela pode não existir ou não estar publicada.'}
        </p>
        <Link className="groupDetail__back" to="/groups">Voltar às equipes</Link>
      </main>
    )
  }

  return (
    <main className="groupDetail">
      <div className="groupDetail__background" />
      {group.banner && (
        <div className="groupDetail__hero">
          <img src={group.banner} alt="" />
          <div className="groupDetail__hero-overlay" />
        </div>
      )}

      <div className="groupDetail__content">
        <Link className="groupDetail__back" to="/groups">Voltar às equipes</Link>

        <header className="groupDetail__header">
          {group.groupType && <p className="groupDetail__type">{group.groupType}</p>}
          <h1 className="groupDetail__title">{group.name}</h1>
          {group.description && <p className="groupDetail__description">{group.description}</p>}
          <dl className="groupDetail__facts">
            {group.universe && (
              <div>
                <dt>Universo</dt>
                <dd>{group.universe}</dd>
              </div>
            )}
            {group.base && (
              <div>
                <dt>Base de operações</dt>
                <dd>{group.base}</dd>
              </div>
            )}
            {group.foundedYear && (
              <div>
                <dt>Formação</dt>
                <dd>{group.foundedYear}</dd>
              </div>
            )}
            {group.firstAppearance && (
              <div>
                <dt>Primeira aparição</dt>
                <dd>{group.firstAppearance}</dd>
              </div>
            )}
          </dl>
        </header>

        <section className="groupDetail__members" aria-labelledby="group-members-title">
          <div className="groupDetail__section-heading">
            <p className="groupDetail__eyebrow">Unidos são mais fortes</p>
            <h2 id="group-members-title" className="groupDetail__section-title">Integrantes da equipe</h2>
          </div>
          {group.characters?.length ? (
            <ul className="groupDetail__member-grid">
              {group.characters.map((character) => (
                <li className="groupDetail__member" key={character.id}>
                  <Link className="groupDetail__member-link" to={`/characters/${character.id}`}>
                    {character.background ? (
                      <img src={character.background} alt="" loading="lazy" />
                    ) : (
                      <span className="groupDetail__member-fallback" aria-hidden="true">
                        {character.name?.charAt(0) || '?'}
                      </span>
                    )}
                    <span className="groupDetail__member-name">{character.name}</span>
                    {character.true_name && (
                      <span className="groupDetail__member-alias">{character.true_name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="groupDetail__empty">Ainda não há personagens associados a esta equipe.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default GroupDetail
