/** Editorial callouts share one accessible interaction model across old and new dossiers. */
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';
import { expectedOutfits } from './fixtures/expected-outfits';
import { analyseSample } from './helpers/firstSight';

const labelsByItem: Readonly<Record<string, readonly string[]>> = {
  'puma-rose-micro-grip': ['Domed silhouette', 'Twin handles', 'Curved panel seams', 'Textured surface'],
  'puma-rose-longsleeve': ['Cropped silhouette', 'Round neckline', 'Finished cuffs', 'Smooth surface'],
  'puma-rose-mini-skirt': ['Mini silhouette', 'ROSIE badge', 'Curved hem', 'Smooth fabric'],
  'puma-rose-mesh-top': ['Sleeveless cut', '97 graphic', 'Bound hem', 'Open mesh'],
  'puma-rose-t7-trousers': ['Wide leg', 'Drawcord waist', 'Finished hems', 'Smooth surface'],
  'puma-rose-speedcat': ['Low profile', 'Wrapping laces', 'Stitched panels', 'Smooth upper'],
};

async function analyseOutfit(page: Page, button: string) {
  await page.getByRole('button', { name: button, exact: false }).click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(3);
}

async function selectPiece(page: Page, id: string) {
  await page.locator(`.fs-recognition-card[data-item-id="${id}"]`).click();
  await page.mouse.move(0, 0);
  await expect(page.locator('.fs-recognition-card.is-selected')).toHaveAttribute('data-item-id', id);
  await expect(page.locator('.fs-dossier-feature-label[aria-pressed="true"]')).toHaveCount(0);
}

async function explanation(page: Page, label: Locator) {
  const panelId = await label.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  return page.locator(`#${panelId}`);
}

/** Connector endpoints must coincide with image markers after every responsive reflow. */
async function expectConnectedFeatures(page: Page) {
  await expect(page.locator('.fs-dossier-connectors path')).toHaveCount(4);
  await expect.poll(() => page.locator('#fs-fashion-dossier').evaluate(dossier => {
    const paths = [...dossier.querySelectorAll<SVGPathElement>('.fs-dossier-connectors path')];
    const points = [...dossier.querySelectorAll<HTMLElement>('.fs-dossier-point')];
    const markers = [...dossier.querySelectorAll<HTMLElement>('.fs-dossier-point-marker')];
    return paths.every((path, index) => {
      const point = getComputedStyle(points[index]).display === 'none' ? markers[index] : points[index];
      const bounds = point.getBoundingClientRect();
      const matrix = path.getScreenCTM();
      if (!matrix || !bounds.width) return false;
      const end = path.getPointAtLength(path.getTotalLength()).matrixTransform(matrix);
      return Math.abs(end.x - bounds.left - bounds.width / 2) <= 2
        && Math.abs(end.y - bounds.top - bounds.height / 2) <= 2;
    });
  })).toBe(true);
}

test('all six ROSÉ dossiers expose four connected editorial features and stable explanations @responsive @cross-browser @preview', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/first-sight');
  for (const outfit of expectedOutfits) {
    await analyseOutfit(page, outfit.button);
    for (const piece of outfit.pieces) {
      await selectPiece(page, piece.id);
      const labels = page.locator('.fs-dossier-feature-label');
      await expect(labels).toHaveCount(4);
      await expect(labels.locator('.fs-dossier-feature-text')).toHaveText(labelsByItem[piece.id]);
      await expect(labels.locator('.fs-dossier-feature-number')).toHaveText(['01', '02', '03', '04']);
      await expect(labels.locator('.fs-dossier-feature-toggle')).toHaveText(['+', '+', '+', '+']);
      await expectConnectedFeatures(page);
      const image = page.locator('.fs-dossier-image-plane');
      for (const [index, label] of (await labels.all()).entries()) {
        await label.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        const before = await image.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x + scrollX, y: bounds.y + scrollY, width: bounds.width, height: bounds.height };
        });
        await expect(label).toHaveAccessibleName(labelsByItem[piece.id][index]);
        await label.click();
        await expect(label).toHaveAttribute('aria-pressed', 'true');
        await expect(label).toHaveAttribute('aria-expanded', 'true');
        await expect(label.locator('.fs-dossier-feature-toggle')).toHaveText('−');
        const panel = await explanation(page, label);
        await expect(panel).toBeVisible();
        await expect(panel.locator('h4')).toHaveText(labelsByItem[piece.id][index]);
        await expect(panel.locator('p')).not.toBeEmpty();
        const after = await image.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x + scrollX, y: bounds.y + scrollY, width: bounds.width, height: bounds.height };
        });
        // Document coordinates exclude legitimate scrolling when a lower tag is activated.
        for (const field of ['x', 'y', 'width', 'height'] as const) expect(after[field]).toBeCloseTo(before[field], 1);
        await page.keyboard.press('Escape');
        await expect(label).toHaveAttribute('aria-expanded', 'false');
        await expect(label).toHaveAttribute('aria-pressed', 'false');
        await expect(panel).not.toBeVisible();
      }
      await expect(page.locator('.fs-purchase-card')).toHaveCount(3);
    }
  }
});

test('shared tags distinguish preview and pinning with native keyboard and pointer or touch @responsive @cross-browser', async ({ page, browserName }, testInfo) => {
  await analyseSample(page);
  const label = page.locator('.fs-dossier-feature-label').first();
  await page.mouse.move(0, 0);
  await label.scrollIntoViewIfNeeded();
  const hasTouch = Boolean(testInfo.project.use.hasTouch);
  if (!hasTouch) {
    await label.hover();
    await expect(label).toHaveAttribute('aria-expanded', 'true');
    await expect(label).toHaveAttribute('aria-pressed', 'false');
    await expect(label).not.toHaveCSS('background-color', 'rgb(128, 47, 53)');
  }
  if (hasTouch) await label.tap();
  else await label.click();
  await expect(label).toHaveAttribute('aria-pressed', 'true');
  await expect(label).toHaveCSS('background-color', 'rgb(128, 47, 53)');
  await expect(label.locator('.fs-dossier-feature-toggle')).toHaveText('−');
  if (hasTouch) await label.tap();
  else await label.click();
  await expect(label).toHaveAttribute('aria-pressed', 'false');
  if (!hasTouch) {
    // Unpinning keeps a genuine hover preview open until pointer exit.
    await expect(label).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.move(0, 0);
  }
  await expect(label).toHaveAttribute('aria-expanded', 'false');
  await expect(label.locator('.fs-dossier-feature-toggle')).toHaveText('+');

  const nextControl = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  const points = page.locator('.fs-dossier-point:visible');
  if (await points.count()) await points.last().focus();
  else await page.locator('.fs-recognition-card').last().focus();
  await page.keyboard.press(nextControl);
  await expect(label).toBeFocused();
  await expect(label).toHaveAttribute('aria-expanded', 'true');
  await expect(label).toHaveAttribute('aria-pressed', 'false');
  await expect(label).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(label).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(label).toHaveAttribute('aria-expanded', 'false');
  await expect(label).toHaveAttribute('aria-pressed', 'false');
  await expect(label).toBeFocused();
  await label.click();
  await page.locator('#fs-fashion-dossier h3').first().click();
  await expect(label).toHaveAttribute('aria-expanded', 'false');
  await expect(label).toHaveAttribute('aria-pressed', 'false');
});

test('all ROSÉ feature text remains readable at doubled size with accessible open cards @responsive @cross-browser', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.goto('/first-sight');
  for (const outfit of expectedOutfits) {
    await analyseOutfit(page, outfit.button);
    for (const piece of outfit.pieces) {
      await selectPiece(page, piece.id);
      // Dossiers remount per piece, so every computed font is doubled exactly once.
      await page.locator('#fs-fashion-dossier').evaluate(dossier => {
        const nodes = [dossier, ...dossier.querySelectorAll('*')]
          .filter((element): element is HTMLElement => element instanceof HTMLElement)
          .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
        for (const { element, size } of nodes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
      });
      const labels = page.locator('.fs-dossier-feature-label');
      for (const label of await labels.all()) {
        const bounds = await label.boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(56);
        const text = label.locator('.fs-dossier-feature-text');
        await expect(text).toBeVisible();
        expect(await text.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
        await expect(label.locator('.fs-dossier-feature-toggle')).toBeVisible();
      }
      await expectConnectedFeatures(page);
      const label = labels.last();
      await label.click();
      await expect(await explanation(page, label)).toBeVisible();
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
    const result = await new AxeBuilder({ page }).include('#fs-fashion-dossier')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
    await testInfo.attach(`axe-dossier-tags-${outfit.id}`, {
      body: JSON.stringify({ violations: result.violations, incomplete: result.incomplete }, null, 2),
      contentType: 'application/json',
    });
    expect(result.violations).toEqual([]);
  }
});
