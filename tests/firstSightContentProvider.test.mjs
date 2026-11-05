// Protect the provider seam and cancellation races independently of React presentation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { chloeLooks } from '../src/features/first-sight/chloe.ts';
import { outfitLooks } from '../src/features/first-sight/looks.ts';
import { recognitionStudies } from '../src/features/first-sight/recognition.ts';
import {
  createPrototypeContextContentProvider,
  prototypeContextContentProvider,
} from '../src/features/first-sight/services/content/prototype.ts';
import { createPrototypeGateway } from '../src/features/first-sight/services/prototype.ts';

const photo = { kind: 'sample', url: '/sample.jpg', name: 'sample.jpg' };
const references = [...chloeLooks, ...outfitLooks];
const referenceById = new Map(references.map(look => [look.id, look]));
const freshSignal = () => new AbortController().signal;
const abortListeners = signal => getEventListeners(signal, 'abort').length;

/** Expose settlement so tests can reverse order or resolve/reject after cancellation. */
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

/** Yield one event-loop turn; mock only the demonstration timeout, not promise scheduling. */
const settleMicrotasks = () => new Promise(resolve => setImmediate(resolve));

function controlledProvider() {
  const calls = [];
  return {
    calls,
    id: 'controlled-test-provider',
    getReferences(request, signal) {
      const pending = deferred();
      calls.push({ request, signal, ...pending });
      return pending.promise;
    },
  };
}

async function enterProviderPhase(context) {
  context.mock.timers.tick(900);
  await settleMicrotasks();
}

test('local resolution preserves requested order, attribution and independent result arrays', async () => {
  const records = Object.freeze([references[0], references[4]]);
  const provider = createPrototypeContextContentProvider(records);
  const referenceIds = Object.freeze([records[1].id, records[0].id]);
  const request = Object.freeze({ itemId: 'ordered-study', referenceIds });
  const signal = freshSignal();
  const first = await provider.getReferences(request, signal);
  const second = await provider.getReferences(request, signal);

  assert.deepEqual(first.map(look => look.id), referenceIds);
  assert.strictEqual(first[0], records[1], 'The source record retains its credit, dimensions and relationship');
  assert.strictEqual(first[1], records[0]);
  assert.notStrictEqual(first, second);
  first.pop();
  assert.equal(second.length, 2, 'A consumer changing its result array must not change another result');
  assert.equal(records.length, 2);
  assert.equal(abortListeners(signal), 0);
});

test('an empty reference request is valid without inventing fallback content', async () => {
  const provider = createPrototypeContextContentProvider([]);
  assert.deepEqual(await provider.getReferences({ itemId: 'empty-study', referenceIds: [] }, freshSignal()), []);
});

test('registry ambiguity is rejected before the provider can be used', () => {
  const record = references[0];
  assert.throws(
    () => createPrototypeContextContentProvider([record, { ...record, title: 'Conflicting record' }]),
    error => error instanceof Error && error.message.includes(record.id),
  );
});

test('missing and repeated requested IDs reject with the offending ID', async () => {
  const provider = createPrototypeContextContentProvider([references[0]]);
  const signal = freshSignal();
  for (const referenceIds of [['unregistered-reference'], [references[0].id, references[0].id]]) {
    await assert.rejects(
      provider.getReferences({ itemId: 'invalid-study', referenceIds }, signal),
      error => error instanceof Error && error.message.includes(referenceIds.at(-1)),
    );
  }
  assert.equal(abortListeners(signal), 0);
});

test('local resolution normalises pre-existing cancellation even with a custom abort reason', async () => {
  for (const reason of [undefined, new Error('Photo changed')]) {
    const controller = new AbortController();
    controller.abort(reason);
    await assert.rejects(
      prototypeContextContentProvider.getReferences({ itemId: 'cancelled-study', referenceIds: [] }, controller.signal),
      { name: 'AbortError' },
    );
    assert.equal(abortListeners(controller.signal), 0);
  }
});

test('all 44 references have conservative authored relationships preserved by the default provider', async () => {
  const validRelationships = new Set(['same-design', 'runway-reference', 'styling-inspiration']);
  assert.equal(references.length, 44);
  assert.equal(referenceById.size, references.length);
  assert.ok(references.every(look => validRelationships.has(look.relationship)));
  assert.ok(outfitLooks.every(look => look.relationship === 'styling-inspiration'));
  assert.deepEqual(
    references.filter(look => look.relationship === 'runway-reference').map(look => look.id),
    ['paddington-styling-03', 'paddington-styling-04'],
  );
  assert.equal(references.some(look => look.relationship === 'same-design'), false,
    'No current record establishes an exact design-family association');

  const resolved = await prototypeContextContentProvider.getReferences({
    itemId: 'all-references', referenceIds: references.map(look => look.id),
  }, freshSignal());
  assert.deepEqual(resolved, references);
  for (const [index, record] of resolved.entries()) {
    assert.strictEqual(record, references[index], 'Relationship and attribution must travel with the source record');
  }
});

test('gateway waits for the scan delay and preserves study order despite reverse provider settlement', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const provider = controlledProvider();
  const signal = freshSignal();
  const discovery = createPrototypeGateway(provider).discover(photo, signal);
  context.mock.timers.tick(899);
  await settleMicrotasks();
  assert.equal(provider.calls.length, 0, 'Content must not start before the demonstration delay');
  context.mock.timers.tick(1);
  await settleMicrotasks();
  assert.equal(provider.calls.length, 5, 'All five lookups should start without serially awaiting each provider');

  for (const [index, call] of provider.calls.entries()) {
    assert.deepEqual(call.request, {
      itemId: recognitionStudies[index].id,
      referenceIds: recognitionStudies[index].contextReferenceIds,
    });
    assert.strictEqual(call.signal, signal);
  }
  for (const call of [...provider.calls].reverse()) {
    call.resolve(call.request.referenceIds.map(id => referenceById.get(id)));
    await settleMicrotasks();
  }
  const result = await discovery;
  assert.deepEqual(result.items.map(item => item.id), recognitionStudies.map(study => study.id));
  for (const [index, item] of result.items.entries()) {
    const { contextReferenceIds, ...study } = recognitionStudies[index];
    const { looks, ...resolvedFields } = item;
    assert.deepEqual(resolvedFields, study, 'Gateway composition must preserve canonical dossiers and commerce');
    assert.deepEqual(looks.map(look => look.id), contextReferenceIds);
    assert.equal(Object.hasOwn(item, 'products'), false, 'Provider composition must not recreate the retired mixed edit');
  }
  assert.equal(abortListeners(signal), 0);
});

test('gateway abort during the delay prevents any provider call and removes its listener', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const provider = controlledProvider();
  const controller = new AbortController();
  const discovery = createPrototypeGateway(provider).discover(photo, controller.signal);
  const rejected = assert.rejects(discovery, { name: 'AbortError' });
  context.mock.timers.tick(300);
  controller.abort(new Error('Changed photo during scan'));
  await rejected;
  context.mock.timers.tick(900);
  await settleMicrotasks();
  assert.equal(provider.calls.length, 0);
  assert.equal(abortListeners(controller.signal), 0);
});

test('gateway rejects promptly when a pending provider ignores cancellation and consumes late settlement', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const provider = controlledProvider();
  const controller = new AbortController();
  const discovery = createPrototypeGateway(provider).discover(photo, controller.signal);
  const rejected = assert.rejects(discovery, { name: 'AbortError' });
  await enterProviderPhase(context);
  assert.equal(provider.calls.length, 5);
  controller.abort(new Error('Changed photo during context lookup'));
  await rejected;
  assert.equal(abortListeners(controller.signal), 0, 'No listener may remain attached to an abandoned request');

  // Node's test runner reports unhandled rejections, including those after the test completes.
  provider.calls.forEach((call, index) => {
    if (index % 2) call.reject(new Error(`Late provider failure ${index}`));
    else call.resolve(call.request.referenceIds.map(id => referenceById.get(id)));
  });
  await settleMicrotasks();
  await assert.rejects(discovery, { name: 'AbortError' }, 'Late content must not turn cancellation into success');
});

test('an asynchronous provider failure rejects the whole result and cleans up pending work listeners', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const provider = controlledProvider();
  const signal = freshSignal();
  const failure = new Error('Context source unavailable');
  const discovery = createPrototypeGateway(provider).discover(photo, signal);
  const rejected = assert.rejects(discovery, error => error === failure);
  await enterProviderPhase(context);
  provider.calls[2].reject(failure);
  await rejected;
  assert.equal(abortListeners(signal), 0);
  provider.calls.forEach(call => call.resolve([]));
  await settleMicrotasks();
});

test('a synchronous provider exception becomes a rejected discovery promise with cleanup', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const failure = new Error('Malformed adapter input');
  const signal = freshSignal();
  const gateway = createPrototypeGateway({
    id: 'synchronous-failure',
    getReferences() { throw failure; },
  });
  const discovery = gateway.discover(photo, signal);
  const rejected = assert.rejects(discovery, error => error === failure);
  await enterProviderPhase(context);
  await rejected;
  assert.equal(abortListeners(signal), 0);
});

test('cancellation at provider completion cannot expose a successful stale response', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const controller = new AbortController();
  const gateway = createPrototypeGateway({
    id: 'abort-at-resolution',
    async getReferences(request) {
      controller.abort('Photo replaced as content arrived');
      return request.referenceIds.map(id => referenceById.get(id));
    },
  });
  const discovery = gateway.discover(photo, controller.signal);
  const rejected = assert.rejects(discovery, { name: 'AbortError' });
  await enterProviderPhase(context);
  await rejected;
  assert.equal(abortListeners(controller.signal), 0);
});

test('separate discoveries own their result arrays even when an injected provider reuses an array', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const sharedLooks = [references[0]];
  const gateway = createPrototypeGateway({ id: 'shared-array', async getReferences() { return sharedLooks; } });
  const firstPending = gateway.discover(photo, freshSignal());
  const secondPending = gateway.discover(photo, freshSignal());
  await enterProviderPhase(context);
  const [first, second] = await Promise.all([firstPending, secondPending]);
  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first.items, second.items);
  for (const [index, item] of first.items.entries()) {
    assert.notStrictEqual(item, second.items[index]);
    assert.notStrictEqual(item.looks, second.items[index].looks);
    assert.notStrictEqual(item.looks, sharedLooks);
    assert.strictEqual(item.looks[0], sharedLooks[0], 'Canonical records need not be deep-cloned');
  }
  first.items[0].looks.pop();
  first.items.pop();
  assert.equal(sharedLooks.length, 1);
  assert.equal(second.items[0].looks.length, 1);
  assert.equal(second.items.length, 5);
});
