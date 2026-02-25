import type { Commit, GitState } from '../../types'

export const NOT_REPO_ERROR = 'fatal: not a git repository (or any of the parent directories): .git'

export type ExecutionResult = {
  nextState: GitState
  out: string
  err?: string
}

export function isInitialized(state: GitState): boolean {
  return state.meta.initialized
}

export function hasOwn<T extends object>(obj: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function getSnapshotByCommitId(commitId: string | null, commits: Record<string, Commit>): string {
  if (!commitId) {
    return ''
  }

  const commit = commits[commitId]
  return commit?.snapshot ?? ''
}

export function getLaneByName(state: GitState, branch: string): number {
  const lane = state.meta.lanes[branch]
  return lane !== undefined && lane !== null ? lane : 0
}

export function ensureRepoInitialized(state: GitState): ExecutionResult | null {
  if (state.meta.initialized) {
    return null
  }

  return {
    nextState: state,
    out: '',
    err: NOT_REPO_ERROR,
  }
}

export function createCommitId(state: GitState): string {
  return `c${state.meta.nextId}`
}
