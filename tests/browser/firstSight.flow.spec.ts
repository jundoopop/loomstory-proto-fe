import { fileURLToPath } from 'node:url';
import { test, expect } from './helpers/diagnostics';
import { archiveCardDetails, studies } from './fixtures/expected-edits';
import { analyseSample, closeInspire, expectArchiveEdit, openArchiveProduct, openInspire, selectStudy } from './helpers/firstSight';

const savedKey = 'loomstory-web:saved:v1';
const uploadPhoto = fileURLToPath(new URL('./fixtures/test-photo.png', import.meta.url));

test('explicit analysis and all five edits retain archive-first commerce @responsive @cross-browser @preview', async ({ page }) => {
  await analyseSample(page);
  const originalPhoto = await page.locator('.fs-workspace-preview').getAttribute('src');

  for (const study of studies) {
    await selectStudy(page, study);
    await expectArchiveEdit(page, study);
    await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', originalPhoto!);
    await expect(page.getByRole('complementary', { name: 'Contextual outfit feed' })).toBeVisible();
    await expect(page.locator('.fs-context-section .fs-look-relationship')).toHaveCount(4);

    const drawer = await openInspire(page);
    await expect(drawer.locator('.fs-style-match-card')).toHaveCount(study.styles.length);
    await expect(drawer.locator('h3')).toHaveText(study.styles.map(offer => offer.title));
    await expect(drawer.locator('.fs-style-match-label')).toHaveText(study.styles.map(() => 'Partner-offer preview'));
    await closeInspire(page);
    await expect(page.locator('.fs-shop-toolbar .fs-style-match-trigger')).toBeFocused();
  }
});

test('unavailable archive cards remain viewable and saveable while partial stock stays available @responsive @cross-browser @preview', async ({ page, browserName }) => {
  await analyseSample(page);
  // macOS WebKit uses Option+Tab to include buttons; preserve its native navigation preference.
  const nextControl = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  const cards = page.locator('.fs-purchase-card');
  const unavailableOffer = studies[0].archive[2];
  const unavailable = cards.nth(2);
  await expect(cards.locator('.fs-product-stock')).toHaveCount(1);
  await expect(unavailable).toHaveClass(/is-out-of-stock/);
  await expect(unavailable).toHaveCSS('filter', 'grayscale(1)');
  for (const field of await unavailable.locator('.fs-purchase-details > *, .fs-product-name > button').all()) {
    await expect(field).toHaveCSS('text-decoration-line', 'line-through');
  }
  await expect(unavailable.locator('.fs-product-stock')).toHaveText('Out of stock');
  await expect(unavailable.locator('.fs-product-stock')).toHaveCSS('text-decoration-line', 'none');
  const availableCards = page.locator('.fs-purchase-card:not(.is-out-of-stock)');
  await expect(availableCards).toHaveCount(2);
  for (const available of await availableCards.all()) {
    await expect(available).toHaveCSS('filter', 'none');
  }

  // Tab from the image to the independent save control, then to the product name.
  await unavailable.locator('.fs-purchase-open').focus();
  await page.keyboard.press(nextControl);
  const save = unavailable.locator('.fs-look-save');
  await expect(save).toHaveAttribute('aria-label', `Save ${unavailableOffer.title}`);
  await expect(save).toBeFocused();
  await expect(save).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Space');
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey))
    .toEqual([unavailableOffer.id]);
  await page.keyboard.press(nextControl);
  await expect(unavailable.locator('.fs-product-name > button')).toBeFocused();
  await page.keyboard.press('Enter');
  let pdp = page.locator('.fs-pdp');
  await expect(pdp.getByRole('heading', { level: 2, name: unavailableOffer.title, exact: true })).toBeVisible();
  await expect(pdp.getByRole('button', { name: 'Add to bag', exact: true })).toBeDisabled();
  await expect(pdp.getByRole('button', { name: 'Buy now', exact: true })).toBeDisabled();
  await expect(pdp.getByRole('button', { name: 'Size One size, out of stock', exact: true })).toBeDisabled();
  const specifications = pdp.locator('.fs-pdp-specifications');
  await expect(specifications.locator('dt')).toHaveText([
    'Material', 'Condition', 'Category', 'Colour', 'Era', 'Listing type', 'Source',
  ]);
  await expect(specifications.locator('dd')).toContainText([
    'Suede calfskin', 'Excellent · sample reissue', 'Bags', 'Vintage brown', '2020s',
    unavailableOffer.label, 'Sample offer · reference photo',
  ]);
  await pdp.getByRole('button', { name: 'Back to your matches' }).click();

  // The image independently opens the same canonical piece after the clean title entry.
  pdp = await openArchiveProduct(page, unavailableOffer.title);
  await expect(pdp.getByRole('button', { name: 'Add to bag', exact: true })).toBeDisabled();
  await pdp.getByRole('button', { name: 'Back to your matches' }).click();
  await unavailable.getByRole('button', { name: `Unsave ${unavailableOffer.title}`, exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey)).toEqual([]);
  await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 0');

  // The bomber has an exhausted S SKU, but its M/L stock must keep the card in colour.
  await selectStudy(page, studies[1]);
  await expect(cards.locator('.fs-product-stock')).toHaveCount(0);
  await expect(cards.filter({ has: page.getByRole('button', {
    name: `View purchase options for ${studies[1].archive[0].title}`, exact: true,
  }) })).not.toHaveClass(/is-out-of-stock/);
  pdp = await openArchiveProduct(page, studies[1].archive[0].title);
  await expect(pdp.getByRole('button', { name: 'Size S, out of stock', exact: true })).toBeDisabled();
  await expect(pdp.getByRole('button', { name: 'Size M, 2 available', exact: true })).toBeEnabled();
  await pdp.getByRole('button', { name: 'Size M, 2 available', exact: true }).click();
  await expect(pdp.getByRole('button', { name: 'Add to bag', exact: true })).toBeEnabled();
});

test('archive card names and prices reflow with doubled text and keyboard access @responsive @cross-browser', async ({ page, browserName }) => {
  await analyseSample(page);
  const nextControl = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await selectStudy(page, studies[2]);
  await page.evaluate(() => {
    // Capture computed values before applying them so inherited text doubles exactly once.
    const sizes = [...document.querySelectorAll('.fs-purchase-card, .fs-purchase-card *')]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    for (const { element, size } of sizes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
  });
  const cards = page.locator('.fs-purchase-card');
  await expect(cards.locator('.fs-product-name')).toHaveText(studies[2].archive.map(offer => archiveCardDetails[offer.id].name));
  for (const card of await cards.all()) {
    expect(await card.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    for (const field of await card.locator('.fs-purchase-details > *, .fs-product-name > button').all()) {
      const overflow = await field.evaluate(element => ({
        horizontal: element.scrollWidth - element.clientWidth,
        vertical: element.scrollHeight - element.clientHeight,
      }));
      expect(overflow.horizontal).toBeLessThanOrEqual(1);
      expect(overflow.vertical).toBeLessThanOrEqual(1);
    }
    for (const control of await card.getByRole('button').all()) {
      const bounds = await control.boundingBox();
      expect(bounds, 'Each image, heart and title has measurable geometry').not.toBeNull();
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    .toBeLessThanOrEqual(1);
  const first = cards.first();
  await first.locator('.fs-purchase-open').focus();
  await page.keyboard.press(nextControl);
  await expect(first.locator('.fs-look-save')).toBeFocused();
  await page.keyboard.press(nextControl);
  await expect(first.locator('.fs-product-name > button')).toBeFocused();
  await expect(first.locator('.fs-product-name > button')).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('.fs-pdp h2')).toHaveText(studies[2].archive[0].title);
});

test('both Inspire entries retain visit choices and PDP state without changing archive commerce @cross-browser @preview', async ({ page }) => {
  await analyseSample(page);
  const study = studies[0];
  const archiveSave = page.locator('.fs-purchase-card').first().getByRole('button', { name: `Save ${study.archive[0].title}`, exact: true });
  await archiveSave.click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey))
    .toEqual([study.archive[0].id]);

  let drawer = await openInspire(page);
  const preview = drawer.getByRole('button', { name: 'Preview partner offer' });
  await expect(preview).toBeDisabled();
  await drawer.getByRole('button', { name: 'Size One size, 3 available', exact: true }).click();
  await drawer.getByRole('button', { name: `Save style: ${study.styles[0].title}`, exact: true }).click();
  await preview.click();
  await expect(drawer.getByRole('status')).toContainText('No purchase has been made.');
  await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 0');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), savedKey))
    .toEqual([study.archive[0].id]);
  await closeInspire(page, 'escape');

  // A different study may show another edit, but must not erase this visit's saved style or size.
  await selectStudy(page, studies[4]);
  await selectStudy(page, study);

  const pdp = await openArchiveProduct(page, study.archive[0].title);
  await expect(pdp.getByRole('button', { name: 'Add to bag' })).toBeDisabled();
  await pdp.getByRole('button', { name: 'Size One size, 1 available', exact: true }).click();
  const activePhoto = await pdp.locator('.fs-pdp-main-image img').getAttribute('src');
  drawer = await openInspire(page, 'product');
  await expect(drawer.getByRole('button', { name: 'Size One size, 3 available', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(drawer.getByRole('button', { name: `Save style: ${study.styles[0].title}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await closeInspire(page);
  await expect(pdp.locator('.fs-pdp-inspire-prompt button')).toBeFocused();
  await expect(pdp.locator('.fs-pdp-main-image img')).toHaveAttribute('src', activePhoto!);
  await expect(pdp.getByRole('button', { name: 'Size One size, 1 available', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(pdp.getByRole('button', { name: 'Add to bag' })).toBeEnabled();
  // Cultural notes remain alongside the archive PDP; partner products require opting into Inspire.
  await expect(pdp.locator('.fs-pdp-style-note')).toHaveCount(2);
  await expect(pdp.locator('.fs-pdp-note-label > :first-child')).toHaveText([
    'Styling inspiration', 'Styling inspiration',
  ]);
  await expect(pdp.locator('.fs-pdp-look-link')).toHaveCount(2);
  for (const style of study.styles) {
    await expect(pdp.getByRole('heading', { name: style.title, exact: true })).toHaveCount(0);
  }

  await page.locator('.fs-bag-button').click();
  await expect(page.getByRole('dialog', { name: 'Your edit.' }).locator('.fs-cart-line')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close bag preview' }).click();
});

test('archive bag quantities respect stock and retain the edit across study changes @cross-browser', async ({ page }) => {
  await analyseSample(page);
  const paddington = studies[0];
  let pdp = await openArchiveProduct(page, paddington.archive[0].title);
  await pdp.getByRole('button', { name: 'Size One size, 1 available', exact: true }).click();
  await pdp.getByRole('button', { name: 'Add to bag' }).click();
  await pdp.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 1');
  await pdp.getByRole('button', { name: 'Back to your matches' }).click();

  pdp = await openArchiveProduct(page, paddington.archive[1].title);
  await pdp.getByRole('button', { name: 'Size One size, 2 available', exact: true }).click();
  for (let i = 0; i < 3; i++) await pdp.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 3');
  await pdp.getByRole('button', { name: 'Back to your matches' }).click();

  pdp = await openArchiveProduct(page, paddington.archive[2].title);
  await expect(pdp.getByRole('button', { name: 'Size One size, out of stock', exact: true })).toBeDisabled();
  await expect(pdp.getByRole('button', { name: 'Add to bag' })).toBeDisabled();
  await expect(pdp.getByRole('button', { name: 'Buy now' })).toBeDisabled();
  await selectStudy(page, studies[1]);
  await expect(page.locator('.fs-pdp')).toHaveCount(0);

  await page.locator('.fs-bag-button').click();
  // The dialog's accessible name changes on checkout completion; retain its stable host locator.
  const bag = page.locator('.fs-cart-dialog');
  await expect(bag.locator('.fs-cart-line h3')).toHaveText(paddington.archive.slice(0, 2).map(offer => offer.title));
  await expect(bag.getByLabel(`Quantity of ${paddington.archive[0].title}, size One size`)).toHaveValue('1');
  const completeQuantity = bag.getByLabel(`Quantity of ${paddington.archive[1].title}, size One size`);
  await expect(completeQuantity).toHaveValue('2');
  await expect(completeQuantity.locator('option')).toHaveText(['1', '2']);
  await completeQuantity.selectOption('1');
  await expect(page.locator('.fs-bag-button')).toHaveText('Your bag 2');
  await bag.getByRole('button', { name: `Remove ${paddington.archive[0].title}, size One size`, exact: true }).click();
  await expect(bag.locator('.fs-cart-line')).toHaveCount(1);
  await bag.getByRole('button', { name: 'Preview checkout', exact: false }).click();
  await expect(bag).toContainText('No order was placed and no payment was taken.');
  await bag.getByRole('button', { name: 'Keep exploring' }).click();
  await page.locator('.fs-bag-button').click();
  await expect(bag).toContainText('Your edit.');
  await expect(bag.locator('.fs-cart-line')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(bag).not.toBeVisible();
});

test('archive wardrobe persists while Inspire saves and sizes reset on a fresh page visit', async ({ page }) => {
  await analyseSample(page);
  const study = studies[0];
  await page.locator('.fs-purchase-card').first().getByRole('button', { name: `Save ${study.archive[0].title}`, exact: true }).click();
  const drawer = await openInspire(page);
  await drawer.getByRole('button', { name: 'Size One size, 3 available', exact: true }).click();
  await drawer.getByRole('button', { name: `Save style: ${study.styles[0].title}`, exact: true }).click();
  await closeInspire(page);

  await page.goto('/wardrobe');
  await expect(page.locator('.wardrobe-section')).toContainText(study.archive[0].title);
  await expect(page.locator('.wardrobe-section')).not.toContainText(study.styles[0].title);
  await page.reload();
  await expect(page.locator('.wardrobe-section')).toContainText(study.archive[0].title);
  await analyseSample(page);
  await expect(page.locator('.fs-purchase-card').first().getByRole('button', { name: `Unsave ${study.archive[0].title}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
  const freshDrawer = await openInspire(page);
  await expect(freshDrawer.getByRole('button', { name: 'Size One size, 3 available', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(freshDrawer.getByRole('button', { name: `Save style: ${study.styles[0].title}`, exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(freshDrawer.getByRole('button', { name: 'Preview partner offer' })).toBeDisabled();
});

test('a local upload requires explicit analysis, cancellation retains it and removal clears results @cross-browser @preview', async ({ page }) => {
  await page.goto('/first-sight');
  await expect(page.locator('.fs-analyze-button')).toBeDisabled();
  await page.getByLabel('Choose a garment photo', { exact: true }).setInputFiles(uploadPhoto);
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  const blobUrl = await page.locator('.fs-workspace-preview').getAttribute('src');
  await page.locator('.fs-analyze-button').click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', blobUrl!);
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expect(page.locator('.fs-error')).toHaveCount(0);
  await page.locator('.fs-analyze-button').click();
  await expect(page.locator('.fs-recognition-card')).toHaveCount(5);
  await expectArchiveEdit(page, studies[0]);
  await page.locator('.fs-workspace-file-tools').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.locator('.fs-photo-workspace')).toHaveAttribute('data-state', 'upload');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expect(page.locator('.fs-products-empty')).toBeVisible();
  await expect(page.locator('.fs-analyze-button')).toBeDisabled();
});

test('unsupported, empty, oversized and corrupt files fail locally without starting analysis', async ({ page }) => {
  await page.goto('/first-sight');
  const input = page.getByLabel('Choose a garment photo', { exact: true });
  for (const payload of [
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') },
    { name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) },
    { name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) },
  ]) {
    await input.setInputFiles(payload);
    await expect(page.getByRole('alert')).toHaveText('Choose a nonempty JPG, PNG, or WebP photo up to 5 MB.');
    await expect(page.locator('.fs-analyze-button')).toBeDisabled();
    await expect(page.locator('.fs-workspace-preview')).toHaveCount(0);
  }
  await input.setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG image') });
  await expect(page.getByRole('alert')).toHaveText('This photo could not be opened. Please choose another image.');
  await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
  await expect(page.locator('.fs-analyze-button')).toBeDisabled();
  await input.setInputFiles(uploadPhoto);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.fs-analyze-button')).toBeEnabled();
});

test('supported JPEG and WebP files preview locally without starting analysis @cross-browser', async ({ page }) => {
  await page.goto('/first-sight');
  for (const [index, extension] of ['jpg', 'webp'].entries()) {
    const input = page.getByLabel(index ? 'Replace selected photograph' : 'Choose a garment photo', { exact: true });
    await input.setInputFiles(fileURLToPath(new URL(`./fixtures/test-photo.${extension}`, import.meta.url)));
    await expect(page.locator('.fs-workspace-preview')).toHaveAttribute('src', /^blob:/);
    await expect(page.locator('.fs-workspace-filename')).toHaveText(`test-photo.${extension}`);
    await expect(page.locator('.fs-analyze-button')).toBeEnabled();
    await expect(page.locator('.fs-recognition-card')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
  }
});

test('journal relationships retain their source credits and design context @cross-browser', async ({ page }) => {
  await analyseSample(page);
  // Geographic inspiration now belongs to Discover; item relationships stay beside shopping.
  await expect(page.locator('#fs-trend-board')).toHaveCount(0);
  const journal = page.getByRole('complementary', { name: 'Contextual outfit feed' });
  await expect(journal.locator('.fs-look-relationship')).toHaveText([
    'Styling inspiration', 'Styling inspiration', 'Runway reference', 'Runway reference',
  ]);
  await journal.locator('.fs-look-open').nth(2).click();
  const dialog = page.locator('.fs-context-section .fs-look-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.fs-section-kicker')).toHaveText('Runway reference / STYLE REFERENCE');
  await expect(dialog.locator('.fs-photo-credit')).toContainText('Photo:');
  await expect(dialog).toContainText('It does not identify or authenticate this individual piece');
  await dialog.getByRole('button', { name: 'Close outfit details', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
