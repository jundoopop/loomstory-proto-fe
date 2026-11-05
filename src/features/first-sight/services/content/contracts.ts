/** Content resolution is independent of recognition, commerce and React presentation. */
import type { OutfitLook } from '../../types';

/** The study supplies an authored order; the provider must preserve it, including an empty list. */
export interface ContextContentRequest {
  itemId: string;
  referenceIds: readonly string[];
}

/** Resolve complete, attributed references or reject; never silently omit a requested record. */
export interface ContextContentProvider {
  readonly id: string;
  /** Honour cancellation and return a fresh array. Treat the reference records as immutable. */
  getReferences(request: ContextContentRequest, signal: AbortSignal): Promise<OutfitLook[]>;
}
