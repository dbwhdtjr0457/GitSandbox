import type { Dispatch } from 'react'
import type { GitAction } from '../git/reducer'
import { GitActionType } from '../git/reducer'
import type { GitState } from '../git/types'
import {
  createCommandSteps,
  parseTerminalLines,
  playCommandSequence,
  runCommandSequence,
} from './commandSequence'

export function runTerminalInput(input: string, baseState: GitState) {
  const lines = parseTerminalLines(input)

  if (lines.length === 0) {
    return { nextState: baseState, history: [...baseState.terminal.history] }
  }

  return runCommandSequence(baseState, createCommandSteps(lines))
}

export function createSubmitHandler(state: GitState, dispatch: Dispatch<GitAction>) {
  return () => {
    void (async () => {
      const lines = parseTerminalLines(state.terminal.input)

      dispatch({
        type: GitActionType.SetTerminalState,
        payload: { input: '', draftInput: '', historyCursor: null },
      })

      if (lines.length === 0) {
        return
      }

      await playCommandSequence({
        baseState: {
          ...state,
          terminal: {
            ...state.terminal,
            input: '',
            draftInput: '',
            historyCursor: null,
          },
        },
        steps: createCommandSteps(lines),
        onStep: (nextState) => {
          dispatch({ type: GitActionType.ApplyExecutionFrame, payload: nextState })
        },
      })
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
    const lines = parseTerminalLines(script)

    if (lines.length === 0) {
      options?.onFinish?.()
      return
    }

    dispatch({
      type: GitActionType.SetTerminalState,
      payload: { input: '', draftInput: '', historyCursor: null },
    })

    await playCommandSequence({
      baseState: {
        ...state,
        terminal: {
          ...state.terminal,
          input: '',
          draftInput: '',
          historyCursor: null,
        },
      },
      steps: createCommandSteps(lines),
      delayMs,
      onStep: (nextState) => {
        dispatch({ type: GitActionType.ApplyExecutionFrame, payload: nextState })
      },
      onStart: options?.onStart,
      onFinish: options?.onFinish,
      onError: options?.onError,
    })
  }
}

export function createResetHandler(
  dispatch: Dispatch<GitAction>,
  initialState: GitState,
): () => void {
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
