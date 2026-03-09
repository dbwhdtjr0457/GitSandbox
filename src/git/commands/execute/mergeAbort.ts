import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { messages } from '../../messages'
import { requireInitialized } from '../../guards'

export function executeMergeAbort(state: GitState): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const mergeConflict = state.meta.mergeConflict
  if (!mergeConflict) {
    return {
      nextState: state,
      out: '',
      err: messages.error.noMergeToAbort(),
    }
  }

  return {
    nextState: {
      ...state,
      editorText: mergeConflict.oursText,
      meta: {
        ...state.meta,
        mergeConflict: null,
      },
    },
    out: messages.output.mergeAborted(),
  }
}
