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

export const AppRoutes = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters/:id" element={<Character />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/planets" element={<StarMap />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/movies/:id" element={<Movie />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}
