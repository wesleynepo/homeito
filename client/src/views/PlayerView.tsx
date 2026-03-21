import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { LobbyPanel } from '../components/LobbyPanel'
import { DiscussingPanel } from '../components/DiscussingPanel'
import { RevealPanel } from '../components/RevealPanel'
import { RoundResultPanel } from '../components/RoundResultPanel'
import { GameOverPanel } from '../components/GameOverPanel'
import { PausedOverlay } from '../components/PausedOverlay'

export default function PlayerView() {
  const { state } = useGame()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Redirect to home if not in a room
  React.useEffect(() => {
    if (state.connectionStatus === 'connected' && !state.room) {
      navigate('/')
    }
  }, [state.connectionStatus, state.room, navigate])

  if (!state.room) {
    return <div className="loading">{t('common.connecting')}</div>
  }

  const room = state.room
  const disconnectedPlayer = room.players.find((p) => !p.isConnected && room.phase === 'paused')

  const renderPhase = () => {
    switch (room.phase) {
      case 'lobby': return <LobbyPanel />
      case 'discussing': return <DiscussingPanel />
      case 'revealing':
      case 'roundResult': return room.phase === 'revealing' ? <RevealPanel /> : <RoundResultPanel />
      case 'gameOver': return <GameOverPanel />
      case 'paused': return <DiscussingPanel />
      default: return null
    }
  }

  return (
    <>
      {renderPhase()}
      {room.phase === 'paused' && disconnectedPlayer && (
        <PausedOverlay disconnectedNickname={disconnectedPlayer.nickname} />
      )}
    </>
  )
}
