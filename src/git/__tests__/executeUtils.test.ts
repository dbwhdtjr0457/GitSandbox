import { describe, expect, it } from 'vitest'
import {
  createCommitId,
  ensureRepoInitialized,
  getLaneByName,
  getSnapshotByCommitId,
  hasOwn,
  isInitialized,
} from '../commands/execute/executeUtils'
import { initialState } from '../reducer'
import type { GitState } from '../types'

function createState(): GitState {
  return structuredClone(initialState)
}

describe('executeUtils', () => {
  it('exposes repo initialization helpers', () => {
    const state = createState()
    expect(isInitialized(state)).toBe(false)
    expect(ensureRepoInitialized(state)?.err).toContain('not a git repository')
    state.meta.initialized = true
    expect(isInitialized(state)).toBe(true)
    expect(ensureRepoInitialized(state)).toBeNull()
  })

  it('reads commit snapshots and lane ids safely', () => {
    const state = createState()
    state.commits.c1 = {
      id: 'c1',
      message: 'init',
      parents: [],
      branch: 'main',
      lane: 0,
      snapshot: 'hello',
      timestamp: 1,
    }
    state.meta.lanes.main = 2

    expect(getSnapshotByCommitId('c1', state.commits)).toBe('hello')
    expect(getSnapshotByCommitId(null, state.commits)).toBe('')
    expect(getLaneByName(state, 'main')).toBe(2)
    expect(getLaneByName(state, 'missing')).toBe(0)
  })

  it('provides basic object and commit id helpers', () => {
    const state = createState()
    state.meta.nextId = 7

    expect(createCommitId(state)).toBe('c7')
    expect(hasOwn({ a: 1 }, 'a')).toBe(true)
    expect(hasOwn({ a: 1 }, 'b')).toBe(false)
  })
})
