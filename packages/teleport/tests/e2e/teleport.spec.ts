import { test, expect } from '@playwright/test';

test('page loads successfully', async ({ page }) => {
  await page.goto('/packages/teleport/tests/fixtures/index.html');

  // Verify the page structure is present
  await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.nav-item')).toHaveCount(5);
});

test.describe('Go to top/bottom page scroll', () => {
  test('gg scrolls to top of page', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/scroll-fixture.html');

    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    // Press gg (two g's in quick succession)
    await page.keyboard.press('g');
    await page.keyboard.press('g');

    // Wait for smooth scroll
    await page.waitForTimeout(500);

    // Should be at top
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('G (Shift+g) scrolls to bottom of page', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/scroll-fixture.html');

    // Start at top
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // Press G (Shift+g)
    await page.keyboard.press('Shift+g');

    // Wait for smooth scroll to complete
    await page.waitForTimeout(1000);

    // Should have scrolled significantly (at least halfway down)
    const scrollY = await page.evaluate(() => window.scrollY);
    const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
    expect(scrollY).toBeGreaterThan(maxScroll * 0.5);
  });

  test('single g does not trigger scroll', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/scroll-fixture.html');

    // Scroll to middle
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Press single g
    await page.keyboard.press('g');
    await page.waitForTimeout(100);

    // Should still be at same position
    expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
  });

  test('g sequence times out after 500ms', async ({ page }) => {
    await page.goto('/packages/teleport/tests/fixtures/scroll-fixture.html');

    // Scroll to middle
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Press g, wait too long, then press g again
    await page.keyboard.press('g');
    await page.waitForTimeout(600); // Wait longer than 500ms timeout
    await page.keyboard.press('g');
    await page.waitForTimeout(100);

    // Should still be at same position (sequence timed out, second g starts new sequence)
    expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
  });
});
