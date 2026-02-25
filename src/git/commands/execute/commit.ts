import { createCommitId, getLaneByName } from './executeUtils'
import type { ExecutionResult } from './executeUtils'
import type { Commit, GitState } from '../../types'

export function executeCommit(state: GitState, message: string): ExecutionResult {
  if (!state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  const commitId = createCommitId(state)
  const commitLane = state.head.type === 'symbolic' ? getLaneByName(state, state.head.branch) : 0

  const commit: Commit = {
    id: commitId,
    message,
    parents: state.head.commitId ? [state.head.commitId] : [],
    branch: state.head.type === 'symbolic' ? state.head.branch : null,
    lane: commitLane,
    snapshot: state.editorText,
    timestamp: Date.now(),
  }

  const nextHead =
    state.head.type === 'symbolic'
      ? {
          ...state.head,
          commitId,
        }
      : {
          type: 'detached' as const,
          commitId,
        }

  const nextBranches =
    state.head.type === 'symbolic'
      ? {
          ...state.branches,
          [state.head.branch]: commitId,
        }
      : state.branches

  return {
    nextState: {
      ...state,
      commits: {
        ...state.commits,
        [commitId]: commit,
      },
      branches: nextBranches,
      head: nextHead,
      meta: {
        ...state.meta,
        nextId: state.meta.nextId + 1,
      },
    },
    out: `Created commit ${commitId}`,
  }
}
