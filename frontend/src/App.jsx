import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import DailyLog from './pages/DailyLog'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'

export default function App(){
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark)
  }, [dark])

  return (
    <Layout dark={dark} setDark={setDark}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/daily-logs" element={<DailyLog />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  )
}
