import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './CatalogDetail.css'

const API_URL = 'http://localhost:8080'

const DETAIL_TYPES = {
  series: { endpoint: 'series', label: 'Série', imageField: 'serieLogo' },
  games: { endpoint: 'games', label: 'Jogo', imageField: 'gameLogo' },
}

export const CatalogDetail = ({ type }) => {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('loading')
  const config = DETAIL_TYPES[type]

  useEffect(() => {
    const loadItem = async () => {
      setStatus('loading')
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
        {item.images?.length > 0 && (
          <section className="catalogDetail__gallery" aria-label={`Imagens de ${item.title}`}>
            <h2 className="catalogDetail__gallery-title">Galeria</h2>
            <div className="catalogDetail__gallery-grid">
              {item.images.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${item.title} — imagem ${index + 1}`} loading="lazy" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export const SeriesDetail = () => <CatalogDetail type="series" />
export const GameDetail = () => <CatalogDetail type="games" />

export default CatalogDetail
