import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import './CatalogDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const DETAIL_TYPES = {
  series: { endpoint: 'series', label: 'Série', imageField: 'serieLogo' },
  games: { endpoint: 'games', label: 'Jogo', imageField: 'gameLogo' },
}

export const CatalogDetail = ({ type }) => {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('loading')
  const [lightbox, setLightbox] = useState(null) // índice da imagem aberta, ou null
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const triggerRef = useRef(null)
  const config = DETAIL_TYPES[type]

  const images = item?.images ?? []
  const isOpen = lightbox !== null

  useEffect(() => {
    const loadItem = async () => {
      setStatus('loading')
      setLightbox(null)
      try {
        const response = await fetch(`${API_URL}/${config.endpoint}/${id}`)
        if (!response.ok) throw new Error(`Erro ${response.status}`)
        setItem(await response.json())
        setStatus('ready')
      } catch (error) {
        console.error(`Não foi possível carregar ${config.label.toLowerCase()}.`, error)
        setStatus('error')
      }
    }

    loadItem()
  }, [config, id])

  const openLightbox = (index, event) => {
    triggerRef.current = event.currentTarget
    setLightbox(index)
  }

  const closeLightbox = useCallback(() => setLightbox(null), [])

  const step = useCallback(
    (direction) =>
      setLightbox((current) =>
        current === null ? current : (current + direction + images.length) % images.length
      ),
    [images.length]
  )

  // teclado (Esc, setas, Tab preso no modal), trava o scroll e devolve o foco ao fechar
  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox()
      } else if (event.key === 'ArrowRight') {
        step(1)
      } else if (event.key === 'ArrowLeft') {
        step(-1)
      } else if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [isOpen, closeLightbox, step])

  if (status !== 'ready') {
    return (
      <main className="catalogDetail catalogDetail--empty" aria-busy={status === 'loading'}>
        <p className="catalogDetail__message">
          {status === 'loading'
            ? `Carregando ${config.label.toLowerCase()}...`
            : `Não foi possível carregar esta página. Verifique se a API está rodando em ${API_URL}.`}
        </p>
      </main>
    )
  }

  const image = item[config.imageField]
  const backdrop = item.banner || item.background || item.horizontalImage

  return (
    <main
      className="catalogDetail"
      style={backdrop ? { '--catalog-detail-backdrop': `url("${backdrop}")` } : undefined}
    >
      <div className="catalogDetail__backdrop" />
      {backdrop && (
        <div className="catalogDetail__hero">
          <img src={backdrop} alt="" />
          <div className="catalogDetail__hero-overlay" />
        </div>
      )}
      <div className={`catalogDetail__content${backdrop ? '' : ' catalogDetail__content--no-hero'}`}>
        <Link to="/catalog" className="catalogDetail__back">Voltar ao catálogo</Link>
        <div className="catalogDetail__layout">
          {image && (
            <div className="catalogDetail__poster">
              <img src={image} alt={`${config.label}: ${item.title}`} />
              <span className="catalogDetail__tag">{config.label}</span>
            </div>
          )}
          <section className="catalogDetail__info">
            <h1 className="catalogDetail__title">{item.title}</h1>
            {item.description && (
              <p className="catalogDetail__description">{item.description}</p>
            )}
          </section>
        </div>
        {images.length > 0 && (
          <section className="catalogDetail__gallery" aria-label={`Imagens de ${item.title}`}>
            <h2 className="catalogDetail__gallery-title">Galeria</h2>
            <div className="catalogDetail__gallery-grid">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  className="catalogDetail__gallery-item"
                  aria-label={`Ampliar imagem ${index + 1} de ${images.length}`}
                  onClick={(event) => openLightbox(index, event)}
                >
                  <img src={src} alt={`${item.title} — imagem ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* portal: o conteúdo da página cria um stacking context, o modal precisa ficar acima do header */}
      {isOpen &&
        createPortal(
          <div
            ref={dialogRef}
            className="catalogLightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} — imagem ${lightbox + 1} de ${images.length}`}
            onClick={closeLightbox}
          >
            <button
              ref={closeRef}
              type="button"
              className="catalogLightbox__close"
              aria-label="Fechar"
              onClick={closeLightbox}
            >
              ×
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="catalogLightbox__nav catalogLightbox__nav--prev"
                aria-label="Imagem anterior"
                onClick={(event) => {
                  event.stopPropagation()
                  step(-1)
                }}
              >
                ‹
              </button>
            )}

            <figure className="catalogLightbox__figure" onClick={(event) => event.stopPropagation()}>
              <img
                className="catalogLightbox__image"
                src={images[lightbox]}
                alt={`${item.title} — imagem ${lightbox + 1}`}
              />
              <figcaption className="catalogLightbox__caption">
                {lightbox + 1} / {images.length}
              </figcaption>
            </figure>

            {images.length > 1 && (
              <button
                type="button"
                className="catalogLightbox__nav catalogLightbox__nav--next"
                aria-label="Próxima imagem"
                onClick={(event) => {
                  event.stopPropagation()
                  step(1)
                }}
              >
                ›
              </button>
            )}
          </div>,
          document.body
        )}
    </main>
  )
}

export const SeriesDetail = () => <CatalogDetail type="series" />
export const GameDetail = () => <CatalogDetail type="games" />

export default CatalogDetail
