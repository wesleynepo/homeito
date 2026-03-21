import React from 'react'
import { useGame } from '../context/GameContext'
import styles from './RevealPanel.module.css'

export function RevealPanel() {
  const { state } = useGame()
  const result = state.lastRevealResult

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>ITO</span>
        <span className={styles.label}>Revealing…</span>
      </div>

      {result ? (
        <div className={styles.content}>
          <div className={styles.cards}>
            {result.orderedPlayers.map((p, i) => {
              const prev = result.orderedPlayers[i - 1]
              const isMistake = prev && prev.cardValue !== null && p.cardValue !== null && prev.cardValue > p.cardValue
              return (
                <div key={p.id} className={`${styles.card} ${isMistake ? styles.mistake : ''}`}>
                  <span className={styles.nickname}>{p.nickname}</span>
                  <span className={styles.value}>{p.cardValue}</span>
                  {isMistake && <span className={styles.mistakeIcon}>✗</span>}
                </div>
              )
            })}
          </div>

          {result.mistakes === 0 ? (
            <p className={styles.success}>✅ All in order! No lives lost.</p>
          ) : (
            <p className={styles.lost}>
              {result.mistakes} mistake{result.mistakes !== 1 ? 's' : ''} · {result.livesLost} life{result.livesLost !== 1 ? 's' : ''} lost
            </p>
          )}
        </div>
      ) : (
        <p className={styles.waiting}>Waiting for host to reveal…</p>
      )}

      <p className={styles.hostWait}>[waiting for host]</p>
    </div>
  )
}
