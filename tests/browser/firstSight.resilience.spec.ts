/** Controlled props exercise data and lifecycle failures without production test hooks. */
import type { Page } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';
import type { HarnessMode, StyleChange } from './harness/main';
import { studies } from './fixtures/expected-edits';
import { expectArchiveEdit } from './helpers/firstSight';

async function openHost(page: Page, screen: 'page' | 'modals' = 'page') {
  await page.goto(`/tests/browser/harness/?screen=${screen}`);
  await page.waitForFunction(() => Boolean(window.__firstSightTestHost));
}

async function analyseHost(page: Page, mode: HarnessMode = 'normal') {
  await openHost(page);
  await page.evaluate(value => window.__firstSightTestHost.setMode(value), mode);
  await page.getByRole('button', { name: /Try the Chloé bag/ }).click();
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
}

async function openHostInspire(page: Page) {
  await page.locator('.fs-shop-toolbar .fs-style-match-trigger').click();
  const drawer = page.getByRole('dialog', { name: 'Explore similar styles', exact: true });
  await expect(drawer).toBeVisible();
  return drawer;
}

for (const mode of ['archive-empty', 'style-empty', 'both-empty', 'no-context'] as const) {
  test(`${mode} retains a coherent archive and inspiration boundary`, async ({ page }) => {
    await analyseHost(page, mode);
    const noArchive = mode === 'archive-empty' || mode === 'both-empty';
    const noStyles = mode === 'style-empty' || mode === 'both-empty';
    await expect(page.locator('.fs-purchase-card')).toHaveCount(noArchive ? 0 : 3);
    await expect(page.locator('.fs-archive-empty')).toHaveCount(noArchive ? 1 : 0);
    await expect(page.locator('.fs-shop-toolbar .fs-style-match-trigger')).toHaveCount(noStyles ? 0 : 1);
    await expect(page.locator('.fs-context-section')).toHaveCount(mode === 'no-context' ? 0 : 1);
    await expect(page.locator('.fs-products-empty')).toHaveCount(0);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    if (!noStyles) {
      const drawer = await openHostInspire(page);
      await expect(drawer.locator('.fs-style-match-card')).toHaveCount(1);
    }
  });
}

test('misplaced commerce entries are filtered without changing authored track counts', async ({ page }) => {
  await analyseHost(page, 'mixed');
  // Independently check exact archive identities/order, not the intentionally removed listing badges.
  await expectArchiveEdit(page, studies[0]);
  const drawer = await openHostInspire(page);
  await expect(drawer.locator('.fs-style-match-card')).toHaveCount(1);
  await expect(drawer.locator('.fs-style-match-label')).toHaveText('Partner-offer preview');
});

test('authored same-design metadata keeps the distinction from authentication', async ({ page }) => {
  await analyseHost(page, 'same-design');
  const journal = page.locator('.fs-context-section');
  await expect(journal.locator('.fs-look-relationship').first()).toHaveText('Same design');
  await journal.locator('.fs-look-open').first().click();
  const details = journal.locator('.fs-look-dialog');
  await expect(details).toBeVisible();
  await expect(details).toContainText('Same design describes a design-family connection.');
  await expect(details).toContainText('It does not identify or authenticate this individual piece');
});

test('provider failure retains the photograph and allows a successful retry', async ({ page }) => {
  await openHost(page);
  await page.evaluate(() => window.__firstSightTestHost.setMode('failure'));
  await page.getByRole('button', { name: /Try the Chloé bag/ }).click();
  const originalPhoto = await page.locator('.fs-workspace-preview').getAttribute('src');
  await page.locator('.fs-analyze-button').click();
  await expect(page.getByRole('alert')).toContainText('The sample analysis could not be prepared.');
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', originalPhoto!);
  await expect(page.locator('.fs-analyze-button')).toBeEnabled();
  await page.evaluate(() => window.__firstSightTestHost.setMode('normal'));
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('a cancelled provider cannot replace a later selected study after late settlement', async ({ page }) => {
  await openHost(page);
  await page.evaluate(() => window.__firstSightTestHost.setMode('pending'));
  await page.getByRole('button', { name: /Try the Chloé bag/ }).click();
  await page.locator('.fs-analyze-button').click();
  await expect.poll(() => page.evaluate(() => window.__firstSightTestHost.snapshot().pending)).toBe(1);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await page.evaluate(() => window.__firstSightTestHost.setMode('normal'));
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
  await page.locator('.fs-recognition-card').filter({ hasText: 'Vintage workwear jacket' }).click();
  await page.evaluate(async () => {
    window.__firstSightTestHost.releasePending();
    // Allow the obsolete promise and React scheduling to settle before asserting selection.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await expect(page.locator('.fs-selected-edit strong')).toHaveText('Vintage workwear jacket');
  await expect(page.locator('.fs-purchase-card')).toHaveCount(2);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const change of ['no-stock', 'removed-sku'] as const satisfies readonly StyleChange[]) {
  test(`${change} invalidates an already selected partner variant`, async ({ page }) => {
    await analyseHost(page);
    const drawer = await openHostInspire(page);
    await drawer.getByRole('button', { name: 'Size One size, 3 available', exact: true }).click();
    await expect(drawer.getByRole('button', { name: 'Preview partner offer' })).toBeEnabled();
    await page.evaluate(value => window.__firstSightTestHost.changeStyles(value), change);
    await expect(drawer.getByRole('button', { name: 'Preview partner offer' })).toBeDisabled();
    await expect(drawer).toContainText('Currently unavailable in this sample edit.');
    await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 0');
    await expect.poll(() => page.evaluate(() => window.__firstSightTestHost.snapshot().archiveSaveCalls)).toEqual([]);
  });
}

test('long copy fits and visit-local choices reset when the host remounts FirstSight', async ({ page }) => {
  await analyseHost(page);
  let drawer = await openHostInspire(page);
  await drawer.getByRole('button', { name: 'Size One size, 3 available', exact: true }).click();
  await drawer.getByRole('button', { name: /^Save style:/ }).click();
  await page.evaluate(() => window.__firstSightTestHost.changeStyles('long-copy'));
  await expect(drawer.locator('h3')).toHaveText('A generous silhouette with a carefully considered line and beautifully layered details');
  expect(await drawer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await drawer.getByRole('button', { name: 'Close The Inspire', exact: true }).click();
  await page.evaluate(() => window.__firstSightTestHost.remountPage());
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'upload');
  await page.getByRole('button', { name: /Try the Chloé bag/ }).click();
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
  drawer = await openHostInspire(page);
  await expect(drawer.getByRole('button', { name: 'Size One size, 3 available', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(drawer.getByRole('button', { name: /^Save style:/ })).toHaveAttribute('aria-pressed', 'false');
});

test('controlled closure, removed opener and unmount restore focus and overflow without duplicate callbacks', async ({ page }) => {
  await openHost(page, 'modals');
  await page.evaluate(() => {
    document.documentElement.style.setProperty('overflow-x', 'clip', 'important');
    document.documentElement.style.setProperty('overflow-y', 'scroll');
  });
  await page.getByRole('button', { name: 'Open controlled Inspire' }).click();
  await expect(page.locator('.fs-style-drawer')).toBeVisible();
  await page.evaluate(() => window.__firstSightTestHost.setOpenerVisible(false));
  await page.evaluate(() => window.__firstSightTestHost.openModal('none'));
  await expect(page.locator('.fs-style-drawer')).not.toBeVisible();
  await expect(page.locator('#test-focus-fallback')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.__firstSightTestHost.snapshot().dismissCalls)).toBe(0);
  expect(await page.evaluate(() => ({
    x: document.documentElement.style.getPropertyValue('overflow-x'),
    y: document.documentElement.style.getPropertyValue('overflow-y'),
    priority: document.documentElement.style.getPropertyPriority('overflow-x'),
  }))).toEqual({ x: 'clip', y: 'scroll', priority: 'important' });
  await page.locator('#test-focus-fallback').focus();
  await page.evaluate(() => window.__firstSightTestHost.openModal('inspire'));
  await expect(page.locator('.fs-style-drawer')).toBeVisible();
  await page.evaluate(() => window.__firstSightTestHost.setDrawerMounted(false));
  await expect(page.locator('.fs-style-drawer')).toHaveCount(0);
  await expect(page.locator('#test-focus-fallback')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('overflow-x'))).toBe('clip');
  await expect.poll(() => page.evaluate(() => window.__firstSightTestHost.snapshot().dismissCalls)).toBe(0);
});

test('hidden bag opener and delayed native close preserve the current modal', async ({ page }) => {
  await openHost(page, 'modals');
  await page.getByRole('button', { name: 'Open controlled bag' }).click();
  await expect(page.locator('.fs-cart-dialog')).toBeVisible();
  await page.evaluate(() => window.__firstSightTestHost.openModal('inspire'));
  await expect(page.locator('.fs-style-drawer')).toBeVisible();
  await page.getByRole('button', { name: 'Close The Inspire', exact: true }).click();
  await expect(page.locator('#test-focus-fallback')).toBeFocused();
  await page.getByRole('button', { name: 'Open controlled bag' }).click();
  await page.evaluate(() => window.__firstSightTestHost.openModal('inspire'));
  await expect(page.locator('.fs-style-drawer')).toBeVisible();
  await page.evaluate(() => window.__firstSightTestHost.openModal('bag'));
  const bag = page.locator('.fs-cart-dialog');
  await expect(bag).toBeVisible();
  // Deliberately model delivery of a native close event queued by the earlier bag opening.
  await bag.dispatchEvent('close');
  await expect(bag).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(bag).not.toBeVisible();
  await page.getByRole('button', { name: 'Open controlled bag' }).click();
  await expect(bag).toBeVisible();
  await page.getByRole('button', { name: 'Close bag preview' }).click();
  await expect(bag).not.toBeVisible();
});

test('a queued native close before the bag opening effect cannot cancel current controlled intent', async ({ page }) => {
  await openHost(page, 'modals');
  await page.getByRole('button', { name: 'Open controlled bag' }).click();
  await expect(page.locator('.fs-cart-dialog')).toBeVisible();
  await page.evaluate(() => window.__firstSightTestHost.openModal('inspire'));
  await expect(page.locator('.fs-style-drawer')).toBeVisible();
  await page.evaluate(() => {
    window.__firstSightTestHost.queueBagCloseOnNextOpen();
    window.__firstSightTestHost.openModal('bag');
  });
  await expect(page.locator('.fs-cart-dialog')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__firstSightTestHost.snapshot().modal)).toBe('bag');
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.fs-cart-dialog')).not.toBeVisible();
});
