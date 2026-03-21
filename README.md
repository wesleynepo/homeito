# Homito

A self-hosted, real-time multiplayer web clone of the cooperative party game **ITO**. Players receive secret numbers and must collaboratively order themselves from lowest to highest — without ever saying their number aloud.

![CI](https://github.com/wesleynepo/homito/actions/workflows/build.yml/badge.svg)
![Tests](https://github.com/wesleynepo/homito/actions/workflows/test.yml/badge.svg)
![Lint](https://github.com/wesleynepo/homito/actions/workflows/lint.yml/badge.svg)

---

## How It Works

Each round, players are secretly dealt a number from 1 to 100. A theme question is revealed (e.g. *"How fast is it?"*), and players must arrange themselves in ascending order by giving only verbal clues tied to the theme — think "sleeping turtle" for low, "rocket ship" for high.

When everyone is ready, the host reveals the cards. The team loses a life for every out-of-order pair. Survive all rounds without losing all lives to win.

- **3–8 players**
- **5–20 configurable rounds** (default: 13)
- **1–5 configurable lives** (default: 3)
- **20 built-in themes**: speed, temperature, rarity, spiciness, and more
- Join via QR code or room code — no accounts required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Language | TypeScript (strict) |
| Styling | CSS Modules |
| Testing | Vitest + React Testing Library |
| Linting | ESLint (zero-warning policy) |
| Monorepo | npm workspaces |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/wesleynepo/homito.git
cd homito
npm install
```

### Development

```bash
npm run dev
```

Starts both the server (`:3000`) and the Vite dev server concurrently. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

Compiles the shared package, server TypeScript, and React frontend into production artifacts.

### Run in Production

```bash
npm run build
NODE_ENV=production node server/dist/index.js
```

The server serves the built client from `client/dist/` and listens on `PORT` (default: `3000`).

---

## Project Structure

```
homito/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── views/   # HomeView, PlayerView, SpectatorView
│       ├── components/
│       ├── context/ # GameContext (Socket.io + useReducer)
│       └── hooks/
├── server/          # Express + Socket.io backend
│   └── src/
│       ├── index.ts     # App entry point
│       ├── handlers.ts  # Socket.io event handlers
│       └── room.ts      # Room state & game logic
├── shared/          # Shared types and game logic
│   └── src/
│       ├── game.js       # Card assignment, mistake detection, room codes
│       ├── questions.js  # 20 theme questions
│       └── types.js      # TypeScript type definitions
└── vitest.workspace.ts
```

---

## Game Phases

```
Lobby → Discussing → Revealing → RoundResult → [next round or GameOver]
```

- **Lobby** — players join, host configures rounds and lives
- **Discussing** — players claim positions on the spectrum and lock in
- **Revealing** — cards are revealed in claimed order
- **RoundResult** — mistakes counted, lives updated
- **GameOver** — final summary

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server + client in development mode |
| `npm run build` | Build all packages for production |
| `npm test` | Run Vitest across all workspaces |
| `npm run lint` | ESLint with zero-warning policy |

---

## Joining a Game

When you create a room, a QR code is displayed. Other players on the same network can scan it or enter the 4-character room code at the home screen. No sign-up, no app install required.

A spectator URL is also available for displaying the game state on a TV or shared screen.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests and lint: `npm test && npm run lint`
5. Open a pull request

Pre-commit hooks (Husky + lint-staged) enforce linting automatically on commit.

---

## License

MIT
