export const SAVED_ITEMS_KEY = 'loomstory-web:saved:v1';

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

export function toggleSavedItem(savedIds: readonly string[], id: string, validIds: readonly string[]): string[] {
  if (!validIds.includes(id)) return [...savedIds];
  return savedIds.includes(id) ? savedIds.filter(value => value !== id) : [...savedIds, id];
}
