import type { Dispatch } from 'react'
import { parseCommand } from '../git/parse'
import { executeCommand } from '../git/execute'
import type { GitAction } from '../git/reducer'
import { GitActionType } from '../git/reducer'
import type { GitState } from '../git/types'

export function runTerminalInput(input: string, baseState: GitState) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { nextState: baseState, history: [...baseState.terminal.history] }
  }

  let nextState = baseState
  const nextHistory = [...baseState.terminal.history]
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

  return { nextState, history: nextHistory }
}

export function createSubmitHandler(
  state: GitState,
  dispatch: Dispatch<GitAction>,
) {
  return () => {
    const result = runTerminalInput(state.terminal.input, state)

    dispatch({
      type: GitActionType.Initialize,
      payload: {
        ...result.nextState,
        terminal: {
          ...result.nextState.terminal,
          history: result.history,
          historyCursor: null,
          draftInput: '',
          input: '',
        },
      },
    })

    dispatch({ type: GitActionType.SetTerminalInput, payload: '' })
  }
}

export function createResetHandler(dispatch: Dispatch<GitAction>, initialState: GitState): () => void {
  return () => {
    dispatch({ type: GitActionType.Initialize, payload: initialState })
  }
}

export function createLogStateHandler(state: GitState): () => void {
  return () => {
    console.group('Git Sandbox State')
    console.log({
      initialized: state.meta.initialized,
      nextId: state.meta.nextId,
      laneCount: state.meta.laneCount,
      head: state.head,
      editorText: state.editorText,
      branches: state.branches,
      commits: state.commits,
      lanes: state.meta.lanes,
      terminal: state.terminal,
    })
    console.groupEnd()
  }
}
