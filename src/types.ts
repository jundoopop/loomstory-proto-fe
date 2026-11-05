/** Shared catalog/editorial models used by App and the original collection pages.
 * FirstSight's richer identity, SKU, and cart models live in features/first-sight/types.ts.
 */

/** One fictional catalog piece; its stable ID is also the wardrobe persistence key. */
export interface Item {
  id: string;
  title: string;
  price: number;
  era: string;
  category: string;
  size: string;
  image: string;
  description: string;
  storyId: string;
}

/** An editorial article linked from catalog pieces through Item.storyId. */
export interface Story {
  id: string;
  title: string;
  kicker: string;
  image: string;
  summary: string;
  body: string[];
}

/** App-owned catalog and wardrobe operations shared by browsing/detail page components. */
export interface CollectionProps {
  items: Item[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
}
