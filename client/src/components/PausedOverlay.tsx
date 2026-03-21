import React from 'react'
import { useGame } from '../context/GameContext'
import styles from './PausedOverlay.module.css'

interface Props {
  disconnectedNickname: string
}

export function PausedOverlay({ disconnectedNickname }: Props) {
  const { isHost, kickPlayer, state } = useGame()

  const disconnectedPlayer = state.room?.players.find(
    (p) => p.nickname === disconnectedNickname && !p.isConnected
  )

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p className={styles.title}>Game Paused</p>
        <p className={styles.message}>
          Waiting for <strong>{disconnectedNickname}</strong> to reconnect…
        </p>
        {isHost && disconnectedPlayer && (
          <button
            className={styles.kickButton}
            onClick={() => kickPlayer(disconnectedPlayer.id)}
          >
            Remove Player &amp; Resume
          </button>
        )}
      </div>
    </div>
  )
}
