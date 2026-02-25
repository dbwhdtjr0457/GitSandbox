import { useReducer } from 'react'
import './App.css'
import { Editor } from './components/Editor'
import { Graph } from './components/Graph'
import { Terminal } from './components/Terminal'
import { parseCommand } from './git/parse'
import { executeCommand } from './git/execute'
import { initialState, GitActionType, reducer } from './git/reducer'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleTerminalHistoryUp = () => {
    const history = state.terminal.history
    if (history.length === 0) {
      return
    }

    if (state.terminal.historyCursor === null) {
      const lastIndex = history.length - 1
      dispatch({ type: GitActionType.SetTerminalDraftInput, payload: state.terminal.input })
      dispatch({ type: GitActionType.SetTerminalHistoryCursor, payload: lastIndex })
      dispatch({ type: GitActionType.SetTerminalInput, payload: history[lastIndex].cmd })
      return
    }

    if (state.terminal.historyCursor > 0) {
      const nextCursor = state.terminal.historyCursor - 1
      dispatch({ type: GitActionType.SetTerminalHistoryCursor, payload: nextCursor })
      dispatch({ type: GitActionType.SetTerminalInput, payload: history[nextCursor].cmd })
    }
  }

  const handleTerminalHistoryDown = () => {
    const history = state.terminal.history
    if (state.terminal.historyCursor === null) {
      return
    }

    if (state.terminal.historyCursor < history.length - 1) {
      const nextCursor = state.terminal.historyCursor + 1
      dispatch({ type: GitActionType.SetTerminalHistoryCursor, payload: nextCursor })
      dispatch({ type: GitActionType.SetTerminalInput, payload: history[nextCursor].cmd })
      return
    }

    dispatch({ type: GitActionType.SetTerminalHistoryCursor, payload: null })
    dispatch({ type: GitActionType.SetTerminalInput, payload: state.terminal.draftInput })
  }

  const handleTerminalSubmit = () => {
    const lines = state.terminal.input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0) {
      dispatch({
        type: GitActionType.SetTerminalInput,
        payload: '',
      })
      dispatch({
        type: GitActionType.SetTerminalHistoryCursor,
        payload: null,
      })
      dispatch({
        type: GitActionType.SetTerminalDraftInput,
        payload: '',
      })
      return
    }

    let nextState = state
    const nextHistory = [...state.terminal.history]
    const timestamp = Date.now()

    lines.forEach((line, index) => {
      const ast = parseCommand(line)
      const result = executeCommand(nextState, ast)
      nextState = result.nextState

      nextHistory.push({
        id: String(timestamp + index),
        cmd: line,
        out: result.out,
        err: result.err,
        timestamp: timestamp + index,
      })
    })

    dispatch({
      type: GitActionType.Initialize,
      payload: {
        ...nextState,
        terminal: {
          ...nextState.terminal,
          history: nextHistory,
          historyCursor: null,
          draftInput: '',
          input: '',
        },
      },
    })

    dispatch({
      type: GitActionType.SetTerminalInput,
      payload: '',
    })
  }

  const handleReset = () => {
    dispatch({
      type: GitActionType.Initialize,
      payload: initialState,
    })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">Git Sandbox</div>
        <div className="app-header-sub">
          {state.meta.initialized ? 'Initialized' : 'Not initialized'} /
          {' '}
          HEAD: {state.head.type === 'symbolic' ? state.head.branch : 'detached'}
          {state.head.commitId ? ` (${state.head.commitId})` : ''}
        </div>
        <div className="app-header-actions">
          <button type="button" className="app-reset-button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </header>

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
            <Editor
              value={state.editorText}
              onChange={(value) =>
                dispatch({ type: GitActionType.EditorSetText, payload: value })
              }
            />
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

export default App
