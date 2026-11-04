// Business-rule checks protect the two commerce streams before the UI switches to them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommerceEdit, isArchiveOffer, isStyleMatchOffer } from '../src/features/first-sight/commerce.ts';
import { offersFor } from '../src/features/first-sight/fixtures.ts';

const [archive, secondArchive, alternative] = offersFor([
  'chloe-paddington-archive', 'chloe-paddington-complete', 'soft-satchel-alternative',
]);

/** Require useful errors without coupling tests to the exact wording of validation messages. */
function identifiesOffer(id) {
  return error => error instanceof Error && error.message.includes(id);
}

test('classification follows the declared track even when price or the legacy flag suggests otherwise', () => {
  const cheapArchive = { ...archive, price: 58, affordable: true };
  const expensiveStyleMatch = { ...alternative, price: 2000, affordable: false };

  assert.equal(isArchiveOffer(cheapArchive), true);
  assert.equal(isStyleMatchOffer(cheapArchive), false);
  assert.equal(isArchiveOffer(expensiveStyleMatch), false);
  assert.equal(isStyleMatchOffer(expensiveStyleMatch), true);
  assert.equal(isArchiveOffer({ ...cheapArchive, price: 8000 }), true);
  assert.equal(isStyleMatchOffer({ ...expensiveStyleMatch, price: 20 }), true);
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
