import React, { useState, useEffect } from 'react'
import styles from './ThemeToggle.module.css'

const STORAGE_KEY = 'ito-theme'

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'light'
  })

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-mode')
      localStorage.setItem(STORAGE_KEY, 'light')
    } else {
      document.documentElement.classList.remove('light-mode')
      localStorage.setItem(STORAGE_KEY, 'dark')
    }
  }, [isLight])

  return (
    <button
      className={styles.btn}
      onClick={() => setIsLight((v) => !v)}
      aria-label={isLight ? 'Switch to night mode' : 'Switch to day mode'}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  )
}
