/** The moved cover and board retain full-page accessibility and input-mode coverage on their new route. */
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';
import { expectedInspirationCollections, boardReference } from './fixtures/expected-inspiration';

async function expectAccessible(page: Page, testInfo: TestInfo, state: string) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  const summarise = (rules: typeof result.violations) => rules.map(rule => ({
    id: rule.id, impact: rule.impact,
    nodes: rule.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
  }));
  await testInfo.attach(`axe-${state}`, {
    body: JSON.stringify({ state, viewport: page.viewportSize(), violations: summarise(result.violations),
      incomplete: summarise(result.incomplete) }, null, 2), contentType: 'application/json',
  });
  expect.soft(summarise(result.violations), `Automatically detectable accessibility failures: ${state}`).toEqual([]);
}

async function expectPageFits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    'Discover must fit without horizontal document scrolling').toBeLessThanOrEqual(1);
  await expect.poll(() => page.locator('.fs-trend-visual').evaluate(visual => {
    const frame = visual.getBoundingClientRect();
    const caption = visual.querySelector('figcaption')!.getBoundingClientRect();
    return caption.top >= frame.top && caption.bottom <= frame.bottom;
  }), { message: 'The cover caption must stay inside its frame' }).toBe(true);
}

/** Include retained homepage controls and source links, not only the renewed collection controls. */
async function expectLargeTargets(container: Locator) {
  // Resolve targets afresh while the selected board commits; detached previous controls remain failures until replaced.
  await expect.poll(() => container.locator('button:visible, a:visible, input:visible').evaluateAll(elements =>
    elements.flatMap(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.width >= 44 && bounds.height >= 44 ? [] : [{
        target: element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName,
        className: element.className, width: bounds.width, height: bounds.height,
      }];
    })), { message: 'Every visible Discover control must provide at least a 44 px target' }).toEqual([]);
}

test('all Discover collections and an open source dialog remain accessible @responsive', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.goto('/');
  const controls = page.getByRole('group', { name: 'Choose an inspiration collection' });
  for (const collection of expectedInspirationCollections) {
    const control = controls.getByRole('button', { name: collection.title, exact: true });
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.fs-trend-visual > img')).toHaveAttribute('src', collection.image);
    // Every board has six cards, so count alone cannot prove that the requested collection has committed.
    await expect.poll(() => page.locator('#fs-trend-board .fs-look-open > img').evaluateAll(images => images.map(image =>
      image.getAttribute('src')!.split('/').at(-1)!.replace(/\.[^.]+$/, '')))).toEqual(collection.looks);
    await expectLargeTargets(page.locator('.discover-page'));
    await expectAccessible(page, testInfo, `discover-${collection.id}`);
    await expectPageFits(page);
  }
  await page.locator('#fs-trend-board .fs-look-open').first().click();
  const dialog = page.locator('#fs-trend-board .fs-look-dialog');
  await expect(dialog).toBeVisible();
  await expectLargeTargets(dialog);
  await expectAccessible(page, testInfo, 'discover-source-dialog');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('reference hand-off attribution and prototype disclosure remain accessible @responsive', async ({ page }, testInfo) => {
  await page.goto(`/first-sight?look=${boardReference.id}`);
  await expect(page.locator('.fs-workspace-reference-credit')).toContainText(boardReference.credit);
  await expect(page.locator('.fs-reference-disclosure')).toHaveText('This reference opens the prepared five-study demonstration. Results are sample studies, not an identification of this outfit.');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expectAccessible(page, testInfo, 'first-sight-reference-ready');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('Discover dialog keeps keyboard focus and returns it after Escape or backdrop dismissal @cross-browser', async ({ page }) => {
  await page.goto('/');
  const control = page.getByRole('button', { name: 'Vintage Denim', exact: true });
  await control.focus();
  await page.keyboard.press('Enter');
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  expect(await control.evaluate(element => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  })).toBe(true);
  const opener = page.locator('#fs-trend-board .fs-look-open').first();
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('#fs-trend-board .fs-look-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close outfit details', exact: true })).toBeFocused();
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press(index % 3 ? 'Tab' : 'Shift+Tab');
    expect(await dialog.evaluate(element => element.contains(document.activeElement) || !document.hasFocus())).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  // Pointer activation also needs a concrete return destination in WebKit.
  await opener.click();
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.click(bounds!.x > 1 ? bounds!.x / 2 : 1, 1);
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test.describe('Discover text enlargement', () => {
  for (const width of [320, 390]) test(`all covers, product cards and source details fit with doubled text at ${width}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 844 });
    for (const collection of expectedInspirationCollections) {
      await page.goto(`/?collection=${collection.id}`);
      await page.evaluate(() => {
        // Capture before changing styles so inherited text is enlarged exactly once.
        const sizes = [...document.querySelectorAll('.discover-page *')]
          .filter((element): element is HTMLElement => element instanceof HTMLElement)
          .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
        for (const { element, size } of sizes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
      });
      await expectPageFits(page);
      await page.locator('#fs-trend-board .fs-look-open').first().click();
      const dialog = page.locator('#fs-trend-board .fs-look-dialog');
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
      await page.keyboard.press('Escape');
      await expectPageFits(page);
    }
  });
});

test.describe('Discover touch emulation', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('collection, saved heart and source hand-off work with touch activation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Vintage Denim', exact: true }).tap();
    const board = page.locator('#fs-trend-board');
    await board.getByRole('button', { name: 'Save IU look', exact: true }).tap();
    await expect(board.getByRole('button', { name: 'Unsave IU look', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await board.getByRole('button', { name: 'View look: IU. Print over denim', exact: true }).tap();
    const dialog = board.getByRole('dialog', { name: 'IU', exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Explore in FirstSight', exact: true }).tap();
    await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', expectedInspirationCollections[1].image);
    await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
    await expect(page.locator('.fs-analyze-button')).toBeEnabled();
  });
});
