import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import styles from './HomeView.module.css'

export default function HomeView() {
  const { createRoom, joinRoom, state } = useGame()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'create' | 'join' | 'watch'>('create')
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [rounds, setRounds] = useState(13)
  const [lives, setLives] = useState(3)

  // Navigate to player view once we have a room
  useEffect(() => {
    if (state.room && state.myPlayerId) {
      navigate(`/player/${state.room.code}`)
    }
  }, [state.room, state.myPlayerId, navigate])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return
    createRoom(nickname.trim(), rounds, lives)
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !roomCode.trim()) return
    joinRoom(roomCode.trim().toUpperCase(), nickname.trim())
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ITO</h1>

      <div className={styles.tabs}>
        <button
          className={mode === 'create' ? styles.activeTab : styles.tab}
          onClick={() => setMode('create')}
        >
          Create Room
        </button>
        <button
          className={mode === 'join' ? styles.activeTab : styles.tab}
          onClick={() => setMode('join')}
        >
          Join Room
        </button>
        <button
          className={mode === 'watch' ? styles.activeTab : styles.tab}
          onClick={() => setMode('watch')}
        >
          Watch
        </button>
      </div>

      {state.error && (
        <div className={styles.error}>{state.error.message}</div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className={styles.form}>
          <label className={styles.label}>
            Your nickname
            <input
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="Enter nickname"
              autoFocus
            />
          </label>

          <label className={styles.label}>
            Rounds: {rounds}
            <input
              type="range"
              min={5}
              max={20}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className={styles.slider}
            />
          </label>

          <label className={styles.label}>
            Lives: {lives}
            <input
              type="range"
              min={1}
              max={5}
              value={lives}
              onChange={(e) => setLives(Number(e.target.value))}
              className={styles.slider}
            />
          </label>

          <button type="submit" className={styles.button} disabled={!nickname.trim()}>
            Create Room
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className={styles.form}>
          <label className={styles.label}>
            Room code
            <input
              className={styles.input}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
              placeholder="XXXX"
              autoFocus
            />
          </label>

          <label className={styles.label}>
            Your nickname
            <input
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="Enter nickname"
            />
          </label>

          <button
            type="submit"
            className={styles.button}
            disabled={!nickname.trim() || roomCode.length !== 4}
          >
            Join Room
          </button>
        </form>
      )}

      {mode === 'watch' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (roomCode.length === 4) navigate(`/spectator/${roomCode.trim().toUpperCase()}`)
          }}
          className={styles.form}
        >
          <label className={styles.label}>
            Room code
            <input
              className={styles.input}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
              placeholder="XXXX"
              autoFocus
            />
          </label>
          <button
            type="submit"
            className={styles.button}
            disabled={roomCode.length !== 4}
          >
            Watch on TV
          </button>
        </form>
      )}
    </div>
  )
}
