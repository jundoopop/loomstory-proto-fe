/** Ordered local context lookup; this adapter never downloads media or analyses a photograph. */
import { chloeLooks } from '../../chloe.ts';
import { outfitLooks } from '../../looks.ts';
import { outfitExampleLooks } from '../../data/outfitExamples.ts';
import type { OutfitLook } from '../../types';
import type { ContextContentProvider } from './contracts';

/** Validate the registry once, then retain the original immutable records and their attribution. */
export function createPrototypeContextContentProvider(
  references: readonly OutfitLook[],
): ContextContentProvider {
  const registry = new Map<string, OutfitLook>();
  for (const reference of references) {
    if (registry.has(reference.id)) {
      throw new Error(`FirstSight context registry repeats reference ID: ${reference.id}`);
    }
    registry.set(reference.id, reference);
  }

  return {
    id: 'prototype-context',
    async getReferences({ itemId, referenceIds }, signal) {
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      const requested = new Set<string>();
      const resolved = referenceIds.map(id => {
        if (requested.has(id)) {
          throw new Error(`FirstSight study ${itemId} repeats reference ID: ${id}`);
        }
        requested.add(id);
        const reference = registry.get(id);
        if (!reference) {
          throw new Error(`FirstSight study ${itemId} has an unregistered reference ID: ${id}`);
        }
        return reference;
      });
      // Use the same cancellation convention even when a caller supplies a custom abort reason.
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      return resolved;
    },
  };
}

export const prototypeContextContentProvider = createPrototypeContextContentProvider([
  ...chloeLooks,
  ...outfitLooks,
  ...outfitExampleLooks,
]);
