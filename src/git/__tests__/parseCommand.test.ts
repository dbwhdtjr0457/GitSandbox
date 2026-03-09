import { describe, expect, it } from 'vitest'
import { parseCommand } from '../parse'

describe('parseCommand', () => {
  it('parses git merge --abort separately from merge branch', () => {
    expect(parseCommand('git merge --abort')).toEqual({ kind: 'mergeAbort' })
    expect(parseCommand('git merge feat')).toEqual({ kind: 'merge', name: 'feat' })
  })

  it('returns a merge usage error for invalid merge arguments', () => {
    expect(parseCommand('git merge')).toEqual({
      kind: 'error',
      message: 'Invalid merge command. Usage: git merge <name> | git merge --abort',
    })
  })
})
