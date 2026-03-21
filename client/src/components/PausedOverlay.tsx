import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import styles from './PausedOverlay.module.css'

interface Props {
  disconnectedNickname: string
}

export function PausedOverlay({ disconnectedNickname }: Props) {
  const { isHost, kickPlayer, state } = useGame()
  const { t } = useTranslation()

  const disconnectedPlayer = state.room?.players.find(
    (p) => p.nickname === disconnectedNickname && !p.isConnected
  )

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p className={styles.title}>{t('paused.title')}</p>
        <p className={styles.message}>
          {t('paused.message_before')} <strong>{disconnectedNickname}</strong> {t('paused.message_after')}
        </p>
        {isHost && disconnectedPlayer && (
          <button
            className={styles.kickButton}
            onClick={() => kickPlayer(disconnectedPlayer.id)}
          >
            {t('paused.kick')}
          </button>
        )}
      </div>
    </div>
  )
}
