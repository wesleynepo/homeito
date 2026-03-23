import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Player, GamePhase } from '@ito/shared'
import { useCssVars } from '../hooks/useCssVars'
import styles from './SpectrumLine.module.css'

interface Props {
  players: Player[]
  revealedUpToIndex: number
  revealedOrder: Player[]
  phase: GamePhase
}

interface PlacedCardProps {
  player: Player
  isLocked: boolean
  isRevealing: boolean
  isMistake: boolean
  isRevealed: boolean
  stackIndex?: number
}

function PlacedCard({ player, isLocked, isRevealing, isMistake, isRevealed, stackIndex }: PlacedCardProps) {
  const cssVars: Record<string, string> = { '--player-color': player.color }
  if (stackIndex !== undefined) cssVars['--stack-index'] = String(stackIndex)
  const ref = useCssVars<HTMLDivElement>(cssVars)
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

interface CardStackProps {
  players: Player[]
  isRevealing: boolean
  revealedOrder: Player[]
  revealedUpToIndex: number
}

function CardStack({ players, isRevealing, revealedOrder, revealedUpToIndex }: CardStackProps) {
  const ref = useCssVars<HTMLDivElement>({ '--stack-count': String(players.length) })
  return (
    <div ref={ref} className={styles.stack}>
      {players.map((player, idx) => {
        const revealIdx = revealedOrder.findIndex((r) => r.id === player.id)
        const isRevealed = isRevealing && revealIdx <= revealedUpToIndex
        const prevInOrder = revealedOrder[revealIdx - 1]
        const isMistake =
          isRevealed &&
          prevInOrder &&
          prevInOrder.cardValue !== null &&
          player.cardValue !== null &&
          prevInOrder.cardValue > player.cardValue
        return (
          <PlacedCard
            key={player.id}
            player={player}
            isLocked={player.isLocked}
            isRevealing={isRevealing}
            isMistake={!!isMistake}
            isRevealed={isRevealed}
            stackIndex={idx}
          />
        )
      })}
    </div>
  )
}

function GhostSlot({ position }: { position: number }) {
  return (
    <div className={styles.ghost}>
      <span className={styles.ghostPos}>{position}</span>
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

  const waitingPlayers = connectedPlayers.filter((p) => p.claimedPosition === null)
  const isRevealing = phase === 'revealing' || phase === 'roundResult'
  const showGhosts = !isRevealing && phase !== 'gameOver'

  return (
    <div className={styles.wrapper}>
      <div className={styles.lineContainer}>
        <span className={styles.label}>{t('spectrum.lowest')}</span>
        <div className={styles.lineWrapper}>
          <div className={styles.cardRow}>
            {Array.from({ length: N }, (_, i) => {
              const pos = i + 1
              const playersAtPos = connectedPlayers.filter((p) => p.claimedPosition === pos)

              if (playersAtPos.length === 0) {
                return showGhosts ? <GhostSlot key={`ghost-${pos}`} position={pos} /> : null
              }

              if (playersAtPos.length === 1) {
                const player = playersAtPos[0]
                const revealIdx = revealedOrder.findIndex((r) => r.id === player.id)
                const isRevealed = isRevealing && revealIdx <= revealedUpToIndex
                const prevInOrder = revealedOrder[revealIdx - 1]
                const isMistake =
                  isRevealed &&
                  prevInOrder &&
                  prevInOrder.cardValue !== null &&
                  player.cardValue !== null &&
                  prevInOrder.cardValue > player.cardValue
                return (
                  <PlacedCard
                    key={player.id}
                    player={player}
                    isLocked={player.isLocked}
                    isRevealing={isRevealing}
                    isMistake={!!isMistake}
                    isRevealed={isRevealed}
                  />
                )
              }

              return (
                <CardStack
                  key={`stack-${pos}`}
                  players={playersAtPos}
                  isRevealing={isRevealing}
                  revealedOrder={revealedOrder}
                  revealedUpToIndex={revealedUpToIndex}
                />
              )
            })}
          </div>
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
