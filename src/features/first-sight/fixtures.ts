/**
 * Commerce fixtures for the Paddington walkthrough. Shared catalog IDs keep saves
 * compatible with the wardrobe; sample SKU details remain behind the gateway.
 */
import { items } from '../../data/catalog';
import type { PurchaseOption } from './types';

/** Per-offer enrichment is explicit so unrelated catalog additions cannot change this result. */
const offerDetails: Record<string, { condition: string; stock: number; affordable?: boolean }> = {
  'chloe-paddington-archive': { condition: 'Good · illustrative wear', stock: 1 },
  'chloe-paddington-complete': { condition: 'Excellent · illustrative complete set', stock: 2 },
  'chloe-paddington-reissue': { condition: 'Excellent · illustrative reissue', stock: 0 },
  'soft-satchel-alternative': { condition: 'New · fictional silhouette', stock: 3, affordable: true },
};

/** Return bag-specific cards without inventing photographic angles or live stock. */
export const purchaseOptions: PurchaseOption[] = items
  .filter(item => Object.hasOwn(offerDetails, item.id))
  .map(item => {
    const details = offerDetails[item.id];
    const affordable = Boolean(details.affordable);
    return {
      id: item.id, title: item.title,
      brand: affordable ? 'Unbranded concept' : 'Chloé · sample offer',
      price: item.price, image: item.image, category: item.category,
      color: 'Warm brown · illustrative',
      description: item.description,
      material: affordable ? 'Soft textile · fictional specification' : 'Suede with leather trim · reference photograph',
      condition: details.condition,
      // Bags use a single size; stock varies to exercise available and unavailable states.
      variants: [{ sku: `LS-${item.id.toUpperCase()}-OS`, size: 'One size', stock: details.stock }],
      gallery: [{ src: item.image, label: affordable ? 'Silhouette illustration · fictional design' : 'Supplied reference · shared across sample offers' }],
      affordable,
    };
  });
