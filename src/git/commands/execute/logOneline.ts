import type { Commit, GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'
import { logSummaryLine, messages } from '../../messages'
import { requireInitialized } from '../../guards'

export function executeLogOneline(state: GitState): ExecutionResult {
  const initError = requireInitialized(state)
  if (initError) {
    return initError
  }

  const headCommitId = state.head.commitId
  if (!headCommitId) {
    return {
      nextState: state,
      out: messages.output.noCommitsYet(),
    }
  }

  const lines: string[] = []
  let currentId: string | null = headCommitId
  for (let i = 0; i < 30 && currentId !== null; i += 1) {
    const commit: Commit | undefined = state.commits[currentId]
    if (!commit) {
      break
    }
    lines.push(logSummaryLine(commit))
    currentId = commit.parents[0] ?? null
  }

  if (lines.length === 0) {
    return {
      nextState: state,
      out: messages.output.noCommitsYet(),
    }
  }

  return {
    nextState: state,
    out: lines.join('\n'),
  }
}
