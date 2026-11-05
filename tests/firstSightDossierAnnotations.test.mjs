// Feature content is an authored contract; valid array shape alone cannot catch a missing feature.
import test from 'node:test';
import assert from 'node:assert/strict';
import { outfitStudies } from '../src/features/first-sight/data/outfitStudies.ts';
import { recognitionStudies } from '../src/features/first-sight/recognition.ts';
import { prototypeGateway } from '../src/features/first-sight/services/prototype.ts';

const expectedLabels = {
  'puma-rose-micro-grip': ['Domed silhouette', 'Twin handles', 'Curved panel seams', 'Textured surface'],
  'puma-rose-longsleeve': ['Cropped silhouette', 'Round neckline', 'Finished cuffs', 'Smooth surface'],
  'puma-rose-mini-skirt': ['Mini silhouette', 'ROSIE badge', 'Curved hem', 'Smooth fabric'],
  'puma-rose-mesh-top': ['Sleeveless cut', '97 graphic', 'Bound hem', 'Open mesh'],
  'puma-rose-t7-trousers': ['Wide leg', 'Drawcord waist', 'Finished hems', 'Smooth surface'],
  'puma-rose-speedcat': ['Low profile', 'Wrapping laces', 'Stitched panels', 'Smooth upper'],
};
const cardIds = ['design-concept', 'key-features', 'craftsmanship', 'common-materials'];

test('all six ROSÉ models retain four distinct, labelled product-image features', () => {
  assert.deepEqual(outfitStudies.map(item => item.id).sort(), Object.keys(expectedLabels).sort());
  const annotationIds = new Set();
  for (const item of outfitStudies) {
    assert.equal(item.analysis.imagePresentation, 'full', `${item.id}: anchors use the complete packshot`);
    assert.deepEqual(item.annotations.map(feature => feature.label), expectedLabels[item.id]);
    assert.deepEqual(item.annotations.map(feature => feature.cardId), cardIds);
    assert.deepEqual(item.analysis.cards.map(card => card.id), cardIds);
    const positions = new Set();
    for (const feature of item.annotations) {
      assert.ok(feature.id.trim(), `${item.id}: missing stable annotation ID`);
      assert.equal(annotationIds.has(feature.id), false, `${feature.id}: ambiguous DOM references`);
      annotationIds.add(feature.id);
      assert.ok(Number.isFinite(feature.x) && feature.x > 0 && feature.x < 100, `${feature.id}: invalid image x`);
      assert.ok(Number.isFinite(feature.y) && feature.y > 0 && feature.y < 100, `${feature.id}: invalid image y`);
      positions.add(`${feature.x},${feature.y}`);
      assert.ok(feature.detail.trim().length > feature.label.length, `${feature.id}: a feature needs an explanation`);
    }
    assert.equal(positions.size, 4, `${item.id}: each feature must have its own target`);
    assert.equal(item.confidence, undefined, 'Adding callouts must not fabricate measured recognition');
    assert.equal(item.analysis.resale, undefined, 'Adding callouts must not introduce a valuation');
  }
  assert.equal(annotationIds.size, 24);
});

test('the public gateway delivers each look’s four-feature studies without changing Chloé anchors', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  for (const photo of [
    { kind: 'sample', exampleId: 'rose-puma-city', url: '/local-media/outfits/rose-standing.jpg', name: 'City example' },
    { kind: 'sample', exampleId: 'rose-puma-track', url: '/local-media/outfits/rose-seated.webp', name: 'Track example' },
  ]) {
    const pending = prototypeGateway.discover(photo, new AbortController().signal);
    context.mock.timers.tick(900);
    const result = await pending;
    assert.equal(result.items.length, 3);
    for (const item of result.items) {
      assert.deepEqual(item.annotations.map(feature => feature.label), expectedLabels[item.id]);
      assert.deepEqual(item.annotations.map(feature => feature.cardId), cardIds);
    }
  }
  const chloe = recognitionStudies.find(item => item.id === 'chloe-paddington');
  assert.ok(chloe);
  assert.deepEqual(chloe.annotations.map(({ label, x, y }) => ({ label, x, y })), [
    { label: 'Soft silhouette', x: 26, y: 69 },
    { label: 'Signature padlock', x: 49, y: 64 },
    { label: 'Shaped leather trim', x: 35, y: 65 },
    { label: 'Suede calfskin', x: 64, y: 73 },
  ]);
});
