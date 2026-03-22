import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Player } from '@ito/shared'
import { useGame } from '../context/GameContext'
import { useCssVars } from '../hooks/useCssVars'
import styles from './RevealPanel.module.css'

interface RevealCardProps {
  player: Player
  isMistake: boolean
}

function RevealCard({ player, isMistake }: RevealCardProps) {
  const ref = useCssVars<HTMLDivElement>({ '--player-color': player.color })
  return (
    <div ref={ref} className={`${styles.card} ${isMistake ? styles.mistake : ''}`}>
      <span className={styles.nickname}>{player.nickname}</span>
      <span className={styles.value}>{player.cardValue}</span>
      {isMistake && <span className={styles.mistakeIcon}>✗</span>}
    </div>
  )
}

export function RevealPanel() {
  const { state } = useGame()
  const { t } = useTranslation()
  const result = state.lastRevealResult

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>ITO</span>
        <span className={styles.label}>{t('reveal.revealing')}</span>
      </div>

      {result ? (
        <div className={styles.content}>
          <div className={styles.cards}>
            {result.orderedPlayers.map((p, i) => {
              const prev = result.orderedPlayers[i - 1]
              const isMistake = !!(prev && prev.cardValue !== null && p.cardValue !== null && prev.cardValue > p.cardValue)
              return <RevealCard key={p.id} player={p} isMistake={isMistake} />
            })}
          </div>

          {result.mistakes === 0 ? (
            <p className={styles.success}>{t('reveal.all_good')}</p>
          ) : (
            <p className={styles.lost}>
              {t('reveal.mistake', { count: result.mistakes })} · {t('reveal.life_lost', { count: result.livesLost })}
            </p>
          )}
        </div>
      ) : (
        <p className={styles.waiting}>{t('reveal.waiting_host')}</p>
      )}

      <p className={styles.hostWait}>{t('reveal.host_note')}</p>
    </div>
  )
}
