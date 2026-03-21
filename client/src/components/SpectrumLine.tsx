import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Player } from '@ito/shared'
import { positionToPercent } from '@ito/shared'
import styles from './SpectrumLine.module.css'

interface Props {
  players: Player[]
  revealedUpToIndex: number
  revealedOrder: Player[]
  phase: string
}

export function SpectrumLine({ players, revealedUpToIndex, revealedOrder, phase }: Props) {
  const { t } = useTranslation()
  const connectedPlayers = players.filter((p) => p.isConnected)
  const N = connectedPlayers.length

  const placedPlayers = connectedPlayers.filter((p) => p.claimedPosition !== null)
  const waitingPlayers = connectedPlayers.filter((p) => p.claimedPosition === null)

  const isRevealing = phase === 'revealing' || phase === 'roundResult'

  return (
    <div className={styles.wrapper}>
      {/* Spectrum line */}
      <div className={styles.lineContainer}>
        <span className={styles.label}>{t('spectrum.lowest')}</span>
        <div className={styles.line}>
          {placedPlayers.map((p) => {
            const pct = positionToPercent(p.claimedPosition!, N)
            const revealIdx = revealedOrder.findIndex((r) => r.id === p.id)
            const isRevealed = isRevealing && revealIdx <= revealedUpToIndex

            // Find if this player is a mistake (out of order with previous)
            const prevInOrder = revealedOrder[revealIdx - 1]
            const isMistake =
              isRevealed &&
              prevInOrder &&
              prevInOrder.cardValue !== null &&
              p.cardValue !== null &&
              prevInOrder.cardValue > p.cardValue

            return (
              <div
                key={p.id}
                className={`${styles.card} ${p.isLocked ? styles.locked : styles.unlocked} ${isMistake ? styles.mistake : ''}`}
                // eslint-disable-next-line react/forbid-dom-props -- CSS custom property required for dynamic per-element positioning
                style={{ '--card-left': `${pct}%` } as React.CSSProperties}
              >
                <span className={styles.nick}>{p.nickname}</span>
                {p.isLocked && !isRevealing && <span className={styles.check}>✓</span>}
                <span className={styles.value}>
                  {isRevealed ? p.cardValue : '?'}
                </span>
              </div>
            )
          })}
        </div>
        <span className={styles.label}>{t('spectrum.highest')}</span>
      </div>

      {/* Waiting tray */}
      {waitingPlayers.length > 0 && (
        <div className={styles.tray}>
          {waitingPlayers.map((p) => (
            <div key={p.id} className={styles.trayCard}>
              <span className={styles.nick}>{p.nickname}</span>
              <span className={styles.value}>?</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
