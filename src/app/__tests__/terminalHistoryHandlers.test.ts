import { describe, expect, it, vi } from 'vitest'
import { createHistoryDownHandler, createHistoryUpHandler } from '../terminalHistoryHandlers'
import { GitActionType, initialState } from '../../git/reducer'
import type { GitAction } from '../../git/reducer'
import type { GitState } from '../../git/types'

function createState(overrides?: Partial<GitState>): GitState {
  return {
    ...structuredClone(initialState),
    ...overrides,
  }
}

describe('terminalHistoryHandlers', () => {
  it('loads the latest history entry on first ArrowUp and stores draft input', () => {
    const dispatch = vi.fn<(action: GitAction) => void>()
    const state = createState({
      terminal: {
        input: 'git sta',
        draftInput: '',
        historyCursor: null,
        history: [
          { id: '1', cmd: 'git init', out: '', timestamp: 1 },
          { id: '2', cmd: 'git status', out: '', timestamp: 2 },
        ],
      },
    })

    createHistoryUpHandler(state, dispatch)()

    expect(dispatch).toHaveBeenCalledWith({
      type: GitActionType.SetTerminalState,
      payload: {
        draftInput: 'git sta',
        historyCursor: 1,
        input: 'git status',
      },
    })
  })

  it('moves down through history and restores draft input at the end', () => {
    const dispatch = vi.fn<(action: GitAction) => void>()
    const state = createState({
      terminal: {
        input: 'git init',
        draftInput: 'git br',
        historyCursor: 0,
        history: [
          { id: '1', cmd: 'git init', out: '', timestamp: 1 },
          { id: '2', cmd: 'git status', out: '', timestamp: 2 },
        ],
      },
    })

    createHistoryDownHandler(state, dispatch)()
    expect(dispatch).toHaveBeenCalledWith({
      type: GitActionType.SetTerminalState,
      payload: {
        historyCursor: 1,
        input: 'git status',
      },
    })

    dispatch.mockClear()
    const stateAtEnd = createState({
      terminal: {
        ...state.terminal,
        historyCursor: 1,
      },
    })
    createHistoryDownHandler(stateAtEnd, dispatch)()
    expect(dispatch).toHaveBeenCalledWith({
      type: GitActionType.SetTerminalState,
      payload: {
        historyCursor: null,
        input: 'git br',
      },
    })
  })
})
