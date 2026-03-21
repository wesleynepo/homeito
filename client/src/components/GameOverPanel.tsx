import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import styles from './GameOverPanel.module.css'

export function GameOverPanel() {
  const { state, isHost } = useGame()
  const navigate = useNavigate()
  const room = state.room!
  const gameOver = state.gameOverPayload

  const handleLeave = () => {
    sessionStorage.removeItem('ito-session')
    navigate('/')
  }

  const won = gameOver?.won ?? false

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <p className={styles.gameOverLabel}>GAME OVER</p>
        <p className={styles.outcome}>{won ? '🎉 You won!' : '💀 You lost…'}</p>
      </div>

      <div className={styles.stats}>
        <p>Rounds: {gameOver?.roundsPlayed}/{room.totalRounds}</p>
        <div className={styles.livesRow}>
          Lives left: <LivesDisplay lives={gameOver?.livesRemaining ?? 0} maxLives={room.maxLives} />
        </div>
      </div>

      <div className={styles.actions}>
        {isHost && (
          <button className={styles.playAgain} onClick={() => window.location.reload()}>
            Play Again
          </button>
        )}
        <button className={styles.leave} onClick={handleLeave}>
          Leave Room
        </button>
      </div>
    </div>
  )
}
