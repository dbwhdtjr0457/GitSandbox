import { describe, expect, it } from 'vitest'
import { collectAncestors, findLCA, getHeadCommitId, isAncestor } from '../utils'
import type { Commit, GitState } from '../types'
import { initialState } from '../reducer'

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
      message: 'main',
      parents: ['c1'],
      branch: 'main',
      lane: 0,
      snapshot: '',
      timestamp: 3,
    },
    c4: {
      id: 'c4',
      message: 'merge',
      parents: ['c3', 'c2'],
      branch: 'main',
      lane: 0,
      snapshot: '',
      timestamp: 4,
    },
  }
}

describe('git utils', () => {
  it('collects ancestors and detects ancestry', () => {
    const commits = createCommits()
    expect(Array.from(collectAncestors(commits, 'c4')).sort()).toEqual(['c1', 'c2', 'c3', 'c4'])
    expect(isAncestor('c1', 'c4', commits)).toBe(true)
    expect(isAncestor('c2', 'c3', commits)).toBe(false)
  })

  it('finds lowest common ancestors across branches', () => {
    const commits = createCommits()
    expect(findLCA(commits, 'c3', 'c2')).toBe('c1')
    expect(findLCA(commits, 'c4', 'c2')).toBe('c2')
  })

  it('returns null for missing head commit references', () => {
    const state: GitState = structuredClone(initialState)
    state.commits = createCommits()
    state.head = { type: 'symbolic', branch: 'main', commitId: 'c4' }
    expect(getHeadCommitId(state)).toBe('c4')

    state.head = { type: 'symbolic', branch: 'main', commitId: 'missing' }
    expect(getHeadCommitId(state)).toBeNull()
  })
})
