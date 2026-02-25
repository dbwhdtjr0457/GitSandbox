type ParsedCommand =
  | { kind: 'init' }
  | { kind: 'commit', message: string }
  | { kind: 'branch', name: string }
  | { kind: 'switch', name: string }
  | { kind: 'switchCreate', name: string }
  | { kind: 'merge', name: string }
  | { kind: 'help' }
  | { kind: 'error', message: string }

function tokenize(line: string): { kind: 'error'; message: string } | string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]

    if (quote) {
      if (ch === quote) {
        quote = null
        continue
      }
      current += ch
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }

    if (ch === ' ' || ch === '\t') {
      if (current.length > 0) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += ch
  }

  if (quote) {
    return { kind: 'error', message: 'Unclosed quote in command line.' }
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

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

  // Examples:
  // git init
  // git commit -m "first commit"
  // git commit -m no-quotes
  // git branch feat/login
  // git switch main
  // git switch -c feat/api
  // git merge main
  // help

  if (tokens.length === 1 && tokens[0] === 'help') {
    return { kind: 'help' }
  }

  if (tokens.length < 2 || tokens[0] !== 'git') {
    return { kind: 'error', message: 'Unknown command. Use help.' }
  }

  if (tokens[1] === 'init' && tokens.length === 2) {
    return { kind: 'init' }
  }

  if (tokens[1] === 'commit') {
    if (tokens.length === 4 && tokens[2] === '-m') {
      return { kind: 'commit', message: tokens[3] }
    }
    return { kind: 'error', message: 'Invalid commit command. Usage: git commit -m "message"' }
  }

  if (tokens[1] === 'branch' && tokens.length === 3) {
    return { kind: 'branch', name: tokens[2] }
  }

  if (tokens[1] === 'switch') {
    if (tokens.length === 3) {
      return { kind: 'switch', name: tokens[2] }
    }
    if (tokens.length === 4 && tokens[2] === '-c') {
      return { kind: 'switchCreate', name: tokens[3] }
    }
    return {
      kind: 'error',
      message: 'Invalid switch command. Usage: git switch <name> or git switch -c <name>',
    }
  }

  if (tokens[1] === 'merge' && tokens.length === 3) {
    return { kind: 'merge', name: tokens[2] }
  }

  return { kind: 'error', message: 'Unknown git subcommand. Use help.' }
}

export type { ParsedCommand }
