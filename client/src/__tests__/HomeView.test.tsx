import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import i18n from 'i18next'
import { initReactI18next, I18nextProvider } from 'react-i18next'
import HomeView from '../views/HomeView'
import en from '../i18n/en.json'
import ptBR from '../i18n/pt-BR.json'

vi.mock('../context/GameContext', () => ({
  useGame: () => ({
    state: { room: null, myPlayerId: null, error: null, connectionStatus: 'connected' },
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    joinSpectator: vi.fn(),
  }),
}))

function setupI18n() {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        'pt-BR': { translation: ptBR },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    })
  } else {
    i18n.changeLanguage('en')
  }
}

function renderHome(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nextProvider i18n={i18n}>
        <HomeView />
      </I18nextProvider>
    </MemoryRouter>
  )
}

describe('HomeView — join-by-link', () => {
  beforeEach(() => {
    setupI18n()
  })

  it('shows create mode by default (no ?code param)', () => {
    renderHome('/')
    // Room code input is only rendered in join mode
    expect(screen.queryByPlaceholderText('XXXX')).not.toBeInTheDocument()
    // Nickname input is rendered in create mode
    expect(screen.getByPlaceholderText('Enter nickname')).toBeInTheDocument()
  })

  it('switches to join mode and pre-fills room code when ?code= is valid', () => {
    renderHome('/?code=ABCD')
    const codeInput = screen.getByPlaceholderText('XXXX') as HTMLInputElement
    expect(codeInput).toBeInTheDocument()
    expect(codeInput.value).toBe('ABCD')
  })

  it('lowercases the ?code= param before pre-filling', () => {
    renderHome('/?code=abcd')
    const codeInput = screen.getByPlaceholderText('XXXX') as HTMLInputElement
    expect(codeInput.value).toBe('ABCD')
  })

  it('does not switch to join mode for an invalid (too short) ?code= param', () => {
    renderHome('/?code=AB')
    expect(screen.queryByPlaceholderText('XXXX')).not.toBeInTheDocument()
  })

  it('does not switch to join mode for an invalid (non-alphanumeric) ?code= param', () => {
    renderHome('/?code=AB!@')
    expect(screen.queryByPlaceholderText('XXXX')).not.toBeInTheDocument()
  })

  it('nickname input starts empty after pre-fill so the user must enter one', () => {
    renderHome('/?code=ABCD')
    const nicknameInput = screen.getByPlaceholderText('Enter nickname') as HTMLInputElement
    expect(nicknameInput.value).toBe('')
  })
})
