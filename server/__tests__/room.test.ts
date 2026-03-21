import { describe, it, expect } from 'vitest'
import { assignCards, detectMistakes, migrateHost } from '@ito/shared'
import type { Player } from '@ito/shared'

// Helper to make players
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

describe('assignCards', () => {
  it('no duplicates for N players', () => {
    for (let n = 3; n <= 8; n++) {
      const cards = assignCards(n)
      expect(cards.length).toBe(n)
      const unique = new Set(cards)
      expect(unique.size).toBe(n)
    }
  })

  it('full range spread — values distributed across 1-100', () => {
    const cards = assignCards(8)
    const min = Math.min(...cards)
    const max = Math.max(...cards)
    expect(min).toBeGreaterThanOrEqual(1)
    expect(max).toBeLessThanOrEqual(100)
    // With 8 players and band size ~12, min should be in first band, max in last
    expect(min).toBeLessThanOrEqual(15)
    expect(max).toBeGreaterThanOrEqual(85)
  })
})

describe('detectMistakes', () => {
  it('all correct — returns 0', () => {
    const players: Player[] = [
      makePlayer({ id: 'p1', cardValue: 10, claimedPosition: 1 }),
      makePlayer({ id: 'p2', cardValue: 30, claimedPosition: 2 }),
      makePlayer({ id: 'p3', cardValue: 70, claimedPosition: 3 }),
    ]
    expect(detectMistakes(players)).toBe(0)
  })

  it('one swap — returns 1', () => {
    const players: Player[] = [
      makePlayer({ id: 'p1', cardValue: 30, claimedPosition: 1 }),
      makePlayer({ id: 'p2', cardValue: 10, claimedPosition: 2 }),
      makePlayer({ id: 'p3', cardValue: 70, claimedPosition: 3 }),
    ]
    expect(detectMistakes(players)).toBe(1)
  })

  it('all wrong — fully reversed returns N-1 mistakes', () => {
    const players: Player[] = [
      makePlayer({ id: 'p1', cardValue: 90, claimedPosition: 1 }),
      makePlayer({ id: 'p2', cardValue: 60, claimedPosition: 2 }),
      makePlayer({ id: 'p3', cardValue: 30, claimedPosition: 3 }),
      makePlayer({ id: 'p4', cardValue: 10, claimedPosition: 4 }),
    ]
    expect(detectMistakes(players)).toBe(3)
  })
})

describe('migrateHost', () => {
  it('on disconnect — next connected player becomes host', () => {
    const players: Player[] = [
      makePlayer({ id: 'p1', nickname: 'Alice', isHost: true, isConnected: false }),
      makePlayer({ id: 'p2', nickname: 'Bob', isHost: false, isConnected: true }),
      makePlayer({ id: 'p3', nickname: 'Cia', isHost: false, isConnected: true }),
    ]
    const result = migrateHost(players)
    expect(result.find((p) => p.id === 'p1')?.isHost).toBe(false)
    expect(result.find((p) => p.id === 'p2')?.isHost).toBe(true)
    expect(result.find((p) => p.id === 'p3')?.isHost).toBe(false)
  })
})
