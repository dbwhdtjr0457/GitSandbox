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

  if (state.head.type !== 'symbolic') {
    return {
      nextState: state,
      out: '',
      err: messages.error.detachedHeadNotSupported(),
    }
  }
  const symbolicHead = state.head

  if (!Object.prototype.hasOwnProperty.call(state.branches, branchName)) {
    return {
      nextState: state,
      out: '',
      err: messages.error.commitRequiredForMerge(branchName),
    }
  }

  const targetCommitId = state.branches[branchName]
  const currentCommitId = symbolicHead.commitId

  if (currentCommitId === targetCommitId) {
    return {
      nextState: state,
      out: messages.output.mergeAlreadyUpToDate(),
    }
  }

  if (isAncestor(currentCommitId, targetCommitId, state.commits)) {
    const currentBranch = symbolicHead.branch

    return {
      nextState: {
        ...state,
        branches: {
          ...state.branches,
          [currentBranch]: targetCommitId,
        },
        head: {
          ...symbolicHead,
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
    branch: symbolicHead.branch,
    lane: getLaneByName(state, symbolicHead.branch),
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
        [symbolicHead.branch]: mergeCommitId,
      },
      head: {
        ...symbolicHead,
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
