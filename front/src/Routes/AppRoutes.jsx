import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Home } from '../Pages/Home/Home'
import { Header } from '../Components/Header/Header'
import { Character } from '../Pages/Character/Character'
import { StarMap } from '../Components/StarMap/StarMap'
import { CharactersPage } from '../Pages/Characters/CharactersPage'
import Admin from '../Pages/Admin/Admin'
import Movie from '../Pages/Movie/Movie'
import Login from '../Pages/Login/Login'
import Register from '../Pages/Register/Register'
import UserPage from '../Pages/Users/UserPage'
import CatalogPage from '../Pages/Catalog/CatalogPage'
import { GameDetail, SeriesDetail } from '../Pages/Catalog/CatalogDetail'
import SagasPage from '../Pages/Sagas/SagasPage'
import SagaDetail from '../Pages/Sagas/SagaDetail'

export const AppRoutes = () => {
  const { pathname } = useLocation()

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters/:id" element={<Character />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/sagas" element={<SagasPage />} />
        <Route path="/sagas/:id" element={<SagaDetail />} />
        <Route path="/planets" element={<StarMap />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/movies/:id" element={<Movie />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserPage />} />
      </Routes>
      {pathname !== '/planets' && (
        <footer className="site-footer">
          <div className="site-footer__content">
            <div className="site-footer__brands" aria-label="DC Universe e Amazon Web Services">
              <img
                className="site-footer__brand site-footer__brand--dc"
                src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/logos/DCUniverse.png"
                alt="DC Universe"
              />
              <span className="site-footer__divider" aria-hidden="true" />
              <img
                className="site-footer__brand site-footer__brand--aws"
                src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/logos/amazon_logo.png"
                alt="Amazon Web Services"
              />
            </div>
          </div>
          <div className="site-footer__legal">
            <p>
              Este é um projeto pessoal, não oficial e sem fins comerciais. Não possui afiliação,
              patrocínio ou endosso da DC Comics, Warner Bros. Discovery, Amazon ou AWS.
            </p>
            <p>
              Personagens, nomes, logotipos, imagens e demais elementos relacionados ao universo
              DC pertencem aos seus respectivos titulares, incluindo DC Comics e Warner Bros.
              Discovery. AWS e o logotipo da AWS são marcas da Amazon.com, Inc. ou de suas afiliadas.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
