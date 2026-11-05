/** Check the built App route; the development harness is deliberately unavailable here. */
import { defineConfig } from '@playwright/test';
import shared from './playwright.config';

const port = Number(process.env.FIRST_SIGHT_PREVIEW_PORT ?? 4183);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid FIRST_SIGHT_PREVIEW_PORT');
const baseURL = `http://127.0.0.1:${port}`;

// Use one object: defineConfig(shared, overrides) concatenates servers/projects instead of replacing them.
export default defineConfig({
  ...shared,
  testMatch: ['**/firstSight.flow.spec.ts', '**/firstSight.outfits.spec.ts', '**/firstSight.dossier.spec.ts', '**/discover.flow.spec.ts', '**/discover.landscape.spec.ts'],
  grep: /@preview/,
  outputDir: 'test-results/preview',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/preview', open: 'never' }]],
  use: { ...shared.use, baseURL },
  webServer: {
    command: `npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [{ name: 'preview-chromium', use: { browserName: 'chromium' } }],
});
