import { describe, it, expect } from 'vitest'
import { positionToPercent, detectMistakes } from '@ito/shared'
import type { Player } from '@ito/shared'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    nickname: 'Alice',
    isHost: false,
    cardValue: null,
    claimedPosition: null,
    isLocked: false,
    isConnected: true,
    ...overrides,
  }
}

describe('positionToPercent', () => {
  it('first of N returns 0', () => {
    expect(positionToPercent(1, 4)).toBe(0)
  })

  it('last of N returns 100', () => {
    expect(positionToPercent(4, 4)).toBe(100)
  })

  it('middle returns interpolated percentage', () => {
    expect(positionToPercent(2, 4)).toBeCloseTo(33.33, 1)
  })

  it('single player returns 50', () => {
    expect(positionToPercent(1, 1)).toBe(50)
  })
})

describe('detectMistakes', () => {
  it('correct order returns 0', () => {
    const players = [
      makePlayer({ id: 'p1', cardValue: 10, claimedPosition: 1 }),
      makePlayer({ id: 'p2', cardValue: 50, claimedPosition: 2 }),
      makePlayer({ id: 'p3', cardValue: 90, claimedPosition: 3 }),
    ]
    expect(detectMistakes(players)).toBe(0)
  })

  it('one swap returns 1', () => {
    const players = [
      makePlayer({ id: 'p1', cardValue: 50, claimedPosition: 1 }),
      makePlayer({ id: 'p2', cardValue: 10, claimedPosition: 2 }),
      makePlayer({ id: 'p3', cardValue: 90, claimedPosition: 3 }),
    ]
    expect(detectMistakes(players)).toBe(1)
  })
})
