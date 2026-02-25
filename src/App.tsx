import { useReducer, useState } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { Editor } from './components/Editor'
import { ConflictResolver } from './components/ConflictResolver'
import { Graph } from './components/Graph'
import { Terminal } from './components/Terminal'
import { initialState, GitActionType, reducer } from './git/reducer'
import { createHistoryDownHandler, createHistoryUpHandler } from './app/terminalHistoryHandlers'
import {
  createLogStateHandler,
  createResetHandler,
  createSubmitHandler,
} from './app/terminalSubmitHandlers'
import { parseCommand } from './git/parse'
import { executeCommand } from './git/execute'
import AppTutorialModal from './components/AppTutorialModal'
import { AppDemoCatalogModal } from './components/AppDemoCatalogModal'
import type { GitState, TerminalEntry } from './git/types'

type DemoStep =
  | { type: 'command'; line: string }
  | { type: 'editor'; text: string; note: string }

type DemoScenario = {
  id: string
  title: string
  description: string
  steps: DemoStep[]
}

const sleep = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

const baseDemoSteps: DemoStep[] = [
  { type: 'command', line: 'git init' },
  { type: 'command', line: 'git commit -m "init"' },
  { type: 'command', line: 'git commit -m "main: bootstrap project"' },
  { type: 'command', line: 'git branch feat' },
  { type: 'command', line: 'git switch feat' },
  { type: 'command', line: 'git commit -m "feat: add editor"' },
  { type: 'command', line: 'git commit -m "feat: add toolbar"' },
  { type: 'command', line: 'git switch main' },
  { type: 'command', line: 'git merge feat' },
  { type: 'command', line: 'git status' },
  { type: 'command', line: 'git log --oneline' },
  { type: 'command', line: 'git checkout feat' },
  { type: 'command', line: 'git commit -m "feat: refine toolbar"' },
  { type: 'command', line: 'git reset --hard c2' },
]

const conflictDemoSteps: DemoStep[] = [
  { type: 'command', line: 'git init' },
  { type: 'command', line: 'git commit -m "init baseline"' },
  { type: 'command', line: 'git switch -c feat' },
  {
    type: 'editor',
    text: 'Shared intro\n\nFeature branch added this line.',
    note: 'Editor filled before feat commit.',
  },
  { type: 'command', line: 'git commit -m "feat: add toolbar"' },
  { type: 'command', line: 'git switch main' },
  {
    type: 'editor',
    text: 'Shared intro\n\nMain branch changed this line.',
    note: 'Editor filled before main commit.',
  },
  { type: 'command', line: 'git commit -m "main: add metrics"' },
  { type: 'command', line: 'git merge feat' },
  { type: 'command', line: 'git status' },
  { type: 'command', line: 'git log --oneline' },
]

const demoScenarios: DemoScenario[] = [
  {
    id: 'help',
    title: '1) help',
    description: 'See available commands and learn the command set first.',
    steps: [
      { type: 'command', line: 'help' },
    ],
  },
  {
    id: 'init-only',
    title: '2) git init only',
    description: 'Initialize once and confirm the repository becomes ready.',
    steps: [
      { type: 'command', line: 'git init' },
    ],
  },
  {
    id: 'status-before-init',
    title: '3) status before init',
    description: 'Run status on a non-initialized state to see the standard not-initialized error.',
    steps: [
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'init-status',
    title: '4) init + status',
    description: 'Initialize and immediately check status for a clean working baseline.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'single-commit',
    title: '5) single commit',
    description: 'Create the first commit and watch one new node appear on the graph.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
    ],
  },
  {
    id: 'two-commits',
    title: '6) two commits',
    description: 'Build a small commit chain to verify parent relationship and sequential IDs.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: bootstrap"' },
    ],
  },
  {
    id: 'create-branch',
    title: '7) branch create',
    description: 'Create a new branch from current HEAD.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git branch feat' },
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'switch-to-branch',
    title: '8) switch branch',
    description: 'Move to a branch and start new work there.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git branch feat' },
      { type: 'command', line: 'git switch feat' },
      { type: 'command', line: 'git commit -m "feat: start feature"' },
    ],
  },
  {
    id: 'switch-create-branch',
    title: '9) switch -c',
    description: 'Create and switch to a new branch in one command.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git switch -c feat' },
      { type: 'command', line: 'git commit -m "feat: init feature branch"' },
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'checkout-branch',
    title: '10) checkout branch',
    description: 'Checkout by branch name and then keep adding commit history there.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git switch -c feat' },
      { type: 'command', line: 'git commit -m "feat: baseline"' },
      { type: 'command', line: 'git checkout main' },
    ],
  },
  {
    id: 'checkout-commit',
    title: '11) checkout commit',
    description: 'Move to a detached state from a commit hash and keep typing still works.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: bootstrap"' },
      { type: 'command', line: 'git checkout c1' },
    ],
  },
  {
    id: 'switch-error',
    title: '12) invalid switch error',
    description: 'Show how invalid branch name input is handled.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git switch unknown-branch' },
    ],
  },
  {
    id: 'merge-ff',
    title: '13) fast-forward merge',
    description: 'Prepare branches so merge can be cleanly fast-forwarded.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git branch feat' },
      { type: 'command', line: 'git switch feat' },
      { type: 'command', line: 'git commit -m "feat: add docs"' },
      { type: 'command', line: 'git switch main' },
      { type: 'command', line: 'git merge feat' },
      { type: 'command', line: 'git log --oneline' },
    ],
  },
  {
    id: 'merge-non-ff',
    title: '14) non-fast-forward merge',
    description: 'Make both branches diverge and merge to generate a merge commit.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git switch -c feat' },
      { type: 'command', line: 'git commit -m "feat: base work"' },
      { type: 'command', line: 'git switch main' },
      { type: 'command', line: 'git commit -m "main: add analytics"' },
      { type: 'command', line: 'git merge feat' },
      { type: 'command', line: 'git log --oneline' },
    ],
  },
  {
    id: 'log-oneline-baseline',
    title: '15) log oneline',
    description: 'Check commit list order along first-parent path from current HEAD.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: bootstrap"' },
      { type: 'command', line: 'git commit -m "main: add ui"' },
      { type: 'command', line: 'git log --oneline' },
    ],
  },
  {
    id: 'revert-only',
    title: '16) revert command',
    description: 'Revert the second commit and observe the new reverting commit on the same branch.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: unstable change"' },
      { type: 'command', line: 'git revert c2' },
      { type: 'command', line: 'git log --oneline' },
    ],
  },
  {
    id: 'reset-hard-only',
    title: '17) reset --hard',
    description: 'Move HEAD to an earlier commit and rollback editor snapshot to that state.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: setup"' },
      { type: 'command', line: 'git commit -m "main: update config"' },
      { type: 'command', line: 'git reset --hard c2' },
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'basic',
    title: '18) combined: basic flow',
    description:
      'Initialize repository and run commit/switch/merge/log workflow. Good first-time walkthrough for how graph and terminal change together.',
    steps: baseDemoSteps,
  },
  {
    id: 'conflict',
    title: '19) combined: merge conflict',
    description:
      'Apply different edits per branch and run merge so you can observe branch heads and editor snapshot behavior in one flow.',
    steps: conflictDemoSteps,
  },
  {
    id: 'revert-reset',
    title: '20) combined: revert + reset',
    description:
      'Create commits, revert one commit, then move HEAD back using reset --hard to verify pointer + snapshot rollback.',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: bootstrap"' },
      { type: 'command', line: 'git switch -c feat' },
      { type: 'command', line: 'git commit -m "feat: add toolbar"' },
      { type: 'command', line: 'git commit -m "feat: add style"' },
      { type: 'command', line: 'git switch main' },
      { type: 'command', line: 'git commit -m "main: setup"' },
      { type: 'command', line: 'git revert c2' },
      { type: 'command', line: 'git reset --hard c2' },
      { type: 'command', line: 'git status' },
      { type: 'command', line: 'git log --oneline' },
    ],
  },
]

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [isDemoCatalogOpen, setIsDemoCatalogOpen] = useState(false)
  const [isDemoRunning, setIsDemoRunning] = useState(false)

  const handleTerminalHistoryUp = createHistoryUpHandler(state, dispatch)
  const handleTerminalHistoryDown = createHistoryDownHandler(state, dispatch)
  const handleTerminalSubmit = createSubmitHandler(state, dispatch)
  const handleReset = createResetHandler(dispatch, initialState)
  const handleLogState = createLogStateHandler(state)
  const mergeConflict = state.meta.mergeConflict

  const runDemoSequence = async (steps: DemoStep[]) => {
    if (steps.length === 0 || isDemoRunning) {
      return
    }

    setIsDemoRunning(true)

    const cleanState: GitState = {
      ...initialState,
      terminal: {
        ...initialState.terminal,
        history: [],
        historyCursor: null,
        draftInput: '',
        input: '',
      },
    }

    dispatch({ type: GitActionType.SetTerminalInput, payload: '' })
    dispatch({ type: GitActionType.SetTerminalDraftInput, payload: '' })
    dispatch({ type: GitActionType.Initialize, payload: cleanState })

    let nextState: GitState = cleanState
    const nextHistory: TerminalEntry[] = [...cleanState.terminal.history]
    const now = Date.now()

    try {
      for (let index = 0; index < steps.length; index += 1) {
        const step = steps[index]
        if (step.type === 'editor') {
          nextState = {
            ...nextState,
            editorText: step.text,
          }

          nextHistory.push({
            id: String(now + index),
            cmd: '(demo) editor: auto update',
            out: step.note,
            timestamp: now + index,
          })

          dispatch({
            type: GitActionType.Initialize,
            payload: {
              ...nextState,
              terminal: {
                ...nextState.terminal,
                history: [...nextHistory],
              },
            },
          })
        } else {
          const ast = parseCommand(step.line)
          const result = executeCommand(nextState, ast)
          nextState = result.nextState

          nextHistory.push({
            id: String(now + index),
            cmd: step.line,
            out: result.out,
            err: result.err,
            timestamp: now + index,
          })

          dispatch({
            type: GitActionType.Initialize,
            payload: {
              ...nextState,
              terminal: {
                ...nextState.terminal,
                history: [...nextHistory],
                historyCursor: null,
                draftInput: '',
                input: '',
              },
            },
          })
        }

        if (index < steps.length - 1) {
          await sleep(1000)
        }
      }
    } catch {
      setIsDemoRunning(false)
      return
    }

    setIsDemoRunning(false)
  }

  const handleRunDemoScenario = (scenarioId: string) => {
    const scenario = demoScenarios.find((item) => item.id === scenarioId)
    if (!scenario) {
      return
    }
    setIsDemoCatalogOpen(false)
    void runDemoSequence(scenario.steps)
  }

  const handleAcceptOurs = () => {
    if (!mergeConflict) {
      return
    }

    dispatch({ type: GitActionType.EditorSetText, payload: mergeConflict.oursText })
    dispatch({
      type: GitActionType.SetCommitSnapshot,
      payload: { commitId: mergeConflict.pendingMergeCommitId, snapshot: mergeConflict.oursText },
    })
    dispatch({ type: GitActionType.SetMergeConflict, payload: null })
  }

  const handleAcceptTheirs = () => {
    if (!mergeConflict) {
      return
    }

    dispatch({ type: GitActionType.EditorSetText, payload: mergeConflict.theirsText })
    dispatch({
      type: GitActionType.SetCommitSnapshot,
      payload: { commitId: mergeConflict.pendingMergeCommitId, snapshot: mergeConflict.theirsText },
    })
    dispatch({ type: GitActionType.SetMergeConflict, payload: null })
  }

  const handleKeepResult = () => {
    if (!mergeConflict) {
      return
    }

    dispatch({
      type: GitActionType.SetCommitSnapshot,
      payload: {
        commitId: mergeConflict.pendingMergeCommitId,
        snapshot: state.editorText,
      },
    })
    dispatch({ type: GitActionType.SetMergeConflict, payload: null })
  }

  const handleResultChange = (value: string) => {
    dispatch({ type: GitActionType.EditorSetText, payload: value })
  }

  return (
    <div className="app-shell">
      <AppHeader
        initialized={state.meta.initialized}
        head={state.head}
        onLogState={handleLogState}
        onReset={handleReset}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenDemoCatalog={() => setIsDemoCatalogOpen(true)}
        isDemoRunning={isDemoRunning}
      />
      <AppDemoCatalogModal
        open={isDemoCatalogOpen}
        onClose={() => setIsDemoCatalogOpen(false)}
        demos={demoScenarios}
        onRun={handleRunDemoScenario}
        isDemoRunning={isDemoRunning}
      />
      <AppTutorialModal open={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <div className="layout">
        <section className="panel graph-panel">
          <Graph
            commits={state.commits}
            branches={state.branches}
            head={state.head}
            lanes={state.meta.lanes}
          />
        </section>

        <section className="panel right-panel">
          <div className="sub-panel editor-panel">
            {mergeConflict?.inProgress ? (
              <ConflictResolver
                oursText={mergeConflict.oursText}
                theirsText={mergeConflict.theirsText}
                resultText={state.editorText}
                oursBranch={`HEAD (${mergeConflict.oursBranch})`}
                theirsBranch={mergeConflict.theirsBranch}
                onResultChange={handleResultChange}
                onAcceptOurs={handleAcceptOurs}
                onAcceptTheirs={handleAcceptTheirs}
                onKeepResult={handleKeepResult}
              />
            ) : (
              <Editor
                value={state.editorText}
                onChange={(value) => dispatch({ type: GitActionType.EditorSetText, payload: value })}
              />
            )}
          </div>
          <div className="sub-panel">
            <Terminal
              input={state.terminal.input}
              history={state.terminal.history}
              onInputChange={(value) => {
                dispatch({ type: GitActionType.SetTerminalInput, payload: value })
                dispatch({ type: GitActionType.SetTerminalHistoryCursor, payload: null })
                dispatch({ type: GitActionType.SetTerminalDraftInput, payload: value })
              }}
              onSubmit={handleTerminalSubmit}
              onHistoryUp={handleTerminalHistoryUp}
              onHistoryDown={handleTerminalHistoryDown}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export { App as default }
