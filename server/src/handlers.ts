import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, Room } from '@ito/shared'
import {
  createRoom,
  joinRoom,
  joinSpectator,
  startGame,
  setPosition,
  lockPosition,
  unlockPosition,
  triggerReveal,
  advanceRound,
  disconnectPlayer,
  kickPlayer,
  getRoom,
  getRoomBySocketId,
  sanitizeRoom,
} from './room.js'

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>

function broadcastRoom(io: IOServer, room: Room): void {
  for (const player of room.players) {
    io.to(player.id).emit('room-updated', sanitizeRoom(room, player.id))
  }
  io.to(room.code + ':spectators').emit('room-updated', sanitizeRoom(room, null))
}

export function registerHandlers(io: IOServer, socket: GameSocket): void {
  socket.on('create-room', ({ nickname, rounds, lives }) => {
    const room = createRoom(socket.id, nickname, rounds, lives)
    socket.join(room.code)
    socket.emit('room-updated', sanitizeRoom(room, socket.id))
  })

  socket.on('join-room', ({ roomCode, nickname }) => {
    const result = joinRoom(socket.id, roomCode, nickname)
    if (!result.success) {
      socket.emit('error', { code: result.code, message: result.code })
      return
    }
    socket.join(roomCode)
    broadcastRoom(io, result.room)
  })

  socket.on('join-spectator', ({ roomCode }) => {
    const room = joinSpectator(socket.id, roomCode)
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'ROOM_NOT_FOUND' })
      return
    }
    socket.join(roomCode + ':spectators')
    socket.emit('room-updated', sanitizeRoom(room, null))
  })

  socket.on('start-game', () => {
    const currentRoom = getRoomBySocketId(socket.id)
    if (!currentRoom) return
    const player = currentRoom.players.find((p) => p.id === socket.id)
    if (!player?.isHost) {
      socket.emit('error', { code: 'NOT_HOST', message: 'NOT_HOST' })
      return
    }

    const room = startGame(currentRoom.code)
    if (!room) return

    broadcastRoom(io, room)

    for (const p of room.players) {
      if (p.isConnected && p.cardValue !== null) {
        io.to(p.id).emit('round-started', {
          question: room.currentQuestion!,
          cardValue: p.cardValue,
          round: room.currentRound,
        })
      }
    }
  })

  socket.on('set-position', ({ position }) => {
    const room = setPosition(socket.id, position)
    if (room) broadcastRoom(io, room)
  })

  socket.on('lock-position', () => {
    const room = lockPosition(socket.id)
    if (room) broadcastRoom(io, room)
  })

  socket.on('unlock-position', () => {
    const room = unlockPosition(socket.id)
    if (room) broadcastRoom(io, room)
  })

  socket.on('force-reveal', () => {
    const currentRoom = getRoomBySocketId(socket.id)
    if (!currentRoom) return
    const player = currentRoom.players.find((p) => p.id === socket.id)
    if (!player?.isHost) {
      socket.emit('error', { code: 'NOT_HOST', message: 'NOT_HOST' })
      return
    }

    const result = triggerReveal(currentRoom.code)
    if (!result) return

    broadcastRoom(io, result.room)
    io.to(currentRoom.code).emit('reveal-sequence', result.result)
    io.to(currentRoom.code + ':spectators').emit('reveal-sequence', result.result)
  })

  socket.on('next-round', () => {
    const currentRoom = getRoomBySocketId(socket.id)
    if (!currentRoom) return
    const player = currentRoom.players.find((p) => p.id === socket.id)
    if (!player?.isHost) {
      socket.emit('error', { code: 'NOT_HOST', message: 'NOT_HOST' })
      return
    }

    const result = advanceRound(currentRoom.code)
    if (!result) return

    broadcastRoom(io, result.room)

    if (result.type === 'gameOver') {
      const payload = {
        won: result.won,
        livesRemaining: result.room.lives,
        roundsPlayed: result.room.currentRound,
      }
      io.to(currentRoom.code).emit('game-over', payload)
      io.to(currentRoom.code + ':spectators').emit('game-over', payload)
    } else {
      for (const p of result.room.players) {
        if (p.isConnected && p.cardValue !== null) {
          io.to(p.id).emit('round-started', {
            question: result.room.currentQuestion!,
            cardValue: p.cardValue,
            round: result.room.currentRound,
          })
        }
      }
    }
  })

  socket.on('kick-player', ({ playerId }) => {
    const currentRoom = getRoomBySocketId(socket.id)
    if (!currentRoom) return
    const player = currentRoom.players.find((p) => p.id === socket.id)
    if (!player?.isHost) {
      socket.emit('error', { code: 'NOT_HOST', message: 'NOT_HOST' })
      return
    }

    const kicked = currentRoom.players.find((p) => p.id === playerId)
    const room = kickPlayer(currentRoom.code, playerId)
    if (!room) return

    broadcastRoom(io, room)
    io.to(currentRoom.code).emit('game-resumed', { removedPlayer: kicked?.nickname })
    io.to(currentRoom.code + ':spectators').emit('game-resumed', { removedPlayer: kicked?.nickname })
  })

  socket.on('disconnect', () => {
    const room = getRoomBySocketId(socket.id)
    if (!room) return

    const disconnectedNickname = room.players.find((p) => p.id === socket.id)?.nickname
    const roomCode = room.code

    const result = disconnectPlayer(socket.id, (code, playerId) => {
      const r = getRoom(code)
      if (!r) return
      const removedNickname = r.players.find((p) => p.id === playerId)?.nickname
      const kicked = kickPlayer(code, playerId)
      if (kicked) {
        broadcastRoom(io, kicked)
        io.to(code).emit('game-resumed', { removedPlayer: removedNickname })
        io.to(code + ':spectators').emit('game-resumed', { removedPlayer: removedNickname })
      }
    })

    if (!result) return

    broadcastRoom(io, result.room)

    if (result.shouldPause && disconnectedNickname) {
      io.to(roomCode).emit('game-paused', { disconnectedPlayer: disconnectedNickname })
      io.to(roomCode + ':spectators').emit('game-paused', { disconnectedPlayer: disconnectedNickname })
    }
  })
}
