import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { getSnapshotByCommitId } from './executeUtils'
import { messages } from '../../messages'
import { requireInitialized } from '../../guards'

export function executeStatus(state: GitState): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const mergeConflict = state.meta.mergeConflict
  if (mergeConflict) {
    const mergeLine = mergeConflict.resolved
      ? `${messages.output.statusAllConflictsFixed()}\n${messages.output.statusCommitMergeHint()}`
      : `${messages.output.statusUnmergedPaths()}\n${messages.output.statusResolveConflictHint()}`

    if (state.head.type === 'symbolic') {
      const commitText = state.head.commitId ?? 'no commits yet'
      return {
        nextState: state,
        out: `${messages.output.statusOnBranch(state.head.branch, commitText)}\n${mergeLine}`,
      }
    }

    const detachedAt = state.head.commitId ?? 'no commits yet'
    return {
      nextState: state,
      out: `${messages.output.statusHeadDetached(detachedAt)}\n${mergeLine}`,
    }
  }

  const headSnapshot = getSnapshotByCommitId(state.head.commitId, state.commits)
  const statusLine =
    state.editorText === headSnapshot
      ? messages.output.statusNoChanges()
      : messages.output.statusDirty()

  if (state.head.type === 'symbolic') {
    const commitText = state.head.commitId ?? 'no commits yet'
    return {
      nextState: state,
      out: `${messages.output.statusOnBranch(state.head.branch, commitText)}\n${statusLine}`,
    }
  }

  const detachedAt = state.head.commitId ?? 'no commits yet'
  return {
    nextState: state,
    out: `${messages.output.statusHeadDetached(detachedAt)}\n${statusLine}`,
  }
}
