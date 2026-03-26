import { test, expect } from '@playwright/test'

test.describe('Create a new room', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Enter nickname').waitFor({ state: 'visible' })
  })

  test('shows create tab by default with nickname input', async ({ page }) => {
    await expect(page.getByPlaceholder('Enter nickname')).toBeVisible()
    await expect(page.getByPlaceholder('XXXX')).not.toBeVisible()
  })

  test('create button is disabled when nickname is empty', async ({ page }) => {
    const form = page.locator('form')
    await expect(form.getByRole('button', { name: 'Create Room' })).toBeDisabled()
  })

  test('create button enables when nickname is typed', async ({ page }) => {
    await page.getByPlaceholder('Enter nickname').fill('Alice')
    await expect(page.locator('form').getByRole('button', { name: 'Create Room' })).toBeEnabled()
  })

  test('submitting navigates to /player/<CODE>', async ({ page }) => {
    await page.getByPlaceholder('Enter nickname').fill('Alice')
    await page.locator('form').getByRole('button', { name: 'Create Room' }).click()

    await expect(page).toHaveURL(/\/player\/[A-Z0-9]{4}/)
    await expect(page.getByText(/^ROOM: [A-Z0-9]{4}$/)).toBeVisible()
  })

  test('lobby shows creator as only player with host crown', async ({ page }) => {
    await page.getByPlaceholder('Enter nickname').fill('Alice')
    await page.locator('form').getByRole('button', { name: 'Create Room' }).click()

    await expect(page).toHaveURL(/\/player\/[A-Z0-9]{4}/)
    await expect(page.getByText('Players (1/8)')).toBeVisible()
    await expect(page.getByText(/Alice.*👑/)).toBeVisible()
  })

  test('start button is disabled for a single player', async ({ page }) => {
    await page.getByPlaceholder('Enter nickname').fill('Alice')
    await page.locator('form').getByRole('button', { name: 'Create Room' }).click()

    await expect(page).toHaveURL(/\/player\/[A-Z0-9]{4}/)
    await expect(page.getByRole('button', { name: /Need \d+ more player/ })).toBeDisabled()
  })
})
