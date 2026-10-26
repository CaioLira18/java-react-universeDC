import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Timeline.css'
import { API_URL } from '../../config'

const EVENTS = [
  {
    year: '1934',
    era: 'O começo',
    title: 'Nasce a DC',
    description:
      'A National Allied Publications inicia a trajetória que daria origem à DC Comics e transforma os quadrinhos em uma nova linguagem de aventura.',
    image: 'https://placehold.co/900x500/0a6cf0/fff6dc?text=DC+COMICS',
    imageAlt: 'Arte representando o início da DC Comics',
    accent: 'blue',
  },
  {
    year: '1938',
    era: 'A Era de Ouro',
    title: 'Superman chega a Metropolis',
    description:
      'A estreia do Superman inaugura a era dos super-heróis e estabelece o modelo que inspiraria gerações de personagens.',
    image: 'https://placehold.co/900x500/ffd400/0a0c1c?text=SUPERMAN',
    imageAlt: 'Arte representando a estreia do Superman',
    accent: 'yellow',
  },
  {
    year: '1939',
    era: 'Um novo símbolo',
    title: 'Batman aparece em Gotham',
    description:
      'Um herói sem poderes, movido por estratégia, investigação e determinação, passa a proteger Gotham durante a noite.',
    image: 'https://placehold.co/900x500/e8212e/fff6dc?text=BATMAN',
    imageAlt: 'Arte representando a estreia do Batman',
    accent: 'red',
  },
  {
    year: '1941',
    era: 'Uma nova fronteira',
    title: 'Wonder Woman entra em cena',
    description:
      'Diana de Themyscira amplia o universo com mitologia, representatividade e uma nova visão de heroísmo.',
    image: 'https://placehold.co/900x500/0a6cf0/fff6dc?text=WONDER+WOMAN',
    imageAlt: 'Arte representando a estreia da Wonder Woman',
    accent: 'blue',
  },
  {
    year: '1956',
    era: 'A Era de Prata',
    title: 'O multiverso ganha forma',
    description:
      'Novas versões de heróis e mundos paralelos mostram que diferentes realidades podem coexistir dentro do universo DC.',
    image: 'https://placehold.co/900x500/ffd400/0a0c1c?text=MULTIVERSO',
    imageAlt: 'Arte representando o multiverso DC',
    accent: 'yellow',
  },
  {
    year: '1960',
    era: 'Heróis unidos',
    title: 'A Liga da Justiça',
    description:
      'Superman, Batman, Wonder Woman e outros heróis se unem para enfrentar ameaças grandes demais para qualquer integrante sozinho.',
    image: 'https://placehold.co/900x500/e8212e/fff6dc?text=LIGA+DA+JUSTICA',
    imageAlt: 'Arte representando a Liga da Justiça',
    accent: 'red',
  },
  {
    year: '1985',
    era: 'Crise',
    title: 'As infinitas Terras entram em choque',
    description:
      'Uma grande crise reorganiza as realidades e se torna um dos eventos mais importantes para a continuidade dos quadrinhos.',
    image: 'https://placehold.co/900x500/0a6cf0/fff6dc?text=CRISE',
    imageAlt: 'Arte representando uma crise no multiverso',
    accent: 'blue',
  },
  {
    year: '1986',
    era: 'Novas perspectivas',
    title: 'Heróis mais complexos',
    description:
      'Histórias mais maduras aprofundam conflitos, escolhas e consequências, influenciando a forma como super-heróis seriam escritos.',
    image: 'https://placehold.co/900x500/ffd400/0a0c1c?text=NOVAS+PERSPECTIVAS',
    imageAlt: 'Arte representando uma nova fase dos heróis',
    accent: 'yellow',
  },
  {
    year: '2011',
    era: 'Os Novos 52',
    title: 'Uma nova porta de entrada',
    description:
      'A editora reinventa origens e cronologias para apresentar uma nova fase editorial e aproximar leitores do vasto universo DC.',
    image: 'https://placehold.co/900x500/e8212e/fff6dc?text=OS+NOVOS+52',
    imageAlt: 'Arte representando Os Novos 52',
    accent: 'red',
  },
  {
    year: '2016',
    era: 'Renascimento',
    title: 'O legado continua',
    description:
      'Personagens, relações e memórias de fases anteriores voltam a ganhar espaço em uma celebração da história da editora.',
    image: 'https://placehold.co/900x500/0a6cf0/fff6dc?text=RENASCIMENTO',
    imageAlt: 'Arte representando o Renascimento da DC',
    accent: 'blue',
  },
  {
    year: '2021',
    era: 'Fronteiras infinitas',
    title: 'Todas as histórias importam',
    description:
      'A DC amplia novamente sua cosmologia e reforça a ideia de que diferentes Terras podem fazer parte de um mesmo mapa.',
    image: 'https://placehold.co/900x500/ffd400/0a0c1c?text=FRONTEIRAS+INFINITAS',
    imageAlt: 'Arte representando as Fronteiras Infinitas',
    accent: 'yellow',
  },
  {
    year: 'Hoje',
    era: 'O futuro',
    title: 'Um universo em expansão',
    description:
      'Quadrinhos, animações, filmes, séries e jogos continuam apresentando novas interpretações dos heróis e de suas histórias.',
    image: 'https://placehold.co/900x500/e8212e/fff6dc?text=O+FUTURO',
    imageAlt: 'Arte representando o futuro do universo DC',
    accent: 'red',
  },
]

export const Timeline = () => {
  const [events, setEvents] = useState(EVENTS)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    fetch(`${API_URL}/timelines`)
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar a timeline`)
        return response.json()
      })
      .then((timeline) => {
        if (timeline.length > 0) {
          setEvents(timeline)
          setActiveIndex(0)
        }
      })
      .catch((error) => console.error('Não foi possível carregar a timeline cadastrada.', error))
  }, [])

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 700 ? 1 : window.innerWidth <= 1050 ? 2 : 3)
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const lastIndex = Math.max(events.length - visibleCount, 0)
  useEffect(() => {
    setActiveIndex((current) => Math.min(current, lastIndex))
  }, [lastIndex])

  const showPrevious = () => setActiveIndex((current) => Math.max(current - 1, 0))
  const showNext = () => setActiveIndex((current) => Math.min(current + 1, lastIndex))

  return (
    <main className="timeline">
      <section className="timeline__hero">
        <p className="timeline__eyebrow">Antes, agora e além</p>
        <h1 className="timeline__title">Linha do tempo</h1>
        <p className="timeline__intro">
          Uma viagem pelos momentos que construíram o universo DC. Aqui, a ordem acompanha a
          história editorial e as grandes mudanças de continuidade dos quadrinhos.
        </p>
        <a className="timeline__jump" href="#marcos">Explorar os marcos</a>
      </section>

      <section className="timeline__road" id="marcos" aria-labelledby="timeline-heading">
        <div className="timeline__heading">
          <p className="timeline__section-label">Do primeiro sinal ao multiverso</p>
          <h2 id="timeline-heading">Uma história maior que qualquer herói</h2>
        </div>

        <div className="timeline__carousel">
          <button
            type="button"
            className="timeline__arrow timeline__arrow--previous"
            onClick={showPrevious}
            disabled={activeIndex === 0}
            aria-label="Marco anterior"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div
            className="timeline__viewport"
            aria-live="polite"
            aria-label={`Marco ${activeIndex + 1} de ${events.length}`}
          >
            <div
              className="timeline__events"
              style={{ '--timeline-index': activeIndex }}
            >
              {events.map((event, index) => (
                <article className={`timeline__event timeline__event--${event.accent}`} key={`${event.year}-${event.title}`}>
                  <div className="timeline__marker" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <Link className="timeline__card" to={`/timeline/${event.id || index}`}>
                    <img
                      className="timeline__image"
                      src={event.image}
                      alt={event.imageAlt}
                      loading="lazy"
                      onError={(imageEvent) => {
                        imageEvent.currentTarget.src = 'https://placehold.co/900x500/151a32/fff6dc?text=DC+UNIVERSE'
                      }}
                    />
                    <p className="timeline__year">{event.year}</p>
                    <p className="timeline__era">{event.era}</p>
                    <h3>{event.title}</h3>
                    <p className="timeline__description">{event.description}</p>
                    <span className="timeline__details">Ver detalhes →</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="timeline__arrow timeline__arrow--next"
            onClick={showNext}
            disabled={activeIndex === lastIndex}
            aria-label="Próximo marco"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div className="timeline__pagination" aria-label="Navegação da timeline">
          {events.slice(0, lastIndex + 1).map((event, index) => (
            <button
              key={`${event.year}-${event.title}-dot`}
              type="button"
              className={`timeline__dot${index === activeIndex ? ' timeline__dot--active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir para ${event.title}`}
              aria-current={index === activeIndex ? 'step' : undefined}
            />
          ))}
        </div>
      </section>

      <p className="timeline__note">
        Esta é uma linha do tempo editorial e introdutória. Filmes, séries e jogos podem seguir
        continuidades próprias e não devem ser lidos como uma única cronologia.
      </p>
    </main>
  )
}

export default Timeline
