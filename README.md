# Git Sandbox

Git Sandbox is a `Vite + React + TypeScript` learning app that visualizes Git command flows in the browser.

The left side renders the commit graph, and the right side combines an editor and terminal so branch, switch, checkout, merge, revert, and reset flows can be inspected in one place. When a merge conflict occurs, the `ConflictResolver` UI exposes `OURS / THEIRS / RESULT` panes for side-by-side resolution.

## Features

- Git learning UI with a visual commit graph
- Monaco-based editor with terminal-driven command execution
- `ko / en` locale toggle
- Guided tutorial and demo scenario catalog
- Merge conflict resolution UI
- Support for `git merge --abort`
- Vitest, Testing Library, and Playwright coverage

## Supported Commands

- `help`
- `git init`
- `git commit -m <msg>`
- `git branch <name>`
- `git switch <name>`
- `git switch -c <name>`
- `git checkout <branch|commitId>`
- `git merge <name>`
- `git merge --abort`
- `git revert <commitId>`
- `git reset --hard <commitId>`
- `git status`
- `git log --oneline`

## Current Behavior

- `git init`
  Creates symbolic `HEAD` on `main`.
- `git commit -m`
  Snapshots the current editor content into a new commit.
- `git branch`
  Creates a branch from the current `HEAD`.
- `git switch` / `git checkout`
  Supports branch moves and detached `HEAD` checkout.
- `git merge`
  Handles fast-forward, merge commits, and conflict entry.
- `git merge --abort`
  Restores the pre-conflict state for an active merge.
- `git status`
  Differentiates normal state and in-progress merge state.

## Demo Scenarios

The app includes built-in scenarios for:

- help, init, status
- single and multiple commits
- branch creation and switching
- checkout by branch and commit
- fast-forward merge
- non-fast-forward merge
- merge conflict
- revert
- reset --hard
- combined end-to-end flows

Each demo resets the sandbox first and then replays the command sequence with short delays.

## Development

```bash
npm install
npm run dev
```

- Local server: `http://localhost:5173`
- Production build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`

## Testing

```bash
npm run test
npm run test:e2e
npm run test:all
```

- `npm run test`
  Runs unit and integration tests with Vitest.
- `npm run test:e2e`
  Runs Playwright end-to-end tests.
- `npm run test:all`
  Runs both suites.

If Chromium is not installed for Playwright yet:

```bash
npx playwright install chromium
```

## Test Coverage

- Git parser and command execution logic
- Reducer and command runner
- Terminal history and scroll behavior
- App-level integration flows
- Merge conflict UI
- Modal interactions

## Tech Stack

- React 19
- TypeScript
- Vite
- Mantine
- Monaco Editor
- Vitest
- Testing Library
- Playwright

## Project Structure

```text
src/
  app/
    commandSequence.ts
    terminalHistoryHandlers.ts
    terminalSubmitHandlers.ts
  components/
    AppDemoCatalogModal.tsx
    AppHeader.tsx
    AppTutorialModal.tsx
    ConflictResolver.tsx
    Editor.tsx
    Graph.tsx
    MonacoEditor.tsx
    Terminal.tsx
    graph/
  git/
    commands/execute/
    parse/
    reducer/
    types.ts
    execute.ts
    guards.ts
    messages.ts
    utils.ts
  test/
    renderWithProviders.tsx
    setup.tsx
e2e/
  app.spec.ts
```

## Notes

- This project is a learning-oriented Git simulator, not a byte-for-byte reimplementation of Git.
- The merge conflict flow has been tuned to feel close to real Git, including conflict entry and `merge --abort`.

## Playwright Skill Verification

Verified on 2026-03-09 with the installed `playwright` skill by driving the app through the demo catalog and saving screenshots under `output/playwright/`.

### Scenarios

1. Single commit
   Result: `git init` and `git commit -m "init"` created `c1`, and the graph showed `main` plus `HEAD` on the first commit.
   Artifact: `output/playwright/single-commit.png`
2. Branch create
   Result: `git branch feat` added a second branch label on `c1` while `HEAD` stayed on `main`.
   Artifact: `output/playwright/branch-create.png`
3. Switch -c
   Result: `git switch -c feat` moved `HEAD` to `feat`, and the follow-up commit created `c2` on the feature branch.
   Artifact: `output/playwright/switch-create-branch.png`
4. Fast-forward merge
   Result: the scenario reached `git merge feat`, reported `Fast-forward`, and `git log --oneline` ended with `c2 feat: add docs` above `c1 init`.
   Artifact: `output/playwright/fast-forward-merge.png`
5. Merge conflict
   Result: the scenario produced `CONFLICT (content)`, `git status` reported unmerged paths, and the conflict resolver rendered `OURS`, `THEIRS`, and `RESULT` panes with merge action buttons.
   Artifact: `output/playwright/merge-conflict.png`

Raw captured state for the same runs is stored in `output/playwright/skill-verification.json`.
