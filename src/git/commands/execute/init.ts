import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { messages } from '../../messages'

export function executeInit(state: GitState): ExecutionResult {
  const nextState: GitState = {
    ...state,
    commits: {},
    editorText: '',
    branches: {
      ...state.branches,
      main: null,
    },
    head: {
      type: 'symbolic',
      branch: 'main',
      commitId: null,
    },
    meta: {
      ...state.meta,
      initialized: true,
      lanes: {
        ...state.meta.lanes,
        main: 0,
      },
      laneCount: 1,
    },
  }

  if (state.meta.initialized) {
    return {
      nextState,
      out: messages.output.reinitialized(),
    }
  }

  return {
    nextState,
    out: messages.output.initialized(),
  }
}
