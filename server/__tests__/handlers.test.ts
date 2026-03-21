import { describe, it, expect } from 'vitest'
import { createRoom, joinRoom, disconnectPlayer, startGame } from '../src/room.js'

const noop = () => {}

describe('create-room — unique codes', () => {
  it('two rooms get different codes', () => {
    const room1 = createRoom('sock-unique-1', 'Alice')
    const room2 = createRoom('sock-unique-2', 'Bob')
    expect(room1.code).not.toBe(room2.code)
  })
})

describe('join-room', () => {
  it('max players — 9th player gets ROOM_FULL', () => {
    const host = createRoom('host-full', 'Host')
    const code = host.code

    for (let i = 1; i <= 7; i++) {
      joinRoom(`sock-full-${i}`, code, `Player${i}`)
    }

    const result = joinRoom('sock-full-8', code, 'NinthPlayer')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('ROOM_FULL')
    }
  })

  it('duplicate nickname — returns NICKNAME_TAKEN', () => {
    const host = createRoom('host-dup', 'Alice')
    const result = joinRoom('sock-dup-1', host.code, 'Alice')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('NICKNAME_TAKEN')
    }
  })
})

describe('disconnect', () => {
  it('disconnect during discussing sets phase to paused', () => {
    const host = createRoom('host-disc', 'Host')
    const code = host.code
    joinRoom('p1-disc', code, 'Player1')
    joinRoom('p2-disc', code, 'Player2')

    startGame(code)

    const result = disconnectPlayer('p1-disc', noop)
    expect(result).not.toBeNull()
    expect(result?.shouldPause).toBe(true)
    expect(result?.room.phase).toBe('paused')
  })

  it('reconnect — restores player state', () => {
    const host = createRoom('host-recon', 'Host')
    const code = host.code
    joinRoom('p1-recon', code, 'Player1')
    joinRoom('p2-recon', code, 'Player2')

    startGame(code)

    // Disconnect player1
    disconnectPlayer('p1-recon', noop)

    // Reconnect with new socket ID by joining with same nickname
    const result = joinRoom('p1-recon-new', code, 'Player1')
    expect(result.success).toBe(true)
    if (result.success) {
      const reconnected = result.room.players.find((p) => p.nickname === 'Player1')
      expect(reconnected?.isConnected).toBe(true)
      expect(reconnected?.cardValue).not.toBeNull()
    }
  })
})
