import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import './TimelineDetail.css'

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
        <img src={event.image} alt={event.imageAlt || event.title} />
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
