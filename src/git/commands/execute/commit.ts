import { createCommitId, getLaneByName } from './executeUtils'
import type { ExecutionResult } from './executeUtils'
import type { Commit, GitState } from '../../types'
import { messages } from '../../messages'
import { requireInitialized } from '../../guards'

export function executeCommit(state: GitState, message: string): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const mergeConflict = state.meta.mergeConflict
  if (mergeConflict && !mergeConflict.resolved) {
    return {
      nextState: state,
      out: '',
      err: messages.error.commitNotPossibleBecauseUnmerged(),
    }
  }

  const commitId = createCommitId(state)
  const commitLane = state.head.type === 'symbolic' ? getLaneByName(state, state.head.branch) : 0

  const commit: Commit = {
    id: commitId,
    message: mergeConflict ? message || mergeConflict.branchMergeMessage : message,
    parents: mergeConflict
      ? [mergeConflict.oursCommitId, mergeConflict.theirsCommitId].filter(
          (id): id is string => id !== null,
        )
      : state.head.commitId
        ? [state.head.commitId]
        : [],
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
        mergeConflict: null,
      },
    },
    out: messages.output.createdCommit(commitId),
  }
}
