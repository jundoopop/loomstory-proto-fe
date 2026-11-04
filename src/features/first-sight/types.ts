/** Shared FirstSight data shapes. Keep service adapters and UI components aligned here. */

/** Filter labels; individual looks use a concrete region rather than the aggregate "All". */
export type Region = 'All' | 'Korea' | 'Japan' | 'China' | 'Global';

/** Commerce intent is authored for each sample listing; price never selects its track. */
export type CommerceTrack = 'archive' | 'style-match';

/** Listing labels describe the sample offer, not authentication of the uploaded garment. */
export type ArchiveListingKind = 'vintage-original' | 'designer-reissue' | 'archive-study';
export type ListingKind = ArchiveListingKind | 'partner-preview';

/** The discriminant prevents partner previews from being authored as archive listings. */
export type CommerceProfile =
  | { track: 'archive'; listingKind: ArchiveListingKind; matchReason: string }
  | { track: 'style-match'; listingKind: 'partner-preview'; matchReason: string };

/** The study's curated commerce streams; validate membership with createCommerceEdit. */
export interface CommerceEdit {
  archive: PurchaseOption[];
  styleMatches: PurchaseOption[];
}

/** Vocabulary for P6's authored context metadata; existing look records migrate in that phase. */
export type ContextRelationship = 'same-design' | 'runway-reference' | 'styling-inspiration';

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
  // Omit when the original source is still awaiting a supplied file or URL.
  sourceUrl?: string;
  sourceLabel: string;
  // Keep attribution and license links with the image when adding or replacing a look.
  credit: string;
  // User-provided references have credit, but no invented public reuse license.
  license?: string;
  licenseUrl?: string;
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

/** Authored explanation cards; future analysis adapters can populate the same presentation. */
export interface AnalysisCard {
  id: 'design-concept' | 'key-features' | 'craftsmanship' | 'common-materials';
  title: string;
  bullets: string[];
}

/** Item-specific interpretation and sample valuation, separate from uploaded-photo metadata. */
export interface ItemAnalysis {
  image: string;
  imageAlt: string;
  // Trim only known empty studio background; annotation coordinates still use the original image.
  imagePresentation?: 'full' | 'trim-top-space';
  cards: AnalysisCard[];
  resale: {
    description: string;
    minimum: number;
    maximum: number;
    currency: 'EUR';
    // The prototype must not imply that authored estimates came from live marketplace data.
    basis: 'prototype';
  };
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
  era?: string;
  sourceLabel?: string;
  variants: PurchaseVariant[];
  // Labels distinguish illustrative photographs from front/back silhouette sketches.
  gallery: { src: string; label: string }[];
  commerce: CommerceProfile;
  /** @deprecated Derived from commerce.track for the existing grid/PDP; remove after P9/P10. */
  affordable?: boolean;
}

/** Coordinates are percentages of the product-image frame, not of the whole dossier. */
export interface ProductAnnotation {
  id: string;
  cardId: AnalysisCard['id'];
  label: string;
  detail: string;
  x: number;
  y: number;
}

/** Resolved UI result: a selectable study with its narrative, commerce streams, and styling. */
export interface RecognizedItem {
  id: string;
  name: string;
  category: string;
  era: string;
  summary: string;
  // A seeded demonstration score, never a measured probability for the uploaded photograph.
  confidence: number;
  identity: GarmentIdentity;
  analysis: ItemAnalysis;
  annotations: ProductAnnotation[];
  culture: {
    title: string;
    paragraphs: string[];
    sources: { title: string; url: string }[];
  };
  commerce: CommerceEdit;
  /** @deprecated Flattened from commerce for the current page; remove when P8 migrates it. */
  products: PurchaseOption[];
  looks: OutfitLook[];
}

/** Authored input before context resolution and the temporary legacy-product projection. */
export type RecognitionStudy = Omit<RecognizedItem, 'products' | 'looks'> & {
  contextReferenceIds: string[];
};

/** Gateway response: selection stays in the page; the provider returns independent studies. */
export interface DiscoveryResult {
  items: RecognizedItem[];
}

/** A selected SKU in the page-owned bag; quantity is capped by its variant's sample stock. */
export interface CartLine {
  product: PurchaseOption;
  sku: string;
  size: string;
  quantity: number;
}
