import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { QRCodePanel } from '../components/QRCodePanel'
import { SpectrumLine } from '../components/SpectrumLine'
import { LivesDisplay } from '../components/LivesDisplay'
import { PausedOverlay } from '../components/PausedOverlay'
import { useCssVars } from '../hooks/useCssVars'
import styles from './SpectatorView.module.css'

function PlayerChip({ nickname, color, isHost }: { nickname: string; color: string; isHost: boolean }) {
  const { t } = useTranslation()
  const ref = useCssVars<HTMLSpanElement>({ '--player-color': color })
  return (
    <span ref={ref} className={styles.playerChip}>
      {isHost ? '✦ ' : ''}{nickname}{isHost ? t('spectator.host_suffix') : ''}
    </span>
  )
}

export default function SpectatorView() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { state, joinSpectator } = useGame()
  const { t } = useTranslation()

  const [revealedUpToIndex, setRevealedUpToIndex] = useState(-1)
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (roomCode && state.connectionStatus === 'connected') {
      joinSpectator(roomCode)
    }
  }, [roomCode, state.connectionStatus, joinSpectator])

  // Reveal animation sequencing
  useEffect(() => {
    if (!state.lastRevealResult) return

    const { orderedPlayers } = state.lastRevealResult
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevealedUpToIndex(-1)

    let idx = -1
    revealIntervalRef.current = setInterval(() => {
      idx += 1
      setRevealedUpToIndex(idx)
      if (idx >= orderedPlayers.length - 1) {
        clearInterval(revealIntervalRef.current!)
      }
    }, 600)

    return () => {
      if (revealIntervalRef.current) clearInterval(revealIntervalRef.current)
    }
  }, [state.lastRevealResult])

  if (!state.room) {
    return <div className="loading">{t('common.connecting_room', { code: roomCode })}</div>
  }

  const room = state.room
  const isLobby = room.phase === 'lobby'
  const isRevealing = room.phase === 'revealing' || room.phase === 'roundResult'
  const disconnectedPlayer = room.players.find((p) => !p.isConnected && room.phase === 'paused')

  const revealedOrder = state.lastRevealResult?.orderedPlayers ?? []

  return (
    <div className={styles.container}>
      {isLobby ? (
        <div className={styles.lobby}>
          <h1 className={styles.title}>ITO</h1>
          <QRCodePanel roomCode={room.code} />
          <div className={styles.playerList}>
            <p className={styles.playerCount}>
              {t('spectator.players', { count: room.players.length })}
            </p>
            <div className={styles.players}>
              {room.players.map((p) => (
                <PlayerChip key={p.id} nickname={p.nickname} color={p.color} isHost={p.isHost} />
              ))}
            </div>
            <p className={`${styles.waitingText} ${room.players.length >= 3 ? styles.ready : styles.dim}`}>
              {t('spectator.waiting')}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.game}>
          <div className={styles.topBar}>
            <span className={styles.logo}>ITO</span>
            <span className={styles.roomInfo}>{t('spectator.room', { code: room.code })}</span>
            <span className={styles.roundInfo}>{t('spectator.round', { current: room.currentRound, total: room.totalRounds })}</span>
            <LivesDisplay lives={room.lives} maxLives={room.maxLives} />
          </div>

          {room.currentQuestion && (
            <div className={styles.theme}>
              <p className={styles.themeText}>{t(`questions.${room.currentQuestion.id}.theme`, { defaultValue: room.currentQuestion.theme })}</p>
            </div>
          )}

          <SpectrumLine
            players={room.players}
            revealedUpToIndex={revealedUpToIndex}
            revealedOrder={revealedOrder}
            phase={room.phase}
          />

          {isRevealing && state.lastRevealResult && (
            <div className={styles.revealSummary}>
              {state.lastRevealResult.mistakes === 0 ? (
                <p className={styles.allGood}>{t('spectator.all_good')}</p>
              ) : (
                <p className={styles.mistakes}>
                  {t('spectator.mistake', { count: state.lastRevealResult.mistakes })}
                  {' '}· -{state.lastRevealResult.livesLost} ❤️
                </p>
              )}
            </div>
          )}

          {room.phase === 'gameOver' && state.gameOverPayload && (
            <div className={styles.gameOver}>
              <p className={styles.gameOverText}>
                {state.gameOverPayload.won ? t('spectator.won') : t('spectator.game_over')}
              </p>
            </div>
          )}
        </div>
      )}

      {room.phase === 'paused' && disconnectedPlayer && (
        <PausedOverlay disconnectedNickname={disconnectedPlayer.nickname} />
      )}
    </div>
  )
}
