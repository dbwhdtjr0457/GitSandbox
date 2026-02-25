import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId } from './executeUtils'
import { messages } from '../../messages'
import { requireBranchExists } from '../../guards'

export function executeSwitch(state: GitState, branchName: string): ExecutionResult {
  const branchError = requireBranchExists(state, branchName)
  if (branchError) {
    return branchError
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
    out: messages.output.switchedBranch(branchName),
  }
}
