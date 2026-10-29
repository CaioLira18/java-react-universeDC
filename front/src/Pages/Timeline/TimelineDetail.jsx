import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import './TimelineDetail.css'

const createTimelineFallback = (event) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500">
    <rect width="900" height="500" fill="#151a32"/>
    <path d="M0 410L220 170L390 330L570 110L900 410V500H0Z" fill="#242c52"/>
    <text x="50%" y="43%" fill="#ffd400" font-family="Arial,sans-serif" font-size="44" font-weight="700" text-anchor="middle">${event.year}  ${event.title}</text>
    <text x="50%" y="58%" fill="#fff6dc" font-family="Arial,sans-serif" font-size="22" text-anchor="middle">DC UNIVERSE</text>
  </svg>
`)}`

const getTimelineImage = (event) => (
  typeof event.image === 'string' && event.image.trim()
    ? event.image.trim()
    : createTimelineFallback(event)
)

export const TimelineDetail = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetch(`${API_URL}/timelines/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ${response.status}`)
        return response.json()
      })
      .then((data) => {
        setEvent(data)
        setStatus('ready')
      })
      .catch((error) => {
        console.error('Não foi possível carregar o marco da timeline.', error)
        setStatus('error')
      })
  }, [id])

  if (status === 'loading') return <main className="timelineDetail"><p>Carregando marco...</p></main>
  if (status === 'error' || !event) {
    return (
      <main className="timelineDetail">
        <p>Este marco não foi encontrado.</p>
        <Link to="/timeline">Voltar para a timeline</Link>
      </main>
    )
  }

  return (
    <main className="timelineDetail">
      <Link className="timelineDetail__back" to="/timeline">← Voltar para a timeline</Link>
      <article className={`timelineDetail__card timelineDetail__card--${event.accent || 'yellow'}`}>
        <img
          src={getTimelineImage(event)}
          alt={event.imageAlt || event.title}
          onError={(imageEvent) => {
            imageEvent.currentTarget.onerror = null
            imageEvent.currentTarget.src = createTimelineFallback(event)
          }}
        />
        <div className="timelineDetail__content">
          <p className="timelineDetail__year">{event.year}</p>
          <p className="timelineDetail__era">{event.era}</p>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>
      </article>
    </main>
  )
}

export default TimelineDetail
