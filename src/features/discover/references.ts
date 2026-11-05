/** Resolve navigation identifiers through authored data, never through a supplied image URL. */
import { outfitLooks } from '../first-sight/looks.ts';
import type { PhotoInput } from '../first-sight/types';

export function resolveInspirationPhoto(id: string | null): PhotoInput | null {
  const reference = outfitLooks.find(look => look.id === id);
  return reference ? {
    kind: 'reference',
    url: reference.image,
    name: `${reference.celebrity} — ${reference.title}`,
    reference,
  } : null;
}
