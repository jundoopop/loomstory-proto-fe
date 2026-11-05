/** Only ignored supplied media is substituted; tracked assets must still load normally. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

export const testPhotoPath = fileURLToPath(new URL('../fixtures/test-photo.png', import.meta.url));
const testPhoto = readFileSync(testPhotoPath);

export async function substituteLocalMedia(page: Page) {
  await page.route('**/local-media/chloe/**', route => route.fulfill({
    status: 200, contentType: 'image/png', body: testPhoto,
  }));
  await page.route('**/local-media/outfits/**', route => route.fulfill({
    status: 200, contentType: 'image/png', body: testPhoto,
  }));
}
