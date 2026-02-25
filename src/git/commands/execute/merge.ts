import { findLCA, isAncestor } from '../../utils'
import type { Commit, GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { createCommitId, getLaneByName } from './executeUtils'
import { messages } from '../../messages'
import { requireInitialized, requireSymbolicHead } from '../../guards'

export function executeMerge(state: GitState, branchName: string): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const symbolicError = requireSymbolicHead(state)
  if (symbolicError) {
    return symbolicError
  }

  if (!Object.prototype.hasOwnProperty.call(state.branches, branchName)) {
    return {
      nextState: state,
      out: '',
      err: messages.error.commitRequiredForMerge(branchName),
    }
  }

  const targetCommitId = state.branches[branchName]
  const currentCommitId = state.head.commitId

  if (currentCommitId === targetCommitId) {
    return {
      nextState: state,
      out: messages.output.mergeAlreadyUpToDate(),
    }
  }

  if (isAncestor(currentCommitId, targetCommitId, state.commits)) {
    return {
      nextState: {
        ...state,
        branches: {
          ...state.branches,
          [state.head.branch]: targetCommitId,
        },
        head: {
          ...state.head,
          commitId: targetCommitId,
        },
        editorText: targetCommitId ? state.commits[targetCommitId]?.snapshot ?? '' : state.editorText,
      },
      out: messages.output.mergeFastForward(),
    }
  }

  const baseId = findLCA(state.commits, currentCommitId, targetCommitId)

  const mergeCommitId = createCommitId(state)
  const mergeCommit: Commit = {
    id: mergeCommitId,
    message: `Merge branch '${branchName}'`,
    parents: [currentCommitId, targetCommitId].filter((id): id is string => id !== null),
    branch: state.head.branch,
    lane: getLaneByName(state, state.head.branch),
    snapshot: state.editorText,
    timestamp: Date.now(),
    mergeBase: baseId,
  }

  return {
    nextState: {
      ...state,
      commits: {
        ...state.commits,
        [mergeCommitId]: mergeCommit,
      },
      branches: {
        ...state.branches,
        [state.head.branch]: mergeCommitId,
      },
      head: {
        ...state.head,
        commitId: mergeCommitId,
      },
      meta: {
        ...state.meta,
        nextId: state.meta.nextId + 1,
      },
    },
    out: messages.output.mergeMadeByOrt(),
  }
}
