import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import type { ParsedCommand } from '../../parse/types'
import { getSnapshotByCommitId, hasOwn } from './executeUtils'

export function executeCheckout(
  state: GitState,
  cmd: Extract<ParsedCommand, { kind: 'checkout' }>,
): ExecutionResult {
  if (!state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  if (cmd.refType === 'branch') {
    if (!hasOwn(state.branches, cmd.name)) {
      return {
        nextState: state,
        out: '',
        err: `error: pathspec '${cmd.name}' did not match any branch`,
      }
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
      out: `Switched to branch '${cmd.name}'`,
    }
  }

  if (!hasOwn(state.commits, cmd.commitId)) {
    return {
      nextState: state,
      out: '',
      err: `fatal: bad revision '${cmd.commitId}'`,
    }
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
    out: `HEAD is now at ${cmd.commitId}`,
  }
}
