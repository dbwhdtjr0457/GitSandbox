import { describe, expect, it } from 'vitest'
import {
  requireBranchExists,
  requireCommitExists,
  requireInitialized,
  requireNoMergeInProgress,
  requireSymbolicHead,
} from '../guards'
import { initialState } from '../reducer'
import type { GitState } from '../types'

function createState(): GitState {
  return structuredClone(initialState)
}

describe('guards', () => {
  it('returns initialization error when repository is not initialized', () => {
    const result = requireInitialized(createState())
    expect(result?.err).toBe('fatal: not a git repository (or any of the parent directories): .git')
  })

  it('validates existing branches and commits', () => {
    const state = createState()
    state.branches.main = 'c1'
    state.commits.c1 = {
      id: 'c1',
      message: 'init',
      parents: [],
      branch: 'main',
      lane: 0,
      snapshot: '',
      timestamp: 1,
    }

    expect(requireBranchExists(state, 'main')).toBeNull()
    expect(requireCommitExists(state, 'c1')).toBeNull()
    expect(requireBranchExists(state, 'feat')?.err).toContain("pathspec 'feat'")
    expect(requireCommitExists(state, 'c2')?.err).toContain("bad revision 'c2'")
  })

  it('requires symbolic head and no active merge when applicable', () => {
    const detached = createState()
    detached.head = { type: 'detached', commitId: 'c1' }
    expect(requireSymbolicHead(detached)?.err).toContain('cannot merge while HEAD is detached')

    const merging = createState()
    merging.meta.mergeConflict = {
      inProgress: true,
      resolved: false,
      oursBranch: 'main',
      theirsBranch: 'feat',
      oursCommitId: 'c1',
      theirsCommitId: 'c2',
      oursText: 'a',
      theirsText: 'b',
      branchMergeMessage: "Merge branch 'feat'",
    }
    expect(requireNoMergeInProgress(merging)?.err).toBe(
      'error: you need to resolve your current index first',
    )
  })
})
