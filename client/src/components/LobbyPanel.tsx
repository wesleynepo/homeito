import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import styles from './LobbyPanel.module.css'

export function LobbyPanel() {
  const { state, myPlayer, isHost, startGame } = useGame()
  const { t } = useTranslation()
  const room = state.room!

  const connectedCount = room.players.filter((p) => p.isConnected).length
  const canStart = connectedCount >= 3

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>ITO</span>
        <span className={styles.roomCode}>{t('lobby.room', { code: room.code })}</span>
      </div>

      <div className={styles.playerList}>
        <p className={styles.sectionLabel}>
          {t('lobby.players', { count: room.players.length })}
        </p>
        {room.players.map((p) => (
          <div key={p.id} className={styles.player}>
            <span
              className={`${styles.dot} ${p.isConnected ? styles.online : styles.offline}`}
            />
            <span>
              {p.nickname}
              {p.id === myPlayer?.id && t('lobby.you')}
              {p.isHost && ' 👑'}
            </span>
          </div>
        ))}
      </div>

      {isHost ? (
        <div className={styles.config}>
          <label className={styles.label}>
            {t('lobby.rounds_label', { count: room.totalRounds })}
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
            {t('lobby.lives_label')} <LivesDisplay lives={room.maxLives} maxLives={room.maxLives} />
          </label>
          <button
            className={styles.startButton}
            onClick={startGame}
            disabled={!canStart}
          >
            {canStart
              ? t('lobby.btn_start')
              : t('lobby.need_players', { count: 3 - room.players.length })}
          </button>
        </div>
      ) : (
        <div className={styles.waiting}>
          <p className={styles.configDisplay}>
            {room.totalRounds} rounds · <LivesDisplay lives={room.maxLives} maxLives={room.maxLives} />
          </p>
          <p className={styles.waitText}>{t('lobby.waiting')}</p>
        </div>
      )}
    </div>
  )
}
