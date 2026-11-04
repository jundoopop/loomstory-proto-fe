/** Local discovery implementation; replace the injected gateway when live services are ready. */
import { purchaseOptions, sampleIdentity } from '../fixtures';
import { outfitLooks } from '../looks';
import type { FirstSightGateway } from './contracts';

/** Local adapter: no photo upload, inference, live stock, or network request. */
export const prototypeGateway: FirstSightGateway = {
  /** Simulate loading, then return the same authored identity/catalog for any selected photo. */
  discover(_photo, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
      // An aborted older request must not finish later and overwrite a newer photo's result.
      /** Cancel the pending sample delay using the same AbortError convention as a request. */
      const cancel = () => {
        window.clearTimeout(timer);
        reject(new DOMException('Cancelled', 'AbortError'));
      };
      const timer = window.setTimeout(() => {
        signal.removeEventListener('abort', cancel);
        // This is a curated tag filter with leather looks first, not image-based AI matching.
        const contextTags = ['Leather', 'Layers', 'Monochrome', 'Tailoring'];
        const looks = outfitLooks.filter(look => look.tags.some(tag => contextTags.includes(tag)))
          .sort((left, right) => Number(right.tags.includes('Leather')) - Number(left.tags.includes('Leather')));
        resolve({ identity: sampleIdentity, products: purchaseOptions, looks });
      }, 900);
      signal.addEventListener('abort', cancel, { once: true });
    });
  },
};
