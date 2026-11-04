// Contract checks protect selection, saved items, and annotation anchors as sample data evolves.
import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { items } from '../src/data/catalog.ts';
import { recognitionItems } from '../src/features/first-sight/recognition.ts';
import { prototypeGateway } from '../src/features/first-sight/services/prototype.ts';

test('every recognition choice has a distinct shopping edit that resolves in the wardrobe', () => {
  const catalogIds = new Set(items.map(item => item.id));
  const edits = new Set();
  assert.equal(recognitionItems.length, 5);
  assert.equal(new Set(recognitionItems.map(item => item.id)).size, recognitionItems.length);

  for (const item of recognitionItems) {
    assert.equal(item.identity.mode, 'prototype');
    assert.ok(item.confidence >= 0 && item.confidence <= 100);
    assert.equal(item.analysis.resale.basis, 'prototype');
    assert.ok(item.analysis.resale.minimum <= item.analysis.resale.maximum);
    assert.ok(item.products.length >= 3);
    assert.equal(new Set(item.products.map(product => product.id)).size, item.products.length);
    edits.add(item.products.map(product => product.id).sort().join('|'));

    for (const product of item.products) {
      assert.ok(catalogIds.has(product.id), `${product.id} cannot be saved to the wardrobe`);
      assert.ok(product.variants.length > 0);
      assert.ok(product.variants.every(variant => Number.isInteger(variant.stock) && variant.stock >= 0));
      assert.equal(new Set(product.variants.map(variant => variant.sku)).size, product.variants.length);
    }
    assert.ok(item.products.some(product => product.variants.some(variant => variant.stock > 0)));
  }
  assert.equal(edits.size, recognitionItems.length, 'Selecting another study must change its shopping edit');
});

test('dossier annotations stay inside their image and reference every explanation card', () => {
  for (const item of recognitionItems) {
    const cardIds = new Set(item.analysis.cards.map(card => card.id));
    const annotationCardIds = new Set(item.annotations.map(annotation => annotation.cardId));
    assert.equal(cardIds.size, 4);
    assert.deepEqual(annotationCardIds, cardIds);
    assert.equal(new Set(item.annotations.map(annotation => annotation.id)).size, item.annotations.length);
    for (const annotation of item.annotations) {
      assert.ok(annotation.x >= 0 && annotation.x <= 100, `${annotation.id}: x is outside the image`);
      assert.ok(annotation.y >= 0 && annotation.y <= 100, `${annotation.id}: y is outside the image`);
    }
  }
});

test('illustrated studies resolve to four separate bundled assets and retain sourced context', async () => {
  const illustrations = recognitionItems.filter(item => item.analysis.image.endsWith('.svg'));
  assert.equal(new Set(illustrations.map(item => item.analysis.image)).size, 4);
  for (const item of illustrations) {
    await access(new URL(`../public${item.analysis.image}`, import.meta.url));
  }
  for (const item of recognitionItems) {
    assert.ok(item.looks.length > 0);
    assert.ok(item.looks.every(look => look.sourceUrl && look.credit && look.width > 0 && look.height > 0));
    assert.ok(item.looks.every(look => !look.image.endsWith('/styling-05.jpg')), 'Missing media must not enter the active feed');
  }
});

// Fake time makes cancellation deterministic without waiting through the sample scan delay.
test('aborting an older scan cannot stop or replace the next photo’s result', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const previousController = new AbortController();
  const previous = prototypeGateway.discover({ kind: 'upload', url: 'blob:previous', name: 'previous.png' }, previousController.signal);
  const previousRejected = assert.rejects(previous, { name: 'AbortError' });
  context.mock.timers.tick(300);
  previousController.abort();
  await previousRejected;

  let resolved = false;
  const current = prototypeGateway.discover(
    { kind: 'upload', url: 'blob:current', name: 'current.png' },
    new AbortController().signal,
  ).then(result => { resolved = true; return result; });
  context.mock.timers.tick(899);
  await Promise.resolve();
  assert.equal(resolved, false);
  context.mock.timers.tick(1);
  const result = await current;
  assert.equal(result.items.length, 5);
  assert.equal(resolved, true);
});

test('an already aborted request fails without starting a sample scan', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    prototypeGateway.discover({ kind: 'sample', url: '/sample.jpg', name: 'sample.jpg' }, controller.signal),
    { name: 'AbortError' },
  );
});
