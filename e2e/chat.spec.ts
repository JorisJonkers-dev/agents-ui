import { expect, test } from '@playwright/test'
import { installAuthenticatedAppMocks } from './mocks'

test('root redirects authenticated users to workspaces', async ({ page }) => {
  await installAuthenticatedAppMocks(page)

  await page.goto('/')

  await page.waitForURL('**/workspaces')
  await expect(page.getByRole('heading', { name: 'Workspaces', exact: true })).toBeVisible()
  await expect(page.getByTestId('workspace-tab')).toBeVisible()
})

test('workspaces route redirects unauthenticated users to login', async ({ page }) => {
  await installAuthenticatedAppMocks(page, { authenticated: false })

  await page.goto('/workspaces')

  await page.waitForURL(/\/login\?redirect=/)
})

test('conversations can open and stream an answer from the Conversations view', async ({ page }) => {
  await installAuthenticatedAppMocks(page)

  await page.goto('/conversations')

  await expect(page.getByRole('heading', { name: 'Conversations' })).toBeVisible()
  await expect(page.getByTestId('chat-tab')).toBeVisible()
  await expect(page.getByTestId('chat-session-chat-1')).toContainText('Planning brief')
  await expect(page.getByTestId('chat-detail-chat-1')).toBeVisible()
  await expect(page.getByText('Use the sessions workspace.')).toBeVisible()

  await page.getByTestId('chat-input').fill('Summarize the workspace')
  await page.getByTestId('chat-send-submit').click()

  await expect(page.getByText('Summarize the workspace')).toBeVisible()
  await expect(page.getByText('Mock streamed answer')).toBeVisible()
})

test('the old bookmarked /sessions?tab=chat URL still lands on Conversations', async ({ page }) => {
  await installAuthenticatedAppMocks(page)

  await page.goto('/sessions?tab=chat')

  await page.waitForURL('**/conversations')
  await expect(page.getByRole('heading', { name: 'Conversations' })).toBeVisible()
  await expect(page.getByTestId('chat-tab')).toBeVisible()
})

test('the old bookmarked /sessions and /sessions?tab=scratch URLs still land on Workspaces', async ({ page }) => {
  await installAuthenticatedAppMocks(page)

  await page.goto('/sessions')
  await page.waitForURL('**/workspaces')
  await expect(page.getByRole('heading', { name: 'Workspaces', exact: true })).toBeVisible()

  await page.goto('/sessions?tab=scratch')
  await page.waitForURL('**/workspaces?tab=scratch')
  await expect(page.getByTestId('workspaces-tab-scratch')).toHaveAttribute('aria-selected', 'true')
})
