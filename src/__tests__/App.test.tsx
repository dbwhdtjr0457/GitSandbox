import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { renderWithProviders } from '../test/renderWithProviders'

const LOCALE_KEY = 'gitsandbox-locale'

async function submitTerminalCommand(line: string) {
  const user = userEvent.setup()
  const input = screen.getByPlaceholderText('Type command and press Enter')

  await user.clear(input)
  await user.type(input, line)
  await user.keyboard('{Enter}')
}

describe('App integration', () => {
  beforeEach(() => {
    window.localStorage.setItem(LOCALE_KEY, 'en')
  })

  it('opens tutorial modal and closes it with Escape', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />)

    await user.click(screen.getByRole('button', { name: 'Open tutorial' }))

    expect(await screen.findByRole('dialog', { name: 'Git Sandbox Tutorial' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close tutorial' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Git Sandbox Tutorial' })).not.toBeInTheDocument()
    })
  })

  it(
    'runs terminal commands, enters conflict resolution, and completes merge commit',
    async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await submitTerminalCommand('git init')
      await screen.findByText('Initialized empty Git sandbox repository.')

      await submitTerminalCommand('git commit -m "init"')
      await screen.findByText('Created commit c1')

      await submitTerminalCommand('git switch -c feat')
      await screen.findByText("Created and switched to new branch 'feat'")

      await user.clear(screen.getByTestId('monaco-editor'))
      await user.type(screen.getByTestId('monaco-editor'), 'feature line')

      await submitTerminalCommand('git commit -m "feat: change"')
      await screen.findByText('Created commit c2')

      await submitTerminalCommand('git switch main')
      await screen.findByText("Switched to branch 'main'")

      await user.clear(screen.getByTestId('monaco-editor'))
      await user.type(screen.getByTestId('monaco-editor'), 'main line')

      await submitTerminalCommand('git commit -m "main: change"')
      await screen.findByText('Created commit c3')

      await submitTerminalCommand('git merge feat')
      await screen.findByText('Auto-merging... CONFLICT (content)')

      await user.click(await screen.findByRole('button', { name: 'Accept OURS' }))
      expect(screen.getByTestId('monaco-editor')).toHaveValue('main line')

      await submitTerminalCommand('git commit -m "resolve"')
      await screen.findByText('Created commit c4')

      expect(screen.queryByRole('button', { name: 'Accept OURS' })).not.toBeInTheDocument()
    },
    10_000,
  )

  it('runs a demo scenario from the catalog and appends the generated history', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />)

    await user.click(screen.getByRole('button', { name: 'Demo Scenarios' }))

    expect(await screen.findByRole('dialog', { name: 'Demo Scenarios' })).toBeInTheDocument()

    const helpCard = screen.getByText('1) help').closest('.demo-catalog-item')
    if (!helpCard) {
      throw new Error('Demo help card was not rendered.')
    }

    await user.click(within(helpCard as HTMLElement).getByRole('button', { name: 'Run' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Demo Scenarios' })).not.toBeInTheDocument()
    })

    expect(await screen.findByText('$ help')).toBeInTheDocument()
  })

  it('persists locale selection across remounts', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<App />)
    const localeButton = document.querySelector('.app-locale-button')

    if (!(localeButton instanceof HTMLButtonElement)) {
      throw new Error('Locale button was not rendered.')
    }

    await user.click(localeButton)
    expect(window.localStorage.getItem(LOCALE_KEY)).toBe('ko')

    unmount()
    renderWithProviders(<App />)

    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })
})
