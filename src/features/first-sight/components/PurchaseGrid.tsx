/**
 * FirstSight's archive edit. The page owns wardrobe saves and archive PDP navigation;
 * this component preserves curated order and excludes misplaced partner previews.
 */
import { isArchiveOffer, listingKindLabel } from '../commerce';
import type { PurchaseOption } from '../types';

export interface PurchaseGridProps {
  archiveProducts: PurchaseOption[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelect: (product: PurchaseOption) => void;
}

/** Listing type follows authored commerce metadata; price never decides archive membership. */
export function PurchaseGrid({ archiveProducts, savedIds, onToggleSave, onSelect }: PurchaseGridProps) {
  const archiveOffers = archiveProducts.filter(isArchiveOffer);
  if (!archiveOffers.length) return <div className="fs-archive-empty">
    <h3>No archive pieces in this edit yet.</h3>
    <p>Explore the style references or choose another study to continue your search.</p>
  </div>;

  return <div className="fs-purchase-grid">{archiveOffers.map(product => <article className="fs-purchase-card" key={product.id}>
    <div className="fs-purchase-image">
      <button type="button" className="fs-purchase-open" onClick={() => onSelect(product)} aria-label={`View purchase options for ${product.title}`}>
        <img src={product.image} alt={`${product.title}, ${product.image.endsWith('.svg') ? 'silhouette illustration' : 'illustrative product photo'}`} loading="lazy" />
      </button>
      <span className="fs-product-badge">{listingKindLabel(product.commerce.listingKind)}</span>
      <button type="button" className="fs-look-save" aria-label={`${savedIds.includes(product.id) ? 'Unsave' : 'Save'} ${product.title}`} aria-pressed={savedIds.includes(product.id)} onClick={() => onToggleSave(product.id)}>
        {savedIds.includes(product.id) ? '♥' : '♡'}
      </button>
    </div>
    <div className="fs-purchase-meta"><span>{product.brand}</span><span>€{product.price}</span></div>
    <h3><button type="button" onClick={() => onSelect(product)}>{product.title}</button></h3>
    <p className="fs-product-context"><span>{product.era}</span><span>{product.condition}</span><span>{product.sourceLabel ?? 'LoomStory · sample listing'}</span></p>
    <div className="fs-purchase-sizes">{product.variants.map(variant => <span className={variant.stock ? '' : 'is-unavailable'} key={variant.sku} title={`${variant.size}: ${variant.stock ? `${variant.stock} in sample stock` : 'unavailable'}`}>{variant.size}</span>)}</div>
    <div className="fs-purchase-bottom">
      <span>{product.variants.some(variant => variant.stock > 0) ? <><i aria-hidden="true" /> Sample stock available</> : 'Sample out of stock'}</span>
      <button type="button" onClick={() => onSelect(product)} aria-label={`View piece: ${product.title}`}>View piece <span aria-hidden="true">↗</span></button>
    </div>
  </article>)}</div>;
}
