import React from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language

  const toggle = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('ito-lang', lang)
  }

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
      <button
        onClick={() => toggle('en')}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          background: current === 'en' ? '#fff' : 'rgba(255,255,255,0.15)',
          color: current === 'en' ? '#111' : '#fff',
          fontWeight: current === 'en' ? 700 : 400,
        }}
      >
        EN
      </button>
      <button
        onClick={() => toggle('pt-BR')}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          background: current === 'pt-BR' ? '#fff' : 'rgba(255,255,255,0.15)',
          color: current === 'pt-BR' ? '#111' : '#fff',
          fontWeight: current === 'pt-BR' ? 700 : 400,
        }}
      >
        PT
      </button>
    </div>
  )
}
