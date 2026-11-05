/** Future application-wide data/storage/story ports; no adapters are connected here.
 * FirstSight's currently injectable discovery port lives in features/first-sight/services/.
 */
import type { Item } from '../types';

// Architecture boundaries only: no clients, endpoints, credentials, or network calls.
// A future Supabase adapter will implement these operations with auth and RLS.
/** Read-side catalog contract for replacing local item fixtures with a repository. */
export interface ItemRepository {
  /** Retrieve the collection shown by browsing pages. */
  list(): Promise<Item[]>;
  /** Resolve a stable item ID, returning null when it no longer exists. */
  find(id: string): Promise<Item | null>;
}

/** Upload boundary: convert a local File into a server-readable storage reference. */
export interface PhotoStorage {
  upload(photo: File): Promise<{ storagePath: string }>;
}

// Browser -> authenticated serverless function -> AI provider.
// Provider secrets must remain in that function's environment.
/** Suggested copy that must remain subject to review rather than verified provenance. */
export interface StoryAnalysis {
  description: string;
  culturalContext: string;
  requiresReview: true;
}

/** Analyze a stored photo through a server-side service that owns provider credentials. */
export interface StoryAnalyzer {
  analyze(storagePath: string): Promise<StoryAnalysis>;
}
