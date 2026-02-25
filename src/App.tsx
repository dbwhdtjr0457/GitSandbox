import { useReducer, useState } from 'react'
import './App.css'
import type { Locale } from './i18n/strings'
import { getLocaleStrings, getSavedLocale, saveLocale } from './i18n/strings'
import { AppHeader } from './components/AppHeader'
import { Editor } from './components/Editor'
import { ConflictResolver } from './components/ConflictResolver'
import { Graph } from './components/Graph'
import { Terminal } from './components/Terminal'
import { initialState, GitActionType, reducer } from './git/reducer'
import { createHistoryDownHandler, createHistoryUpHandler } from './app/terminalHistoryHandlers'
import { createResetHandler, createSubmitHandler } from './app/terminalSubmitHandlers'
import { parseCommand } from './git/parse'
import { executeCommand } from './git/execute'
import AppTutorialModal from './components/AppTutorialModal'
import { AppDemoCatalogModal } from './components/AppDemoCatalogModal'
import type { GitState, TerminalEntry } from './git/types'

type DemoStep = { type: 'command'; line: string } | { type: 'editor'; text: string }

type DemoScenario = {
  id: string
  title: string
  description: string
  steps: DemoStep[]
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
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
  { type: 'editor', text: 'Shared intro\n\nFeature branch added this line.' },
  { type: 'command', line: 'git commit -m "feat: add toolbar"' },
  { type: 'command', line: 'git switch main' },
  { type: 'editor', text: 'Shared intro\n\nMain branch changed this line.' },
  { type: 'command', line: 'git commit -m "main: add metrics"' },
  { type: 'command', line: 'git merge feat' },
  { type: 'command', line: 'git status' },
  { type: 'command', line: 'git log --oneline' },
]

const baseDemoScenarios: Omit<DemoScenario, 'title' | 'description'>[] = [
  {
    id: 'help',
    steps: [{ type: 'command', line: 'help' }],
  },
  {
    id: 'init-only',
    steps: [{ type: 'command', line: 'git init' }],
  },
  {
    id: 'status-before-init',
    steps: [{ type: 'command', line: 'git status' }],
  },
  {
    id: 'init-status',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'single-commit',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
    ],
  },
  {
    id: 'two-commits',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: bootstrap"' },
    ],
  },
  {
    id: 'create-branch',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git branch feat' },
      { type: 'command', line: 'git status' },
    ],
  },
  {
    id: 'switch-to-branch',
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
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git commit -m "main: bootstrap"' },
      { type: 'command', line: 'git checkout c1' },
    ],
  },
  {
    id: 'switch-error',
    steps: [
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git commit -m "init"' },
      { type: 'command', line: 'git switch unknown-branch' },
    ],
  },
  {
    id: 'merge-ff',
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
    steps: baseDemoSteps,
  },
  {
    id: 'conflict',
    steps: conflictDemoSteps,
  },
  {
    id: 'revert-reset',
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
  const [locale, setLocale] = useState<Locale>(() => getSavedLocale())
  const strings = getLocaleStrings(locale)

  const demoScenarios: DemoScenario[] = baseDemoScenarios.map((scenario) => {
    const text = strings.demo.items[scenario.id] ?? {
      title: scenario.id,
      description: '',
    }
    return {
      id: scenario.id,
      title: text.title,
      description: text.description,
      steps: scenario.steps,
    }
  })

  const handleTerminalHistoryUp = createHistoryUpHandler(state, dispatch)
  const handleTerminalHistoryDown = createHistoryDownHandler(state, dispatch)
  const handleTerminalSubmit = createSubmitHandler(state, dispatch)
  const handleReset = createResetHandler(dispatch, initialState)
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
            cmd: strings.demo.autoEditorLine,
            out: strings.demo.autoEditorLine,
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

  const handleToggleLocale = () => {
    const nextLocale = locale === 'ko' ? 'en' : 'ko'
    setLocale(nextLocale)
    saveLocale(nextLocale)
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
        strings={strings}
        onReset={handleReset}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenDemoCatalog={() => setIsDemoCatalogOpen(true)}
        isDemoRunning={isDemoRunning}
        onToggleLocale={handleToggleLocale}
      />
      <AppDemoCatalogModal
        open={isDemoCatalogOpen}
        onClose={() => setIsDemoCatalogOpen(false)}
        demos={demoScenarios}
        strings={strings}
        onRun={handleRunDemoScenario}
        isDemoRunning={isDemoRunning}
      />
      <AppTutorialModal
        open={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        strings={strings}
      />

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
                oursBranch={strings.conflict.oursLabel(mergeConflict.oursBranch)}
                theirsBranch={strings.conflict.theirsLabel(mergeConflict.theirsBranch)}
                onResultChange={handleResultChange}
                onAcceptOurs={handleAcceptOurs}
                onAcceptTheirs={handleAcceptTheirs}
                onKeepResult={handleKeepResult}
                strings={strings.conflict}
              />
            ) : (
              <Editor
                value={state.editorText}
                onChange={(value) =>
                  dispatch({ type: GitActionType.EditorSetText, payload: value })
                }
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
