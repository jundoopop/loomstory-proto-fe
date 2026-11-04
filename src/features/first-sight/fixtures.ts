/** Commerce demo data: edit identity copy and product enrichment here, not in UI components. */
import { items } from '../../data/catalog';
import type { GarmentIdentity, PurchaseOption } from './types';

/** Fixed identity shown for every photo; it does not authenticate or analyze that photo. */
export const sampleIdentity: GarmentIdentity = {
  brand: 'Loom Archive', name: 'The everyday leather jacket', year: '1998',
  season: 'Autumn / Winter', mode: 'prototype',
  description: 'A familiar silhouette. A new starting point. Explore an imagined archive match and the ways you could wear it.',
  tags: ['Leather', 'Relaxed fit', 'Archive-inspired'],
};

/** Enrich the shared catalog with sample PDP fields while retaining wardrobe-compatible IDs. */
export const purchaseOptions: PurchaseOption[] = items.map((item, index) => ({
  id: item.id, title: item.title, brand: 'Loom Archive', price: item.price,
  image: item.image, category: item.category,
  color: item.category === 'Denim' ? 'Washed indigo' : item.image.includes('coat') ? 'Warm camel' : 'Soft black',
  description: item.description,
  material: item.category === 'Denim' ? '100% cotton · sample specification' : item.image.includes('coat') ? 'Wool blend · sample specification' : 'Leather outer, lined interior · sample specification',
  condition: 'Very good · illustrative condition',
  // Deterministic stock includes unavailable and low-stock sizes for the shopping walkthrough.
  variants: (item.category === 'Denim' ? ['26', '28', '30', '32'] : ['XS', 'S', 'M', 'L']).map((size, sizeIndex) => ({
    sku: `LS-${String(index + 1).padStart(3, '0')}-${size}`,
    size, stock: sizeIndex === (index + 1) % 4 ? 0 : sizeIndex === 2 ? 1 : 3,
  })),
  // Sketches provide alternate views without presenting invented product photographs.
  gallery: [
    { src: item.image, label: 'Photograph · illustrative' },
    { src: `/assets/first-sight/${item.category === 'Denim' ? 'denim' : item.image.includes('coat') ? 'coat' : 'jacket'}-front.svg`, label: 'Front · silhouette sketch' },
    { src: `/assets/first-sight/${item.category === 'Denim' ? 'denim' : item.image.includes('coat') ? 'coat' : 'jacket'}-back.svg`, label: 'Back · silhouette sketch' },
  ],
  // Controls the accessible-edit badge; relative-price filtering in the PDP chooses alternatives.
  affordable: item.price < 100,
}));
