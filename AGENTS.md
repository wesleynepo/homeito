# Homito — Agent Instructions

## Project structure
Monorepo with three workspaces: `client/` (React + Vite), `server/` (Node + Socket.io), `shared/` (types + game logic).
Run everything from the root. Workspace aliases: `@ito/client`, `@ito/server`, `@ito/shared`.

## Commands
```bash
npm run dev          # start client + server in watch mode
npm run build        # build all workspaces
npx vitest run       # run all tests (use this, not npm test)
npx vitest run <file> # run a single test file
npx eslint <file> --max-warnings=0  # lint a file before committing
```

## Pre-commit hook
Husky + lint-staged runs **build → eslint → vitest --coverage** automatically on commit.
Always run ESLint on changed files before committing to avoid hook failures.

## Testing conventions
- Framework: **Vitest** + **React Testing Library** (`@testing-library/react`)
- Test files live in `client/src/__tests__/` or `server/__tests__/`
- Query DOM by `placeholder`, `within(form)`, or `data-testid` — avoid `getByRole` with names shared between tabs and submit buttons
- Mock `useGame` with `vi.mock('../context/GameContext')` in component tests
- Use real i18n setup (see `LanguageSwitcher.test.tsx`) rather than mocking `react-i18next`
- No `setState` inside `useEffect` bodies — derive initial state at render time instead

## Styling
CSS Modules only — **never** use inline style objects in JSX. ESLint enforces this.
Import styles as `import styles from './Component.module.css'` and apply via `className={styles.foo}`.

## Code conventions
- Shared types live in `shared/src/types.ts` — import from `@ito/shared`
- Room state is authoritative on the server; clients receive it via `room-updated` socket events
- Room codes are 4-char uppercase alphanumeric (validated with `/^[A-Z0-9]{4}$/`)
- Commits follow conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`
