import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Player } from '@ito/shared'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import { useCssVars } from '../hooks/useCssVars'
import styles from './LobbyPanel.module.css'

interface PlayerRowProps {
  player: Player
  isMe: boolean
}

function PlayerRow({ player, isMe }: PlayerRowProps) {
  const { t } = useTranslation()
  const dotRef = useCssVars<HTMLSpanElement>({ '--player-color': player.color })
  return (
    <div className={styles.player}>
      <span
        ref={dotRef}
        className={`${styles.dot} ${player.isConnected ? styles.online : styles.offline}`}
      />
      <span>
        {player.nickname}
        {isMe && t('lobby.you')}
        {player.isHost && ' 👑'}
      </span>
    </div>
  )
}

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
          <PlayerRow key={p.id} player={p} isMe={p.id === myPlayer?.id} />
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
