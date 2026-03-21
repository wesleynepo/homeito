import { describe, it, expect } from 'vitest'
import { gameReducer, GameState } from '../context/GameContext'
import type { Room } from '@ito/shared'

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    code: 'TEST',
    players: [],
    spectators: [],
    phase: 'lobby',
    currentRound: 0,
    totalRounds: 13,
    currentQuestion: null,
    lives: 3,
    maxLives: 3,
    questions: [],
    config: { totalRounds: 13, maxLives: 3, cardRevealDefault: 'hidden' },
    ...overrides,
  }
}

const initialState: GameState = {
  room: null,
  myPlayerId: null,
  myCardValue: null,
  isCardRevealed: false,
  connectionStatus: 'connecting',
  error: null,
  lastRevealResult: null,
  gameOverPayload: null,
}

describe('gameReducer', () => {
  it('ROOM_UPDATED — updates context state', () => {
    const room = makeRoom({ phase: 'discussing' })
    const next = gameReducer(initialState, { type: 'ROOM_UPDATED', room })
    expect(next.room).toBe(room)
    expect(next.room?.phase).toBe('discussing')
  })

  it('ROUND_STARTED — stores cardValue and resets reveal', () => {
    const stateWithReveal = { ...initialState, isCardRevealed: true }
    const next = gameReducer(stateWithReveal, {
      type: 'ROUND_STARTED',
      cardValue: 42,
      question: { id: 'q1', theme: 'Speed', examples: [] },
      round: 1,
    })
    expect(next.myCardValue).toBe(42)
    expect(next.isCardRevealed).toBe(false)
  })

  it('GAME_PAUSED — phase change comes via ROOM_UPDATED (state unchanged)', () => {
    const stateWithRoom = { ...initialState, room: makeRoom({ phase: 'discussing' }) }
    const next = gameReducer(stateWithRoom, { type: 'GAME_PAUSED' })
    // GAME_PAUSED itself doesn't mutate — phase comes via ROOM_UPDATED
    expect(next.room?.phase).toBe('discussing')
  })

  it('ROOM_UPDATED with paused phase — sets paused phase', () => {
    const stateWithRoom = { ...initialState, room: makeRoom({ phase: 'discussing' }) }
    const pausedRoom = makeRoom({ phase: 'paused' })
    const next = gameReducer(stateWithRoom, { type: 'ROOM_UPDATED', room: pausedRoom })
    expect(next.room?.phase).toBe('paused')
  })

  it('TOGGLE_CARD — flips isCardRevealed', () => {
    const next = gameReducer(initialState, { type: 'TOGGLE_CARD' })
    expect(next.isCardRevealed).toBe(true)
    const next2 = gameReducer(next, { type: 'TOGGLE_CARD' })
    expect(next2.isCardRevealed).toBe(false)
  })
})
