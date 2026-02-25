import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import type { ParsedCommand } from '../../parse/types'
import { getSnapshotByCommitId } from './executeUtils'
import { messages } from '../../messages'
import { requireBranchExists, requireCommitExists, requireInitialized } from '../../guards'

export function executeCheckout(
  state: GitState,
  cmd: Extract<ParsedCommand, { kind: 'checkout' }>,
): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  if (cmd.refType === 'branch') {
    const branchError = requireBranchExists(state, cmd.name)
    if (branchError) {
      return branchError
    }

    const commitId = state.branches[cmd.name]
    return {
      nextState: {
        ...state,
        head: {
          type: 'symbolic',
          branch: cmd.name,
          commitId,
        },
        editorText: getSnapshotByCommitId(commitId, state.commits),
      },
      out: messages.output.switchedBranch(cmd.name),
    }
  }

  const commitError = requireCommitExists(state, cmd.commitId)
  if (commitError) {
    return commitError
  }

  return {
    nextState: {
      ...state,
      head: {
        type: 'detached',
        commitId: cmd.commitId,
      },
      editorText: getSnapshotByCommitId(cmd.commitId, state.commits),
    },
    out: messages.output.headNowAt(cmd.commitId),
  }
}
