/** Authored Discover edits: contemporary references to an era or mood, never product identifications. */
import { outfitLooks } from '../first-sight/looks.ts';
import type { OutfitLook } from '../first-sight/types';

export interface InspirationCollection {
  id: string;
  title: string;
  chapter: string;
  headline: string;
  description: string;
  tags: string[];
  heroId: string;
  position: string;
}

// These are contemporary styling references to an era or mood, not archival identifications.
export const inspirationCollections: InspirationCollection[] = [
  {
    id: 'streetwear', title: '90s Streetwear', chapter: 'THE EVERYDAY, REIMAGINED',
    headline: 'A little attitude.\nA lasting impression.',
    description: 'Leather layers, relaxed proportions, and a familiar off-duty feeling. Discover present-day looks with a little nineties spirit.',
    tags: ['Street style', 'Leather', 'Casual', 'Layers'], heroId: 'zendaya-8', position: '50% 30%',
  },
  {
    id: 'denim', title: 'Vintage Denim', chapter: 'WORN IN. NEVER WORN OUT.',
    headline: 'Blue, in every\nchapter of life.',
    description: 'Faded blues and easy silhouettes: a modern edit inspired by the denim we return to, year after year.',
    tags: ['Denim', 'Casual', 'Print'], heroId: 'iu-singer-6', position: '50% 28%',
  },
  {
    id: 'cinema', title: 'Retro Cinema', chapter: 'A LEADING-ROLE FEELING',
    headline: 'Some looks deserve\na second scene.',
    description: 'Sharp tailoring, evening silhouettes, and old-screen elegance. Contemporary red-carpet references with a cinematic point of view.',
    tags: ['Tailoring', 'Evening', 'Monochrome'], heroId: 'tom-holland-5', position: '50% 20%',
  },
  {
    id: 'accessories', title: 'Iconic Designer Accessories', chapter: 'THE DETAILS WE REMEMBER',
    headline: 'One detail.\nThe whole story.',
    description: 'A necklace, a shoulder bag, a flash of metal. Explore styling where a small detail gives the entire look its character.',
    tags: ['Jewellery', 'Leather', 'Texture', 'Evening'], heroId: 'lisa-blackpink-2', position: '50% 22%',
  },
];

/** Rank by the collection's ordered tags, then keep the board deliberately small. */
export function collectionLooks(collection: InspirationCollection): OutfitLook[] {
  const score = (look: OutfitLook) => collection.tags.reduce((total, tag, index) => total + (look.tags.includes(tag) ? collection.tags.length - index : 0), 0);
  return outfitLooks.filter(look => score(look) > 0)
    .sort((left, right) => score(right) - score(left))
    .slice(0, 6);
}
