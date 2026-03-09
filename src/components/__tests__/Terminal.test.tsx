import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Terminal } from '../Terminal'
import type { TerminalEntry } from '../../git/types'

function createEntry(id: string, cmd: string, out = ''): TerminalEntry {
  return {
    id,
    cmd,
    out,
    timestamp: Number(id),
  }
}

describe('Terminal', () => {
  it('submits on Enter and routes history navigation through arrow keys', async () => {
    const user = userEvent.setup()
    const onInputChange = vi.fn()
    const onSubmit = vi.fn()
    const onHistoryUp = vi.fn()
    const onHistoryDown = vi.fn()

    render(
      <Terminal
        input="git status"
        history={[]}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onHistoryUp={onHistoryUp}
        onHistoryDown={onHistoryDown}
      />,
    )

    const input = screen.getByPlaceholderText('Type command and press Enter')
    await user.click(input)
    await user.keyboard('{Enter}')
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Shift>}{Enter}{/Shift}')

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onHistoryUp).toHaveBeenCalledTimes(1)
    expect(onHistoryDown).toHaveBeenCalledTimes(1)
    expect(onInputChange).toHaveBeenCalledTimes(1)
    expect(onInputChange).toHaveBeenLastCalledWith('git status\n')
  })

  it('scrolls the history panel to the latest entry after updates', async () => {
    const history = [createEntry('1', 'git init', 'Initialized empty Git sandbox repository.')]
    const { container, rerender } = render(
      <Terminal
        input=""
        history={history}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onHistoryUp={() => {}}
        onHistoryDown={() => {}}
      />,
    )

    const historyPane = container.querySelector('.terminal-history')
    if (!historyPane) {
      throw new Error('Terminal history pane was not rendered.')
    }

    Object.defineProperty(historyPane, 'scrollHeight', {
      configurable: true,
      value: 640,
    })

    rerender(
      <Terminal
        input=""
        history={[...history, createEntry('2', 'git status', 'nothing to commit')]}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onHistoryUp={() => {}}
        onHistoryDown={() => {}}
      />,
    )

    await waitFor(() => {
      expect(historyPane.scrollTop).toBe(640)
    })
  })
})
