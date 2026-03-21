import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import i18n from 'i18next'
import { initReactI18next, I18nextProvider } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import en from '../i18n/en.json'
import ptBR from '../i18n/pt-BR.json'

function setupI18n(initialLang = 'en') {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        'pt-BR': { translation: ptBR },
      },
      lng: initialLang,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    })
  } else {
    i18n.changeLanguage(initialLang)
  }
}

function renderSwitcher() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>
  )
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    setupI18n('en')
  })

  it('renders EN and PT buttons', () => {
    renderSwitcher()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PT' })).toBeInTheDocument()
  })

  it('clicking PT switches language to pt-BR and saves to localStorage', () => {
    renderSwitcher()
    fireEvent.click(screen.getByRole('button', { name: 'PT' }))
    expect(i18n.language).toBe('pt-BR')
    expect(localStorage.getItem('ito-lang')).toBe('pt-BR')
  })

  it('clicking EN switches language to en and saves to localStorage', () => {
    setupI18n('pt-BR')
    renderSwitcher()
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(i18n.language).toBe('en')
    expect(localStorage.getItem('ito-lang')).toBe('en')
  })

  it('active language button has a distinct background', () => {
    renderSwitcher()
    const enBtn = screen.getByRole('button', { name: 'EN' })
    const ptBtn = screen.getByRole('button', { name: 'PT' })
    // Active button has white background; inactive is semi-transparent
    expect(enBtn.style.background).toBe('rgb(255, 255, 255)')
    expect(ptBtn.style.background).not.toBe('rgb(255, 255, 255)')
  })
})
