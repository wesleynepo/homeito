Add tests for recently changed files in this project.

1. Run `git diff main..HEAD --name-only` to find which files changed on this branch.
2. For each changed source file, check if a corresponding test file exists in `client/src/__tests__/` or `server/__tests__/`.
3. Read the changed file and any existing related test files to understand the patterns in use.
4. Write tests that cover:
   - The happy path of new/changed behavior
   - Edge cases introduced by the change (invalid inputs, boundary conditions)
   - Any regression risk (what could break if this logic changes)
5. Follow project conventions from AGENTS.md:
   - Use Vitest + React Testing Library for client code
   - Mock `useGame` with `vi.mock('../context/GameContext')` in component tests
   - Use real i18n setup (see `LanguageSwitcher.test.tsx`) not mocks
   - Query by `placeholder` or `within(form)` — avoid role+name when tabs and submit buttons share names
   - No `setState` inside `useEffect` in production code
6. Run `npx vitest run <test-file>` to confirm all new tests pass before finishing.
