import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import type { ClientToServerEvents, ServerToClientEvents } from '@ito/shared'
import { registerHandlers } from './handlers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getLocalIp(): string {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address
      }
    }
  }
  return '127.0.0.1'
}

const app = express()
const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
})

app.use(express.json())

app.get('/api/local-ip', (_req, res) => {
  res.json({ ip: getLocalIp() })
})

// Serve client build in production
const clientDist = path.resolve(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

io.on('connection', (socket) => {
  registerHandlers(io, socket)
})

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000
const localIp = getLocalIp()

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`ITO Game Server running`)
  console.log(`  Local:   http://localhost:${PORT}`)
  console.log(`  Network: http://${localIp}:${PORT}`)
})
