import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { LivesDisplay } from './LivesDisplay'
import styles from './DiscussingPanel.module.css'

export function DiscussingPanel() {
  const { state, myPlayer, isHost, setPosition, lockPosition, unlockPosition, forceReveal, toggleCard } = useGame()
  const { t } = useTranslation()
  const room = state.room!
  const question = room.currentQuestion!
  const connectedPlayers = room.players.filter((p) => p.isConnected)
  const N = connectedPlayers.length
  const pos = myPlayer?.claimedPosition ?? null
  const locked = myPlayer?.isLocked ?? false

  const lockedPlayers = connectedPlayers.filter((p) => p.isLocked)
  const waitingPlayers = connectedPlayers.filter((p) => !p.isLocked)
  const allLocked = lockedPlayers.length === connectedPlayers.length

  const handleDecrement = () => {
    if (pos === null) setPosition(1)
    else if (pos > 1) setPosition(pos - 1)
  }

  const handleIncrement = () => {
    if (pos === null) setPosition(1)
    else if (pos < N) setPosition(pos + 1)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>ITO</span>
        <span className={styles.code}>{room.code}</span>
        <LivesDisplay lives={room.lives} maxLives={room.maxLives} />
      </div>

      <div className={styles.theme}>
        <p className={styles.themeLabel}>{t('discussing.round', { current: room.currentRound, total: room.totalRounds })}</p>
        <p className={styles.themeText}>{t(`questions.${question.id}.theme`, { defaultValue: question.theme })}</p>
        <p className={styles.examples}>{t(`questions.${question.id}.examples`, { defaultValue: question.examples.join(' · ') })}</p>
      </div>

      <div className={styles.cardSection}>
        <p className={styles.sectionLabel}>{t('discussing.your_card')}</p>
        <button
          className={`${styles.card} ${state.isCardRevealed ? styles.revealed : ''}`}
          onClick={toggleCard}
          aria-label={state.isCardRevealed ? t('discussing.hide_card') : t('discussing.tap_to_reveal')}
        >
          {state.isCardRevealed ? (
            <span className={styles.cardValue}>{state.myCardValue}</span>
          ) : (
            <span className={styles.cardHint}>{t('discussing.tap_hint')}</span>
          )}
        </button>
      </div>

      <div className={styles.positionSection}>
        <p className={styles.sectionLabel}>{t('discussing.your_position', { n: N })}</p>
        <div className={styles.stepper}>
          <button onClick={handleDecrement} disabled={locked || pos === 1} className={styles.stepBtn}>
            ←
          </button>
          <span className={styles.posValue}>{pos ?? '—'}</span>
          <button onClick={handleIncrement} disabled={locked || pos === N} className={styles.stepBtn}>
            →
          </button>
        </div>

        {locked ? (
          <button onClick={unlockPosition} className={styles.unlockButton}>
            {t('discussing.unlock')}
          </button>
        ) : (
          <button
            onClick={lockPosition}
            disabled={pos === null}
            className={styles.lockButton}
          >
            {t('discussing.lock_in')}
          </button>
        )}
      </div>

      <div className={styles.statusSection}>
        {lockedPlayers.length > 0 && (
          <p className={styles.statusText}>
            {t('discussing.locked', { players: lockedPlayers.map((p) => p.nickname).join(', ') })}
          </p>
        )}
        {waitingPlayers.length > 0 && (
          <p className={styles.statusText}>
            {t('discussing.waiting', { players: waitingPlayers.map((p) => p.nickname).join(', ') })}
          </p>
        )}
      </div>

      {isHost && (
        <button
          onClick={forceReveal}
          className={`${styles.revealButton} ${allLocked ? styles.revealReady : ''}`}
        >
          {allLocked ? t('discussing.reveal') : t('discussing.force_reveal')}
        </button>
      )}
    </div>
  )
}
