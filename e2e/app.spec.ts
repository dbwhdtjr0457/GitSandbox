import { expect, test, type Page } from '@playwright/test'

async function bootEnglishLocale(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('gitsandbox-locale', 'en')
  })
}

async function submitTerminalCommand(page: Page, command: string) {
  const input = page.getByPlaceholder('Type command and press Enter')
  await input.fill(command)
  await input.press('Enter')
}

test.beforeEach(async ({ page }) => {
  await bootEnglishLocale(page)
  await page.goto('/')
})

test('tutorial and demo dialogs remain keyboard accessible', async ({ page }) => {
  await page.getByRole('button', { name: 'Open tutorial' }).click()
  await expect(page.getByRole('dialog', { name: 'Git Sandbox Tutorial' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Git Sandbox Tutorial' })).toBeHidden()

  await page.getByRole('button', { name: 'Demo Scenarios' }).click()
  await expect(page.getByRole('dialog', { name: 'Demo Scenarios' })).toBeVisible()

  await expect
    .poll(() => page.locator('.demo-modal-content').evaluate((node) => node.scrollHeight > node.clientHeight))
    .toBeTruthy()
})

test('terminal flow works end to end for init and commit', async ({ page }) => {
  await submitTerminalCommand(page, 'git init')
  await expect(page.getByText('Initialized empty Git sandbox repository.')).toBeVisible()

  await submitTerminalCommand(page, 'git commit -m "init"')
  await expect(page.getByText('Created commit c1')).toBeVisible()
  await expect(page.locator('.graph-panel')).toContainText('c1')
})

test('long terminal history stays scrollable without stretching the editor panel', async ({ page }) => {
  const editorPanel = page.locator('.editor-panel')
  const terminalHistory = page.locator('.terminal-history')
  const initialEditorBox = await editorPanel.boundingBox()

  for (let index = 0; index < 24; index += 1) {
    await submitTerminalCommand(page, 'help')
  }

  const nextEditorBox = await editorPanel.boundingBox()
  expect(initialEditorBox).not.toBeNull()
  expect(nextEditorBox).not.toBeNull()

  const heightDelta = Math.abs((nextEditorBox?.height ?? 0) - (initialEditorBox?.height ?? 0))
  expect(heightDelta).toBeLessThan(4)

  await expect
    .poll(() => terminalHistory.evaluate((node) => node.scrollHeight > node.clientHeight))
    .toBeTruthy()
})
