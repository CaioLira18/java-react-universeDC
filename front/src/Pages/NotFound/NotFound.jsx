import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

const STARFIRE_IMAGE =
  'https://dc-universe-bucket.s3.us-east-1.amazonaws.com/extras/dmlxdlv-5ec3414e-266d-4301-bccf-3937e45d9772.png'

export const NotFound = () => {
  return (
    <main className="notFound">
      <div className="notFound__inner">
        <div className="notFound__text">
          <p className="notFound__bubble">Nem a Estelar achou!</p>
          <h1 className="notFound__code">404</h1>
          <h2 className="notFound__title">Não encontramos essa URL</h2>
          <p className="notFound__description">
            O endereço não existe ou foi movido. Volte para a página inicial e continue explorando o universo DC.
          </p>
          <Link to="/" className="notFound__cta">Voltar ao início</Link>
        </div>

        <figure className="notFound__figure">
          <img
            className="notFound__image"
            src={STARFIRE_IMAGE}
            alt="Estelar, personagem da DC, em pose de voo"
          />
        </figure>
      </div>
    </main>
  )
}

export default NotFound
