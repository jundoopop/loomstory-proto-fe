/** Shared FirstSight data shapes. Keep service adapters and UI components aligned here. */

/** Filter labels; individual looks use a concrete region rather than the aggregate "All". */
export type Region = 'All' | 'Korea' | 'Japan' | 'China' | 'Global';

/** A sourced styling reference, including the metadata needed for credit and image layout. */
export interface OutfitLook {
  id: string;
  celebrity: string;
  region: Exclude<Region, 'All'>;
  title: string;
  image: string;
  // Original thumbnail dimensions preserve each photo's ratio in the masonry layout.
  width: number;
  height: number;
  sourceUrl: string;
  sourceLabel: string;
  // Keep attribution and license links with the image when adding or replacing a look.
  credit: string;
  license: string;
  licenseUrl: string;
  tags: string[];
  kind: 'Celebrity style' | 'Editorial' | 'On screen';
  description: string;
}

/** Browser-local photo preview passed into the discovery flow; this is not a storage path. */
export interface PhotoInput {
  kind: 'sample' | 'upload';
  url: string;
  name: string;
}

/** Authored identity reveal. A live adapter will need statuses for uncertain or unknown matches. */
export interface GarmentIdentity {
  brand: string;
  name: string;
  year: string;
  season: string;
  description: string;
  mode: 'prototype';
  tags: string[];
}

/** One purchasable size/SKU. Zero stock disables selection and bounds local bag quantities. */
export interface PurchaseVariant {
  sku: string;
  size: string;
  stock: number;
}

/** Product information used by purchase cards, the PDP, alternatives, and the local bag. */
export interface PurchaseOption {
  // Prototype IDs match the shared catalog so the existing wardrobe can recognize them.
  id: string;
  title: string;
  brand: string;
  // Displayed as EUR throughout the current prototype.
  price: number;
  image: string;
  category: string;
  color: string;
  description: string;
  material: string;
  condition: string;
  variants: PurchaseVariant[];
  // Labels distinguish illustrative photographs from front/back silhouette sketches.
  gallery: { src: string; label: string }[];
  affordable?: boolean;
}

/** Complete result returned through the gateway, keeping page orchestration independent of data access. */
export interface DiscoveryResult {
  identity: GarmentIdentity;
  products: PurchaseOption[];
  looks: OutfitLook[];
}

/** A selected SKU in the page-owned bag; quantity is capped by its variant's sample stock. */
export interface CartLine {
  product: PurchaseOption;
  sku: string;
  size: string;
  quantity: number;
}
