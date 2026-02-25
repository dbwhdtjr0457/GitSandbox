import type { GitState } from './types'
import { messages } from './messages'
import type { ExecutionResult } from './commands/execute/executeUtils'

export function requireInitialized(state: GitState): ExecutionResult | null {
  if (state.meta.initialized) {
    return null
  }

  return {
    nextState: state,
    out: '',
    err: messages.error.notInitialized(),
  }
}

export function requireBranchExists(state: GitState, branchName: string): ExecutionResult | null {
  if (Object.prototype.hasOwnProperty.call(state.branches, branchName)) {
    return null
  }

  return {
    nextState: state,
    out: '',
    err: messages.error.noSuchBranch(branchName),
  }
}

export function requireCommitExists(state: GitState, commitId: string): ExecutionResult | null {
  if (Object.prototype.hasOwnProperty.call(state.commits, commitId)) {
    return null
  }

  return {
    nextState: state,
    out: '',
    err: messages.error.badRevision(commitId),
  }
}

export function requireSymbolicHead(state: GitState): ExecutionResult | null {
  if (state.head.type === 'symbolic') {
    return null
  }

  return {
    nextState: state,
    out: '',
    err: messages.error.detachedHeadNotSupported(),
  }
}
