import { describe, expect, it } from 'vitest'
import { collectReachableCommits } from '../graphUtils'
import type { Commit, HeadRef } from '../../../git/types'

function createCommits(): Record<string, Commit> {
  return {
    c1: {
      id: 'c1',
      message: 'init',
      parents: [],
      branch: 'main',
      lane: 0,
      snapshot: '',
      timestamp: 1,
    },
    c2: {
      id: 'c2',
      message: 'feat',
      parents: ['c1'],
      branch: 'feat',
      lane: 1,
      snapshot: '',
      timestamp: 2,
    },
    c3: {
      id: 'c3',
      message: 'orphan',
      parents: [],
      branch: null,
      lane: 2,
      snapshot: '',
      timestamp: 3,
    },
  }
}

describe('graphUtils', () => {
  it('collects commits reachable from branches and head only', () => {
    const commits = createCommits()
    const branches = { main: 'c1', feat: 'c2' }
    const head: HeadRef = { type: 'symbolic', branch: 'main', commitId: 'c1' }

    expect(Array.from(collectReachableCommits(commits, branches, head)).sort()).toEqual(['c1', 'c2'])
  })
})
