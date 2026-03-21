import React from 'react'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import styles from './LobbyPanel.module.css'

export function LobbyPanel() {
  const { state, myPlayer, isHost, startGame } = useGame()
  const room = state.room!

  const canStart = room.players.filter((p) => p.isConnected).length >= 3

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>ITO</span>
        <span className={styles.roomCode}>ROOM: {room.code}</span>
      </div>

      <div className={styles.playerList}>
        <p className={styles.sectionLabel}>
          Players ({room.players.length}/8)
        </p>
        {room.players.map((p) => (
          <div key={p.id} className={styles.player}>
            <span
              className={`${styles.dot} ${p.isConnected ? styles.online : styles.offline}`}
            />
            <span>
              {p.nickname}
              {p.id === myPlayer?.id && ' (you)'}
              {p.isHost && ' 👑'}
            </span>
          </div>
        ))}
      </div>

      {isHost ? (
        <div className={styles.config}>
          <label className={styles.label}>
            Rounds: {room.totalRounds}
            <input
              type="range"
              min={5}
              max={20}
              value={room.totalRounds}
              disabled
              className={styles.slider}
            />
          </label>
          <label className={styles.label}>
            Lives: <LivesDisplay lives={room.maxLives} maxLives={room.maxLives} />
          </label>
          <button
            className={styles.startButton}
            onClick={startGame}
            disabled={!canStart}
          >
            {canStart ? 'Start Game →' : `Need ${3 - room.players.length} more players`}
          </button>
        </div>
      ) : (
        <div className={styles.waiting}>
          <p className={styles.configDisplay}>
            {room.totalRounds} rounds · <LivesDisplay lives={room.maxLives} maxLives={room.maxLives} />
          </p>
          <p className={styles.waitText}>Waiting for host to start…</p>
        </div>
      )}
    </div>
  )
}
