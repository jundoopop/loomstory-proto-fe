/**
 * Purchase-option cards for FirstSight discovery and focused shopping layouts.
 * Product data, wardrobe state, and PDP navigation are supplied by FirstSightPage;
 * customize card content here and column counts in pages/first-sight.css.
 */
import type { PurchaseOption } from '../types';

/** Show available sizes at a glance; actual SKU selection happens in ProductDetailPanel. */
export function PurchaseGrid({ products, savedIds, onToggleSave, onSelect }: { products: PurchaseOption[]; savedIds: string[]; onToggleSave: (id: string) => void; onSelect: (product: PurchaseOption) => void }) {
  return <div className="fs-purchase-grid">{products.map(product => <article className="fs-purchase-card" key={product.id}>
    <div className="fs-purchase-image"><button className="fs-purchase-open" onClick={() => onSelect(product)} aria-label={`View purchase options for ${product.title}`}><img src={product.image} alt={`${product.title}, ${product.image.endsWith('.svg') ? 'silhouette illustration' : 'illustrative product photo'}`} loading="lazy" /></button><span className="fs-product-badge">{product.affordable ? 'THE ACCESSIBLE EDIT' : 'FROM THE ARCHIVE'}</span><button className="fs-look-save" aria-label={`${savedIds.includes(product.id) ? 'Unsave' : 'Save'} ${product.title}`} aria-pressed={savedIds.includes(product.id)} onClick={() => onToggleSave(product.id)}>{savedIds.includes(product.id) ? '♥' : '♡'}</button></div>
    <div className="fs-purchase-meta"><span>{product.brand}</span><span>€{product.price}</span></div><h3><button onClick={() => onSelect(product)}>{product.title}</button></h3>
    <p className="fs-product-context"><span>{product.era}</span><span>{product.condition}</span><span>{product.sourceLabel ?? 'LoomStory · sample listing'}</span></p>
    <div className="fs-purchase-sizes">{product.variants.map(variant => <span className={variant.stock ? '' : 'is-unavailable'} key={variant.sku} title={`${variant.size}: ${variant.stock ? `${variant.stock} in sample stock` : 'unavailable'}`}>{variant.size}</span>)}</div>
    <div className="fs-purchase-bottom">
      <span>{product.variants.some(variant => variant.stock > 0) ? <><i aria-hidden="true" /> Sample stock available</> : 'Sample out of stock'}</span>
      <button onClick={() => onSelect(product)} aria-label={`View piece: ${product.title}`}>View piece <span aria-hidden="true">↗</span></button>
    </div>
  </article>)}</div>;
}
