import type { Commit, GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { createCommitId, getLaneByName } from './executeUtils'
import { messages } from '../../messages'
import { describeCommitForRevert } from '../../messages'
import { requireCommitExists, requireInitialized, requireNoMergeInProgress } from '../../guards'

export function executeRevert(state: GitState, commitId: string): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const mergeError = requireNoMergeInProgress(state)
  if (mergeError) {
    return mergeError
  }

  const commitError = requireCommitExists(state, commitId)
  if (commitError) {
    return commitError
  }

  const targetCommit = state.commits[commitId]
  const nextCommitId = createCommitId(state)
  const revertCommit: Commit = {
    id: nextCommitId,
    message: describeCommitForRevert(targetCommit),
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
      out: messages.output.reverted(commitId),
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
    out: messages.output.reverted(commitId),
  }
}
