type TokenizeResult = { kind: 'error'; message: string } | string[]

export function tokenize(line: string): TokenizeResult {
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
