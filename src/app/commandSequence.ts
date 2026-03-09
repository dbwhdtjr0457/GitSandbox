import { executeCommand } from '../git/execute'
import { parseCommand } from '../git/parse'
import type { GitState, TerminalEntry } from '../git/types'

export type CommandSequenceStep =
  | { type: 'command'; line: string }
  | { type: 'editor'; text: string; historyLine: string }

type PlayCommandSequenceOptions = {
  baseState: GitState
  steps: CommandSequenceStep[]
  delayMs?: number
  onStart?: () => void
  onStep?: (state: GitState) => void
  onFinish?: () => void
  onError?: () => void
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function parseTerminalLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function createCommandSteps(lines: string[]): CommandSequenceStep[] {
  return lines.map((line) => ({ type: 'command', line }))
}

function createHistoryEntry(
  step: CommandSequenceStep,
  state: GitState,
  timestamp: number,
): { entry: TerminalEntry; nextState: GitState } {
  if (step.type === 'editor') {
    return {
      entry: {
        id: String(timestamp),
        cmd: step.historyLine,
        out: step.historyLine,
        timestamp,
      },
      nextState: {
        ...state,
        editorText: step.text,
      },
    }
  }

  const ast = parseCommand(step.line)
  const result = executeCommand(state, ast)
  return {
    entry: {
      id: String(timestamp),
      cmd: step.line,
      out: result.out,
      err: result.err,
      timestamp,
    },
    nextState: result.nextState,
  }
}

function withTerminalFrame(
  state: GitState,
  history: TerminalEntry[],
): GitState {
  return {
    ...state,
    terminal: {
      ...state.terminal,
      history,
      historyCursor: null,
      draftInput: '',
      input: '',
    },
  }
}

export function runCommandSequence(
  baseState: GitState,
  steps: CommandSequenceStep[],
): { nextState: GitState; history: TerminalEntry[] } {
  if (steps.length === 0) {
    return { nextState: baseState, history: [...baseState.terminal.history] }
  }

  let nextState = baseState
  const nextHistory = [...baseState.terminal.history]
  const timestampBase = Date.now()

  steps.forEach((step, index) => {
    const { entry, nextState: steppedState } = createHistoryEntry(step, nextState, timestampBase + index)
    nextHistory.push(entry)
    nextState = withTerminalFrame(steppedState, [...nextHistory])
  })

  return {
    nextState,
    history: nextHistory,
  }
}

export async function playCommandSequence({
  baseState,
  steps,
  delayMs = 1000,
  onStart,
  onStep,
  onFinish,
  onError,
}: PlayCommandSequenceOptions): Promise<GitState> {
  if (steps.length === 0) {
    onFinish?.()
    return baseState
  }

  onStart?.()

  try {
    let nextState = baseState
    const nextHistory = [...baseState.terminal.history]
    const timestampBase = Date.now()

    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index]
      const { entry, nextState: steppedState } = createHistoryEntry(
        step,
        nextState,
        timestampBase + index,
      )

      nextHistory.push(entry)
      nextState = withTerminalFrame(steppedState, [...nextHistory])
      onStep?.(nextState)

      if (index < steps.length - 1) {
        await sleep(delayMs)
      }
    }

    onFinish?.()
    return nextState
  } catch {
    onError?.()
    onFinish?.()
    return baseState
  }
}
