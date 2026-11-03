import type { Item } from '../types';

// Architecture boundaries only: no clients, endpoints, credentials, or network calls.
// A future Supabase adapter will implement these operations with auth and RLS.
export interface ItemRepository {
  list(): Promise<Item[]>;
  find(id: string): Promise<Item | null>;
}

export interface PhotoStorage {
  upload(photo: File): Promise<{ storagePath: string }>;
}

// Browser -> authenticated serverless function -> AI provider.
// Provider secrets must remain in that function's environment.
export interface StoryAnalysis {
  description: string;
  culturalContext: string;
  requiresReview: true;
}

export interface StoryAnalyzer {
  analyze(storagePath: string): Promise<StoryAnalysis>;
}
