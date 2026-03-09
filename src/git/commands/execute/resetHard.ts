import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId } from './executeUtils'
import { messages } from '../../messages'
import { requireCommitExists, requireInitialized } from '../../guards'

export function executeResetHard(state: GitState, commitId: string): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const commitError = requireCommitExists(state, commitId)
  if (commitError) {
    return commitError
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
        meta: {
          ...state.meta,
          mergeConflict: null,
        },
      },
      out: messages.output.headNowAt(commitId),
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
      meta: {
        ...state.meta,
        mergeConflict: null,
      },
    },
    out: messages.output.headNowAt(commitId),
  }
}
