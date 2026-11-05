// Business-rule checks protect commerce separation and canonical archive bag requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommerceEdit, isArchiveOffer, isStyleMatchOffer, resolveArchivePurchase } from '../src/features/first-sight/commerce.ts';
import { offersFor } from '../src/features/first-sight/fixtures.ts';

const [archive, secondArchive, alternative] = offersFor([
  'chloe-paddington-archive', 'chloe-paddington-complete', 'soft-satchel-alternative',
]);

/** Require useful errors without coupling tests to the exact wording of validation messages. */
function identifiesOffer(id) {
  return error => error instanceof Error && error.message.includes(id);
}

test('classification follows the declared track regardless of price', () => {
  const cheapArchive = { ...archive, price: 58 };
  const expensiveStyleMatch = { ...alternative, price: 2000 };

  assert.equal(isArchiveOffer(cheapArchive), true);
  assert.equal(isStyleMatchOffer(cheapArchive), false);
  assert.equal(isArchiveOffer(expensiveStyleMatch), false);
  assert.equal(isStyleMatchOffer(expensiveStyleMatch), true);
  assert.equal(isArchiveOffer({ ...cheapArchive, price: 8000 }), true);
  assert.equal(isStyleMatchOffer({ ...expensiveStyleMatch, price: 20 }), true);
});

test('archive purchase resolution returns canonical offer and SKU without changing its edit', () => {
  const canonicalVariant = Object.freeze({ ...archive.variants[0], stock: 2 });
  const canonicalOffer = Object.freeze({ ...archive, variants: Object.freeze([canonicalVariant]) });
  const edit = Object.freeze([canonicalOffer, secondArchive]);
  const selection = resolveArchivePurchase(edit, archive.id, canonicalVariant.sku);

  assert.ok(selection);
  assert.strictEqual(selection.product, canonicalOffer);
  assert.strictEqual(selection.variant, canonicalVariant);
  assert.equal(selection.variant.stock, 2);
  assert.deepEqual(edit, [canonicalOffer, secondArchive]);
});

test('archive purchase resolution rejects partner offers and identities outside the current edit', () => {
  const mixedInput = [archive, alternative];
  assert.equal(resolveArchivePurchase(mixedInput, alternative.id, alternative.variants[0].sku), null);
  assert.equal(resolveArchivePurchase(mixedInput, 'unknown-offer', archive.variants[0].sku), null);
  assert.equal(resolveArchivePurchase([secondArchive], archive.id, archive.variants[0].sku), null);
  assert.equal(resolveArchivePurchase([], archive.id, archive.variants[0].sku), null);
});

test('archive purchase resolution requires a current SKU with positive whole-item stock', () => {
  assert.equal(resolveArchivePurchase([archive], archive.id, 'unknown-sku'), null);
  assert.equal(resolveArchivePurchase([archive], archive.id, secondArchive.variants[0].sku), null);
  for (const stock of [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const unavailable = { ...archive, variants: [{ ...archive.variants[0], stock }] };
    assert.equal(resolveArchivePurchase([unavailable], unavailable.id, unavailable.variants[0].sku), null);
  }
});

test('stale or forged callback data cannot replace current archive pricing, stock or SKU membership', () => {
  const staleCallbackOffer = { ...archive, price: 1, variants: [{ ...archive.variants[0], stock: 999 }] };
  const currentVariant = { ...archive.variants[0], stock: 1 };
  const currentOffer = { ...archive, variants: [currentVariant] };
  const selection = resolveArchivePurchase([currentOffer], staleCallbackOffer.id, staleCallbackOffer.variants[0].sku);
  assert.strictEqual(selection.product, currentOffer);
  assert.strictEqual(selection.variant, currentVariant);
  assert.equal(selection.product.price, archive.price);
  assert.equal(selection.variant.stock, 1);

  const depletedOffer = { ...currentOffer, variants: [{ ...currentVariant, stock: 0 }] };
  assert.equal(resolveArchivePurchase([depletedOffer], staleCallbackOffer.id, staleCallbackOffer.variants[0].sku), null);
  const changedSkuOffer = { ...currentOffer, variants: [{ ...currentVariant, sku: 'replacement-sku' }] };
  assert.equal(resolveArchivePurchase([changedSkuOffer], staleCallbackOffer.id, staleCallbackOffer.variants[0].sku), null);
});

test('valid edits preserve curated order and copy their input arrays', () => {
  const archiveInput = Object.freeze([secondArchive, archive]);
  const styleMatchInput = Object.freeze([alternative]);
  const edit = createCommerceEdit(archiveInput, styleMatchInput);

  assert.deepEqual(edit.archive, [secondArchive, archive]);
  assert.deepEqual(edit.styleMatches, [alternative]);
  assert.notStrictEqual(edit.archive, archiveInput);
  assert.notStrictEqual(edit.styleMatches, styleMatchInput);
  assert.strictEqual(edit.archive[0], secondArchive, 'Offer identity should survive edit assembly');
  edit.archive.reverse();
  edit.styleMatches.pop();
  assert.deepEqual(archiveInput, [secondArchive, archive], 'Editing the result must not reorder its source array');
  assert.deepEqual(styleMatchInput, [alternative], 'Editing the result must not remove source offers');
});

test('empty streams remain valid so a future study can have no matches in one track', () => {
  assert.deepEqual(createCommerceEdit([], []), { archive: [], styleMatches: [] });
  assert.deepEqual(createCommerceEdit([archive], []), { archive: [archive], styleMatches: [] });
  assert.deepEqual(createCommerceEdit([], [alternative]), { archive: [], styleMatches: [alternative] });
});

test('an offer in the wrong stream is rejected with its ID', () => {
  assert.throws(() => createCommerceEdit([alternative], []), identifiesOffer(alternative.id));
  assert.throws(() => createCommerceEdit([], [archive]), identifiesOffer(archive.id));
});

test('duplicate IDs within either stream or across both streams are rejected', () => {
  assert.throws(() => createCommerceEdit([archive, { ...archive }], []), identifiesOffer(archive.id));
  assert.throws(() => createCommerceEdit([], [alternative, { ...alternative }]), identifiesOffer(alternative.id));
  // Different objects with individually valid tracks still cannot share one listing identity.
  const duplicateIdentity = { ...alternative, id: archive.id };
  assert.throws(() => createCommerceEdit([archive], [duplicateIdentity]), identifiesOffer(archive.id));
});

test('fixture lookup preserves explicit order and reports unresolved catalog IDs', () => {
  const ids = ['soft-satchel-alternative', 'chloe-paddington-complete', 'chloe-paddington-archive'];
  assert.deepEqual(offersFor(ids).map(product => product.id), ids);
  assert.throws(() => offersFor(['missing-first-sight-offer']), identifiesOffer('missing-first-sight-offer'));
});
