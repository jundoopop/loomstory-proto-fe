/**
 * FirstSight's archive edit. The page owns wardrobe saves and archive PDP navigation;
 * this component preserves curated order and excludes misplaced partner previews.
 */
import { isArchiveOffer } from '../commerce';
import type { PurchaseOption } from '../types';

export interface PurchaseGridProps {
  archiveProducts: PurchaseOption[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelect: (product: PurchaseOption) => void;
  featuredProductIds?: readonly string[];
}

const priceFormat = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** Keep the authored grade; longer wear descriptions remain in the product details. */
function conditionLabel(condition: string): string {
  return condition.split(' · ')[0];
}

/** The section already discloses sample listings; canonical brand data stays untouched. */
function brandLabel(brand: string): string {
  return brand.replace(/ · sample offer$/, '');
}

/** Remove only known prototype suffixes, retaining complete-set and reissue distinctions. */
function productName(title: string): string {
  return title
    .replace(/ · archive (?:example|study)$/, '')
    .replace(/ · complete-set example$/, ' · complete set')
    .replace(/ · reissue example$/, ' · reissue');
}

/** Listing type follows authored commerce metadata; price never decides archive membership. */
export function PurchaseGrid({ archiveProducts, savedIds, onToggleSave, onSelect, featuredProductIds = [] }: PurchaseGridProps) {
  const archiveOffers = archiveProducts.filter(isArchiveOffer);
  if (!archiveOffers.length) return <div className="fs-archive-empty">
    <h3>No archive pieces in this edit yet.</h3>
    <p>Explore the style references or choose another study to continue your search.</p>
  </div>;

  return <div className="fs-purchase-grid">{archiveOffers.map(product => {
    // One exhausted size does not make a piece unavailable when another SKU can still be bought.
    const unavailable = !product.variants.some(variant => variant.stock > 0);
    const stockStatusId = unavailable ? `fs-product-stock-${product.id}` : undefined;

    const featured = featuredProductIds.includes(product.id);
    return <article data-product-id={product.id} className={`fs-purchase-card${unavailable ? ' is-out-of-stock' : ''}${featured ? ' is-featured' : ''}`} key={product.id}>
      <div className="fs-purchase-image">
        <button type="button" className="fs-purchase-open" onClick={() => onSelect(product)}
          aria-label={`View purchase options for ${product.title}`} aria-describedby={stockStatusId}>
          <img src={product.image} alt={`${product.title}, ${product.image.endsWith('.svg') ? 'silhouette illustration' : 'illustrative product photo'}`} loading="lazy" />
        </button>
        {unavailable && <span className="fs-product-stock" id={stockStatusId}>Out of stock</span>}
        {featured && <span className="fs-product-featured">Featured piece</span>}
        {/* Unavailable pieces still belong in the archive and can be saved for inspiration. */}
        <button type="button" className="fs-look-save" aria-label={`${savedIds.includes(product.id) ? 'Unsave' : 'Save'} ${product.title}`}
          aria-pressed={savedIds.includes(product.id)} aria-describedby={stockStatusId} onClick={() => onToggleSave(product.id)}>
          {savedIds.includes(product.id) ? '♥' : '♡'}
        </button>
      </div>
      <div className="fs-purchase-details">
        <p className="fs-product-condition">{conditionLabel(product.condition)}</p>
        <p className="fs-product-brand">{brandLabel(product.brand)}</p>
        <h3 className="fs-product-name"><button type="button" aria-describedby={stockStatusId} onClick={() => onSelect(product)}>{productName(product.title)}</button></h3>
        <p className="fs-product-price">{priceFormat.format(product.price)}</p>
      </div>
    </article>;
  })}</div>;
}
