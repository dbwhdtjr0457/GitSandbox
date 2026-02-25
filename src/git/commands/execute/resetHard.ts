import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId, hasOwn } from './executeUtils'

export function executeResetHard(state: GitState, commitId: string): ExecutionResult {
  if (!state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  if (!hasOwn(state.commits, commitId)) {
    return {
      nextState: state,
      out: '',
      err: `fatal: bad revision '${commitId}'`,
    }
  }

  const nextEditorText = getSnapshotByCommitId(commitId, state.commits)

  if (state.head.type === 'symbolic') {
    return {
      nextState: {
        ...state,
        head: {
          ...state.head,
          commitId,
        },
        branches: {
          ...state.branches,
          [state.head.branch]: commitId,
        },
        editorText: nextEditorText,
      },
      out: `HEAD is now at ${commitId}`,
    }
  }

  return {
    nextState: {
      ...state,
      head: {
        type: 'detached',
        commitId,
      },
      editorText: nextEditorText,
    },
    out: `HEAD is now at ${commitId}`,
  }
}
