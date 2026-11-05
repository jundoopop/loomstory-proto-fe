/**
 * Sample commerce enrichment. Stable catalog IDs keep every FirstSight save compatible
 * with the wardrobe; no record here represents a seller, live stock, or a real offer.
 */
import { items } from '../../data/catalog.ts';
import { outfitOfferDetails } from './data/outfitCatalog.ts';
import type { CommerceProfile, PurchaseOption } from './types';

/** Keep editable offer assumptions beside the catalog mapping, outside presentation components. */
interface OfferDetails {
  brand?: string;
  sizes?: string[];
  sourceLabel?: string;
  condition: string;
  stock: number;
  material: string;
  color: string;
  commerce: CommerceProfile;
}

const offerDetails: Record<string, OfferDetails> = {
  ...outfitOfferDetails,
  // Vintage-original describes these fictional listings; their photo remains a reissue reference.
  'chloe-paddington-archive': {
    condition: 'Good · sample condition', stock: 1, material: 'Suede calfskin · pictured reissue reference', color: 'Vintage brown',
    commerce: { track: 'archive', listingKind: 'vintage-original', matchReason: 'An imagined vintage Paddington offer shares the study’s rounded shape and signature padlock.' },
  },
  'chloe-paddington-complete': {
    condition: 'Excellent · sample complete set', stock: 2, material: 'Suede calfskin · pictured reissue reference', color: 'Vintage brown',
    commerce: { track: 'archive', listingKind: 'vintage-original', matchReason: 'An imagined complete-set Paddington offer pairs the familiar silhouette with its key and accessories.' },
  },
  'chloe-paddington-reissue': {
    condition: 'Excellent · sample reissue', stock: 0, material: 'Suede calfskin · pictured reissue reference', color: 'Vintage brown',
    commerce: { track: 'archive', listingKind: 'designer-reissue', matchReason: 'The suede reissue revisits the original design’s soft volume and distinctive padlock.' },
  },
  'soft-satchel-alternative': {
    condition: 'New · fictional design', stock: 3, material: 'Soft textile · fictional specification', color: 'Warm brown',
    commerce: { track: 'style-match', listingKind: 'partner-preview', matchReason: 'Soft volume and curved handles echo the Paddington silhouette.' },
  },
  // Generic archive studies and modern concepts share design cues, not a verified production history.
  'bomber-archive': {
    condition: 'Good · sample patina', stock: 2, material: 'Leather shell, knit trim · study specification', color: 'Espresso brown',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'A roomy leather body and ribbed hem follow the bomber study’s compact outline.' },
  },
  'bomber-alternative': {
    condition: 'New · fictional design', stock: 3, material: 'Coated textile, knit trim · study specification', color: 'Espresso brown',
    commerce: { track: 'style-match', listingKind: 'partner-preview', matchReason: 'A coated-textile concept repeats the bomber’s relaxed shoulder and ribbed finish.' },
  },
  'minimalist-leather': {
    condition: 'Very good · sample condition', stock: 1, material: 'Leather · fictional specification', color: 'Black',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'A pared-back leather layer offers a quieter interpretation of the bomber study’s texture.' },
  },
  'weekend-layer': {
    condition: 'Good · sample condition', stock: 2, material: 'Leather · fictional specification', color: 'Black',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'Relaxed leather layering carries the bomber study’s casual styling into a simpler shape.' },
  },
  'denim-jacket-archive': {
    condition: 'Good · sample fading', stock: 2, material: 'Cotton denim · study specification', color: 'Faded indigo',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'Indigo denim, panel seams, and practical pockets connect this jacket to denim and workwear styling.' },
  },
  'denim-jacket-alternative': {
    condition: 'New · fictional design', stock: 3, material: 'Cotton denim · study specification', color: 'Mid indigo',
    commerce: { track: 'style-match', listingKind: 'partner-preview', matchReason: 'A contemporary denim-jacket concept repeats the structured panels and everyday utility of the study.' },
  },
  'archive-denim': {
    condition: 'Very good · sample condition', stock: 1, material: 'Cotton denim · fictional specification', color: 'Indigo',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'Straight-leg indigo denim extends the jacket study’s fabric story into a coordinating piece.' },
  },
  'record-shop-denim': {
    condition: 'Good · sample fading', stock: 2, material: 'Cotton denim · fictional specification', color: 'Indigo',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'Relaxed, faded jeans complement the denim study’s lived-in texture and casual proportions.' },
  },
  'blazer-archive': {
    condition: 'Very good · sample condition', stock: 2, material: 'Wool blend · study specification', color: 'Warm taupe',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'A generous shoulder and double-breasted front follow the tailored-blazer study.' },
  },
  'blazer-alternative': {
    condition: 'New · fictional design', stock: 3, material: 'Viscose blend · study specification', color: 'Warm taupe',
    commerce: { track: 'style-match', listingKind: 'partner-preview', matchReason: 'A modern viscose-blend concept echoes the blazer’s relaxed shoulder and tailored outline.' },
  },
  'city-coat': {
    condition: 'Very good · sample condition', stock: 1, material: 'Wool blend · fictional specification', color: 'Charcoal',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'An oversized wool-blend coat extends the tailoring study’s generous proportions into outerwear.' },
  },
  'gallery-coat': {
    condition: 'Good · sample condition', stock: 2, material: 'Wool blend · fictional specification', color: 'Charcoal',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'A strong coat outline complements the blazer study’s structured shoulder and layered styling.' },
  },
  'workwear-archive': {
    condition: 'Good · sample wear', stock: 2, material: 'Cotton canvas · study specification', color: 'Faded olive',
    commerce: { track: 'archive', listingKind: 'archive-study', matchReason: 'Olive canvas, patch pockets, and a straight cut express the workwear study’s practical design.' },
  },
  'workwear-alternative': {
    condition: 'New · fictional design', stock: 3, material: 'Cotton twill · study specification', color: 'Faded olive',
    commerce: { track: 'style-match', listingKind: 'partner-preview', matchReason: 'A cotton-twill utility concept repeats the chore jacket’s patch pockets and simple straight cut.' },
  },
};

/**
 * Enrich only explicitly listed offers. Adding an unrelated catalog item must not silently
 * change a recognition study. All displayed quantities are deterministic prototype values.
 */
const sampleOffers = new Map<string, PurchaseOption>(items
  .filter(item => Object.hasOwn(offerDetails, item.id))
  .map(item => {
    const details = offerDetails[item.id];
    const isBag = item.category === 'Bags';
    const isIllustration = item.image.endsWith('.svg');
    const isPaddington = item.id.startsWith('chloe-paddington-');
    // Garment-size labels and numeric jean sizes are deliberately kept distinct.
    const sizes = details.sizes ?? (isBag ? ['One size'] : /^\d+$/.test(item.size) ? [item.size] : ['S', 'M', 'L']);
    const offer: PurchaseOption = {
      id: item.id,
      title: item.title,
      brand: details.brand ?? (isPaddington ? 'Chloé · sample offer' : 'Unbranded · sample offer'),
      price: item.price,
      image: item.image,
      category: item.category,
      color: details.color,
      description: item.description,
      material: details.material,
      condition: details.condition,
      era: item.era,
      sourceLabel: details.sourceLabel ?? (isIllustration ? 'Illustrated sample offer' : 'Sample offer · reference photo'),
      variants: sizes.map((size, index) => ({
        sku: `LS-${item.id.toUpperCase()}-${isBag ? 'OS' : size}`,
        size,
        stock: index === 0 && sizes.length > 1 ? 0 : details.stock,
      })),
      // Do not present one repeated reference as several photographic angles.
      gallery: [{
        src: item.image,
        label: isIllustration ? 'Original silhouette illustration · sample only' : 'Reference photograph · not the condition of listed stock',
      }],
      commerce: details.commerce,
    };
    return [item.id, offer] as const;
  }));

/** Resolve a deliberate, ordered edit and fail early if a new offer is missing its catalog ID. */
export function offersFor(ids: readonly string[]): PurchaseOption[] {
  return ids.map(id => {
    const offer = sampleOffers.get(id);
    if (!offer) throw new Error(`FirstSight sample offer is not registered: ${id}`);
    return offer;
  });
}
