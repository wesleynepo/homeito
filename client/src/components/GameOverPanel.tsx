import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import styles from './GameOverPanel.module.css'

export function GameOverPanel() {
  const { state, isHost } = useGame()
  const { t } = useTranslation()
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
        <p className={styles.gameOverLabel}>{t('game_over.title')}</p>
        <p className={styles.outcome}>{won ? t('game_over.won') : t('game_over.lost')}</p>
      </div>

      <div className={styles.stats}>
        <p>{t('game_over.rounds', { played: gameOver?.roundsPlayed, total: room.totalRounds })}</p>
        <div className={styles.livesRow}>
          {t('game_over.lives_left')} <LivesDisplay lives={gameOver?.livesRemaining ?? 0} maxLives={room.maxLives} />
        </div>
      </div>

      <div className={styles.actions}>
        {isHost && (
          <button className={styles.playAgain} onClick={() => window.location.reload()}>
            {t('game_over.play_again')}
          </button>
        )}
        <button className={styles.leave} onClick={handleLeave}>
          {t('game_over.leave')}
        </button>
      </div>
    </div>
  )
}
