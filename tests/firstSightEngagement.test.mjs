// Domain tests use explicit monotonic timestamps; no real timers or browser are required.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_ENGAGEMENT_MS,
  advanceEngagement,
  createEngagementState,
  recordEngagement,
} from '../src/features/first-sight/engagement.ts';

// Budget and pause rules: only intervals that began during active browsing are consumed.
test('a new photograph gets 45 seconds, and waiting before viewport entry consumes none', () => {
  const initial = createEngagementState();
  assert.equal(DISCOVERY_ENGAGEMENT_MS, 45_000);
  assert.equal(initial.remainingMs, 45_000);
  const waiting = advanceEngagement(initial, 90_000, false);
  const entered = advanceEngagement(waiting, 120_000, true);
  assert.equal(entered.remainingMs, 45_000);
  assert.equal(entered.expired, false);
});

test('expiration happens at exactly 45 active seconds and does not run below zero', () => {
  let clock = advanceEngagement(createEngagementState(), 5_000, true);
  clock = advanceEngagement(clock, 49_999, true);
  assert.equal(clock.remainingMs, 1);
  assert.equal(clock.expired, false);
  clock = advanceEngagement(clock, 50_000, true);
  assert.equal(clock.expired, true);
  assert.equal(clock.activeSince, null);
  assert.equal(advanceEngagement(clock, 200_000, true).remainingMs, 0);
});

test('hidden tabs, blur, offscreen feeds and other phases pause rather than reset elapsed time', () => {
  let clock = advanceEngagement(createEngagementState(), 0, true);
  clock = advanceEngagement(clock, 10_000, false);
  assert.equal(clock.remainingMs, 35_000);
  clock = advanceEngagement(clock, 100_000, false);
  clock = advanceEngagement(clock, 150_000, true);
  assert.equal(clock.remainingMs, 35_000);
  clock = advanceEngagement(clock, 170_000, false);
  assert.equal(clock.remainingMs, 15_000);
  clock = advanceEngagement(clock, 500_000, true);
  clock = advanceEngagement(clock, 514_999, true);
  assert.equal(clock.expired, false);
  clock = advanceEngagement(clock, 515_000, true);
  assert.equal(clock.expired, true);
});

// Engagement persists through restoration, but a new photograph starts a separate opportunity.
test('a feed interaction permanently cancels auto-collapse for the current photograph', () => {
  let clock = advanceEngagement(createEngagementState(), 100, true);
  clock = recordEngagement(clock, 20_100);
  assert.equal(clock.engaged, true);
  assert.equal(clock.remainingMs, 25_000);
  clock = advanceEngagement(clock, 500_000, true);
  assert.equal(clock.remainingMs, 25_000);
  assert.equal(clock.expired, false);
  assert.equal(clock.activeSince, null);
});

test('restoring an expired feed records engagement; a new photo resets the opportunity', () => {
  let expired = advanceEngagement(createEngagementState(), 0, true);
  expired = advanceEngagement(expired, 45_000, true);
  const restored = recordEngagement(expired, 50_000);
  assert.equal(restored.engaged, true);
  assert.equal(restored.activeSince, null);
  const nextPhoto = createEngagementState();
  assert.equal(nextPhoto.remainingMs, 45_000);
  assert.equal(nextPhoto.engaged, false);
  assert.equal(nextPhoto.expired, false);
});

// Event ordering and immutable snapshots protect the hook from stale browser callbacks.
test('stale timestamps cannot refund or double-count active browsing', () => {
  let clock = advanceEngagement(createEngagementState(), 1_000, true);
  clock = advanceEngagement(clock, 11_000, true);
  clock = advanceEngagement(clock, 10_000, true);
  assert.equal(clock.remainingMs, 35_000);
  clock = advanceEngagement(clock, 12_000, true);
  assert.equal(clock.remainingMs, 34_000);
});

test('engagement operations leave previous snapshots unchanged', () => {
  const before = advanceEngagement(createEngagementState(), 0, true);
  const advanced = advanceEngagement(before, 1_000, false);
  const engaged = recordEngagement(advanced, 2_000);
  assert.equal(before.remainingMs, 45_000);
  assert.equal(before.activeSince, 0);
  assert.equal(advanced.engaged, false);
  assert.equal(engaged.engaged, true);
});
