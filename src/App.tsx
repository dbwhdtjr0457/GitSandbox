import { useReducer, useState } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { Editor } from './components/Editor'
import { Graph } from './components/Graph'
import { Terminal } from './components/Terminal'
import { initialState, GitActionType, reducer } from './git/reducer'
import { createHistoryDownHandler, createHistoryUpHandler } from './app/terminalHistoryHandlers'
import { createLogStateHandler, createResetHandler, createSubmitHandler } from './app/terminalSubmitHandlers'
import AppTutorialModal from './components/AppTutorialModal'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const handleTerminalHistoryUp = createHistoryUpHandler(state, dispatch)
  const handleTerminalHistoryDown = createHistoryDownHandler(state, dispatch)
  const handleTerminalSubmit = createSubmitHandler(state, dispatch)
  const handleReset = createResetHandler(dispatch, initialState)
  const handleLogState = createLogStateHandler(state)

  return (
    <div className="app-shell">
      <AppHeader
        initialized={state.meta.initialized}
        head={state.head}
        onLogState={handleLogState}
        onReset={handleReset}
        onOpenTutorial={() => setIsTutorialOpen(true)}
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
