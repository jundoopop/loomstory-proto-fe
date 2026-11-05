/** Compose authored studies with an injectable context provider; no photo leaves the browser. */
import { recognitionStudies } from '../recognition.ts';
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
    async discover(_photo, signal) {
      await waitForPrototypeDelay(signal);
      assertActive(signal);

      // Async callbacks convert a synchronous provider throw into a handled rejected study.
      // Promise.all preserves authored study order even when providers finish out of order.
      const work = Promise.all(recognitionStudies.map(async study => {
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
      return { items };
    },
  };
}

/** Existing page import remains stable; tests and future adapters can use the factory above. */
export const prototypeGateway = createPrototypeGateway();
