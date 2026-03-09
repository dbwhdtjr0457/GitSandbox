import { tokenize } from './tokenize'
import type { ParsedCommand } from './types'

const commitIdPattern = /^c\d+$/

export function parseCommand(line: string): ParsedCommand {
  const trimmed = line.trim()
  if (trimmed.length === 0) {
    return { kind: 'error', message: 'Command is empty.' }
  }

  const tokenized = tokenize(trimmed)
  if (!Array.isArray(tokenized)) {
    return tokenized
  }
  const tokens = tokenized

  if (tokens.length === 1 && tokens[0] === 'help') {
    return { kind: 'help' }
  }

  if (tokens.length < 2 || tokens[0] !== 'git') {
    return { kind: 'error', message: 'Unknown command. Use help.' }
  }

  const command = tokens[1]
  const args = tokens.slice(2)

  if (command === 'init' && args.length === 0) {
    return { kind: 'init' }
  }

  if (command === 'commit') {
    if (args.length === 2 && args[0] === '-m') {
      return { kind: 'commit', message: args[1] }
    }
    return { kind: 'error', message: 'Invalid commit command. Usage: git commit -m "message"' }
  }

  if (command === 'branch' && args.length === 1) {
    return { kind: 'branch', name: args[0] }
  }

  if (command === 'switch') {
    if (args.length === 1) {
      return { kind: 'switch', name: args[0] }
    }
    if (args.length === 2 && args[0] === '-c') {
      return { kind: 'switchCreate', name: args[1] }
    }
    return {
      kind: 'error',
      message: 'Invalid switch command. Usage: git switch <name> or git switch -c <name>',
    }
  }

  if (command === 'merge') {
    if (args.length === 1 && args[0] === '--abort') {
      return { kind: 'mergeAbort' }
    }
    if (args.length === 1) {
      return { kind: 'merge', name: args[0] }
    }
    return { kind: 'error', message: 'Invalid merge command. Usage: git merge <name> | git merge --abort' }
  }

  if (command === 'revert' && args.length === 1) {
    const commitId = args[0]
    if (!commitIdPattern.test(commitId)) {
      return { kind: 'error', message: 'Invalid revert command. Usage: git revert <commitId>' }
    }
    return { kind: 'revert', commitId }
  }

  if (command === 'reset' && args.length === 2 && args[0] === '--hard') {
    const commitId = args[1]
    if (!commitIdPattern.test(commitId)) {
      return { kind: 'error', message: 'Invalid commit id. Usage: git reset --hard <commitId>' }
    }
    return { kind: 'resetHard', commitId }
  }

  if (command === 'status' && args.length === 0) {
    return { kind: 'status' }
  }

  if (command === 'log' && args.length === 1 && args[0] === '--oneline') {
    return { kind: 'logOneline' }
  }

  if (command === 'checkout' && args.length === 1) {
    const ref = args[0]
    if (commitIdPattern.test(ref)) {
      return { kind: 'checkout', refType: 'commit', commitId: ref }
    }
    return { kind: 'checkout', refType: 'branch', name: ref }
  }

  return { kind: 'error', message: 'Unknown git subcommand. Use help.' }
}
