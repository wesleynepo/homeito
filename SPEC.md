# ITO Game — Web-Based Clone
## Product Specification v2.8

---

## 1. Project Overview

| Field | Value |
|---|---|
| Project Name | ITO Game (Web Clone) |
| Project Type | Real-time multiplayer party game |
| Target Users | Party game players, game night hosts |
| Minimum Players | 3 |
| Maximum Players | 8 |
| Session Model | Room-based, ephemeral (no persistence required) |

---

## 2. Core Mechanic

ITO is a **cooperative number-ordering game**. Each round:

1. A **theme/question** is displayed to all players (e.g. *"Speed — from slowest to fastest"*).
2. Each player is secretly dealt a **number between 1 and 100**.
3. Players must **collectively arrange themselves in ascending order** on a shared line, from lowest to highest number — **without ever saying their number out loud**.
4. Players communicate only by giving **verbal clues** that relate their number to the theme (e.g. for speed: *"a sleeping turtle"* for 3, *"a sprinting cheetah"* for 97).
5. Once the team agrees on an ordering, they **lock in their positions** and all cards are revealed simultaneously.
6. The team **loses one life** for each card that is out of order with its neighbors. The game tracks lives across all rounds.

> **Key distinction from the spec v1:** There are no "slots 1–8" to tap. The interaction is: each player submits a **relative position claim** — a rank from 1 (leftmost) to N (rightmost, where N = number of players). Players can adjust their claimed position until the host locks the round.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + TypeScript |
| Real-time | Socket.io (server + client) |
| Styling | CSS Modules |
| QR Code | `qrcode.react` |
| Testing (server) | Vitest |
| Testing (client) | Vitest + React Testing Library |

One unified TypeScript monorepo. Shared types (schemas from Section 4) live in a `/shared` package imported by both client and server — no duplication, no drift.

> **Architecture notes:**
> - Socket.io handles rooms, reconnection, and event namespacing out of the box — no manual WebSocket management required.
> - Shared types in `/shared/types.ts` give full type safety across the client/server boundary.
> - React Context holds client-side game state, fed by a custom `useSocket` hook that wraps the Socket.io client.
> - CSS Modules for component-scoped styles, co-located with each component file.
> - Two React entry points rendered based on route: `/spectator/:roomCode` and `/player/:roomCode`.

---

## 4. Data Schemas

### 4.1 Question

```ts
type Question = {
  id: string;
  theme: string;        // e.g. "Speed — slowest to fastest"
  examples: string[];   // Optional hint examples shown to players, e.g. ["snail = 1", "rocket = 100"]
}
```

### 4.2 Player

```ts
type Player = {
  id: string;           // socket id
  nickname: string;
  isHost: boolean;
  cardValue: number | null;       // 1–100, assigned each round
  claimedPosition: number | null; // 1–N, player's self-reported rank
  isLocked: boolean;              // whether player has confirmed their position
  isConnected: boolean;
}
```

### 4.3 Room

```ts
type Room = {
  code: string;               // 4-character uppercase alphanumeric
  players: Player[];
  spectators: string[];       // socket ids
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;        // host-configurable at lobby: 5–20, default 13
  currentQuestion: Question | null;
  lives: number;              // team lives remaining
  maxLives: number;           // host-configurable at lobby: 1–5, default 3
  questions: Question[];      // shuffled queue for this session
  config: RoomConfig;         // snapshot of host settings at game start
}

type RoomConfig = {
  totalRounds: number;  // 5–20
  maxLives: number;     // 1–5
  cardRevealDefault: 'hidden'; // always 'hidden' — tap to reveal
}

type GamePhase =
  | 'lobby'        // waiting for players, host can start
  | 'discussing'   // round active: players can give clues and set positions
  | 'paused'       // a player disconnected mid-round; waiting for reconnect
  | 'revealing'    // host has locked round, cards flipping
  | 'roundResult'  // result displayed, host advances
  | 'gameOver';    // all rounds done or team ran out of lives
```

### 4.4 Round Result

```ts
type RoundResult = {
  orderedPlayers: Player[];   // sorted by claimedPosition
  mistakes: number;           // count of out-of-order adjacent pairs
  livesLost: number;
  livesRemaining: number;
}
```

---

## 5. Game Flow

```
[Lobby]
  Host creates room → gets 4-char code
  Players join with nickname
  Host sees "Start Game" when ≥ 3 players connected
        │
        ▼
[Question & Card Deal]  ← server assigns random 1–100 values (no duplicates per round)
  All players see the theme
  Each player sees only their own number
  Discussing phase begins
        │
        ▼
[Discussing Phase]
  Players give verbal clues (in person / voice — not mediated by the app)
  Each player sets their claimed position (1 to N) in the app
  Players can change their position freely until they tap "Lock In"
  When ALL players have locked in → host "Reveal" button becomes active
  ── OR ── host can force-reveal at any time (override)
        │
        ▼
[Revealing Phase]
  Cards flip one by one in claimed-position order (left to right)
  Mistakes are highlighted (wrong-order pairs shown in red)
  Lives lost are animated
        │
        ▼
[Round Result Screen]
  Shows: ordered line with all values revealed
  Shows: mistakes this round, lives lost, total lives remaining
  Host sees "Next Round" button
  If lives = 0 → go to Game Over
  If rounds exhausted → go to Game Over (victory)
        │
        ▼ (loop back)
[Next Round] or [Game Over]
```

---

## 6. Number Assignment Rules

- Each round, values are drawn **without replacement** from 1–100 for the current set of players.
- Values are spread across the range: server picks N values with minimum spacing of `floor(100 / (N + 1))` to avoid all players clustering at one end. *(Implementation note: simplest approach is to partition 1–100 into N equal bands and pick a random value from each band.)*
- A player who joins mid-game sits out the current round and receives a card next round.

---

## 7. Scoring / Lives System

This follows the physical ITO game's cooperative model:

- Team starts with **3 lives** (configurable by host before game start: 1–5).
- Each round, a **mistake** = one adjacent pair in the revealed order where the left card's value is greater than the right card's value.
- **Lives lost per round = number of mistakes** (capped at remaining lives).
- **Win condition**: Complete all rounds with at least 1 life remaining.
- **Lose condition**: Lives reach 0.
- No individual scoring. This is fully cooperative.

> ⚠️ **Open question**: Should the number of rounds be configurable (default 13)? Recommend yes — host sets 5–20 before starting. **Needs product decision.**

---

## 8. Host Role

- The **first player to create the room** is the host.
- The host is also a **regular player** (receives a card, participates in ordering).
- Host-only controls:
  - Start game
  - Force-reveal (override "all locked in" requirement)
  - Advance to next round
  - End game early
- **Host migration**: If the host disconnects, the next connected player in join order automatically becomes host. They are notified via a toast.
- The host does **not** have a separate view — host controls are shown as additional UI elements within the standard player view.

---

## 9. Disconnection Handling

If any player disconnects during an active round, the **game pauses** and waits for them to reconnect.

- Game phase transitions to `'paused'` (add to `GamePhase` union).
- All clients display a blocking overlay: *"Waiting for [nickname] to reconnect…"*
- The spectator view shows the same overlay.
- On reconnect, the server restores the player's full state (card value, claimed position, lock status) and resumes the previous phase.
- **Host-override**: If the host is still connected, they may choose to **remove the disconnected player** and resume without them. This requires a confirmation dialog. The removed player's card is excluded from the round's ordering entirely.
- If the **host** disconnects: host migration fires first (next player in join order becomes host), then the pause overlay appears. The new host inherits override capability.
- If a player closes the browser entirely (no reconnect within **5 minutes**): the host-override is automatically applied and the game resumes without them. A toast notifies all players.

> **Local network note**: Because this targets LAN play, reconnection should be near-instant in practice. The 5-minute timeout is a safety net for accidental closes.

---

## 10. Socket Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `create-room` | `{ nickname, rounds?: 5–20, lives?: 1–5 }` | Create room; host sets config before anyone joins |
| `join-room` | `{ roomCode, nickname }` | Join existing room as player |
| `join-spectator` | `{ roomCode }` | Join as spectator (no card) |
| `set-position` | `{ position: number }` | Set claimed rank (1–N) during discussing phase |
| `lock-position` | `{}` | Lock in current position claim |
| `unlock-position` | `{}` | Undo lock (allowed until host reveals) |
| `start-game` | `{}` | Host only — begins first round |
| `force-reveal` | `{}` | Host only — triggers reveal regardless of lock state |
| `next-round` | `{}` | Host only — advances to next round |
| `kick-player` | `{ playerId: string }` | Host only — remove disconnected player and resume |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room-updated` | `Room` | Full room state sync (on any state change) |
| `round-started` | `{ question, cardValue, round }` | Deal — `cardValue` is private to each recipient |
| `player-updated` | `Player[]` | Player list changed (join, disconnect, lock) |
| `reveal-sequence` | `RoundResult` | Trigger reveal animation with results |
| `game-over` | `{ won: boolean, livesRemaining: number, roundsPlayed: number }` | Game ended |
| `game-paused` | `{ disconnectedPlayer: string }` | A player dropped; game is waiting |
| `game-resumed` | `{ removedPlayer?: string }` | Game unpaused (reconnect or host kicked player) |
| `error` | `{ code: string, message: string }` | Error codes: `ROOM_NOT_FOUND`, `ROOM_FULL`, `NICKNAME_TAKEN`, `NOT_HOST` |

> **Design note**: Prefer sending full `Room` state on every update (`room-updated`) during development for simplicity. Optimise to delta events only if performance requires it.

---

## 11. UI / UX Specification

### 11.1 Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0a0a0f` | Page background |
| `--primary` | `#ff6b35` | Buttons, highlights |
| `--secondary` | `#2d1b4e` | Card backgrounds, panels |
| `--accent` | `#00d4aa` | Locked-in state, success |
| `--text-primary` | `#ffffff` | Headings, card values |
| `--text-secondary` | `#a0a0b0` | Supporting text |
| `--card-bg` | `#1a1a2e` | Player card surface |
| `--card-border` | `#3d3d5c` | Card borders |
| `--danger` | `#f87171` | Mistakes, lost lives |
| `--warning` | `#fbbf24` | One life remaining |
| `--success` | `#4ade80` | Win state |

### 11.2 Typography

| Role | Font | Usage |
|---|---|---|
| Display / Headings | Bebas Neue | Room codes, round numbers, large labels |
| Body | Inter | Instructions, nicknames, UI text |
| Card Values | Space Mono | The secret number on player cards |

### 11.3 Spectator View (`/spectator/:roomCode`)

Designed for a TV or large screen. Read-only — no interaction. The spectator view has two distinct states depending on whether the game has started.

---

#### Spectator — Lobby State (game not yet started)

This is what the TV shows while players are joining. The primary goal is to get phones pointed at the screen.

```
┌──────────────────────────────────────────────────────┐
│                      ITO                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│         ┌───────────────────────┐                    │
│         │                       │                    │
│         │   ▄▄▄ ▄  ▄ ▄▄▄▄▄     │                    │
│         │   █▄█ ██▄█ █   █     │  ← QR code         │
│         │   █ █ █  █ █▄▄▄█     │                    │
│         │                       │                    │
│         └───────────────────────┘                    │
│                                                      │
│              192.168.1.42:3000                       │
│               ROOM CODE: X7K2                        │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Players (4/8)                                       │
│                                                      │
│   ✦ Ana (host)    ✦ Bob    ✦ Cia    ✦ Dan            │
│                                                      │
│              Waiting for host to start...            │
└──────────────────────────────────────────────────────┘
```

**QR code behaviour:**
- QR encodes the full player join URL: `http://<local-ip>:<port>/player/X7K2`
- Generated client-side using a lightweight QR library (e.g. `qrcode.react` or `qrcodejs`)
- Displayed prominently, centred, large enough to scan from across a room (~250×250px minimum)
- Local IP shown in text below the QR as a fallback for manual entry
- Room code shown separately in large type for players who type it into a join screen

**Player list behaviour:**
- Updates in real time as players join — no refresh needed
- Shows nickname + host badge for the host
- Player count shown as `(N/8)`
- Minimum player count indicator: dims/greys out "Waiting for host to start..." until 3 players are present; at 3+ shows it normally

**Transition:** When the host starts the game, the lobby state fades out and the in-game spectrum view fades in.

---

#### Spectator — In-Game State

The primary display is a **horizontal spectrum line**. Player cards live on this line and slide in real time as players update their claimed position. This is the shared board — everyone in the room watches the ordering take shape live.

```
┌──────────────────────────────────────────────────────┐
│  ITO    ROOM: X7K2    ROUND: 3 / 13    ❤❤❤           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  THEME: "Speed — slowest to fastest"                 │
│                                                      │
│  SLOWEST ◄────────────────────────────► FASTEST      │
│          │                             │             │
│        ┌─┴──┐      ┌────┐   ┌────┐  ┌─┴──┐          │
│        │ Cia│      │ Ana│   │ Dan│  │ Bob│          │
│        │    │      │    │   │ ✓  │  │ ✓  │          │
│        │ ?  │      │ ?  │   │ ?  │  │ ?  │          │
│        └────┘      └────┘   └────┘  └────┘          │
│        pos 1       pos 2    pos 3   pos 4            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Card states on the spectrum line:**

| State | Visual treatment |
|---|---|
| No position claimed yet | Card not shown on line; shown in a "waiting" tray below the line |
| Position claimed, not locked | Card on line at correct position, **40% opacity**, dashed border — ghosted |
| Position claimed, locked | Card on line, **full opacity**, solid accent border (`--accent`), ✓ badge |
| Revealed (post-round) | Card flips to show number; colour-coded by correctness |

**Waiting tray** — players who haven't claimed a position yet appear in a row beneath the spectrum line, full opacity but not placed. This makes it clear at a glance who hasn't engaged yet.

**Live movement** — when a player changes their position, their card slides smoothly along the line (`transition: left 250ms ease-out`). The spectator sees every position adjustment in real time as the server broadcasts each `player-updated` event.

**Spectator sees:**
- Player nickname on every card
- Live position on the spectrum line as soon as a player claims one
- Ghost styling (translucent, dashed) for unlocked positions
- Solid styling + ✓ for locked positions
- Card values are **hidden** (shown as `?`) until the host triggers reveal
- During reveal: cards flip left-to-right; out-of-order pairs flash red

**Spectator does NOT see:**
- Individual card values during the discussing phase

### 11.4 Player View (`/player/:roomCode`)

Mobile-optimised. Portrait orientation.

**Lobby state (host view):**
```
┌─────────────────────┐
│  ITO    ROOM: X7K2  │
├─────────────────────┤
│  Players (4/8):     │
│  ● Ana (you, host)  │
│  ● Bob              │
│  ● Cia              │
│  ● Dan              │
├─────────────────────┤
│  Rounds:  [─●────]  │  ← slider, 5–20, shows "13"
│  Lives:   [●─────]  │  ← slider, 1–5, shows "3"
├─────────────────────┤
│  [ Start Game → ]   │  ← enabled when ≥ 3 players
└─────────────────────┘
```

**Lobby state (player view, non-host):**
```
┌─────────────────────┐
│  ITO    ROOM: X7K2  │
├─────────────────────┤
│  Players (4/8):     │
│  ● Ana (host)       │
│  ● Bob              │
│  ● Cia              │
│  ● Dan (you)        │
│                     │
│  13 rounds · ❤❤❤    │  ← host's chosen config, read-only
│                     │
│  Waiting for host   │
│  to start...        │
└─────────────────────┘
```

**Discussing state:**
```
┌─────────────────────┐
│  ITO  X7K2  ❤❤❤     │
├─────────────────────┤
│  Speed:             │
│  slowest → fastest  │
├─────────────────────┤
│  Your card:         │
│  ┌───────────┐      │
│  │           │      │
│  │    TAP    │      │  ← hidden by default; tap to reveal value
│  │           │      │
│  └───────────┘      │
├─────────────────────┤
│  Your position:     │
│                     │
│  ← [  2  ] →        │  ← stepper, 1 to N
│                     │
│  [ Lock In ✓ ]      │
│                     │
│  Locked: Bob, Dan   │
│  Waiting: Ana, Cia  │
└─────────────────────┘
```

> **Card reveal behaviour**: Card starts face-down each round. Player taps to flip it open (value visible). Tapping again hides it again. This is intentional — players hold the phone to their chest and only peek when needed, matching the physical game feel.

**Revealing state:**
```
┌─────────────────────┐
│  Revealing...       │
├─────────────────────┤
│  Cia  →  Ana  →  Bob  →  Dan   │
│   12      37     55     81     │
│                     │
│  ✅ All in order!   │
│  No lives lost.     │
│                     │
│  [waiting for host] │
└─────────────────────┘
```

---

## 12. Animations

| Animation | Duration | Trigger |
|---|---|---|
| Card flip (value reveal) | 500ms | Reveal sequence, per card |
| Card slide along spectrum line | 250ms ease-out | Player changes claimed position (live, every update) |
| Card appear on line | 300ms fade + slide up | Player claims a position for the first time |
| Card return to tray | 200ms fade + slide down | Player clears their position (edge case) |
| Ghost → solid transition | 200ms opacity | Player locks their position |
| Life lost pulse | 600ms | Life counter decrements |
| Mistake highlight | 400ms flash red | Wrong-order pair during reveal |
| Lock-in checkmark | 200ms pop | Player locks position |
| Phase transition fade | 300ms | Phase changes |

---

## 13. Question Set (Initial — 20 Questions)

Each question is a **spectrum theme**. Players' numbers represent where they fall on that spectrum.

1. Speed — slowest to fastest
2. Size — smallest to largest
3. Temperature — coldest to hottest
4. Age — youngest to oldest (things, not people)
5. Loudness — quietest to loudest
6. Sweetness — least sweet to sweetest
7. Rarity — most common to rarest
8. Distance from Earth — closest to farthest
9. Danger — safest to most dangerous
10. Popularity — least known to most famous
11. Price — cheapest to most expensive
12. Spiciness — mildest to spiciest
13. Height — shortest to tallest
14. Weight — lightest to heaviest
15. Intelligence (animals) — simplest to most intelligent
16. Flexibility — most rigid to most flexible
17. Depth — shallowest to deepest
18. Brightness — darkest to brightest
19. Softness — hardest to softest
20. Speed of change — most stable to fastest changing

---

## 14. Responsive Breakpoints

| Breakpoint | Width | Primary use |
|---|---|---|
| Mobile | < 640px | Player view |
| Tablet | 640px–1024px | Either view |
| Desktop | > 1024px | Spectator view |

The spectator view should be **unusable on mobile** by design (redirect or show a warning). The player view should be **thumb-reachable** — all interactive elements in the bottom 60% of the viewport.

---

## 15. Deployment Context

This game targets **local network (LAN) play** — a single host machine on the same Wi-Fi as all players' phones.

| Concern | Decision |
|---|---|
| Server host | Any laptop/desktop on the local network |
| Access | Players connect via local IP (e.g. `192.168.1.x:3000`) — no internet required |
| Room codes | Scoped to the server instance; no global uniqueness needed |
| Auth | None — nickname-only, no accounts |
| HTTPS | Not required for LAN; HTTP is fine |
| Persistence | None — all state in memory, resets on server restart |
| Concurrency | Single game night = low load; no scaling concerns |

**Suggested project structure:**
```
/
├── package.json              // workspaces: ["client", "server", "shared"]
├── shared/
│   ├── types.ts              // Room, Player, GamePhase, Question, RoundResult
│   └── game.ts               // pure game logic (card assignment, mistake detection)
├── server/
│   ├── index.ts              // Express + Socket.io setup
│   ├── room.ts               // room registry, state mutations
│   ├── handlers.ts           // socket event handlers
│   └── __tests__/
│       ├── room.test.ts      // unit tests for game logic
│       └── handlers.test.ts  // unit tests for event handlers
└── client/
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── context/
        │   └── GameContext.tsx    // React Context + useSocket hook
        ├── views/
        │   ├── SpectatorView.tsx
        │   └── PlayerView.tsx
        ├── components/           // shared UI components
        └── __tests__/
            ├── game.test.ts      // pure logic from shared/game.ts
            └── GameContext.test.ts
```

**Setup UX goal**: Host runs `npm install && npm run dev` once. Players open a browser on the same network, enter the room code. Single command, no configuration.

---

## 16. Testing

### Scope
Unit tests only for this iteration. No integration or end-to-end tests required now.

Run all tests with `npm test` from the root (Vitest workspace mode covers both `server` and `client`).

### Server — Vitest (`server/__tests__/`)

**`room.test.ts`** — pure game logic, no I/O, imports from `shared/game.ts`:

| Test | What it covers |
|---|---|
| `assignCards — no duplicates` | N players all receive unique values in a single round |
| `assignCards — full range spread` | Values distributed across 1–100, not clustered |
| `detectMistakes — all correct` | Ordered sequence returns 0 mistakes |
| `detectMistakes — one swap` | Single out-of-order adjacent pair returns 1 mistake |
| `detectMistakes — all wrong` | Fully reversed sequence returns N-1 mistakes |
| `livesDecrement — after mistakes` | Lives decrease correctly after a round with mistakes |
| `gameOver — no lives` | Phase transitions to `gameOver` when lives reach 0 |
| `gameOver — all rounds complete` | Phase transitions to `gameOver` after final round |
| `hostMigration — on disconnect` | Next player in join order becomes host |
| `roomConfig — defaults` | Room created without config uses rounds=13, lives=3 |
| `roomConfig — clamp` | Rounds and lives values are clamped to valid ranges |

**`handlers.test.ts`** — room registry logic, no Socket.io I/O:

| Test | What it covers |
|---|---|
| `create-room — unique codes` | Two rooms created back-to-back get different codes |
| `join-room — max players` | 9th player joining an 8-player room returns `ROOM_FULL` error |
| `join-room — duplicate nickname` | Duplicate nickname returns `NICKNAME_TAKEN` error |
| `disconnect — pauses phase` | Disconnect during `discussing` sets phase to `paused` |
| `reconnect — restores state` | Reconnecting player gets their card value and position back |

### Client — Vitest (`client/src/__tests__/`)

> **Note**: Components that depend on a live Socket.io connection or DOM animations are not unit-tested. Only pure logic and context state are covered.

**`game.test.ts`** — pure functions from `shared/game.ts`:

| Test | What it covers |
|---|---|
| `positionToPercent — first of N` | Returns 0% |
| `positionToPercent — last of N` | Returns 100% |
| `positionToPercent — middle` | Returns correct interpolated percentage |
| `detectMistakes — correct order` | Returns empty array |
| `detectMistakes — one swap` | Returns the swapped pair |

**`GameContext.test.ts`** — React Context state transitions (socket events mocked):

| Test | What it covers |
|---|---|
| `room-updated — updates context state` | State reflects new room payload |
| `round-started — stores cardValue` | Player's card value stored in context |
| `game-paused — sets paused phase` | Phase transitions correctly on pause event |
| `player-updated — triggers re-render` | Components subscribed to context re-render on player list change |

---

## 17. Acceptance Criteria

### Testing
- [ ] `npm test` passes with no failures across server and client workspaces
- [ ] All functions under test are pure (no Socket.io I/O, no DOM)
- [ ] Shared types in `/shared/types.ts` are used by both client and server with no duplication
- [ ] Socket.io events are mocked in client context tests — no real server required

### Room Configuration
- [ ] Host can set round count (5–20) via slider before starting
- [ ] Host can set starting lives (1–5) via slider before starting
- [ ] Non-host players see the chosen config (read-only) in the lobby
- [ ] Config is locked once the game starts

### Post-Game Summary
- [ ] Win/loss state is clearly communicated
- [ ] Summary table shows mistakes per round
- [ ] Lives remaining is shown
- [ ] Host sees "Play Again" button (resets round state, keeps players in room)
- [ ] All players see "Leave Room" button

### Room Management
- [ ] Host can create a room and receive a 4-character code
- [ ] Players can join by entering room code + nickname
- [ ] Duplicate nicknames within a room are rejected
- [ ] Spectator can connect via URL and receive live updates
- [ ] Host migrates automatically on host disconnect
- [ ] Room is destroyed server-side after all players disconnect for > 5 minutes

### Gameplay
- [ ] Each round, every active player receives a unique number 1–100
- [ ] Numbers are distributed across the full range (not clustered)
- [ ] Players can set and change their position during discussing phase
- [ ] Players can lock and unlock their position until host reveals
- [ ] Host can force-reveal even if not all players are locked
- [ ] Reveal sequence animates cards left to right in claimed-position order
- [ ] Mistakes (out-of-order pairs) are correctly identified and highlighted
- [ ] Lives decrement by the number of mistakes each round
- [ ] Game ends when lives = 0 (loss) or all rounds complete (win)

### Spectator View — Lobby
- [ ] QR code displayed encoding the full player join URL (`http://<local-ip>:<port>/player/:roomCode`)
- [ ] QR code is minimum 250×250px and scannable from across a room
- [ ] Local IP and room code shown in text below QR as manual fallback
- [ ] Player list updates in real time as players join, showing nickname + host badge
- [ ] Player count shown as `(N/8)`
- [ ] "Waiting for host to start" dims until ≥ 3 players are present
- [ ] Lobby fades out and spectrum view fades in when game starts

### Spectator View — In-Game
- [ ] Displays a horizontal spectrum line with theme label at each end
- [ ] Players with no position claimed appear in a waiting tray below the line
- [ ] Cards slide onto the line and animate to new positions in real time as players update
- [ ] Unlocked position cards are rendered at 40% opacity with a dashed border
- [ ] Locked position cards are full opacity with accent border and ✓ badge
- [ ] Card values shown as `?` during discussing phase
- [ ] Animates card reveal left-to-right after host triggers reveal
- [ ] Out-of-order pairs highlighted in red during reveal
- [ ] Shows lives remaining with visual indicator

### Player View
- [ ] Shows player's own card face-down by default; tap reveals value, tap again hides it
- [ ] Position stepper is constrained to 1–N
- [ ] Lock-in button is prominent and gives clear feedback
- [ ] Shows how many other players are locked vs. waiting
- [ ] Mobile layout is thumb-friendly (controls in bottom half)

### Multiplayer Sync
- [ ] All clients reflect state changes within 200ms
- [ ] Reconnecting player rejoins their room and receives current state
- [ ] Disconnected player is marked inactive; others can continue
- [ ] No state corruption if two players act simultaneously

---

**Post-game summary screen (both views):**
```
┌─────────────────────┐
│  GAME OVER          │
│  🎉 You won!        │  ← or "💀 You lost..."
├─────────────────────┤
│  Rounds: 13/13      │
│  Lives left: ❤      │
│                     │
│  Round  Mistakes    │
│  ─────────────────  │
│    1       0  ✅    │
│    2       1  ❤     │
│    3       0  ✅    │
│   ...               │
├─────────────────────┤
│  [ Play Again ]     │  ← host only; resets room, same players
│  [ Leave Room ]     │
└─────────────────────┘
```

---

## 17. Decisions Log

All product questions are now resolved. No open items remain.

| # | Question | Decision |
|---|---|---|
| 1 | Configurable round count? | ✅ Yes — host sets 5–20 at lobby, default 13 |
| 2 | Configurable lives? | ✅ Yes — host sets 1–5 at lobby, default 3 |
| 3 | Card reveal default? | ✅ Hidden by default — tap to reveal (matches physical game) |
| 4 | Post-game summary screen? | ✅ Yes — shows win/loss, lives remaining, per-round mistake table |
| 5 | Spectators see values post-reveal? | ✅ Yes — spectator is the shared board; full reveal shown there |
| 6 | Disconnection policy? | ✅ Pause and wait; host can kick after 5 min auto-timeout |
| 7 | Cooperative or competitive? | ✅ Cooperative — team lives, no individual score |
| 8 | Deployment target? | ✅ LAN only — single server, no auth, no HTTPS required |
| 9 | Server language + transport? | ✅ Node.js + TypeScript + Socket.io |
| 10 | Frontend framework? | ✅ React + Vite + TypeScript |
| 11 | Test framework? | ✅ Vitest (server + client), React Testing Library (client) |

---

*Spec v2.8 — Spectator lobby state fully specified: QR code (encodes player join URL), real-time player list, host badge, minimum player indicator. `qrcode.react` added to stack. Spectator AC split into Lobby and In-Game sections.*
