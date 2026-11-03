import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSavedItems, toggleSavedItem } from '../src/domain/savedItems.ts';

test('missing, malformed and non-array browser storage recover safely', () => {
  for (const raw of [null, '{broken', '{}', 'null', '42']) assert.deepEqual(parseSavedItems(raw, ['one']), []);
});

test('saved state removes duplicates, unknown items, and invalid values', () => {
  assert.deepEqual(parseSavedItems('["one",null,"two","one",3,"missing"]', ['one', 'two']), ['one', 'two']);
});

test('toggle adds and removes a valid item without modifying input', () => {
  const before = ['one'];
  assert.deepEqual(toggleSavedItem(before, 'two', ['one', 'two']), ['one', 'two']);
  assert.deepEqual(toggleSavedItem(before, 'one', ['one', 'two']), []);
  assert.deepEqual(before, ['one']);
});

test('unknown IDs cannot enter the wardrobe', () => {
  assert.deepEqual(toggleSavedItem(['one'], 'unknown', ['one']), ['one']);
});
