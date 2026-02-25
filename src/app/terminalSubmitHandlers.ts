import type { Dispatch } from 'react'
import { parseCommand } from '../git/parse'
import { executeCommand } from '../git/execute'
import type { GitAction } from '../git/reducer'
import { GitActionType } from '../git/reducer'
import type { GitState } from '../git/types'

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

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
    void (async () => {
      const lines = state.terminal.input
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      const now = Date.now()
      let nextState = state
      const nextHistory = [...state.terminal.history]

      dispatch({ type: GitActionType.SetTerminalInput, payload: '' })
      dispatch({ type: GitActionType.SetTerminalDraftInput, payload: '' })

      if (lines.length === 0) {
        return
      }

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const ast = parseCommand(line)
        const result = executeCommand(nextState, ast)
        nextState = result.nextState

        nextHistory.push({
          id: String(now + index),
          cmd: line,
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

        if (index < lines.length - 1) {
          await sleep(1000)
        }
      }
    })()
  }
}

export function createRunScriptHandler(
  state: GitState,
  dispatch: Dispatch<GitAction>,
  script: string,
  delayMs = 1000,
  options?: {
    onStart?: () => void
    onFinish?: () => void
    onError?: () => void
  },
) {
  return async () => {
    const lines = script
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0) {
      options?.onFinish?.()
      return
    }

    options?.onStart?.()

    try {
      let nextState = state
      const nextHistory = [...state.terminal.history]
      const now = Date.now()

      dispatch({ type: GitActionType.SetTerminalInput, payload: '' })
      dispatch({ type: GitActionType.SetTerminalDraftInput, payload: '' })

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const ast = parseCommand(line)
        const result = executeCommand(nextState, ast)
        nextState = result.nextState

        nextHistory.push({
          id: String(now + index),
          cmd: line,
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

        if (index < lines.length - 1) {
          await sleep(delayMs)
        }
      }

      options?.onFinish?.()
    } catch {
      options?.onError?.()
      options?.onFinish?.()
    }
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
