import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { io, Socket } from 'socket.io-client'
import {
  Room,
  Player,
  Question,
  RoundResult,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@ito/shared'

// ---- State ----

export interface GameState {
  room: Room | null
  myPlayerId: string | null
  myCardValue: number | null
  isCardRevealed: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  error: { code: string; message: string } | null
  lastRevealResult: RoundResult | null
  gameOverPayload: { won: boolean; livesRemaining: number; roundsPlayed: number } | null
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

// ---- Actions ----

type Action =
  | { type: 'CONNECTED'; socketId: string }
  | { type: 'DISCONNECTED' }
  | { type: 'ROOM_UPDATED'; room: Room }
  | { type: 'ROUND_STARTED'; cardValue: number; question: Question; round: number }
  | { type: 'REVEAL_SEQUENCE'; result: RoundResult }
  | { type: 'GAME_OVER'; payload: { won: boolean; livesRemaining: number; roundsPlayed: number } }
  | { type: 'GAME_PAUSED' }
  | { type: 'GAME_RESUMED' }
  | { type: 'ERROR'; error: { code: string; message: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'TOGGLE_CARD' }
  | { type: 'SET_PLAYER_ID'; id: string }

// ---- Reducer ----

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'CONNECTED':
      return { ...state, connectionStatus: 'connected', myPlayerId: action.socketId }

    case 'DISCONNECTED':
      return { ...state, connectionStatus: 'disconnected' }

    case 'ROOM_UPDATED':
      return {
        ...state,
        room: action.room,
        // Reset card reveal when a new round starts (cardValue will update via ROUND_STARTED)
      }

    case 'ROUND_STARTED':
      return {
        ...state,
        myCardValue: action.cardValue,
        isCardRevealed: false,
        lastRevealResult: null,
      }

    case 'REVEAL_SEQUENCE':
      return { ...state, lastRevealResult: action.result }

    case 'GAME_OVER':
      return { ...state, gameOverPayload: action.payload }

    case 'GAME_PAUSED':
      return state // phase change comes via ROOM_UPDATED

    case 'GAME_RESUMED':
      return state // phase change comes via ROOM_UPDATED

    case 'ERROR':
      return { ...state, error: action.error }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'TOGGLE_CARD':
      return { ...state, isCardRevealed: !state.isCardRevealed }

    case 'SET_PLAYER_ID':
      return { ...state, myPlayerId: action.id }

    default:
      return state
  }
}

// ---- Context ----

interface GameContextValue {
  state: GameState
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  // Derived helpers
  myPlayer: Player | null
  isHost: boolean
  // Actions
  createRoom: (nickname: string, rounds?: number, lives?: number) => void
  joinRoom: (roomCode: string, nickname: string) => void
  joinSpectator: (roomCode: string) => void
  setPosition: (position: number) => void
  lockPosition: () => void
  unlockPosition: () => void
  startGame: () => void
  forceReveal: () => void
  nextRound: () => void
  kickPlayer: (playerId: string) => void
  toggleCard: () => void
  clearError: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

// ---- Provider ----

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  useEffect(() => {
    const socket = io({ autoConnect: true })
    socketRef.current = socket

    socket.on('connect', () => {
      dispatch({ type: 'CONNECTED', socketId: socket.id! })

      // Reconnect: rejoin room if we have session data
      const session = sessionStorage.getItem('ito-session')
      if (session) {
        const { roomCode, nickname } = JSON.parse(session) as { roomCode: string; nickname: string }
        socket.emit('join-room', { roomCode, nickname })
      }
    })

    socket.on('disconnect', () => {
      dispatch({ type: 'DISCONNECTED' })
    })

    socket.on('room-updated', (room) => {
      dispatch({ type: 'ROOM_UPDATED', room })
    })

    socket.on('round-started', ({ cardValue, question, round }) => {
      dispatch({ type: 'ROUND_STARTED', cardValue, question, round })
    })

    socket.on('reveal-sequence', (result) => {
      dispatch({ type: 'REVEAL_SEQUENCE', result })
    })

    socket.on('game-over', (payload) => {
      dispatch({ type: 'GAME_OVER', payload })
    })

    socket.on('game-paused', () => {
      dispatch({ type: 'GAME_PAUSED' })
    })

    socket.on('game-resumed', () => {
      dispatch({ type: 'GAME_RESUMED' })
    })

    socket.on('error', (error) => {
      dispatch({ type: 'ERROR', error })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // eslint-disable-next-line react-hooks/refs
  const socket = socketRef.current

  const createRoomFn = useCallback(
    (nickname: string, rounds?: number, lives?: number) => {
      socketRef.current?.emit('create-room', { nickname, rounds, lives })
    },
    []
  )

  const joinRoomFn = useCallback((roomCode: string, nickname: string) => {
    sessionStorage.setItem('ito-session', JSON.stringify({ roomCode, nickname }))
    socketRef.current?.emit('join-room', { roomCode, nickname })
  }, [])

  const joinSpectatorFn = useCallback((roomCode: string) => {
    socketRef.current?.emit('join-spectator', { roomCode })
  }, [])

  const myPlayer =
    state.room?.players.find((p) => p.id === state.myPlayerId) ?? null

  const isHost = myPlayer?.isHost ?? false

  const value: GameContextValue = {
    state,
    socket,
    myPlayer,
    isHost,
    createRoom: createRoomFn,
    joinRoom: joinRoomFn,
    joinSpectator: joinSpectatorFn,
    setPosition: (position) => socketRef.current?.emit('set-position', { position }),
    lockPosition: () => socketRef.current?.emit('lock-position'),
    unlockPosition: () => socketRef.current?.emit('unlock-position'),
    startGame: () => socketRef.current?.emit('start-game'),
    forceReveal: () => socketRef.current?.emit('force-reveal'),
    nextRound: () => socketRef.current?.emit('next-round'),
    kickPlayer: (playerId) => socketRef.current?.emit('kick-player', { playerId }),
    toggleCard: () => dispatch({ type: 'TOGGLE_CARD' }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
  }

  // eslint-disable-next-line react-hooks/refs
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
