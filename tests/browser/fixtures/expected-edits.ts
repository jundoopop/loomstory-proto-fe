/** Independently authored expectations: changes to catalogue membership require an explicit review. */
export interface ExpectedOffer {
  readonly id: string;
  readonly title: string;
  readonly label: 'Vintage original' | 'Designer reissue' | 'Archive study';
}

export interface ExpectedStudy {
  readonly id: string;
  readonly name: string;
  readonly archive: readonly ExpectedOffer[];
  readonly styles: readonly { readonly id: string; readonly title: string }[];
}

// Do not import recognitionStudies here: a broken grouping must not generate its own expected result.
export const studies: readonly ExpectedStudy[] = [
  {
    id: 'chloe-paddington', name: 'Chloé Paddington Bag',
    archive: [
      { id: 'chloe-paddington-archive', title: 'Paddington · archive example', label: 'Vintage original' },
      { id: 'chloe-paddington-complete', title: 'Paddington · complete-set example', label: 'Vintage original' },
      { id: 'chloe-paddington-reissue', title: 'Paddington · reissue example', label: 'Designer reissue' },
    ],
    styles: [{ id: 'soft-satchel-alternative', title: 'The soft satchel · silhouette example' }],
  },
  {
    id: 'leather-bomber', name: 'Vintage leather bomber',
    archive: [
      { id: 'bomber-archive', title: 'The leather bomber · archive study', label: 'Archive study' },
      { id: 'minimalist-leather', title: 'The minimalist leather jacket', label: 'Archive study' },
      { id: 'weekend-layer', title: 'The weekend leather layer', label: 'Archive study' },
    ],
    styles: [{ id: 'bomber-alternative', title: 'The relaxed bomber · modern study' }],
  },
  {
    id: 'denim-jacket', name: 'Classic denim jacket',
    archive: [
      { id: 'denim-jacket-archive', title: 'The denim jacket · archive study', label: 'Archive study' },
      { id: 'archive-denim', title: 'The straight-leg archive jean', label: 'Archive study' },
      { id: 'record-shop-denim', title: 'The record-shop jean', label: 'Archive study' },
    ],
    styles: [{ id: 'denim-jacket-alternative', title: 'The everyday denim jacket · modern study' }],
  },
  {
    id: 'tailored-blazer', name: 'Oversized tailored blazer',
    archive: [
      { id: 'blazer-archive', title: 'The oversized blazer · archive study', label: 'Archive study' },
      { id: 'city-coat', title: 'The city wool coat', label: 'Archive study' },
      { id: 'gallery-coat', title: 'The gallery coat', label: 'Archive study' },
    ],
    styles: [{ id: 'blazer-alternative', title: 'The relaxed blazer · modern study' }],
  },
  {
    id: 'workwear-jacket', name: 'Vintage workwear jacket',
    archive: [
      { id: 'workwear-archive', title: 'The chore jacket · archive study', label: 'Archive study' },
      { id: 'denim-jacket-archive', title: 'The denim jacket · archive study', label: 'Archive study' },
    ],
    styles: [
      { id: 'workwear-alternative', title: 'The utility jacket · modern study' },
      { id: 'denim-jacket-alternative', title: 'The everyday denim jacket · modern study' },
    ],
  },
];
