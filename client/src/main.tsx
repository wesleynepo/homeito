import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import './i18n'
import './styles/globals.css'

// Lazy load views to keep initial bundle small
const HomeView = React.lazy(() => import('./views/HomeView'))
const PlayerView = React.lazy(() => import('./views/PlayerView'))
const SpectatorView = React.lazy(() => import('./views/SpectatorView'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <BrowserRouter>
        <React.Suspense fallback={<div style={{ color: '#fff', padding: 24 }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/player/:roomCode" element={<PlayerView />} />
            <Route path="/spectator/:roomCode" element={<SpectatorView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </GameProvider>
  </React.StrictMode>
)
