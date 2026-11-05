// Same-photo membership is independent of recognition probability and sample commerce.
import test from 'node:test';
import assert from 'node:assert/strict';
import { items as catalogue } from '../src/data/catalog.ts';
import { prototypeGateway } from '../src/features/first-sight/services/prototype.ts';
import { createOutfitCommerceEdit, resolveArchivePurchase } from '../src/features/first-sight/commerce.ts';

// These identities are deliberately authored independently from the example registry.
const expected = [
  { id: 'rose-puma-city', primary: 'puma-rose-micro-grip', members: [
    'puma-rose-micro-grip', 'puma-rose-longsleeve', 'puma-rose-mini-skirt',
  ] },
  { id: 'rose-puma-track', primary: 'puma-rose-t7-trousers', members: [
    'puma-rose-t7-trousers', 'puma-rose-mesh-top', 'puma-rose-speedcat',
  ] },
];
const legacyIds = ['chloe-paddington', 'leather-bomber', 'denim-jacket', 'tailored-blazer', 'workwear-jacket'];

/** The authored ID and photograph must agree; filenames alone never select a prepared outfit. */
function sample(exampleId) {
  const url = exampleId === 'rose-puma-city' ? '/local-media/outfits/rose-standing.jpg'
    : exampleId === 'rose-puma-track' ? '/local-media/outfits/rose-seated.webp' : '/sample-preview.jpg';
  return { kind: 'sample', exampleId, url, name: 'Example preview' };
}

async function resolve(context, photo) {
  const pending = prototypeGateway.discover(photo, new AbortController().signal);
  context.mock.timers.tick(900);
  return pending;
}

test('celebrity examples resolve only their documented members and canonical model offers', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const catalogueById = new Map(catalogue.map(item => [item.id, item]));
  for (const example of expected) {
    const result = await resolve(context, sample(example.id));
    assert.equal(result.outfit.id, example.id);
    assert.equal(result.outfit.primaryItemId, example.primary);
    assert.deepEqual(result.outfit.memberIds, example.members);
    assert.deepEqual(result.items.map(item => item.id), example.members);
    for (const item of result.items) {
      assert.equal(item.identity.brand, 'PUMA x ROSÉ');
      assert.ok(item.name.startsWith('PUMA x ROSÉ '), item.id);
      assert.equal(item.identity.mode, 'prototype');
      assert.equal(item.identityEvidence.relationship, 'campaign-collection-reference');
      assert.ok(item.identityEvidence.sourceUrl.startsWith('https://'));
      assert.equal(item.confidence, undefined, 'Authored references must not imply measured detection confidence');
      assert.ok(item.culture.sources.some(source => source.url.startsWith('https://')), item.id);
      assert.equal(item.analysis.resale, undefined, 'New real models must not manufacture resale valuations');
      assert.deepEqual(item.commerce.archive.map(product => product.id), [`${item.id}-study`]);
      const product = item.commerce.archive[0];
      const record = catalogueById.get(product.id);
      assert.ok(record, `${product.id} must remain saveable in the shared wardrobe`);
      for (const field of ['title', 'price', 'image', 'category', 'description', 'era']) {
        assert.equal(product[field], record[field], `${product.id}: canonical ${field}`);
      }
      assert.equal(product.commerce.track, 'archive');
      assert.equal(product.commerce.listingKind, 'archive-study', 'A campaign reference is not authenticated vintage stock');
      assert.ok(product.variants.length);
      assert.ok(product.variants.every(variant => Number.isInteger(variant.stock) && variant.stock >= 0));
    }
  }
});

test('uploaded and legacy samples retain the library while unknown explicit examples fail', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  for (const photo of [
    { kind: 'sample', url: '/sample-preview.jpg', name: 'Legacy sample' },
    { kind: 'upload', url: 'blob:local-photo', name: 'rose-puma-city.jpg', exampleId: 'rose-puma-city' },
  ]) {
    const result = await resolve(context, photo);
    assert.equal(result.outfit, undefined, 'An arbitrary photograph must not inherit authored outfit regions');
    assert.deepEqual(result.items.map(item => item.id), legacyIds);
  }
  const pending = prototypeGateway.discover(sample('missing-outfit'), new AbortController().signal);
  const rejected = assert.rejects(pending, /unavailable/i);
  context.mock.timers.tick(900);
  await rejected;
  await assert.rejects(prototypeGateway.discover({ ...sample(expected[0].id), url: '/a-different-photo.jpg' },
    new AbortController().signal), /unavailable/i);
});

test('whole-look commerce preserves every canonical offer and its owning piece', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const result = await resolve(context, sample(expected[0].id));
  const edit = createOutfitCommerceEdit(result.items);
  assert.deepEqual(edit.archive.map(product => product.id), expected[0].members.map(id => `${id}-study`));
  for (const item of result.items) {
    const product = item.commerce.archive[0];
    assert.strictEqual(edit.ownerByProductId.get(product.id), item);
    const variant = product.variants.find(candidate => candidate.stock > 0);
    assert.ok(variant, `${product.id} needs an exercisable sample size`);
    const resolved = resolveArchivePurchase(edit.archive, product.id, variant.sku);
    assert.strictEqual(resolved.product, product);
    assert.strictEqual(resolved.variant, variant);
  }
  const sku = edit.archive[0].variants[0].sku;
  assert.equal(resolveArchivePurchase(edit.archive, 'unregistered-offer', sku), null);
  assert.equal(resolveArchivePurchase(edit.archive, edit.archive[1].id, sku), null);
});

test('whole-look commerce rejects ambiguous product ownership, partner injection and shared SKUs', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const { items } = await resolve(context, sample(expected[0].id));
  const repeatedOwner = structuredClone(items);
  repeatedOwner[1].commerce.archive = [repeatedOwner[0].commerce.archive[0]];
  assert.throws(() => createOutfitCommerceEdit(repeatedOwner), /puma-rose-micro-grip-study/);

  const misplaced = structuredClone(items);
  misplaced[0].commerce.archive[0].commerce = {
    track: 'style-match', listingKind: 'partner-preview', matchReason: 'Controlled invalid input',
  };
  assert.throws(() => createOutfitCommerceEdit(misplaced), /puma-rose-micro-grip-study/);

  const sharedSku = structuredClone(items);
  const sku = sharedSku[0].commerce.archive[0].variants[0].sku;
  sharedSku[1].commerce.archive[0].variants[0].sku = sku;
  assert.throws(() => createOutfitCommerceEdit(sharedSku), error => error instanceof Error && error.message.includes(sku));
  assert.equal(new Set(items.flatMap(item => item.commerce.archive.flatMap(product =>
    product.variants.map(variant => variant.sku)))).size,
  items.reduce((count, item) => count + item.commerce.archive.reduce((total, product) => total + product.variants.length, 0), 0),
  'Rejected copies must not mutate canonical fixture SKUs');
});

test('replacing a celebrity example cancels its result without cancelling the next outfit', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const firstController = new AbortController();
  const first = prototypeGateway.discover(sample(expected[0].id), firstController.signal);
  const rejected = assert.rejects(first, { name: 'AbortError' });
  context.mock.timers.tick(300);
  firstController.abort(new Error('A different example was selected'));
  const second = prototypeGateway.discover(sample(expected[1].id), new AbortController().signal);
  context.mock.timers.tick(900);
  await rejected;
  assert.deepEqual((await second).items.map(item => item.id), expected[1].members);
});
