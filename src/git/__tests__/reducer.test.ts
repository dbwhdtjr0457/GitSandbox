import { describe, expect, it } from 'vitest'
import { GitActionType, initialState, reducer } from '../reducer'

describe('reducer', () => {
  it('merges partial terminal state updates', () => {
    const state = reducer(initialState, {
      type: GitActionType.SetTerminalState,
      payload: {
        input: 'git status',
        draftInput: 'git status',
      },
    })

    expect(state.terminal.input).toBe('git status')
    expect(state.terminal.draftInput).toBe('git status')
    expect(state.terminal.historyCursor).toBeNull()
  })

  it('replaces state for execution frames', () => {
    const payload = {
      ...structuredClone(initialState),
      editorText: 'updated',
    }

    const state = reducer(initialState, {
      type: GitActionType.ApplyExecutionFrame,
      payload,
    })

    expect(state).toEqual(payload)
  })

  it('updates merge conflict metadata independently', () => {
    const conflict = {
      inProgress: true,
      resolved: false,
      oursBranch: 'main',
      theirsBranch: 'feat',
      oursCommitId: 'c1',
      theirsCommitId: 'c2',
      oursText: 'main text',
      theirsText: 'feat text',
      branchMergeMessage: "Merge branch 'feat'",
    }

    const state = reducer(initialState, {
      type: GitActionType.SetMergeConflict,
      payload: conflict,
    })

    expect(state.meta.mergeConflict).toEqual(conflict)
  })
})
