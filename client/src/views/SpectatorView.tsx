import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { QRCodePanel } from '../components/QRCodePanel'
import { SpectrumLine } from '../components/SpectrumLine'
import { LivesDisplay } from '../components/LivesDisplay'
import { PausedOverlay } from '../components/PausedOverlay'
import styles from './SpectatorView.module.css'

export default function SpectatorView() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { state, joinSpectator } = useGame()

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
    return <div style={{ color: '#fff', padding: 24 }}>Connecting to room {roomCode}…</div>
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
              Players ({room.players.length}/8)
            </p>
            <div className={styles.players}>
              {room.players.map((p) => (
                <span key={p.id} className={styles.playerChip}>
                  {p.isHost ? '✦ ' : ''}{p.nickname}{p.isHost ? ' (host)' : ''}
                </span>
              ))}
            </div>
            <p className={`${styles.waitingText} ${room.players.length >= 3 ? styles.ready : styles.dim}`}>
              Waiting for host to start…
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.game}>
          <div className={styles.topBar}>
            <span className={styles.logo}>ITO</span>
            <span className={styles.roomInfo}>ROOM: {room.code}</span>
            <span className={styles.roundInfo}>ROUND: {room.currentRound}/{room.totalRounds}</span>
            <LivesDisplay lives={room.lives} maxLives={room.maxLives} />
          </div>

          {room.currentQuestion && (
            <div className={styles.theme}>
              <p className={styles.themeText}>{room.currentQuestion.theme}</p>
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
                <p className={styles.allGood}>✅ All in order!</p>
              ) : (
                <p className={styles.mistakes}>
                  {state.lastRevealResult.mistakes} mistake{state.lastRevealResult.mistakes !== 1 ? 's' : ''}
                  {' '}· -{state.lastRevealResult.livesLost} ❤️
                </p>
              )}
            </div>
          )}

          {room.phase === 'gameOver' && state.gameOverPayload && (
            <div className={styles.gameOver}>
              <p className={styles.gameOverText}>
                {state.gameOverPayload.won ? '🎉 You won!' : '💀 Game Over'}
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
