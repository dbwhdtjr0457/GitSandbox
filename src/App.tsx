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
    const ast = parseCommand(state.terminal.input)
    const result = executeCommand(state, ast)

    dispatch({
      type: GitActionType.Initialize,
      payload: result.nextState,
    })

    dispatch({
      type: GitActionType.PushTerminalEntry,
      payload: {
        id: String(state.meta.nextId + state.terminal.history.length),
        cmd: state.terminal.input,
        out: result.out,
        err: result.err,
        timestamp: Date.now(),
      },
    })

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
  }

  return (
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
            onInputChange={(value) =>
              {
                dispatch({ type: GitActionType.SetTerminalInput, payload: value })
                dispatch({ type: GitActionType.SetTerminalHistoryCursor, payload: null })
                dispatch({ type: GitActionType.SetTerminalDraftInput, payload: value })
              }
            }
            onSubmit={handleTerminalSubmit}
            onHistoryUp={handleTerminalHistoryUp}
            onHistoryDown={handleTerminalHistoryDown}
          />
        </div>
      </section>
    </div>
  )
}

export default App
