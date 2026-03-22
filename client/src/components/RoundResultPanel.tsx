import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Player } from '@ito/shared'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import { useCssVars } from '../hooks/useCssVars'
import styles from './RoundResultPanel.module.css'

interface ResultCardProps {
  player: Player
  isMistake: boolean
}

function ResultCard({ player, isMistake }: ResultCardProps) {
  const ref = useCssVars<HTMLDivElement>({ '--player-color': player.color })
  return (
    <div ref={ref} className={`${styles.card} ${isMistake ? styles.mistake : ''}`}>
      <span className={styles.nick}>{player.nickname}</span>
      <span className={styles.val}>{player.cardValue}</span>
    </div>
  )
}

export function RoundResultPanel() {
  const { state, isHost, nextRound } = useGame()
  const { t } = useTranslation()
  const room = state.room!
  const result = state.lastRevealResult

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>ITO</span>
        <LivesDisplay lives={room.lives} maxLives={room.maxLives} />
      </div>

      <p className={styles.roundLabel}>{t('round_result.round', { current: room.currentRound, total: room.totalRounds })}</p>

      {result && (
        <div className={styles.summary}>
          {result.mistakes === 0 ? (
            <p className={styles.success}>{t('round_result.perfect')}</p>
          ) : (
            <p className={styles.mistakes}>
              {t('round_result.mistake', { count: result.mistakes })} · -{result.livesLost} ❤️
            </p>
          )}

          <div className={styles.cards}>
            {result.orderedPlayers.map((p, i) => {
              const prev = result.orderedPlayers[i - 1]
              const isMistake = !!(prev && prev.cardValue !== null && p.cardValue !== null && prev.cardValue > p.cardValue)
              return <ResultCard key={p.id} player={p} isMistake={isMistake} />
            })}
          </div>
        </div>
      )}

      {isHost && (
        <button onClick={nextRound} className={styles.nextButton}>
          {t('round_result.next_round')}
        </button>
      )}
    </div>
  )
}
