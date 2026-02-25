import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId } from './executeUtils'

export function executeStatus(state: GitState): ExecutionResult {
  if (!state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  const headSnapshot = getSnapshotByCommitId(state.head.commitId, state.commits)
  const statusLine =
    state.editorText === headSnapshot
      ? 'nothing to commit (working tree changes not simulated yet)'
      : 'Changes not staged for commit'

  if (state.head.type === 'symbolic') {
    const commitText = state.head.commitId ?? 'no commits yet'
    return {
      nextState: state,
      out: `On branch ${state.head.branch} + HEAD -> ${state.head.branch} (${commitText})\n${statusLine}`,
    }
  }

  const detachedAt = state.head.commitId ?? 'no commits yet'
  return {
    nextState: state,
    out: `HEAD detached at ${detachedAt}\n${statusLine}`,
  }
}
