/** Protect viewport-sized panels and native scroll ownership without changing the discovery data. */
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './helpers/diagnostics';

const workspaceSelector = '#discover-inspiration';
const heroSelector = '.fs-trend-hero';
const boardSelector = '#fs-trend-board';

/** Explicit test navigation models a visitor scrolling past the unchanged site introduction. */
async function alignWorkspace(page: Page) {
  await page.locator(workspaceSelector).evaluate(element => {
    window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 24);
  });
}

async function scrollState(page: Page) {
  return page.evaluate(() => ({
    page: window.scrollY,
    hero: document.querySelector('.fs-trend-hero')!.scrollTop,
    board: document.querySelector('#fs-trend-board')!.scrollTop,
  }));
}

/** Native wheel/keyboard scrolling can continue after input dispatch, especially in WebKit. */
async function settleScrolling(page: Page) {
  await page.evaluate(async () => {
    let previous = '';
    let stable = 0;
    for (let frame = 0; frame < 180; frame++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const current = [scrollY, document.querySelector('.fs-trend-hero')!.scrollTop,
        document.querySelector('#fs-trend-board')!.scrollTop].join(',');
      stable = current === previous ? stable + 1 : 0;
      previous = current;
      if (stable >= 6) return;
    }
    throw new Error('Native scrolling did not settle');
  });
}

/** Move over an already-visible panel without locator hover's extra scroll-into-view action. */
async function pointIntoPanel(page: Page, panel: Locator) {
  const bounds = await panel.boundingBox();
  expect(bounds).not.toBeNull();
  const point = { x: bounds!.x + bounds!.width / 3, y: Math.max(0, bounds!.y) + 100 };
  expect(await panel.evaluate((element, position) => element.contains(document.elementFromPoint(position.x, position.y)), point),
    'Wheel input must hit the visible panel').toBe(true);
  await page.mouse.move(point.x, point.y);
}

async function expectPanelFits(panel: Locator) {
  expect(await panel.evaluate(element => element.scrollWidth - element.clientWidth),
    'Panel content must remain readable without horizontal scrolling').toBeLessThanOrEqual(1);
}

async function expectWorkspaceGeometry(page: Page) {
  const geometry = await page.evaluate(() => {
    const frame = document.querySelector('#discover-inspiration')!.getBoundingClientRect();
    const hero = document.querySelector('.fs-trend-hero')!.getBoundingClientRect();
    const board = document.querySelector('#fs-trend-board')!.getBoundingClientRect();
    const image = document.querySelector('.fs-trend-visual')!.getBoundingClientRect();
    const copy = document.querySelector('.fs-trend-copy')!.getBoundingClientRect();
    const caption = document.querySelector('.fs-trend-visual figcaption')!.getBoundingClientRect();
    return { height: innerHeight, frameHeight: frame.height, frameTop: frame.top, frameBottom: frame.bottom,
      heroTop: hero.top, heroWidth: hero.width, heroRight: hero.right, heroBottom: hero.bottom,
      boardTop: board.top, boardWidth: board.width, boardLeft: board.left, boardBottom: board.bottom,
      imageTop: image.top, imageBottom: image.bottom, captionTop: caption.top, captionBottom: caption.bottom,
      copyTop: copy.top, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  expect(geometry.frameHeight).toBeCloseTo(geometry.height - 48, 0);
  expect(geometry.frameTop).toBeCloseTo(24, 0);
  expect(geometry.frameBottom).toBeCloseTo(geometry.height - 24, 0);
  expect(geometry.heroTop).toBeCloseTo(geometry.boardTop, 0);
  expect(geometry.heroBottom).toBeCloseTo(geometry.boardBottom, 0);
  expect(geometry.heroWidth).toBeCloseTo(geometry.boardWidth, 0);
  expect(geometry.boardLeft - geometry.heroRight).toBeCloseTo(24, 0);
  expect(geometry.copyTop).toBeGreaterThanOrEqual(geometry.imageBottom - 1);
  expect(geometry.captionTop).toBeGreaterThanOrEqual(geometry.imageTop);
  expect(geometry.captionBottom).toBeLessThanOrEqual(geometry.imageBottom);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  await expectPanelFits(page.locator(heroSelector));
  await expectPanelFits(page.locator(boardSelector));
  expect(await page.locator(`${boardSelector} .fs-masonry`).evaluate(element => getComputedStyle(element).columnCount)).toBe('2');
}

test('five landscape displays align equal viewport-height panels @preview', async ({ page }) => {
  for (const [width, height] of [[1024, 768], [1280, 720], [1366, 768], [1920, 1080], [2560, 1440]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const originalY = await page.evaluate(() => scrollY);
    expect(originalY, 'Entering Discover must not automatically scroll to the workspace').toBe(0);
    await alignWorkspace(page);
    await expectWorkspaceGeometry(page);
  }
});

test('both panels scroll independently and preserve board position after dialog dismissal @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await alignWorkspace(page);
  const hero = page.getByRole('region', { name: 'Inspiration cover and collections', exact: true });
  const board = page.getByRole('region', { name: '90s Streetwear / THE EDIT', exact: true });
  await board.focus();
  await settleScrolling(page);
  const initial = await scrollState(page);
  await page.keyboard.press('PageDown');
  await expect.poll(async () => (await scrollState(page)).board).toBeGreaterThan(initial.board);
  await settleScrolling(page);
  let current = await scrollState(page);
  expect(current.hero).toBe(initial.hero);
  expect(current.page).toBe(initial.page);
  // Move within each panel, away from its boundary, to test actual wheel routing.
  await board.evaluate(element => { element.scrollTop = 0; });
  await pointIntoPanel(page, board);
  await page.mouse.wheel(0, 120);
  await expect.poll(async () => (await scrollState(page)).board).toBeGreaterThan(0);
  await settleScrolling(page);
  const beforeHero = await scrollState(page);
  const maxHero = await hero.evaluate(element => element.scrollHeight - element.clientHeight);
  expect(maxHero).toBeGreaterThan(0);
  await pointIntoPanel(page, hero);
  await page.mouse.wheel(0, Math.min(100, maxHero / 2));
  await expect.poll(async () => (await scrollState(page)).hero).toBeGreaterThan(beforeHero.hero);
  await settleScrolling(page);
  current = await scrollState(page);
  expect(current.board).toBe(beforeHero.board);
  expect(current.page).toBe(beforeHero.page);
  const opener = board.locator('.fs-look-open').nth(4);
  await opener.click();
  const dialog = board.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const beforeClose = await scrollState(page);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect.poll(() => scrollState(page)).toEqual(beforeClose);
});

test('changing collection resets only the board and every photograph remains reachable @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await alignWorkspace(page);
  const hero = page.locator(heroSelector);
  const board = page.locator(boardSelector);
  const denim = hero.getByRole('button', { name: 'Vintage Denim', exact: true });
  await denim.scrollIntoViewIfNeeded();
  await settleScrolling(page);
  await board.evaluate(element => { element.scrollTop = 300; });
  const before = await scrollState(page);
  expect(before.board).toBeGreaterThan(0);
  await denim.click();
  await expect(denim).toHaveAttribute('aria-pressed', 'true');
  await expect(board).toHaveAccessibleName('Vintage Denim / THE EDIT');
  await expect.poll(async () => (await scrollState(page)).board).toBe(0);
  const after = await scrollState(page);
  expect(after.hero).toBe(before.hero);
  expect(after.page).toBe(before.page);
  for (const card of await board.locator('.fs-look').all()) {
    const photo = card.locator('.fs-look-open img');
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await expect(card.locator('.fs-look-save')).toBeInViewport();
    const source = card.locator('.fs-look-caption > a');
    await source.scrollIntoViewIfNeeded();
    await expect(source).toBeInViewport();
  }
  // Native chaining must still allow the retained homepage sections to be reached.
  await board.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await alignWorkspace(page);
  await settleScrolling(page);
  await pointIntoPanel(page, board);
  const beforeBoundary = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 180);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforeBoundary);
});

test('portrait, narrow and short windows retain normal page flow', async ({ page }) => {
  for (const [width, height] of [[768, 1024], [1200, 1600], [1024, 1024], [390, 844], [320, 844], [1023, 768], [1366, 599]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const flow = await page.evaluate(() => {
      const hero = document.querySelector('.fs-trend-hero')!;
      const board = document.querySelector('#fs-trend-board')!;
      return { heroBottom: hero.getBoundingClientRect().bottom, boardTop: board.getBoundingClientRect().top,
        heroOverflow: getComputedStyle(hero).overflowY, boardOverflow: getComputedStyle(board).overflowY,
        columns: getComputedStyle(board.querySelector('.fs-masonry')!).columnCount,
        overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect(flow.boardTop).toBeGreaterThan(flow.heroBottom);
    expect(flow.heroOverflow).toBe('visible');
    expect(flow.boardOverflow).toBe('visible');
    expect(flow.columns).toBe(String(width > 1000 ? 3 : width >= 600 ? 2 : 1));
    expect(flow.overflow).toBeLessThanOrEqual(1);
  }
});

test('resizing restores page flow without losing the collection or saved inspiration @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/?collection=denim');
  const board = page.locator(boardSelector);
  const save = board.getByRole('button', { name: 'Save IU look', exact: true });
  await save.click();
  await expect(board.getByRole('button', { name: 'Unsave IU look', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await board.evaluate(element => { element.scrollTop = 300; });
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByRole('button', { name: 'Vintage Denim', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await board.evaluate(element => getComputedStyle(element).overflowY)).toBe('visible');
  await expect(board.getByRole('button', { name: 'Unsave IU look', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.setViewportSize({ width: 1366, height: 768 });
  await alignWorkspace(page);
  await expectWorkspaceGeometry(page);
  await expect(board.getByRole('button', { name: 'Unsave IU look', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('enlarged landscape text remains reachable and accessible in both panels', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.goto('/');
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll('#discover-inspiration *')]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    for (const { element, size } of sizes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
  });
  await alignWorkspace(page);
  await expectWorkspaceGeometry(page);
  const hero = page.locator(heroSelector);
  const board = page.locator(boardSelector);
  await hero.locator('.fs-trend-explore').focus();
  await expect(hero.locator('.fs-trend-explore')).toBeInViewport();
  expect(await hero.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  for (const source of await board.locator('.fs-look-caption > a').all()) {
    await source.focus();
    await expect(source).toBeInViewport();
  }
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  await testInfo.attach('axe-landscape-enlarged', {
    body: JSON.stringify({ violations: result.violations, incomplete: result.incomplete }, null, 2),
    contentType: 'application/json',
  });
  expect(result.violations.map(rule => ({ id: rule.id, targets: rule.nodes.map(node => node.target) }))).toEqual([]);
});
