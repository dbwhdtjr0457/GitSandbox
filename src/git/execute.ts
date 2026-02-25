import type { ParsedCommand as CommandAst } from './parse'
import type { GitState } from './types'
import {
  executeBranch,
  executeCheckout,
  executeCommit,
  executeHelp,
  executeInit,
  executeLogOneline,
  executeMerge,
  executeRevert,
  executeResetHard,
  executeStatus,
  executeSwitch,
} from './commands/execute'
import type { ExecutionResult } from './commands/execute/executeUtils'

export { type ExecutionResult } from './commands/execute/executeUtils'

export function executeCommand(state: GitState, cmd: CommandAst): ExecutionResult {
  if (cmd.kind === 'help') {
    return executeHelp(state)
  }
  if (cmd.kind === 'init') {
    return executeInit(state)
  }
  if (cmd.kind === 'commit') {
    return executeCommit(state, cmd.message)
  }
  if (cmd.kind === 'branch') {
    return executeBranch(state, cmd.name, false)
  }
  if (cmd.kind === 'switch') {
    return executeSwitch(state, cmd.name)
  }
  if (cmd.kind === 'switchCreate') {
    return executeBranch(state, cmd.name, true)
  }
  if (cmd.kind === 'checkout') {
    return executeCheckout(state, cmd)
  }
  if (cmd.kind === 'merge') {
    return executeMerge(state, cmd.name)
  }
  if (cmd.kind === 'revert') {
    return executeRevert(state, cmd.commitId)
  }
  if (cmd.kind === 'resetHard') {
    return executeResetHard(state, cmd.commitId)
  }
  if (cmd.kind === 'status') {
    return executeStatus(state)
  }
  if (cmd.kind === 'logOneline') {
    return executeLogOneline(state)
  }
  return {
    nextState: state,
    out: '',
    err: cmd.kind === 'error' ? cmd.message : 'Unhandled command.',
  }
}
