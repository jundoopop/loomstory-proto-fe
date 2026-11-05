// Contract checks protect selection, saved items, and annotation anchors as sample data evolves.
import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { items } from '../src/data/catalog.ts';
import { chloeLooks } from '../src/features/first-sight/chloe.ts';
import { outfitLooks } from '../src/features/first-sight/looks.ts';
import { recognitionStudies } from '../src/features/first-sight/recognition.ts';
import { prototypeGateway } from '../src/features/first-sight/services/prototype.ts';

// Exercise the public asynchronous boundary without spending real time on the scan animation.
async function resolvedItems(context) {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const discovery = prototypeGateway.discover(
    { kind: 'sample', url: '/sample.jpg', name: 'sample.jpg' },
    new AbortController().signal,
  );
  context.mock.timers.tick(900);
  return (await discovery).items;
}

// This is the approved curated edit, independent of the implementation's grouping logic.
const expectedEdits = {
  'chloe-paddington': {
    archive: ['chloe-paddington-archive', 'chloe-paddington-complete', 'chloe-paddington-reissue'],
    styleMatches: ['soft-satchel-alternative'],
  },
  'leather-bomber': {
    archive: ['bomber-archive', 'minimalist-leather', 'weekend-layer'],
    styleMatches: ['bomber-alternative'],
  },
  'denim-jacket': {
    archive: ['denim-jacket-archive', 'archive-denim', 'record-shop-denim'],
    styleMatches: ['denim-jacket-alternative'],
  },
  'tailored-blazer': {
    archive: ['blazer-archive', 'city-coat', 'gallery-coat'],
    styleMatches: ['blazer-alternative'],
  },
  'workwear-jacket': {
    archive: ['workwear-archive', 'denim-jacket-archive'],
    styleMatches: ['workwear-alternative', 'denim-jacket-alternative'],
  },
};

test('every recognition choice has a distinct archive edit with valid catalogue identity and stock', async context => {
  const recognitionItems = await resolvedItems(context);
  const catalogIds = new Set(items.map(item => item.id));
  const edits = new Set();
  assert.equal(recognitionItems.length, 5);
  assert.equal(new Set(recognitionItems.map(item => item.id)).size, recognitionItems.length);

  for (const item of recognitionItems) {
    const products = [...item.commerce.archive, ...item.commerce.styleMatches];
    assert.equal(item.identity.mode, 'prototype');
    assert.ok(item.confidence >= 0 && item.confidence <= 100);
    assert.equal(item.analysis.resale.basis, 'prototype');
    assert.ok(item.analysis.resale.minimum <= item.analysis.resale.maximum);
    assert.ok(products.length >= 3);
    assert.equal(new Set(products.map(product => product.id)).size, products.length);
    edits.add(item.commerce.archive.map(product => product.id).sort().join('|'));

    for (const product of products) {
      assert.ok(catalogIds.has(product.id), `${product.id} lost its shared catalogue identity`);
      assert.ok(product.variants.length > 0);
      assert.ok(product.variants.every(variant => Number.isInteger(variant.stock) && variant.stock >= 0));
      assert.equal(new Set(product.variants.map(variant => variant.sku)).size, product.variants.length);
    }
    assert.ok(item.commerce.archive.some(product => product.variants.some(variant => variant.stock > 0)));
  }
  assert.equal(edits.size, recognitionItems.length, 'Selecting another study must change its shopping edit');
});

test('all five authored studies preserve the approved archive and style-match edits', () => {
  assert.deepEqual(recognitionStudies.map(study => study.id), Object.keys(expectedEdits));

  for (const study of recognitionStudies) {
    const { archive, styleMatches } = study.commerce;
    assert.deepEqual(archive.map(product => product.id), expectedEdits[study.id].archive, study.id);
    assert.deepEqual(styleMatches.map(product => product.id), expectedEdits[study.id].styleMatches, study.id);
    assert.ok(archive.every(product => product.commerce.track === 'archive'), study.id);
    assert.ok(styleMatches.every(product => product.commerce.track === 'style-match'), study.id);
    const combined = [...archive, ...styleMatches];
    assert.equal(new Set(combined.map(product => product.id)).size, combined.length, study.id);
    assert.ok(archive.some(product => product.variants.some(variant => variant.stock > 0)), study.id);
    assert.equal(Object.hasOwn(study, 'products'), false, 'Authored studies must not own a second editable product list');
    assert.equal(Object.hasOwn(study, 'looks'), false, 'Authored studies retain reference IDs until resolution');
  }
});

test('all eighteen offers retain shared catalogue identity with explicit profiles and no legacy flag', () => {
  const catalog = new Map(items.map(item => [item.id, item]));
  const offers = new Map(recognitionStudies.flatMap(study => [
    ...study.commerce.archive, ...study.commerce.styleMatches,
  ]).map(product => [product.id, product]));
  const kindCounts = new Map();
  let archiveCount = 0;
  let styleMatchCount = 0;

  assert.equal(offers.size, 18);
  for (const product of offers.values()) {
    const original = catalog.get(product.id);
    assert.ok(original, `${product.id}: missing shared catalog identity`);
    for (const field of ['title', 'price', 'image', 'category', 'description', 'era']) {
      assert.equal(product[field], original[field], `${product.id}: changed ${field}`);
    }
    assert.ok(product.commerce.matchReason.trim(), `${product.id}: missing matching explanation`);
    if (product.commerce.track === 'archive') {
      archiveCount++;
      assert.ok(['vintage-original', 'designer-reissue', 'archive-study'].includes(product.commerce.listingKind));
    } else {
      styleMatchCount++;
      assert.equal(product.commerce.track, 'style-match');
      assert.equal(product.commerce.listingKind, 'partner-preview');
    }
    kindCounts.set(product.commerce.listingKind, (kindCounts.get(product.commerce.listingKind) ?? 0) + 1);
    assert.equal(Object.hasOwn(product, 'affordable'), false, `${product.id}: retired compatibility flag remains`);
  }

  assert.equal(archiveCount, 13);
  assert.equal(styleMatchCount, 5);
  assert.deepEqual(Object.fromEntries([...kindCounts].sort()), {
    'archive-study': 10,
    'designer-reissue': 1,
    'partner-preview': 5,
    'vintage-original': 2,
  });
});

test('the gateway preserves separate commerce streams and resolves references without a legacy product list', async context => {
  const recognitionItems = await resolvedItems(context);
  const referenceRecords = [...chloeLooks, ...outfitLooks];
  const references = new Map(referenceRecords.map(look => [look.id, look]));
  assert.equal(references.size, referenceRecords.length, 'Reference IDs must resolve unambiguously');
  assert.deepEqual(recognitionItems.map(item => item.id), recognitionStudies.map(study => study.id));

  for (const [index, study] of recognitionStudies.entries()) {
    const item = recognitionItems[index];
    const { contextReferenceIds, ...resolvedFields } = study;
    const { looks, ...actualFields } = item;
    assert.equal(Object.hasOwn(item, 'contextReferenceIds'), false, 'Input-only reference IDs must not leak into the UI contract');
    assert.equal(Object.hasOwn(item, 'products'), false, 'The retired mixed product projection must not return');
    assert.deepEqual(actualFields, resolvedFields, `${study.id}: lost canonical study content`);
    assert.ok(contextReferenceIds.length > 0, study.id);
    assert.equal(new Set(contextReferenceIds).size, contextReferenceIds.length, study.id);
    assert.deepEqual(looks.map(look => look.id), contextReferenceIds, `${study.id}: reference order changed`);
    for (const [lookIndex, id] of contextReferenceIds.entries()) {
      assert.ok(references.has(id), `${study.id}: unresolved reference ${id}`);
      assert.strictEqual(looks[lookIndex], references.get(id), `${id}: source metadata should stay with its original record`);
    }
  }
});

test('dossier annotations stay inside their image and reference every explanation card', async context => {
  const recognitionItems = await resolvedItems(context);
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

test('illustrated studies resolve to four separate bundled assets and retain sourced context', async context => {
  const recognitionItems = await resolvedItems(context);
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
  assert.deepEqual(result.items.map(item => item.id), recognitionStudies.map(study => study.id));
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
