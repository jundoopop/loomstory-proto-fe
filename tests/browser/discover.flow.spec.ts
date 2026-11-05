/** Real-route checks cover the inspiration entry point without deriving expectations from its selector. */
import { fileURLToPath } from 'node:url';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';
import { expectedInspirationCollections, boardReference } from './fixtures/expected-inspiration';
import { studies } from './fixtures/expected-edits';
import { closeInspire, openInspire, selectStudy } from './helpers/firstSight';

const savedKey = 'loomstory-web:saved:v1';
const uploadPhoto = fileURLToPath(new URL('./fixtures/test-photo.png', import.meta.url));

async function expectReferenceReady(page: Page, reference: { image: string; celebrity: string; title: string; credit: string; source: string; licenceUrl: string }) {
  const workspace = page.locator('.fs-photo-workspace');
  await expect(workspace).toHaveAttribute('data-state', 'ready');
  await expect(workspace.locator('.fs-workspace-preview')).toHaveAttribute('src', reference.image);
  await expect(workspace.locator('.fs-workspace-photo-label')).toHaveText('DISCOVER REFERENCE');
  await expect(workspace.locator('.fs-workspace-filename')).toHaveText(`${reference.celebrity} — ${reference.title}`);
  const credit = workspace.locator('.fs-workspace-reference-credit');
  await expect(credit).toContainText(reference.credit);
  await expect(credit.locator(`a[href="${reference.source}"]`)).toBeVisible();
  await expect(credit.locator(`a[href="${reference.licenceUrl}"]`)).toBeVisible();
  await expect(workspace.locator('.fs-analyze-button')).toBeEnabled();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expect(workspace).toContainText(/prepared/i);
}

/** Loading a card on demand exercises native lazy images without replacing tracked photographs. */
async function expectLoadedImages(images: Locator) {
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => {
      const photo = element as HTMLImageElement;
      return photo.complete && photo.naturalWidth > 0;
    })).toBe(true);
  }
}

test('direct Discover entry keeps four authored covers and six-look boards @responsive @cross-browser @preview', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /^Discover\.?$/, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'The inspiration edit', exact: true })).toBeVisible();
  const controls = page.getByRole('group', { name: 'Choose an inspiration collection' });
  await expect(controls.getByRole('button')).toHaveCount(4);
  const board = page.locator('#fs-trend-board');
  await expect(board).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filter outfits by region' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Explore collection/ })).toHaveCount(0);
  for (const collection of expectedInspirationCollections) {
    await controls.getByRole('button', { name: collection.title, exact: true }).click();
    await expect(controls.getByRole('button', { name: collection.title, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.fs-trend-visual > img')).toHaveAttribute('src', collection.image);
    await expect(page.locator('.fs-trend-visual figcaption > strong')).toHaveText(collection.headline);
    await expect(page.locator('.fs-trend-credit')).toContainText(collection.credit);
    await expect(page.locator('.fs-trend-credit a').first()).toHaveAttribute('href', collection.source);
    await expect(page.locator('.fs-trend-actions').getByRole('button', { name: 'Explore in FirstSight', exact: true }))
      .toBeEnabled();
    await expect(board.locator('.fs-look')).toHaveCount(6);
    const ids = await board.locator('.fs-look-open > img').evaluateAll(images => images.map(image =>
      image.getAttribute('src')!.split('/').at(-1)!.replace(/\.[^.]+$/, '')));
    expect(ids).toEqual(collection.looks);
    await expect(board.locator('.fs-look-region')).toHaveCount(6);
    for (const badge of await board.locator('.fs-look-region').all()) await expect(badge).toHaveText(/^(Korea|Japan|China|Global)$/);
    await expect(board.locator('.fs-look-relationship')).toHaveCount(0);
    const columns = await board.locator('.fs-masonry').evaluate(element => getComputedStyle(element).columnCount);
    const { width, height } = page.viewportSize()!;
    const landscape = width >= 1024 && height >= 600 && width > height;
    expect(columns).toBe(String(landscape ? 2 : width > 1000 ? 3 : width >= 600 ? 2 : 1));
    await expectLoadedImages(board.locator('.fs-look-open > img'));
  }
});

test('a cover reference survives reload and Back while analysis stays explicit @cross-browser @preview', async ({ page }) => {
  const collection = expectedInspirationCollections[1];
  await page.goto('/');
  await page.getByRole('button', { name: collection.title, exact: true }).click();
  await page.locator('.fs-trend-actions').getByRole('button', { name: 'Explore in FirstSight', exact: true }).click();
  await expect(page).toHaveURL(url => url.pathname === '/first-sight' && url.searchParams.get('look') === collection.heroId);
  await expectReferenceReady(page, { ...collection, title: collection.lookTitle });
  await expect(page.locator('#discover-inspiration')).toHaveCount(0);
  await expect(page.locator('.fs-journey-bar nav a[href="#fs-recognition"]')).toBeVisible();
  await expect(page.locator('.fs-journey-bar nav a[href^="#"]')).toHaveCount(2);
  await expect(page.locator('.fs-journey-bar nav a[href="#fs-similar-pieces"]')).toBeVisible();
  await page.reload();
  await expectReferenceReady(page, { ...collection, title: collection.lookTitle });
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
  await expect(page.locator('.fs-selected-edit strong')).toHaveText(studies[0].name);
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', collection.image);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: /^Discover\.?$/, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: collection.title, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#fs-trend-board .fs-look')).toHaveCount(6);
});

test('a photograph dialog hands its own sourced reference to FirstSight @cross-browser', async ({ page }) => {
  await page.goto('/');
  const board = page.locator('#fs-trend-board');
  await board.getByRole('button', { name: `View look: ${boardReference.celebrity}. ${boardReference.title}`, exact: true }).click();
  const dialog = board.getByRole('dialog', { name: boardReference.celebrity, exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.fs-photo-credit')).toContainText(boardReference.credit);
  await expect(dialog.getByRole('link', { name: /Open original source/ })).toHaveAttribute('href', boardReference.source);
  await dialog.getByRole('button', { name: 'Explore in FirstSight', exact: true }).click();
  await expectReferenceReady(page, boardReference);
  await expect(page).toHaveURL(url => url.pathname === '/first-sight' && url.searchParams.get('look') === boardReference.id);
  await expect(page.locator('.fs-context-section')).toHaveCount(0);
  await expect(page.locator('.fs-products-empty')).toBeVisible();
});

test('invalid reference IDs never create an image or start sample analysis @cross-browser', async ({ page }) => {
  for (const id of ['missing-reference', 'https://example.com/untrusted.jpg', '__proto__', '']) {
    await page.goto(`/first-sight?look=${encodeURIComponent(id)}`);
    await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'upload');
    await expect(page.locator('.fs-workspace-preview')).toHaveCount(0);
    await expect(page.locator('.fs-analyze-button')).toBeDisabled();
    await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
    await expect(page.locator('.first-sight')).toContainText(/reference.*unavailable/i);
  }
});

test('reference removal, replacement and another hand-off cannot restore obsolete analysis', async ({ page }) => {
  await page.goto(`/first-sight?look=${boardReference.id}`);
  await expectReferenceReady(page, boardReference);
  await page.locator('.fs-analyze-button').click();
  await page.locator('.fs-workspace-file-tools').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'upload');
  // Wait beyond the authored delay: removing during analysis must keep the late result discarded.
  await page.waitForTimeout(1050);
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  // A real storage event from another tab rerenders App without reviving the URL's removed photo.
  const otherTab = await page.context().newPage();
  await otherTab.goto('/about');
  await otherTab.evaluate(({ key, id }) => localStorage.setItem(key, JSON.stringify([id])), { key: savedKey, id: studies[0].archive[0].id });
  await expect(page.locator('#count')).toHaveText('1');
  await expect(page.locator('.fs-workspace-preview')).toHaveCount(0);
  await page.getByLabel('Choose a garment photo', { exact: true }).setInputFiles(uploadPhoto);
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', /^blob:/);
  const replacementUrl = await page.locator('.fs-workspace-preview').getAttribute('src');
  await otherTab.evaluate(key => localStorage.setItem(key, '[]'), savedKey);
  await expect(page.locator('#count')).toHaveText('0');
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', replacementUrl!);
  await otherTab.close();
  await expect(page.locator('.fs-workspace-reference-credit')).toHaveCount(0);
  await page.locator('.fs-analyze-button').click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await page.locator('.fs-journey-bar').getByRole('link', { name: /^Find inspiration in Discover/ }).click();
  await page.getByRole('button', { name: expectedInspirationCollections[2].title, exact: true }).click();
  await page.locator('.fs-trend-actions').getByRole('button', { name: 'Explore in FirstSight', exact: true }).click();
  await expectReferenceReady(page, { ...expectedInspirationCollections[2], title: expectedInspirationCollections[2].lookTitle });
  await page.getByLabel('Replace selected photograph', { exact: true }).setInputFiles(uploadPhoto);
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('.fs-workspace-reference-credit')).toHaveCount(0);
});

test('saved inspiration crosses routes for one visit without changing wardrobe or Inspire saves @cross-browser', async ({ page }) => {
  await page.goto('/');
  const discoverSave = page.locator('#fs-trend-board').getByRole('button', { name: 'Save Han So-hee look', exact: true });
  await discoverSave.click();
  await expect(page.locator('#fs-trend-board').getByRole('button', { name: 'Unsave Han So-hee look', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.fs-trend-actions').getByRole('button', { name: 'Explore in FirstSight', exact: true }).click();
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
  await selectStudy(page, studies[1]);
  const journal = page.locator('.fs-context-section');
  await expect(journal.getByRole('button', { name: 'Unsave Han So-hee look', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await journal.getByRole('button', { name: 'Unsave Han So-hee look', exact: true }).click();
  await journal.getByRole('button', { name: 'Save Zendaya look', exact: true }).click();
  const archive = studies[1].archive[0];
  await page.locator('.fs-purchase-card').first().getByRole('button', { name: `Save ${archive.title}`, exact: true }).click();
  const drawer = await openInspire(page);
  await drawer.getByRole('button', { name: `Save style: ${studies[1].styles[0].title}`, exact: true }).click();
  await closeInspire(page);
  await page.locator('.fs-journey-bar').getByRole('link', { name: /^Find inspiration in Discover/ }).click();
  await expect(page.locator('#fs-trend-board').getByRole('button', { name: 'Save Han So-hee look', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#fs-trend-board').getByRole('button', { name: 'Unsave Zendaya look', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey)).toEqual([archive.id]);
  await page.reload();
  await expect(page.locator('#fs-trend-board .fs-look-save[aria-pressed="true"]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey)).toEqual([archive.id]);
});

test('hybrid Discover retains Vault search, featured product saves and editorial destinations @preview', async ({ page }) => {
  await page.goto('/');
  const products = page.locator('.discover-page .card');
  await expect(products).toHaveCount(4);
  const savedButton = products.first().getByRole('button', { name: /^Save / });
  await savedButton.click();
  await expect(products.first().getByRole('button', { name: /^Unsave / })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.discover-page .split-banner').getByRole('link', { name: /Open the journal/ })).toHaveAttribute('href', '/stories');
  await expect(page.locator('.discover-page .split-banner').getByRole('link', { name: /Submit a piece/ })).toHaveAttribute('href', '/submit');
  await expect(page.locator('.discover-page').getByRole('link', { name: /View all pieces/ })).toHaveAttribute('href', '/vault');
  const search = page.locator('.discover-bar form');
  await search.getByRole('textbox').fill('denim');
  await search.getByRole('button', { name: /Search/ }).click();
  await expect(page).toHaveURL(/\/vault\?q=denim$/);
  await expect(page.getByRole('textbox', { name: 'Search collection', exact: true })).toHaveValue('denim');
  await expect(page.locator('.card')).not.toHaveCount(0);
});
