Create a pull request for the current branch following these steps:

1. Run `npx eslint` on any modified `.ts` or `.tsx` files with `--max-warnings=0`. Fix any errors before proceeding.
2. Run `npx vitest run` to confirm all tests pass. Fix any failures before proceeding.
3. Run `git status` and `git diff` to review all staged and unstaged changes.
4. Run `git log main..HEAD --oneline` to see commits on this branch.
5. Stage only the relevant changed files (never `git add -A`).
6. Commit using a conventional commit message (`feat:`, `fix:`, `refactor:`, etc.) if there are uncommitted changes.
7. Push the branch with `git push -u origin <branch>` if not already pushed.
8. Create the PR with `gh pr create` using this body format:

```
## Summary
<2-4 bullet points describing what changed and why>

## Test plan
- [ ] <manual check 1>
- [ ] <manual check 2>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Return the PR URL when done.
