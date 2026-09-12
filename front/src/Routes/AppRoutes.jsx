import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home } from '../Pages/Home/Home'
import { Header } from '../Components/Header/Header'
import { Character } from '../Pages/Character/Character'
import { StarMap } from '../Components/StarMap/StarMap'

export const AppRoutes = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters/:id" element={<Character />} />
        <Route path="/planets" element={<StarMap />} />
      </Routes>
    </div>
  )
}
