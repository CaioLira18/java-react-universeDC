import React from 'react'
import './AboutProject.css'

const STACK = [
  {
    number: '01',
    name: 'Frontend',
    technology: 'React + Vite',
    description: 'Interface interativa para explorar o universo, navegar pelo catálogo e administrar os conteúdos.',
  },
  {
    number: '02',
    name: 'API',
    technology: 'Java 21 + Spring Boot',
    description: 'API REST que concentra as regras de negócio, autenticação e comunicação entre a interface e os dados.',
  },
  {
    number: '03',
    name: 'Banco de dados',
    technology: 'PostgreSQL',
    description: 'Persistência de contas, personagens, equipes, sagas, filmes, séries, jogos e demais informações.',
  },
  {
    number: '04',
    name: 'Armazenamento de mídia',
    technology: 'Amazon S3',
    description: 'Imagens enviadas pelo painel são organizadas em pastas por tipo de conteúdo e armazenadas em um bucket S3.',
  },
]

const LEARNING_GOALS = [
  'Integrar uma aplicação web com uma API REST e um banco relacional.',
  'Implementar autenticação e operações de cadastro, edição e remoção.',
  'Enviar e organizar arquivos de mídia no Amazon S3.',
  'Praticar configuração por variáveis de ambiente e preparação para deploy.',
]

export const AboutProject = () => (
  <main className="aboutProject">
    <section className="aboutProject__hero">
      <p className="aboutProject__eyebrow">Projeto pessoal · estudo de desenvolvimento e AWS</p>
      <h1 className="aboutProject__title">Sobre o projeto</h1>
      <p className="aboutProject__intro">
        Um catálogo interativo inspirado no universo DC, criado como projeto pessoal para
        praticar desenvolvimento full stack e explorar a integração com serviços da AWS.
      </p>
      <a className="aboutProject__cta" href="#arquitetura">
        Conheça a arquitetura
      </a>
    </section>

    <section className="aboutProject__section" id="arquitetura" aria-labelledby="about-architecture-title">
      <div className="aboutProject__section-heading">
        <p className="aboutProject__section-eyebrow">Como funciona</p>
        <h2 id="about-architecture-title">Arquitetura da aplicação</h2>
        <p>
          A interface solicita os dados à API. A API aplica as regras da aplicação, consulta o
          PostgreSQL e integra os uploads de mídia com o Amazon S3.
        </p>
      </div>

      <div className="aboutProject__flow" aria-label="Fluxo entre interface, API, banco de dados e armazenamento de mídia">
        <span>React</span>
        <i aria-hidden="true">↔</i>
        <span>API Spring Boot</span>
        <i aria-hidden="true">↔</i>
        <span>PostgreSQL</span>
        <b aria-hidden="true">+</b>
        <span>Amazon S3 para mídias</span>
      </div>

      <div className="aboutProject__stack">
        {STACK.map((item) => (
          <article className="aboutProject__stack-card" key={item.number}>
            <span className="aboutProject__stack-number">{item.number}</span>
            <p className="aboutProject__stack-name">{item.name}</p>
            <h3>{item.technology}</h3>
            <p className="aboutProject__stack-description">{item.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="aboutProject__learning" aria-labelledby="about-learning-title">
      <div>
        <p className="aboutProject__section-eyebrow">Objetivo de aprendizado</p>
        <h2 id="about-learning-title">Construído para aprender fazendo</h2>
        <p>
          Cada funcionalidade também é uma oportunidade de estudar decisões e integrações comuns
          em aplicações web.
        </p>
      </div>
      <ul>
        {LEARNING_GOALS.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ul>
    </section>

    <p className="aboutProject__disclaimer">
      Projeto pessoal, independente, não oficial e sem fins comerciais. Não possui afiliação,
      patrocínio ou endosso da DC Comics ou da Warner Bros. Discovery. Personagens, marcas e
      elementos relacionados ao universo DC pertencem aos seus respectivos titulares.
    </p>
  </main>
)

export default AboutProject
