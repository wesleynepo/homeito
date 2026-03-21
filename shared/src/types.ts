export type GamePhase =
  | 'lobby'
  | 'discussing'
  | 'paused'
  | 'revealing'
  | 'roundResult'
  | 'gameOver'

export type Question = {
  id: string
  theme: string
  examples: string[]
}

export type Player = {
  id: string
  nickname: string
  isHost: boolean
  cardValue: number | null
  claimedPosition: number | null
  isLocked: boolean
  isConnected: boolean
}

export type RoomConfig = {
  totalRounds: number
  maxLives: number
  cardRevealDefault: 'hidden'
}

export type Room = {
  code: string
  players: Player[]
  spectators: string[]
  phase: GamePhase
  currentRound: number
  totalRounds: number
  currentQuestion: Question | null
  lives: number
  maxLives: number
  questions: Question[]
  config: RoomConfig
}

export type RoundResult = {
  orderedPlayers: Player[]
  mistakes: number
  livesLost: number
  livesRemaining: number
}

// Typed socket event maps for full type safety at the socket boundary

export interface ClientToServerEvents {
  'create-room': (payload: { nickname: string; rounds?: number; lives?: number }) => void
  'join-room': (payload: { roomCode: string; nickname: string }) => void
  'join-spectator': (payload: { roomCode: string }) => void
  'set-position': (payload: { position: number }) => void
  'lock-position': () => void
  'unlock-position': () => void
  'start-game': () => void
  'force-reveal': () => void
  'next-round': () => void
  'kick-player': (payload: { playerId: string }) => void
}

export interface ServerToClientEvents {
  'room-updated': (room: Room) => void
  'round-started': (payload: { question: Question; cardValue: number; round: number }) => void
  'player-updated': (players: Player[]) => void
  'reveal-sequence': (result: RoundResult) => void
  'game-over': (payload: { won: boolean; livesRemaining: number; roundsPlayed: number }) => void
  'game-paused': (payload: { disconnectedPlayer: string }) => void
  'game-resumed': (payload: { removedPlayer?: string }) => void
  'error': (payload: { code: string; message: string }) => void
}
