import { test, expect } from '@playwright/test';

test('page loads successfully', async ({ page }) => {
  await page.goto('/packages/teleport/tests/fixtures/index.html');

  // Verify the page structure is present
  await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.nav-item')).toHaveCount(5);
});

test.describe('Go to top/bottom navigation', () => {
  test('gg goes to first item', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/index.html');

    // Navigate to middle of list first
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').nth(3)).toHaveClass(/teleport-highlight/);

    // Press gg (two g's in quick succession)
    await page.keyboard.press('g');
    await page.keyboard.press('g');

    // Should be at first item
    await expect(page.locator('.nav-item').nth(0)).toHaveClass(/teleport-highlight/);
  });

  test('G (Shift+g) goes to last item', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/index.html');

    // Start at first item
    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').nth(1)).toHaveClass(/teleport-highlight/);

    // Press G (Shift+g)
    await page.keyboard.press('Shift+g');

    // Should be at last item (5 items, index 4)
    await expect(page.locator('.nav-item').nth(4)).toHaveClass(/teleport-highlight/);
  });

  test('single g does not trigger goToTop', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/index.html');

    // Navigate to middle
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').nth(2)).toHaveClass(/teleport-highlight/);

    // Press single g
    await page.keyboard.press('g');

    // Should still be at same position
    await expect(page.locator('.nav-item').nth(2)).toHaveClass(/teleport-highlight/);
  });

  test('g sequence times out after 500ms', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/index.html');

    // Navigate to middle
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').nth(3)).toHaveClass(/teleport-highlight/);

    // Press g, wait too long, then press g again
    await page.keyboard.press('g');
    await page.waitForTimeout(600); // Wait longer than 500ms timeout
    await page.keyboard.press('g');

    // Should still be at same position (sequence timed out)
    await expect(page.locator('.nav-item').nth(3)).toHaveClass(/teleport-highlight/);
  });
});
