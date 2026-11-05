// Authored selections and reference resolution must survive the Discover presentation move.
import test from 'node:test';
import assert from 'node:assert/strict';
import { inspirationCollections, collectionLooks } from '../src/features/discover/collections.ts';
import { resolveInspirationPhoto } from '../src/features/discover/references.ts';
import { outfitLooks } from '../src/features/first-sight/looks.ts';
import { expectedInspirationCollections } from './browser/fixtures/expected-inspiration.ts';

test('Discover retains the four authored collections and their canonical cover identities', () => {
  assert.deepEqual(inspirationCollections.map(({ id, title, heroId }) => ({ id, title, heroId })),
    expectedInspirationCollections.map(({ id, title, heroId }) => ({ id, title, heroId })));
  for (const collection of inspirationCollections) {
    assert.ok(outfitLooks.some(look => look.id === collection.heroId));
  }
});

test('each collection retains its independently recorded six-look order and canonical records', () => {
  for (const expected of expectedInspirationCollections) {
    const collection = inspirationCollections.find(entry => entry.id === expected.id);
    const looks = collectionLooks(collection);
    assert.deepEqual(looks.map(look => look.id), expected.looks, expected.id);
    assert.equal(new Set(looks.map(look => look.id)).size, 6);
    for (const look of looks) {
      assert.strictEqual(look, outfitLooks.find(record => record.id === look.id));
      assert.ok(look.sourceUrl && look.credit && look.width > 0 && look.height > 0);
    }
  }
});

test('assembling or editing a collection board does not mutate the authored library', () => {
  const before = structuredClone(outfitLooks);
  const collection = inspirationCollections[0];
  const board = collectionLooks(collection);
  board.reverse(); board.pop();
  assert.deepEqual(outfitLooks, before);
  assert.deepEqual(collectionLooks(collection).map(look => look.id), expectedInspirationCollections[0].looks);
});

test('inspiration hand-off resolves authored IDs with their original photograph and attribution', () => {
  for (const look of outfitLooks) {
    const photo = resolveInspirationPhoto(look.id);
    assert.ok(photo);
    assert.equal(photo.kind, 'reference');
    assert.equal(photo.url, look.image);
    assert.equal(photo.name, `${look.celebrity} — ${look.title}`);
    assert.strictEqual(photo.reference, look, 'Retain the canonical metadata rather than fabricating photo credit');
  }
});

test('unknown, URL-like and prototype-property IDs cannot select arbitrary photographs', () => {
  for (const id of [null, '', 'missing-reference', '__proto__', 'constructor', 'toString',
    'https://example.com/untrusted.jpg', '/assets/first-sight/looks/zendaya-8.jpg', 'zendaya-8?image=other']) {
    assert.equal(resolveInspirationPhoto(id), null, String(id));
  }
});
