import type { Dispatch } from 'react'
import type { GitAction } from '../git/reducer'
import { GitActionType } from '../git/reducer'
import type { GitState } from '../git/types'

export function createHistoryUpHandler(state: GitState, dispatch: Dispatch<GitAction>): () => void {
  return () => {
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
}

export function createHistoryDownHandler(
  state: GitState,
  dispatch: Dispatch<GitAction>,
): () => void {
  return () => {
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
}
