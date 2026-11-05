/** Consumer coverage for registered same-photograph examples, alongside the retained legacy suite. */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';
import { expectedOutfits, type ExpectedOutfit, type ExpectedOutfitPiece } from './fixtures/expected-outfits';
import { openArchiveProduct } from './helpers/firstSight';

const savedKey = 'loomstory-web:saved:v1';

async function chooseExample(page: Page, outfit: ExpectedOutfit) {
  // Native button names also include the visible list of pieces; retain that useful description.
  await page.getByRole('button', { name: outfit.button, exact: false }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expect(page.locator('.fs-analyze-button')).toBeEnabled();
}

async function analyseExample(page: Page, outfit: ExpectedOutfit) {
  await chooseExample(page, outfit);
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'result');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(outfit.pieces.length);
}

function card(page: Page, piece: ExpectedOutfitPiece) {
  return page.locator(`.fs-purchase-card[data-product-id="${piece.productId}"]`);
}

async function expectWholeLook(page: Page, outfit: ExpectedOutfit) {
  await expect(page.locator('.fs-recognition-card').first()).toHaveAttribute('data-item-id', /./);
  await expect(page.locator('.fs-recognition-card strong')).toHaveText(outfit.pieces.map(piece => piece.name));
  await expect(page.locator('.fs-purchase-card')).toHaveCount(outfit.pieces.length);
  for (const piece of outfit.pieces) await expect(card(page, piece)).toHaveCount(1);
  await expect(page.locator('.fs-recognition-score')).toHaveCount(0);
  await expect(page.locator('.fs-dossier-resale')).toHaveCount(0);
}

test('FirstSight offers real branded examples with explicit analysis and exact photo members @responsive @cross-browser @preview', async ({ page }) => {
  await page.goto('/first-sight');
  await expect(page.getByRole('button', { name: /Try the Chloé bag/ })).toBeVisible();
  for (const outfit of expectedOutfits) {
    await analyseExample(page, outfit);
    await expectWholeLook(page, outfit);
    await expect(page.locator('.fs-recognition-card.is-selected')).toHaveAttribute('data-item-id', outfit.primaryItemId);
    const primary = outfit.pieces.find(piece => piece.id === outfit.primaryItemId)!;
    await expect(page.locator('#fs-fashion-dossier h3').first()).toHaveText(primary.name);
    await expect(page.locator('.fs-recognition-note')).toContainText(/prepared|curated|reference/i);
  }
});

test('another piece opens and saves while the bag is selected and mixed-piece bag lines remain distinct @cross-browser @preview', async ({ page }) => {
  await page.goto('/first-sight');
  const outfit = expectedOutfits[0];
  await analyseExample(page, outfit);
  const bag = outfit.pieces[0];
  const top = outfit.pieces[1];
  await expect(page.locator('.fs-recognition-card.is-selected')).toHaveAttribute('data-item-id', bag.id);
  await card(page, top).getByRole('button', { name: `Save ${top.name}`, exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey)).toEqual([top.productId]);
  const journal = page.locator('.fs-context-section');
  await journal.getByRole('button', { name: 'Save ROSÉ look', exact: true }).click();
  await expect(journal.getByRole('button', { name: 'Unsave ROSÉ look', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey)).toEqual([top.productId]);

  for (const piece of [top, bag]) {
    const product = await openArchiveProduct(page, piece.name);
    await expect(page.locator('.fs-recognition-card.is-selected')).toHaveAttribute('data-item-id', piece.id);
    await expect(page.locator('#fs-fashion-dossier h3').first()).toHaveText(piece.name);
    await expectWholeLook(page, outfit);
    await expect(journal.getByRole('button', { name: 'Unsave ROSÉ look', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const available = product.getByRole('button', { name: /^Size .+, \d+ available$/ }).first();
    await available.click();
    await product.getByRole('button', { name: 'Add to bag', exact: true }).click();
    await product.getByRole('button', { name: 'Back to your matches', exact: true }).click();
  }
  await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 2');
  await page.locator('.fs-bag-button').click();
  const preview = page.locator('.fs-cart-dialog');
  await expect(preview).toBeVisible();
  await expect(preview.locator('.fs-cart-line h3')).toHaveText([top.name, bag.name]);
  await expect(preview.locator('.fs-cart-line small')).toHaveCount(2);
  const skus = await preview.locator('.fs-cart-line small').allTextContents();
  expect(new Set(skus).size).toBe(2);
  await preview.getByRole('button', { name: 'Close bag preview', exact: true }).click();
  await expect(card(page, top).getByRole('button', { name: `Unsave ${top.name}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/wardrobe');
  await expect(page.locator('.wardrobe-section')).toContainText(top.name);
});

test('result controls select the linked dossier with keyboard access and no axe failures @responsive @cross-browser', async ({ page, browserName }, testInfo) => {
  await page.goto('/first-sight');
  const outfit = expectedOutfits[0];
  await analyseExample(page, outfit);
  const skirt = outfit.pieces[2];
  const selection = page.getByRole('list', { name: 'Choose a fashion story' })
    .locator(`[data-item-id="${skirt.id}"]`);
  // Establish a start, then use native navigation to enter keyboard focus modality.
  // Firefox does not infer :focus-visible from programmatic focus after a pointer action.
  const nextControl = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.locator('.fs-recognition-card').first().focus();
  await page.keyboard.press(nextControl);
  await page.keyboard.press(nextControl);
  await expect(selection).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(selection).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#fs-fashion-dossier h3').first()).toHaveText(skirt.name);
  await expect(selection).toHaveCSS('outline-style', 'solid');
  await expectWholeLook(page, outfit);
  const axe = await new AxeBuilder({ page }).include('.first-sight')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  await testInfo.attach('axe-whole-outfit', {
    body: JSON.stringify({ violations: axe.violations, incomplete: axe.incomplete }, null, 2),
    contentType: 'application/json',
  });
  expect(axe.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('changing examples clears earlier results and cancellation cannot restore the previous look @cross-browser', async ({ page }) => {
  await page.goto('/first-sight');
  await analyseExample(page, expectedOutfits[0]);
  await chooseExample(page, expectedOutfits[1]);
  await expect(page.locator('.fs-purchase-card')).toHaveCount(0);
  await page.locator('.fs-analyze-button').click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'result');
  await expectWholeLook(page, expectedOutfits[1]);
  await page.locator('.fs-workspace-file-tools').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'upload');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expect(page.locator('.fs-purchase-card')).toHaveCount(0);
});

test('the track example keeps trousers and footwear usable with doubled text @responsive @cross-browser', async ({ page }) => {
  await page.goto('/first-sight');
  const outfit = expectedOutfits[1];
  await analyseExample(page, outfit);
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll('.first-sight *')]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    for (const { element, size } of sizes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
  });
  for (const piece of [outfit.pieces[0], outfit.pieces[2]]) {
    const product = await openArchiveProduct(page, piece.name);
    await expect(page.locator('.fs-recognition-card.is-selected')).toHaveAttribute('data-item-id', piece.id);
    await expect(product.getByRole('button', { name: 'Add to bag', exact: true })).toBeDisabled();
    await product.getByRole('button', { name: /^Size .+, \d+ available$/ }).first().click();
    await expect(product.getByRole('button', { name: 'Add to bag', exact: true })).toBeEnabled();
    await product.getByRole('button', { name: 'Back to your matches', exact: true }).click();
  }
  await expectWholeLook(page, outfit);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
