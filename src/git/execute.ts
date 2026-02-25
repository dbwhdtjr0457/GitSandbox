import type { ParsedCommand as CommandAst } from './parse'
import type { GitState } from './types'
import type { ExecutionResult } from './commands/execute/executeUtils'
import { messages } from './messages'
import { executeBranch } from './commands/execute/branch'
import { executeCheckout } from './commands/execute/checkout'
import { executeCommit } from './commands/execute/commit'
import { executeHelp } from './commands/execute/help'
import { executeInit } from './commands/execute/init'
import { executeLogOneline } from './commands/execute/logOneline'
import { executeMerge } from './commands/execute/merge'
import { executeRevert } from './commands/execute/revert'
import { executeResetHard } from './commands/execute/resetHard'
import { executeStatus } from './commands/execute/status'
import { executeSwitch } from './commands/execute/switch'

export { type ExecutionResult } from './commands/execute/executeUtils'

export function executeCommand(state: GitState, cmd: CommandAst): ExecutionResult {
  switch (cmd.kind) {
    case 'help':
      return executeHelp(state)
    case 'init':
      return executeInit(state)
    case 'commit':
      return executeCommit(state, cmd.message)
    case 'branch':
      return executeBranch(state, cmd.name, false)
    case 'switch':
      return executeSwitch(state, cmd.name)
    case 'switchCreate':
      return executeBranch(state, cmd.name, true)
    case 'checkout':
      return executeCheckout(state, cmd)
    case 'merge':
      return executeMerge(state, cmd.name)
    case 'revert':
      return executeRevert(state, cmd.commitId)
    case 'resetHard':
      return executeResetHard(state, cmd.commitId)
    case 'status':
      return executeStatus(state)
    case 'logOneline':
      return executeLogOneline(state)
    default:
      return {
        nextState: state,
        out: '',
        err: cmd.kind === 'error' ? cmd.message : messages.error.unhandledCommand(),
      }
  }
}
