/**
 * Sample commerce enrichment. Stable catalog IDs keep every FirstSight save compatible
 * with the wardrobe; no record here represents a seller, live stock, or a real offer.
 */
import { items } from '../../data/catalog.ts';
import type { PurchaseOption } from './types';

/** Keep editable offer assumptions beside the catalog mapping, outside presentation components. */
interface OfferDetails {
  condition: string;
  stock: number;
  material: string;
  color: string;
  affordable?: boolean;
}

const offerDetails: Record<string, OfferDetails> = {
  'chloe-paddington-archive': { condition: 'Good · sample condition', stock: 1, material: 'Suede calfskin · pictured reissue reference', color: 'Vintage brown' },
  'chloe-paddington-complete': { condition: 'Excellent · sample complete set', stock: 2, material: 'Suede calfskin · pictured reissue reference', color: 'Vintage brown' },
  'chloe-paddington-reissue': { condition: 'Excellent · sample reissue', stock: 0, material: 'Suede calfskin · pictured reissue reference', color: 'Vintage brown' },
  'soft-satchel-alternative': { condition: 'New · fictional design', stock: 3, material: 'Soft textile · fictional specification', color: 'Warm brown', affordable: true },
  'bomber-archive': { condition: 'Good · sample patina', stock: 2, material: 'Leather shell, knit trim · study specification', color: 'Espresso brown' },
  'bomber-alternative': { condition: 'New · fictional design', stock: 3, material: 'Coated textile, knit trim · study specification', color: 'Espresso brown', affordable: true },
  'minimalist-leather': { condition: 'Very good · sample condition', stock: 1, material: 'Leather · fictional specification', color: 'Black' },
  'weekend-layer': { condition: 'Good · sample condition', stock: 2, material: 'Leather · fictional specification', color: 'Black' },
  'denim-jacket-archive': { condition: 'Good · sample fading', stock: 2, material: 'Cotton denim · study specification', color: 'Faded indigo' },
  'denim-jacket-alternative': { condition: 'New · fictional design', stock: 3, material: 'Cotton denim · study specification', color: 'Mid indigo', affordable: true },
  'archive-denim': { condition: 'Very good · sample condition', stock: 1, material: 'Cotton denim · fictional specification', color: 'Indigo' },
  'record-shop-denim': { condition: 'Good · sample fading', stock: 2, material: 'Cotton denim · fictional specification', color: 'Indigo' },
  'blazer-archive': { condition: 'Very good · sample condition', stock: 2, material: 'Wool blend · study specification', color: 'Warm taupe' },
  'blazer-alternative': { condition: 'New · fictional design', stock: 3, material: 'Viscose blend · study specification', color: 'Warm taupe', affordable: true },
  'city-coat': { condition: 'Very good · sample condition', stock: 1, material: 'Wool blend · fictional specification', color: 'Charcoal' },
  'gallery-coat': { condition: 'Good · sample condition', stock: 2, material: 'Wool blend · fictional specification', color: 'Charcoal' },
  'workwear-archive': { condition: 'Good · sample wear', stock: 2, material: 'Cotton canvas · study specification', color: 'Faded olive' },
  'workwear-alternative': { condition: 'New · fictional design', stock: 3, material: 'Cotton twill · study specification', color: 'Faded olive', affordable: true },
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
    const sizes = isBag ? ['One size'] : /^\d+$/.test(item.size) ? [item.size] : ['S', 'M', 'L'];
    const offer: PurchaseOption = {
      id: item.id,
      title: item.title,
      brand: isPaddington ? 'Chloé · sample offer' : 'Unbranded · sample offer',
      price: item.price,
      image: item.image,
      category: item.category,
      color: details.color,
      description: item.description,
      material: details.material,
      condition: details.condition,
      era: item.era,
      sourceLabel: isIllustration ? 'Illustrated sample offer' : 'Sample offer · reference photo',
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
      affordable: Boolean(details.affordable),
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

/** The bag edit remains available to older consumers while recognition owns per-study edits. */
export const purchaseOptions = offersFor([
  'chloe-paddington-archive', 'chloe-paddington-complete', 'chloe-paddington-reissue', 'soft-satchel-alternative',
]);
