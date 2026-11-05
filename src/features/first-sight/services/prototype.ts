/** Compose authored studies with an injectable context provider; no photo leaves the browser. */
import { recognitionStudies } from '../recognition.ts';
import { findOutfitExample } from '../data/outfitExamples.ts';
import { outfitStudies } from '../data/outfitStudies.ts';
import { prototypeContextContentProvider } from './content/prototype.ts';
import type { FirstSightGateway } from './contracts';
import type { ContextContentProvider } from './content/contracts';

/** The page treats AbortError as cancellation, regardless of a caller's custom abort reason. */
function assertActive(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
}

/** Keep the existing scan pacing, releasing its timer and listener on either outcome. */
function waitForPrototypeDelay(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    assertActive(signal);
    const cancel = () => {
      globalThis.clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const timer = globalThis.setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, 900);
    signal.addEventListener('abort', cancel, { once: true });
  });
}

/**
 * Cancel the consumer promptly even if an injected provider ignores its signal.
 * Keep both settlement handlers attached so a late provider rejection is consumed.
 * Stopping underlying work remains the provider's responsibility.
 */
function withAbort<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      signal.removeEventListener('abort', cancel);
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', cancel, { once: true });
    work.then(
      value => {
        signal.removeEventListener('abort', cancel);
        if (signal.aborted) cancel();
        else resolve(value);
      },
      error => {
        signal.removeEventListener('abort', cancel);
        if (signal.aborted) cancel();
        else reject(error);
      },
    );
    // Attach settlement handlers first, including when cancellation has already happened.
    if (signal.aborted) cancel();
  });
}

/** Inject only context discovery here; recognition and commerce remain local authored studies. */
export function createPrototypeGateway(
  contentProvider: ContextContentProvider = prototypeContextContentProvider,
): FirstSightGateway {
  return {
    async discover(photo, signal) {
      assertActive(signal);
      // Only an explicit authored sample selects a look. Uploads and Discover references
      // retain the disclosed library demonstration; filenames never infer an outfit.
      const outfit = photo.kind === 'sample' && photo.exampleId ? findOutfitExample(photo.exampleId) : undefined;
      if (photo.kind === 'sample' && photo.exampleId && (!outfit || photo.url !== outfit.photo.url)) {
        throw new Error('This outfit example is unavailable. Choose an example again.');
      }
      const studies = outfit ? outfit.memberIds.map(id => {
        const study = outfitStudies.find(candidate => candidate.id === id);
        if (!study?.identityEvidence || study.identity.brand === 'Unbranded style study') {
          throw new Error(`Outfit member is not a documented model: ${id}`);
        }
        return study;
      }) : recognitionStudies;
      if (outfit && (!studies.length || new Set(outfit.memberIds).size !== studies.length
        || !outfit.memberIds.includes(outfit.primaryItemId))) {
        throw new Error(`Outfit has invalid membership: ${outfit.id}`);
      }
      await waitForPrototypeDelay(signal);
      assertActive(signal);

      // Async callbacks convert a synchronous provider throw into a handled rejected study.
      // Promise.all preserves authored study order even when providers finish out of order.
      const work = Promise.all(studies.map(async study => {
        assertActive(signal);
        const { contextReferenceIds, ...item } = study;
        const looks = await contentProvider.getReferences({
          itemId: study.id,
          referenceIds: [...contextReferenceIds],
        }, signal);
        assertActive(signal);
        return {
          ...item,
          looks: [...looks],
        };
      }));
      const items = await withAbort(work, signal);
      assertActive(signal);
      return outfit ? { items, outfit } : { items };
    },
  };
}

/** Existing page import remains stable; tests and future adapters can use the factory above. */
export const prototypeGateway = createPrototypeGateway();
