import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Player } from '@ito/shared'
import { positionToPercent } from '@ito/shared'
import { useCssVars } from '../hooks/useCssVars'
import styles from './SpectrumLine.module.css'

interface Props {
  players: Player[]
  revealedUpToIndex: number
  revealedOrder: Player[]
  phase: string
}

interface PlacedCardProps {
  player: Player
  pct: number
  isLocked: boolean
  isRevealing: boolean
  isMistake: boolean
  isRevealed: boolean
}

function PlacedCard({ player, pct, isLocked, isRevealing, isMistake, isRevealed }: PlacedCardProps) {
  const ref = useCssVars<HTMLDivElement>({ '--card-left': `${pct}%`, '--player-color': player.color })
  return (
    <div
      ref={ref}
      className={`${styles.card} ${isLocked ? styles.locked : styles.unlocked} ${isMistake ? styles.mistake : ''}`}
    >
      <span className={styles.nick}>{player.nickname}</span>
      {isLocked && !isRevealing && <span className={styles.check}>✓</span>}
      <span className={styles.value}>{isRevealed ? player.cardValue : '?'}</span>
    </div>
  )
}

function TrayCard({ player }: { player: Player }) {
  const ref = useCssVars<HTMLDivElement>({ '--player-color': player.color })
  return (
    <div ref={ref} className={styles.trayCard}>
      <span className={styles.nick}>{player.nickname}</span>
      <span className={styles.value}>?</span>
    </div>
  )
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
      <div className={styles.lineContainer}>
        <span className={styles.label}>{t('spectrum.lowest')}</span>
        <div className={styles.line}>
          {placedPlayers.map((p) => {
            const pct = positionToPercent(p.claimedPosition!, N)
            const revealIdx = revealedOrder.findIndex((r) => r.id === p.id)
            const isRevealed = isRevealing && revealIdx <= revealedUpToIndex
            const prevInOrder = revealedOrder[revealIdx - 1]
            const isMistake =
              isRevealed &&
              prevInOrder &&
              prevInOrder.cardValue !== null &&
              p.cardValue !== null &&
              prevInOrder.cardValue > p.cardValue

            return (
              <PlacedCard
                key={p.id}
                player={p}
                pct={pct}
                isLocked={p.isLocked}
                isRevealing={isRevealing}
                isMistake={!!isMistake}
                isRevealed={isRevealed}
              />
            )
          })}
        </div>
        <span className={styles.label}>{t('spectrum.highest')}</span>
      </div>

      {waitingPlayers.length > 0 && (
        <div className={styles.tray}>
          {waitingPlayers.map((p) => (
            <TrayCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  )
}
