import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ThemeToggle } from '../components/ThemeToggle'
import { ItoWaves } from '../components/ItoWaves'
import styles from './HomeView.module.css'

export default function HomeView() {
  const { createRoom, joinRoom, state } = useGame()
  const { t } = useTranslation()
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
      <ItoWaves className={styles.bgWaves} />
      <h1 className={styles.title}>ITO</h1>
      <div className={styles.controls}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className={styles.tabs}>
        <button
          className={mode === 'create' ? styles.activeTab : styles.tab}
          onClick={() => setMode('create')}
        >
          {t('home.tab_create')}
        </button>
        <button
          className={mode === 'join' ? styles.activeTab : styles.tab}
          onClick={() => setMode('join')}
        >
          {t('home.tab_join')}
        </button>
        <button
          className={mode === 'watch' ? styles.activeTab : styles.tab}
          onClick={() => setMode('watch')}
        >
          {t('home.tab_watch')}
        </button>
      </div>

      {state.error && (
        <div className={styles.error}>{state.error.message}</div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className={styles.form}>
          <label className={styles.label}>
            {t('home.nickname_label')}
            <input
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder={t('home.nickname_placeholder')}
              autoFocus
            />
          </label>

          <label className={styles.label}>
            {t('home.rounds_label', { count: rounds })}
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
            {t('home.lives_label', { count: lives })}
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
            {t('home.btn_create')}
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className={styles.form}>
          <label className={styles.label}>
            {t('home.room_code_label')}
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
            {t('home.nickname_label')}
            <input
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder={t('home.nickname_placeholder')}
            />
          </label>

          <button
            type="submit"
            className={styles.button}
            disabled={!nickname.trim() || roomCode.length !== 4}
          >
            {t('home.btn_join')}
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
            {t('home.room_code_label')}
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
            {t('home.btn_watch')}
          </button>
        </form>
      )}
    </div>
  )
}
