/** Browser-independent wardrobe rules. App handles storage and notifications around them. */

// Version this key if the persisted data shape changes; existing records store item IDs only.
export const SAVED_ITEMS_KEY = 'loomstory-web:saved:v1';

/** Recover stored IDs safely, retaining only unique strings present in the current catalog. */
export function parseSavedItems(raw: string | null, validIds: readonly string[]): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(value)) return [];
    const valid = new Set(validIds);
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && valid.has(id)))];
  } catch {
    return [];
  }
}

/** Return a new favorite list after toggling a known ID; never mutate the caller's array. */
export function toggleSavedItem(savedIds: readonly string[], id: string, validIds: readonly string[]): string[] {
  if (!validIds.includes(id)) return [...savedIds];
  return savedIds.includes(id) ? savedIds.filter(value => value !== id) : [...savedIds, id];
}
