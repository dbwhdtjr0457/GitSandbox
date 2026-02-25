import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId, hasOwn } from './executeUtils'

export function executeSwitch(state: GitState, branchName: string): ExecutionResult {
  if (!hasOwn(state.branches, branchName)) {
    return {
      nextState: state,
      out: '',
      err: `error: pathspec '${branchName}' did not match any branch`,
    }
  }

  const commitId = state.branches[branchName]

  return {
    nextState: {
      ...state,
      head: {
        type: 'symbolic',
        branch: branchName,
        commitId,
      },
      editorText: getSnapshotByCommitId(commitId, state.commits),
    },
    out: `Switched to branch '${branchName}'`,
  }
}
