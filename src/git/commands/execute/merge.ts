import { findLCA, isAncestor } from '../../utils'
import type { Commit, GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { createCommitId, getLaneByName, getSnapshotByCommitId } from './executeUtils'
import { messages } from '../../messages'
import {
  requireBranchExists,
  requireInitialized,
  requireNoMergeInProgress,
  requireSymbolicHead,
} from '../../guards'

function createConflictText(
  oursBranch: string,
  theirsBranch: string,
  oursText: string,
  theirsText: string,
): string {
  return `<<<<<<< ${oursBranch}\n${oursText}\n=======\n${theirsText}\n>>>>>>> ${theirsBranch}`
}

export function executeMerge(state: GitState, branchName: string): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const mergeError = requireNoMergeInProgress(state, messages.error.mergeNotPossibleBecauseUnmerged())
  if (mergeError) {
    return mergeError
  }

  const headRef = state.head
  if (headRef.type !== 'symbolic') {
    const symbolicError = requireSymbolicHead(state)
    if (symbolicError) {
      return symbolicError
    }
    return {
      nextState: state,
      out: '',
      err: messages.error.detachedHeadNotSupported(),
    }
  }

  const symbolicHead = headRef
  const branchError = requireBranchExists(state, branchName)
  if (branchError) {
    return branchError
  }

  const targetCommitId = state.branches[branchName]
  if (targetCommitId === null) {
    return {
      nextState: {
        ...state,
        meta: {
          ...state.meta,
          mergeConflict: null,
        },
      },
      out: messages.output.mergeAlreadyUpToDate(),
    }
  }

  const currentCommitId = symbolicHead.commitId
  if (currentCommitId === targetCommitId) {
    return {
      nextState: {
        ...state,
        meta: {
          ...state.meta,
          mergeConflict: null,
        },
      },
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
        meta: {
          ...state.meta,
          mergeConflict: null,
        },
        editorText: targetCommitId
          ? (state.commits[targetCommitId]?.snapshot ?? '')
          : state.editorText,
      },
      out: messages.output.mergeFastForward(),
    }
  }

  const baseId = findLCA(state.commits, currentCommitId, targetCommitId)
  const oursText = getSnapshotByCommitId(currentCommitId, state.commits)
  const theirsText = getSnapshotByCommitId(targetCommitId, state.commits)
  const hasConflict = oursText !== theirsText

  if (hasConflict) {
    return {
      nextState: {
        ...state,
        editorText: createConflictText(symbolicHead.branch, branchName, oursText, theirsText),
        meta: {
          ...state.meta,
          mergeConflict: {
            inProgress: true,
            resolved: false,
            oursBranch: symbolicHead.branch,
            theirsBranch: branchName,
            oursCommitId: currentCommitId,
            theirsCommitId: targetCommitId,
            oursText,
            theirsText,
            branchMergeMessage: `Merge branch '${branchName}'`,
          },
        },
      },
      out: messages.output.mergeConflictDetected(),
    }
  }

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
        mergeConflict: null,
      },
    },
    out: messages.output.mergeMadeByOrt(),
  }
}
