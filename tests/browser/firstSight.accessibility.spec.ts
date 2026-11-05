/** Whole-page and revealed-state checks complement, rather than replace, manual accessibility review. */
import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';
import { studies } from './fixtures/expected-edits';
import { analyseSample, closeInspire, openInspire, selectStudy } from './helpers/firstSight';
import type { FirstSightTestHost } from './harness/main';

/** Retain actionable selectors and manual-review items without putting supplied images in source. */
async function expectAccessible(page: Page, testInfo: TestInfo, state: string) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  const summarise = (rules: typeof result.violations) => rules.map(rule => ({
    id: rule.id,
    impact: rule.impact,
    nodes: rule.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
  }));
  await testInfo.attach(`axe-${state}`, {
    body: JSON.stringify({ state, viewport: page.viewportSize(), violations: summarise(result.violations),
      incomplete: summarise(result.incomplete) }, null, 2),
    contentType: 'application/json',
  });
  expect.soft(summarise(result.violations), `Automatically detectable accessibility failures: ${state}`).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) {
    const offenders = await page.evaluate(() => [...document.querySelectorAll('body *')]
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element.getClientRects().length > 0)
      .flatMap(element => {
        const bounds = element.getBoundingClientRect();
        if (bounds.right <= document.documentElement.clientWidth + 1 && bounds.left >= -1) return [];
        return [{ tag: element.tagName, id: element.id, className: element.className,
          left: bounds.left, right: bounds.right, width: bounds.width,
          overflowX: getComputedStyle(element).overflowX }];
      }));
    await test.info().attach('horizontal-overflow-elements', {
      body: JSON.stringify({ overflow, viewport: page.viewportSize(), offenders }, null, 2),
      contentType: 'application/json',
    });
  }
  expect(overflow, 'The document must fit its viewport').toBeLessThanOrEqual(1);
}

async function enlargeFirstSightText(page: Page) {
  await page.evaluate(() => {
    // Capture first so inherited text is doubled once, rather than repeatedly down the tree.
    const sizes = [...document.querySelectorAll('.first-sight *')]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    for (const { element, size } of sizes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
  });
}

test('all five study pages have no automatically detectable accessibility failures @responsive', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await analyseSample(page);
  for (const study of studies) {
    await selectStudy(page, study);
    const labels = page.locator('.fs-dossier-feature-label');
    await expect(labels).toHaveCount(4);
    if (page.viewportSize()!.width <= 390) {
      await expect(page.locator('.fs-dossier-point:visible')).toHaveCount(0);
      await expect(page.locator('.fs-dossier-point-marker:visible')).toHaveCount(4);
      for (const label of await labels.all()) {
        const bounds = await label.boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
    }
    for (const label of await labels.all()) {
      // Establish keyboard modality after selecting the study with a pointer.
      await page.keyboard.press('Tab');
      await label.focus();
      await expect(label).toHaveAttribute('aria-expanded', 'true');
      const panelId = await label.getAttribute('aria-controls');
      expect(panelId).not.toBeNull();
      await expect(page.locator(`#${panelId}`)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(label).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator(`#${panelId}`)).not.toBeVisible();
    }
    await expectAccessible(page, testInfo, `study-${study.id}`);
    await expectNoHorizontalOverflow(page);
  }
  await testInfo.attach('marketplace-original-test-artwork', {
    body: await page.locator('#fs-similar-pieces').screenshot(), contentType: 'image/png',
  });
});

test('Inspire, bag and contextual details remain accessible when open @responsive', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await analyseSample(page);
  const drawer = await openInspire(page);
  await expectAccessible(page, testInfo, 'inspire-open');
  expect(await drawer.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  for (const button of await drawer.getByRole('button').all()) {
    const bounds = await button.boundingBox();
    expect(bounds, 'Every visible drawer button has measurable geometry').not.toBeNull();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  await testInfo.attach('inspire-original-test-artwork', {
    body: await page.screenshot(), contentType: 'image/png',
  });
  await closeInspire(page);

  await page.locator('.fs-bag-button').click();
  await expect(page.locator('.fs-cart-dialog')).toBeVisible();
  await expectAccessible(page, testInfo, 'bag-open');
  await page.getByRole('button', { name: 'Close bag preview' }).click();

  await page.locator('.fs-context-section .fs-look-open').nth(2).click();
  const details = page.locator('.fs-context-section .fs-look-dialog');
  await expect(details).toBeVisible();
  await expectAccessible(page, testInfo, 'context-details-open');
  await details.getByRole('button', { name: 'Close outfit details' }).click();
  await expectNoHorizontalOverflow(page);
});

test('expanded design notes and explanations retain readable structure @responsive', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await analyseSample(page);
  // Pointer entry already opens this hover card; keyboard activation avoids toggling it shut.
  const matching = page.getByRole('button', { name: 'How a photo becomes a match', exact: true });
  await matching.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'How photo matching would work' })).toBeVisible();
  await expectAccessible(page, testInfo, 'matching-explanation');
  await page.keyboard.press('Escape');

  const label = page.locator('.fs-dossier-feature-label').first();
  await page.keyboard.press('Tab');
  await label.focus();
  await expect(label).toHaveAttribute('aria-expanded', 'true');
  await expectAccessible(page, testInfo, 'dossier-feature-explanation');
  await page.keyboard.press('Escape');
  await expect(label).toHaveAttribute('aria-expanded', 'false');

  await page.locator('.fs-dossier-notes > summary').click();
  await page.locator('.fs-dossier-culture > summary').click();
  await expect(page.locator('.fs-dossier-notes')).toHaveAttribute('open', '');
  await expect(page.locator('.fs-dossier-culture')).toHaveAttribute('open', '');
  await expectAccessible(page, testInfo, 'expanded-notes-and-culture');
  await expectNoHorizontalOverflow(page);
});

test('keyboard modality, Escape, backdrop and reduced motion preserve user control', async ({ page }) => {
  await analyseSample(page);
  const trigger = page.locator('.fs-shop-toolbar .fs-style-match-trigger');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const drawer = page.getByRole('dialog', { name: 'Explore similar styles', exact: true });
  const close = drawer.getByRole('button', { name: 'Close The Inspire', exact: true });
  await expect(close).toBeFocused();
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  expect(await drawer.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  expect(await close.evaluate(element => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  }), 'Keyboard focus remains visible').toBe(true);

  for (let index = 0; index < 12; index++) {
    await page.keyboard.press(index % 3 === 0 ? 'Shift+Tab' : 'Tab');
    const state = await page.evaluate(() => ({
      modal: document.querySelector('.fs-style-drawer')?.matches(':modal'),
      inDrawer: document.querySelector('.fs-style-drawer')?.contains(document.activeElement),
      documentFocused: document.hasFocus(),
    }));
    expect(state.modal).toBe(true);
    // Native browser-chrome focus is allowed; background application controls are not.
    expect(state.inDrawer || !state.documentFocused).toBe(true);
  }
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await openInspire(page);
  const bounds = await drawer.boundingBox();
  expect(bounds!.x).toBeGreaterThan(0);
  await page.mouse.click(bounds!.x / 2, 40);
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test.describe('narrow text enlargement', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const width of [320, 390]) test(`long copy and 200 percent text fit at ${width} pixels`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/tests/browser/harness/');
    await page.waitForFunction(() => Boolean(window.__firstSightTestHost));
    await enlargeFirstSightText(page);
    await expectNoHorizontalOverflow(page);
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__firstSightTestHost));
    await page.getByRole('button', { name: /Try the Chloé bag/ }).click();
    await page.locator('.fs-analyze-button').click();
    await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
    await page.evaluate(() => (window.__firstSightTestHost as FirstSightTestHost).changeStyles('long-copy'));
    const drawer = await openInspire(page);
    await enlargeFirstSightText(page);
    await expect(drawer.locator('h3')).toContainText('A generous silhouette');
    expect(await drawer.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    await expectNoHorizontalOverflow(page);
    await testInfo.attach('inspire-200-percent-text', { body: await page.screenshot(), contentType: 'image/png' });
    await closeInspire(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('emulated narrow touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('drawer swipe scrolling does not move the background at its boundary', async ({ page }) => {
    await analyseSample(page);
    const drawer = await openInspire(page);
    const background = await page.evaluate(() => scrollY);
    const client = await page.context().newCDPSession(page);
    const swipe = async () => {
      const start = Date.now() / 1000;
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 220, y: 730 }], timestamp: start });
      for (const [index, y] of [650, 570, 490, 410, 330].entries()) {
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 220, y }], timestamp: start + (index + 1) / 60 });
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [], timestamp: start + 0.12 });
    };
    try {
      await swipe();
      await expect.poll(() => drawer.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
      expect(await page.evaluate(() => scrollY)).toBe(background);
      await drawer.evaluate(element => { element.scrollTop = element.scrollHeight; });
      await swipe();
      expect(await page.evaluate(() => scrollY)).toBe(background);
    } finally { await client.detach(); }
  });
});
