import type { GitState } from '../../types'
import type { ExecutionResult } from './executeUtils'

export function executeLogOneline(state: GitState): ExecutionResult {
  if (!state.meta.initialized) {
    return {
      nextState: state,
      out: '',
      err: 'fatal: not a git repository (or any of the parent directories): .git',
    }
  }

  const headCommitId = state.head.commitId
  if (!headCommitId) {
    return {
      nextState: state,
      out: 'No commits yet',
    }
  }

  const lines: string[] = []
  let currentId: string | null = headCommitId
  for (let i = 0; i < 30 && currentId !== null; i += 1) {
    const commit = state.commits[currentId]
    if (!commit) {
      break
    }
    lines.push(`${commit.id} ${commit.message}`)
    currentId = commit.parents[0] ?? null
  }

  if (lines.length === 0) {
    return {
      nextState: state,
      out: 'No commits yet',
    }
  }

  return {
    nextState: state,
    out: lines.join('\n'),
  }
}
