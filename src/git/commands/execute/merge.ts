import { findLCA, isAncestor } from '../../utils'
import type { Commit, GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { createCommitId, getLaneByName, ensureRepoInitialized } from './executeUtils'

export function executeMerge(state: GitState, branchName: string): ExecutionResult {
  const initError = ensureRepoInitialized(state)
  if (initError) {
    return initError
  }

  if (state.head.type !== 'symbolic') {
    return {
      nextState: state,
      out: '',
      err: 'fatal: cannot merge while HEAD is detached (MVP not supported)',
    }
  }

  if (!(branchName in state.branches)) {
    return {
      nextState: state,
      out: '',
      err: `fatal: invalid refspec '${branchName}'`,
    }
  }

  const targetCommitId = state.branches[branchName]
  const currentCommitId = state.head.commitId

  if (currentCommitId === targetCommitId) {
    return {
      nextState: state,
      out: 'Already up to date',
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
      out: 'Fast-forward',
    }
  }

  void findLCA(state.commits, currentCommitId, targetCommitId)

  const mergeCommitId = createCommitId(state)
  const mergeCommit: Commit = {
    id: mergeCommitId,
    message: `Merge branch '${branchName}'`,
    parents: [currentCommitId, targetCommitId].filter((id): id is string => id !== null),
    branch: state.head.branch,
    lane: getLaneByName(state, state.head.branch),
    snapshot: state.editorText,
    timestamp: Date.now(),
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
    out: "Merge made by the 'ort' strategy.",
  }
}
