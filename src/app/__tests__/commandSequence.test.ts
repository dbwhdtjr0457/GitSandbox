import { describe, expect, it, vi } from 'vitest'
import {
  createCommandSteps,
  parseTerminalLines,
  playCommandSequence,
  runCommandSequence,
  type CommandSequenceStep,
} from '../commandSequence'
import { initialState } from '../../git/reducer'
import type { GitState } from '../../git/types'

function createState(): GitState {
  return structuredClone(initialState)
}

describe('commandSequence', () => {
  it('parses multiline terminal input into trimmed command lines', () => {
    expect(parseTerminalLines(' git init \n\n  git status \r\n')).toEqual(['git init', 'git status'])
  })

  it('creates command-only steps from lines', () => {
    expect(createCommandSteps(['git init', 'git status'])).toEqual([
      { type: 'command', line: 'git init' },
      { type: 'command', line: 'git status' },
    ])
  })

  it('runs mixed command and editor steps and appends terminal history', () => {
    const baseState = createState()
    const steps: CommandSequenceStep[] = [
      { type: 'command', line: 'git init' },
      { type: 'editor', text: 'draft text', historyLine: '(test) editor update' },
      { type: 'command', line: 'git commit -m "init"' },
    ]

    const result = runCommandSequence(baseState, steps)

    expect(result.nextState.editorText).toBe('draft text')
    expect(result.nextState.head.commitId).toBe('c1')
    expect(result.history).toHaveLength(3)
    expect(result.history[1].cmd).toBe('(test) editor update')
    expect(result.history[2].cmd).toBe('git commit -m "init"')
    expect(result.nextState.terminal.input).toBe('')
    expect(result.nextState.terminal.draftInput).toBe('')
    expect(result.nextState.terminal.historyCursor).toBeNull()
  })

  it('invokes async sequence callbacks in order', async () => {
    const baseState = createState()
    const onStart = vi.fn()
    const onStep = vi.fn()
    const onFinish = vi.fn()

    const finalState = await playCommandSequence({
      baseState,
      steps: createCommandSteps(['git init', 'git commit -m "init"']),
      delayMs: 0,
      onStart,
      onStep,
      onFinish,
    })

    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onStep).toHaveBeenCalledTimes(2)
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(finalState.head.commitId).toBe('c1')
  })
})
