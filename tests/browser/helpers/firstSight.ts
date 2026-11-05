import { expect, type Locator, type Page } from '@playwright/test';
import { studies, type ExpectedStudy } from '../fixtures/expected-edits';

/** Enter through the public sample control; file selection alone must remain a separate action. */
export async function analyseSample(page: Page): Promise<void> {
  await page.goto('/first-sight');
  await page.getByRole('button', { name: /Try the Chloé bag/ }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(studies.length);
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'result');
}

/** Recognition controls own the selected edit; never reach into React's private event properties. */
export async function selectStudy(page: Page, study: ExpectedStudy): Promise<void> {
  await page.getByRole('list', { name: 'Choose a fashion story' })
    .getByRole('button').filter({ has: page.getByText(study.name, { exact: true }) }).click();
  await expect(page.locator('.fs-recognition-card.is-selected strong')).toHaveText(study.name);
  await expect(page.locator('#fs-fashion-dossier h3').first()).toHaveText(study.name);
}

/** Assert authored card order, classification and counts independently of the fixture implementation. */
export async function expectArchiveEdit(page: Page, study: ExpectedStudy): Promise<void> {
  const cards = page.locator('.fs-purchase-card');
  await expect(cards).toHaveCount(study.archive.length);
  await expect(cards.locator('h3')).toHaveText(study.archive.map(offer => offer.title));
  await expect(cards.locator('.fs-product-badge')).toHaveText(study.archive.map(offer => offer.label));
  await expect(page.locator('.fs-selected-edit strong')).toHaveText(study.name);
  await expect(page.locator('.fs-archive-toolbar-copy h3')).toContainText(`${study.archive.length} pieces`);
  await expect(page.locator('.fs-shop-toolbar .fs-style-match-count')).toHaveText(String(study.styles.length));
  for (const style of study.styles) await expect(cards.getByRole('heading', { name: style.title, exact: true })).toHaveCount(0);
}

export async function openInspire(page: Page, entry: 'marketplace' | 'product' = 'marketplace'): Promise<Locator> {
  const trigger = page.locator(entry === 'marketplace'
    ? '.fs-shop-toolbar .fs-style-match-trigger' : '.fs-pdp-inspire-prompt .fs-style-match-trigger');
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Explore similar styles', exact: true });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Close The Inspire' })).toBeFocused();
  return drawer;
}

export async function closeInspire(page: Page, method: 'button' | 'escape' = 'button'): Promise<void> {
  if (method === 'escape') await page.keyboard.press('Escape');
  else await page.getByRole('button', { name: 'Close The Inspire', exact: true }).click();
  await expect(page.locator('.fs-style-drawer')).not.toBeVisible();
}

export async function openArchiveProduct(page: Page, title: string): Promise<Locator> {
  await page.getByRole('button', { name: `View piece: ${title}`, exact: true }).click();
  const product = page.locator('.fs-pdp');
  await expect(product.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
  return product;
}
