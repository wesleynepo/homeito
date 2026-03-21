import type {
  Room,
  Player,
  GamePhase,
  RoundResult,
  RoomConfig,
} from '@ito/shared'
import {
  assignCards,
  detectMistakes,
  generateRoomCode,
  migrateHost,
  shuffleQuestions,
  QUESTIONS,
} from '@ito/shared'

const rooms = new Map<string, Room>()
const socketRooms = new Map<string, string>() // socketId → roomCode
const disconnectTimers = new Map<string, NodeJS.Timeout>() // socketId → auto-kick timer

const AUTO_KICK_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

// --- Config helpers ---

function clampConfig(rounds?: number, lives?: number): RoomConfig {
  return {
    totalRounds: Math.min(20, Math.max(5, rounds ?? 13)),
    maxLives: Math.min(5, Math.max(1, lives ?? 3)),
    cardRevealDefault: 'hidden',
  }
}

// --- Room access ---

export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode)
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  const code = socketRooms.get(socketId)
  return code ? rooms.get(code) : undefined
}

// --- Room creation ---

export function createRoom(socketId: string, nickname: string, rounds?: number, lives?: number): Room {
  const config = clampConfig(rounds, lives)
  let code: string
  do {
    code = generateRoomCode()
  } while (rooms.has(code))

  const host: Player = {
    id: socketId,
    nickname,
    isHost: true,
    cardValue: null,
    claimedPosition: null,
    isLocked: false,
    isConnected: true,
  }

  const room: Room = {
    code,
    players: [host],
    spectators: [],
    phase: 'lobby',
    currentRound: 0,
    totalRounds: config.totalRounds,
    currentQuestion: null,
    lives: config.maxLives,
    maxLives: config.maxLives,
    questions: shuffleQuestions(QUESTIONS),
    config,
  }

  rooms.set(code, room)
  socketRooms.set(socketId, code)
  return room
}

// --- Joining ---

export type JoinResult =
  | { success: true; room: Room }
  | { success: false; code: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'NICKNAME_TAKEN' }

export function joinRoom(socketId: string, roomCode: string, nickname: string): JoinResult {
  const room = rooms.get(roomCode)
  if (!room) return { success: false, code: 'ROOM_NOT_FOUND' }

  // Check if this is a reconnecting player (same nickname)
  const existing = room.players.find(
    (p) => p.nickname === nickname && !p.isConnected
  )
  if (existing) {
    return reconnectPlayer(socketId, roomCode, existing.id)
  }

  if (room.players.length >= 8) return { success: false, code: 'ROOM_FULL' }
  if (room.players.some((p) => p.nickname === nickname)) {
    return { success: false, code: 'NICKNAME_TAKEN' }
  }

  const player: Player = {
    id: socketId,
    nickname,
    isHost: false,
    cardValue: null,
    claimedPosition: null,
    isLocked: false,
    isConnected: true,
  }

  room.players.push(player)
  socketRooms.set(socketId, roomCode)
  return { success: true, room }
}

export function joinSpectator(socketId: string, roomCode: string): Room | null {
  const room = rooms.get(roomCode)
  if (!room) return null
  if (!room.spectators.includes(socketId)) {
    room.spectators.push(socketId)
  }
  socketRooms.set(socketId, roomCode)
  return room
}

// --- Game start & round dealing ---

export function startGame(roomCode: string): Room | null {
  const room = rooms.get(roomCode)
  if (!room || room.phase !== 'lobby') return null
  dealNextRound(room)
  return room
}

function dealNextRound(room: Room): void {
  const activePlayers = room.players.filter((p) => p.isConnected)
  const cardValues = assignCards(activePlayers.length)

  room.players = room.players.map((p) => {
    if (!p.isConnected) return { ...p, cardValue: null, claimedPosition: null, isLocked: false }
    const idx = activePlayers.findIndex((ap) => ap.id === p.id)
    return {
      ...p,
      cardValue: cardValues[idx],
      claimedPosition: null,
      isLocked: false,
    }
  })

  room.currentRound += 1
  room.currentQuestion = room.questions[room.currentRound - 1] ?? null
  room.phase = 'discussing'
}

// --- Position management ---

export function setPosition(socketId: string, position: number): Room | null {
  const room = getRoomBySocketId(socketId)
  if (!room || room.phase !== 'discussing') return null

  const N = room.players.filter((p) => p.isConnected).length
  if (position < 1 || position > N) return null

  room.players = room.players.map((p) =>
    p.id === socketId ? { ...p, claimedPosition: position } : p
  )
  return room
}

export function lockPosition(socketId: string): Room | null {
  const room = getRoomBySocketId(socketId)
  if (!room || room.phase !== 'discussing') return null

  const player = room.players.find((p) => p.id === socketId)
  if (!player || player.claimedPosition === null) return null

  room.players = room.players.map((p) =>
    p.id === socketId ? { ...p, isLocked: true } : p
  )
  return room
}

export function unlockPosition(socketId: string): Room | null {
  const room = getRoomBySocketId(socketId)
  if (!room || room.phase !== 'discussing') return null

  room.players = room.players.map((p) =>
    p.id === socketId ? { ...p, isLocked: false } : p
  )
  return room
}

// --- Reveal ---

export function triggerReveal(roomCode: string): { room: Room; result: RoundResult } | null {
  const room = rooms.get(roomCode)
  if (!room || room.phase !== 'discussing') return null

  const connectedPlayers = room.players.filter((p) => p.isConnected)
  const orderedPlayers = [...connectedPlayers].sort(
    (a, b) => (a.claimedPosition ?? 0) - (b.claimedPosition ?? 0)
  )

  const mistakes = detectMistakes(orderedPlayers)
  const livesLost = Math.min(mistakes, room.lives)
  room.lives = Math.max(0, room.lives - livesLost)
  room.phase = 'revealing'

  const result: RoundResult = {
    orderedPlayers,
    mistakes,
    livesLost,
    livesRemaining: room.lives,
  }

  return { room, result }
}

// --- Round advance ---

export type AdvanceResult =
  | { type: 'nextRound'; room: Room }
  | { type: 'gameOver'; room: Room; won: boolean }

export function advanceRound(roomCode: string): AdvanceResult | null {
  const room = rooms.get(roomCode)
  if (!room) return null

  room.phase = 'roundResult'

  if (room.lives === 0) {
    room.phase = 'gameOver'
    return { type: 'gameOver', room, won: false }
  }

  if (room.currentRound >= room.totalRounds) {
    room.phase = 'gameOver'
    return { type: 'gameOver', room, won: true }
  }

  dealNextRound(room)
  return { type: 'nextRound', room }
}

// --- Disconnection ---

export type DisconnectResult = {
  room: Room
  shouldPause: boolean
  hostMigrated: boolean
  newHostNickname?: string
}

export function disconnectPlayer(
  socketId: string,
  onAutoKick: (roomCode: string, playerId: string) => void
): DisconnectResult | null {
  const roomCode = socketRooms.get(socketId)
  if (!roomCode) return null

  const room = rooms.get(roomCode)
  if (!room) return null

  let hostMigrated = false
  let newHostNickname: string | undefined

  const wasHost = room.players.find((p) => p.id === socketId)?.isHost ?? false

  room.players = room.players.map((p) =>
    p.id === socketId ? { ...p, isConnected: false } : p
  )

  if (wasHost) {
    const prevPlayers = room.players
    room.players = migrateHost(room.players)
    const newHost = room.players.find((p) => p.isHost)
    if (newHost && prevPlayers.find((p) => p.id === newHost.id)?.isHost === false) {
      hostMigrated = true
      newHostNickname = newHost.nickname
    }
  }

  const activePhases: GamePhase[] = ['discussing', 'revealing']
  const shouldPause = activePhases.includes(room.phase)
  if (shouldPause) {
    room.phase = 'paused'
  }

  // Auto-kick timer
  const timer = setTimeout(() => {
    onAutoKick(roomCode, socketId)
  }, AUTO_KICK_TIMEOUT_MS)
  disconnectTimers.set(socketId, timer)

  return { room, shouldPause, hostMigrated, newHostNickname }
}

// --- Reconnection ---

export function reconnectPlayer(
  newSocketId: string,
  roomCode: string,
  oldSocketId: string
): JoinResult {
  const room = rooms.get(roomCode)
  if (!room) return { success: false, code: 'ROOM_NOT_FOUND' }

  const player = room.players.find((p) => p.id === oldSocketId)
  if (!player) return { success: false, code: 'ROOM_NOT_FOUND' }

  // Clear auto-kick timer
  const timer = disconnectTimers.get(oldSocketId)
  if (timer) {
    clearTimeout(timer)
    disconnectTimers.delete(oldSocketId)
  }

  // Update socket ID and reconnect
  room.players = room.players.map((p) =>
    p.id === oldSocketId ? { ...p, id: newSocketId, isConnected: true } : p
  )

  socketRooms.delete(oldSocketId)
  socketRooms.set(newSocketId, roomCode)

  // Resume if paused
  if (room.phase === 'paused') {
    room.phase = 'discussing'
  }

  return { success: true, room }
}

// --- Kick player ---

export function kickPlayer(roomCode: string, targetId: string): Room | null {
  const room = rooms.get(roomCode)
  if (!room) return null

  // Clear auto-kick timer if pending
  const timer = disconnectTimers.get(targetId)
  if (timer) {
    clearTimeout(timer)
    disconnectTimers.delete(targetId)
  }

  room.players = room.players.filter((p) => p.id !== targetId)
  socketRooms.delete(targetId)

  if (room.phase === 'paused') {
    room.phase = 'discussing'
  }

  return room
}

// --- Reset (Play Again) ---

export function resetRoom(roomCode: string): Room | null {
  const room = rooms.get(roomCode)
  if (!room || room.phase !== 'gameOver') return null

  room.players = room.players.map((p) => ({
    ...p,
    cardValue: null,
    claimedPosition: null,
    isLocked: false,
  }))
  room.phase = 'lobby'
  room.currentRound = 0
  room.lives = room.config.maxLives
  room.maxLives = room.config.maxLives
  room.currentQuestion = null
  room.questions = shuffleQuestions(QUESTIONS)

  return room
}

// --- Sanitize (privacy) ---

/**
 * Returns a Room safe to broadcast: all cardValues are null except the requesting player's own.
 * Pass null forSocketId for spectator broadcasts (all null).
 */
export function sanitizeRoom(room: Room, forSocketId: string | null): Room {
  return {
    ...room,
    players: room.players.map((p) => ({
      ...p,
      cardValue: p.id === forSocketId ? p.cardValue : null,
    })),
  }
}

// --- Cleanup ---

export function destroyRoom(roomCode: string): void {
  const room = rooms.get(roomCode)
  if (!room) return

  for (const player of room.players) {
    socketRooms.delete(player.id)
    const timer = disconnectTimers.get(player.id)
    if (timer) {
      clearTimeout(timer)
      disconnectTimers.delete(player.id)
    }
  }
  for (const spectatorId of room.spectators) {
    socketRooms.delete(spectatorId)
  }

  rooms.delete(roomCode)
}
