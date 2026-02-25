import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId, hasOwn } from './executeUtils'
import { messages } from '../../messages'
import { requireInitialized } from '../../guards'

export function executeBranch(state: GitState, branchName: string, shouldSwitch: boolean): ExecutionResult {
  if (shouldSwitch) {
    const initError = requireInitialized(state)
    if (initError) {
      return initError
    }
  }

  if (hasOwn(state.branches, branchName)) {
    return {
      nextState: state,
      out: '',
      err: messages.error.branchExists(branchName),
    }
  }

  const lane = hasOwn(state.meta.lanes, branchName) ? state.meta.lanes[branchName] : state.meta.laneCount
  const assignLane = !hasOwn(state.meta.lanes, branchName)

  const nextState: GitState = {
    ...state,
    branches: {
      ...state.branches,
      [branchName]: state.head.commitId,
    },
    meta: {
      ...state.meta,
      lanes: {
        ...state.meta.lanes,
        ...(assignLane ? { [branchName]: lane } : {}),
      },
      laneCount: assignLane ? state.meta.laneCount + 1 : state.meta.laneCount,
    },
  }

  if (!shouldSwitch) {
    return {
      nextState,
      out: messages.output.createdBranch(branchName),
    }
  }

  return {
    nextState: {
      ...nextState,
      head: {
        type: 'symbolic',
        branch: branchName,
        commitId: state.head.commitId,
      },
      editorText: getSnapshotByCommitId(state.head.commitId, state.commits),
    },
    out: messages.output.switchNewBranch(branchName),
  }
}
