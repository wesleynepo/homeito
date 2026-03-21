import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LanguageSwitcher.module.css'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language

  const toggle = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('ito-lang', lang)
  }

  return (
    <div className={styles.wrapper}>
      <button
        onClick={() => toggle('en')}
        className={`${styles.btn} ${current === 'en' ? styles.active : ''}`}
      >
        EN
      </button>
      <button
        onClick={() => toggle('pt-BR')}
        className={`${styles.btn} ${current === 'pt-BR' ? styles.active : ''}`}
      >
        PT
      </button>
    </div>
  )
}
