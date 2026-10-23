import React from 'react'
import { Routes, Route } from 'react-router-dom'
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

export const AppRoutes = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters/:id" element={<Character />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/planets" element={<StarMap />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/movies/:id" element={<Movie />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserPage />} />
      </Routes>
    </div>
  )
}
