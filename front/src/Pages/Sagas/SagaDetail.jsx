import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import './SagaDetail.css'

const API_URL = 'http://localhost:8080'

const getSagaPeriod = (saga) => {
  if (saga.startYear && saga.endYear) return `${saga.startYear} – ${saga.endYear}`
  if (saga.startYear) return `A partir de ${saga.startYear}`
  if (saga.endYear) return `Até ${saga.endYear}`
  return 'Período não informado'
}

export const SagaDetail = () => {
  const { id } = useParams()
  const [saga, setSaga] = useState(null)
  const [status, setStatus] = useState('loading')
  const [selectedComic, setSelectedComic] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadSaga = async () => {
      setStatus('loading')
      try {
        const response = await fetch(`${API_URL}/sagas/${id}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar a saga`)
        setSaga(await response.json())
        setStatus('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('Não foi possível carregar a saga.', error)
        setStatus('error')
      }
    }

    loadSaga()
    return () => controller.abort()
  }, [id])

  useEffect(() => {
    if (!selectedComic) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const handleModalKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedComic(null)
      } else if (event.key === 'Tab') {
        const closeButton = modalRef.current?.querySelector('.sagaDetail__modal-close')
        if (closeButton) {
          event.preventDefault()
          closeButton.focus()
        }
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleModalKeyDown)
    modalRef.current?.querySelector('.sagaDetail__modal-close')?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleModalKeyDown)
      previousFocus?.focus()
    }
  }, [selectedComic])

  if (status !== 'ready') {
    return (
      <main className="sagaDetail sagaDetail--message" aria-busy={status === 'loading'}>
        <p className="sagaDetail__notice" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'loading'
            ? 'Carregando saga...'
            : 'Não foi possível carregar esta saga. Ela pode não existir ou não estar publicada.'}
        </p>
        <Link className="sagaDetail__back" to="/sagas">Voltar às sagas</Link>
      </main>
    )
  }

  return (
    <main className="sagaDetail">
      <div className="sagaDetail__background" />
      {saga.banner && (
        <div className="sagaDetail__hero">
          <img src={saga.banner} alt="" />
          <div className="sagaDetail__hero-overlay" />
        </div>
      )}

      <div className="sagaDetail__content">
        <Link className="sagaDetail__back" to="/sagas">Voltar às sagas</Link>

        <header className="sagaDetail__header">
          <p className="sagaDetail__period">{getSagaPeriod(saga)}</p>
          <h1 className="sagaDetail__title">{saga.name}</h1>
          {saga.description && <p className="sagaDetail__description">{saga.description}</p>}
        </header>

        <section className="sagaDetail__comics" aria-labelledby="saga-comics-title">
          <div className="sagaDetail__section-heading">
            <p className="sagaDetail__eyebrow">Leituras da continuidade</p>
            <h2 id="saga-comics-title" className="sagaDetail__section-title">HQs da saga</h2>
          </div>
          {saga.comics?.length ? (
            <ol className="sagaDetail__comic-grid">
              {saga.comics.map((comic, index) => (
                <li className="sagaDetail__comic" key={comic.id}>
                  <button
                    className="sagaDetail__comic-button"
                    type="button"
                    onClick={() => setSelectedComic({ ...comic, index })}
                    aria-haspopup="dialog"
                    aria-label={`Ver detalhes de ${comic.name}`}
                  >
                    {comic.coverImage ? (
                      <img
                        className="sagaDetail__comic-cover"
                        src={comic.coverImage}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className="sagaDetail__comic-cover sagaDetail__comic-cover--empty" aria-hidden="true">
                        HQ
                      </span>
                    )}
                    <span className="sagaDetail__comic-info">
                      <span className="sagaDetail__comic-number">Leitura {String(index + 1).padStart(2, '0')}</span>
                      <span className="sagaDetail__comic-name">{comic.name}</span>
                      {comic.releaseYear && <span className="sagaDetail__comic-year">{comic.releaseYear}</span>}
                      <span className="sagaDetail__comic-action">Ver detalhes</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="sagaDetail__empty-comics">
              Ainda não há HQs adicionadas a esta saga.
            </p>
          )}
        </section>
      </div>

      {selectedComic && (
        createPortal(
          <div
            className="sagaDetail__modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedComic(null)
            }}
          >
            <section
              className="sagaDetail__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="saga-comic-modal-title"
              ref={modalRef}
            >
              <button
                className="sagaDetail__modal-close"
                type="button"
                onClick={() => setSelectedComic(null)}
                aria-label="Fechar detalhes da HQ"
              >
                ×
              </button>
              {selectedComic.coverImage ? (
                <img className="sagaDetail__modal-cover" src={selectedComic.coverImage} alt={`Capa de ${selectedComic.name}`} />
              ) : (
                <div className="sagaDetail__modal-cover sagaDetail__comic-cover--empty" aria-hidden="true">HQ</div>
              )}
              <div className="sagaDetail__modal-info">
                <p className="sagaDetail__comic-number">
                  Leitura {String(selectedComic.index + 1).padStart(2, '0')}
                  {selectedComic.releaseYear ? ` · ${selectedComic.releaseYear}` : ''}
                </p>
                <h2 id="saga-comic-modal-title" className="sagaDetail__modal-title">{selectedComic.name}</h2>
                <p className="sagaDetail__modal-description">
                  {selectedComic.description || 'Nenhuma descrição cadastrada para esta HQ.'}
                </p>
              </div>
            </section>
          </div>,
          document.body
        )
      )}
    </main>
  )
}

export default SagaDetail
