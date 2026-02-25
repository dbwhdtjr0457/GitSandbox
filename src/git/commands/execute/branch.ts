import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId, hasOwn } from './executeUtils'

export function executeBranch(state: GitState, branchName: string, shouldSwitch: boolean): ExecutionResult {
  if (shouldSwitch && !state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  if (hasOwn(state.branches, branchName)) {
    return {
      nextState: state,
      out: '',
      err: `fatal: A branch named '${branchName}' already exists.`,
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
      out: `Created branch ${branchName}`,
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
    out: `Created and switched to new branch '${branchName}'`,
  }
}
