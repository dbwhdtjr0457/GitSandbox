import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'

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
      out: 'Reinitialized existing Git repository',
    }
  }

  return {
    nextState,
    out: 'Initialized empty Git sandbox repository.',
  }
}
