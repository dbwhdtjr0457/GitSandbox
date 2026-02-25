import type { Commit, GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { createCommitId, getLaneByName } from './executeUtils'

export function executeRevert(state: GitState, commitId: string): ExecutionResult {
  if (!state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  const targetCommit = state.commits[commitId]
  if (!targetCommit) {
    return {
      nextState: state,
      out: '',
      err: `fatal: bad revision '${commitId}'`,
    }
  }

  const nextCommitId = createCommitId(state)
  const revertCommit: Commit = {
    id: nextCommitId,
    message: `Revert "${targetCommit.message}"`,
    parents: state.head.commitId ? [state.head.commitId] : [],
    branch: state.head.type === 'symbolic' ? state.head.branch : null,
    lane: state.head.type === 'symbolic' ? getLaneByName(state, state.head.branch) : 0,
    snapshot: state.editorText,
    timestamp: Date.now(),
  }

  if (state.head.type === 'symbolic') {
    return {
      nextState: {
        ...state,
        commits: {
          ...state.commits,
          [nextCommitId]: revertCommit,
        },
        branches: {
          ...state.branches,
          [state.head.branch]: nextCommitId,
        },
        head: {
          ...state.head,
          commitId: nextCommitId,
        },
        meta: {
          ...state.meta,
          nextId: state.meta.nextId + 1,
        },
      },
      out: `Reverted ${commitId}.`,
    }
  }

  return {
    nextState: {
      ...state,
      commits: {
        ...state.commits,
        [nextCommitId]: revertCommit,
      },
      head: {
        type: 'detached',
        commitId: nextCommitId,
      },
      meta: {
        ...state.meta,
        nextId: state.meta.nextId + 1,
      },
    },
    out: `Reverted ${commitId}.`,
  }
}
