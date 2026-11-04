/** Local discovery implementation; replace the injected gateway when live services are ready. */
import { recognitionItems } from '../recognition.ts';
import type { FirstSightGateway } from './contracts';

/** Local adapter: no photo upload, inference, live stock, or network request. */
export const prototypeGateway: FirstSightGateway = {
  /** Simulate loading, then return five authored studies for any selected photo. */
  discover(_photo, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
      // An aborted older request must not finish later and overwrite a newer photo's result.
      /** Cancel the pending sample delay using the same AbortError convention as a request. */
      const cancel = () => {
        globalThis.clearTimeout(timer);
        reject(new DOMException('Cancelled', 'AbortError'));
      };
      const timer = globalThis.setTimeout(() => {
        signal.removeEventListener('abort', cancel);
        // Scores and eras are seeded fixtures, not measured matches to the user's photograph.
        resolve({ items: recognitionItems });
      }, 900);
      signal.addEventListener('abort', cancel, { once: true });
    });
  },
};
