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
      dispatch({
        type: GitActionType.SetTerminalState,
        payload: {
          draftInput: state.terminal.input,
          historyCursor: lastIndex,
          input: history[lastIndex].cmd,
        },
      })
      return
    }

    if (state.terminal.historyCursor > 0) {
      const nextCursor = state.terminal.historyCursor - 1
      dispatch({
        type: GitActionType.SetTerminalState,
        payload: {
          historyCursor: nextCursor,
          input: history[nextCursor].cmd,
        },
      })
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
      dispatch({
        type: GitActionType.SetTerminalState,
        payload: {
          historyCursor: nextCursor,
          input: history[nextCursor].cmd,
        },
      })
      return
    }

    dispatch({
      type: GitActionType.SetTerminalState,
      payload: {
        historyCursor: null,
        input: state.terminal.draftInput,
      },
    })
  }
}
