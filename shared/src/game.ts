import type { Player } from './types'

/**
 * ITO-inspired player color palette — one per player slot (max 8 players).
 * All colors are chosen to read clearly against dark text (#1a1a1a).
 */
export const PLAYER_COLORS = [
  '#F5C818', // yellow
  '#5BC8DC', // cyan
  '#74C045', // green
  '#F07E34', // orange
  '#E87EA1', // pink
  '#7BB8E8', // light blue
  '#B89ED8', // lavender
  '#F08080', // coral
]

/**
 * Assigns card values to N players using band partitioning.
 * Divides 1-100 into N equal bands and picks one random value from each.
 * Returns a shuffled array so assignment order doesn't reveal ranking.
 */
export function assignCards(playerCount: number): number[] {
  if (playerCount < 1) return []

  const bandSize = 100 / playerCount
  const values: number[] = []

  for (let i = 0; i < playerCount; i++) {
    const bandStart = Math.floor(i * bandSize) + 1
    const bandEnd = Math.floor((i + 1) * bandSize)
    const value = Math.floor(Math.random() * (bandEnd - bandStart + 1)) + bandStart
    values.push(value)
  }

  // Fisher-Yates shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }

  return values
}

/**
 * Counts out-of-order adjacent pairs in the revealed ordering.
 * Players should be sorted by claimedPosition before calling this.
 * Returns the number of mistakes (adjacent pairs where left.cardValue > right.cardValue).
 */
export function detectMistakes(orderedPlayers: Player[]): number {
  let mistakes = 0
  for (let i = 0; i < orderedPlayers.length - 1; i++) {
    const left = orderedPlayers[i].cardValue
    const right = orderedPlayers[i + 1].cardValue
    if (left !== null && right !== null && left > right) {
      mistakes++
    }
  }
  return mistakes
}

/**
 * Converts a 1-based position to a percentage for CSS left positioning.
 * position=1 → 0%, position=total → 100%
 */
export function positionToPercent(position: number, total: number): number {
  if (total <= 1) return 50
  return ((position - 1) / (total - 1)) * 100
}

/**
 * Generates a 4-character uppercase alphanumeric room code.
 * Excludes visually ambiguous characters: 0, O, I, 1.
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Migrates host to the next connected player in join order when the host disconnects.
 * Returns a new player array with updated isHost flags.
 */
export function migrateHost(players: Player[]): Player[] {
  const currentHostIndex = players.findIndex((p) => p.isHost)
  const nextHost = players.find((p, i) => i !== currentHostIndex && p.isConnected)
  if (!nextHost) return players

  return players.map((p) => ({
    ...p,
    isHost: p.id === nextHost.id,
  }))
}
