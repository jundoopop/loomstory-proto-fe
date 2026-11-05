/** Shared diagnostics keep ordinary tests strict and intentional failures explicit. */
import { test as base, expect } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { substituteLocalMedia } from './media';

export interface Diagnostics {
  allowConsoleError: (pattern: RegExp) => void;
  allowHttpError: (pattern: RegExp) => void;
  allowRequestFailure: (pattern: RegExp) => void;
}

export const test = base.extend<{ diagnostics: Diagnostics }>({
  launchOptions: async ({ browserName, launchOptions }, use) => {
    if (process.platform !== 'darwin' || browserName !== 'firefox') {
      await use(launchOptions);
      return;
    }
    // Firefox 157 still consults protected personal app data on macOS (Playwright #42768).
    // Give this test worker disposable app data without touching the user's Firefox profile.
    const directory = await mkdtemp(join(tmpdir(), 'loomstory-firefox-home-'));
    try {
      await use({ ...launchOptions,
        env: { ...process.env, ...launchOptions.env, CFFIXED_USER_HOME: directory },
        // Owned loopback servers must not inherit machine proxy routing in isolated test profiles.
        firefoxUserPrefs: { ...launchOptions.firefoxUserPrefs, 'network.proxy.type': 0 },
      });
    } finally {
      try { await rm(directory, { recursive: true, force: true }); }
      catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== 'EACCES' && code !== 'EPERM') throw error;
        // macOS can protect the disposable Library/Downloads it creates for Firefox.
        // Report retained test data rather than changing OS permissions or personal profiles.
        console.warn(`macOS retained disposable Firefox app data at ${directory} (${code}).`);
      }
    }
  },
  diagnostics: [async ({ page }, use, testInfo) => {
    await substituteLocalMedia(page);
    const failures: string[] = [];
    const allowedConsole: RegExp[] = [];
    const allowedHttp: RegExp[] = [];
    const allowedRequests: RegExp[] = [];
    page.on('pageerror', error => failures.push(`Page error: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error' && !allowedConsole.some(pattern => pattern.test(message.text()))) {
        failures.push(`Console error: ${message.text()}`);
      }
    });
    page.on('response', response => {
      if (response.status() >= 400 && !allowedHttp.some(pattern => pattern.test(response.url()))) {
        failures.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    page.on('requestfailed', request => {
      const reason = request.failure()?.errorText ?? 'unknown failure';
      // Navigation can cancel a lazy image legitimately. Other transport failures remain failures.
      if (/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(reason)) return;
      if (!allowedRequests.some(pattern => pattern.test(request.url()))) {
        failures.push(`Request failed: ${request.url()} (${reason})`);
      }
    });
    page.on('request', request => {
      if (request.method() !== 'GET' || ['fetch', 'xhr'].includes(request.resourceType())) {
        failures.push(`Unexpected application request: ${request.method()} ${request.url()}`);
      }
    });
    await use({
      allowConsoleError: pattern => allowedConsole.push(pattern),
      allowHttpError: pattern => allowedHttp.push(pattern),
      allowRequestFailure: pattern => allowedRequests.push(pattern),
    });
    if (failures.length) await testInfo.attach('diagnostics', {
      body: JSON.stringify(failures, null, 2), contentType: 'application/json',
    });
    expect(failures, 'Unexpected browser/network failures').toEqual([]);
  }, { auto: true }],
});

export { expect };
