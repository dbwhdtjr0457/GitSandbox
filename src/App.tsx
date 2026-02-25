import { useReducer, useState } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { Editor } from './components/Editor'
import { ConflictResolver } from './components/ConflictResolver'
import { Graph } from './components/Graph'
import { Terminal } from './components/Terminal'
import { initialState, GitActionType, reducer } from './git/reducer'
import { createHistoryDownHandler, createHistoryUpHandler } from './app/terminalHistoryHandlers'
import { createLogStateHandler, createResetHandler, createSubmitHandler } from './app/terminalSubmitHandlers'
import AppTutorialModal from './components/AppTutorialModal'

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const handleTerminalHistoryUp = createHistoryUpHandler(state, dispatch)
  const handleTerminalHistoryDown = createHistoryDownHandler(state, dispatch)
  const handleTerminalSubmit = createSubmitHandler(state, dispatch)
  const handleReset = createResetHandler(dispatch, initialState)
  const handleLogState = createLogStateHandler(state)
  const mergeConflict = state.meta.mergeConflict

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
