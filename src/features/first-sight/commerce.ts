/**
 * FirstSight commerce rules, independent of fixtures and React presentation.
 * Track membership follows authored listing intent; prices are display data.
 */
import type { CommerceEdit, ContextRelationship, ListingKind, PurchaseOption, PurchaseVariant } from './types.ts';

const listingKindLabels = {
  'vintage-original': 'Vintage original',
  'designer-reissue': 'Designer reissue',
  'archive-study': 'Archive study',
  'partner-preview': 'Partner-offer preview',
} satisfies Record<ListingKind, string>;

const relationshipLabels = {
  'same-design': 'Same design',
  'runway-reference': 'Runway reference',
  'styling-inspiration': 'Styling inspiration',
} satisfies Record<ContextRelationship, string>;

/** Central wording for the archive grid, PDP and Inspire drawer. */
export function listingKindLabel(kind: ListingKind): string {
  return listingKindLabels[kind];
}

/** Present the authored relationship consistently across cultural references. */
export function contextRelationshipLabel(relationship: ContextRelationship): string {
  return relationshipLabels[relationship];
}

/** Low-priced vintage offers still belong to the archive when explicitly classified there. */
export function isArchiveOffer(product: PurchaseOption): boolean {
  return product.commerce.track === 'archive';
}

/** Modern silhouette alternatives use the opt-in track regardless of their displayed price. */
export function isStyleMatchOffer(product: PurchaseOption): boolean {
  return product.commerce.track === 'style-match';
}

/**
 * Resolve an archive bag request against the current edit, never a callback's copied stock.
 * Returning the canonical objects preserves current pricing, sizing and inventory ownership.
 */
export function resolveArchivePurchase(
  archiveProducts: readonly PurchaseOption[],
  productId: string,
  sku: string,
): { product: PurchaseOption; variant: PurchaseVariant } | null {
  const product = archiveProducts.find(candidate => candidate.id === productId && isArchiveOffer(candidate));
  const variant = product?.variants.find(candidate =>
    candidate.sku === sku && Number.isInteger(candidate.stock) && candidate.stock > 0);
  return product && variant ? { product, variant } : null;
}

/**
 * Reject misplaced offers and repeated IDs before an edit reaches presentation.
 * Copy the ordered arrays so assembling an edit never mutates the caller's lists.
 * Empty streams are valid; the five demonstration studies enforce their own content minimums.
 */
export function createCommerceEdit(
  archive: readonly PurchaseOption[],
  styleMatches: readonly PurchaseOption[],
): CommerceEdit {
  const seen = new Set<string>();
  for (const [track, products] of [['archive', archive], ['style-match', styleMatches]] as const) {
    for (const product of products) {
      if (seen.has(product.id)) {
        throw new Error(`FirstSight commerce edit repeats offer ID: ${product.id}`);
      }
      if (product.commerce.track !== track) {
        throw new Error(`FirstSight offer ${product.id} belongs to ${product.commerce.track}, not ${track}`);
      }
      seen.add(product.id);
    }
  }
  return { archive: [...archive], styleMatches: [...styleMatches] };
}
