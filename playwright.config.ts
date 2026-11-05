/** Repository-owned browser checks: isolated contexts and a server owned by this run. */
import { defineConfig } from '@playwright/test';

const port = Number(process.env.FIRST_SIGHT_TEST_PORT ?? 5183);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid FIRST_SIGHT_TEST_PORT');
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  // Keep screenshots, timing and memory use predictable on a development laptop.
  workers: process.env.CI ? 2 : 3,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium' } },
    ...[1024, 768, 320].map(width => ({
      name: `chromium-${width}`,
      grep: /@responsive/,
      use: { browserName: 'chromium' as const, viewport: { width, height: 1000 } },
    })),
    { name: 'chromium-390', grep: /@responsive|@cross-browser/, use: {
      browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    } },
    ...(['firefox', 'webkit'] as const).flatMap(browserName => [
      { name: `${browserName}-desktop`, grep: /@cross-browser/, use: { browserName } },
      { name: `${browserName}-390`, grep: /@cross-browser/, use: {
        browserName, viewport: { width: 390, height: 844 }, hasTouch: true,
      } },
    ]),
  ],
});
