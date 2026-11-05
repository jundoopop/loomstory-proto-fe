/**
 * FirstSight's inline 70/30 product-detail view and styling sidebar.
 * Owns gallery and size selection for the current product; FirstSightPage owns
 * product navigation, wardrobe saves, cart changes, and purchase-preview actions.
 */
import { useState } from 'react';
import { contextRelationshipLabel } from '../commerce';
import type { OutfitLook, PurchaseOption, PurchaseVariant } from '../types';
import './product-detail.css';

/** Page-owned data and callbacks. No service adapter or cart storage is used here. */
export interface ProductDetailPanelProps {
  product: PurchaseOption;
  styleMatchCount: number;
  looks: OutfitLook[];
  saved: boolean;
  onToggleSave: (id: string) => void;
  onBack: () => void;
  onOpenStyleMatches: () => void;
  onAddToCart: (product: PurchaseOption, variant: PurchaseVariant) => void;
  onBuyNow: (product: PurchaseOption, variant: PurchaseVariant) => void;
}

const priceFormat = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** Key the inner view by product so switching products resets gallery and selected SKU. */
export function ProductDetailPanel(props: ProductDetailPanelProps) {
  return <ProductDetailContent key={props.product.id} {...props} />;
}

/** Render one product's gallery, available variants, specifications, and cross-sell content. */
function ProductDetailContent({
  product, styleMatchCount, looks, saved, onToggleSave, onBack,
  onOpenStyleMatches, onAddToCart, onBuyNow,
}: ProductDetailPanelProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const gallery = product.gallery.length ? product.gallery : [{ src: product.image, label: 'Front view' }];
  const activeImage = gallery[imageIndex] ?? gallery[0];
  // Resolve selection against current stock so every purchase callback receives an available SKU.
  const selectedVariant = product.variants.find(variant => variant.sku === selectedSku && variant.stock > 0);
  const availableVariants = product.variants.filter(variant => variant.stock > 0);
  // The sidebar owns cultural presentation; partner offers stay behind the page's Inspire action.
  // Pending originals remain visible as board slots; the compact sidebar uses sourced references.
  const styleLooks = looks.filter(look => look.sourceUrl).slice(0, 2);

  return <section className="fs-pdp" aria-labelledby="fs-pdp-title">
    <div className="fs-pdp-topline">
      <button type="button" className="fs-pdp-back" onClick={onBack}><span aria-hidden="true">←</span> Back to your matches</button>
      <span className="fs-pdp-step">03 / THE NEXT CHAPTER</span>
    </div>

    <div className="fs-pdp-layout">
      <div className="fs-pdp-main">
        <div className="fs-pdp-product">
          <div className="fs-pdp-gallery">
            <figure className="fs-pdp-main-image">
              <img src={activeImage.src} alt={`${product.title} — ${activeImage.label}`} />
              {!activeImage.src.endsWith('.svg') && <span className="fs-pdp-image-label">THE LOOMSTORY EDIT</span>}
              <figcaption><span>{activeImage.label}</span><span>{imageIndex + 1} / {gallery.length}</span></figcaption>
            </figure>
            {gallery.length > 1 && <div className="fs-pdp-thumbnails" aria-label="Product views">
              {gallery.map((view, index) => <button
                key={`${view.src}-${index}`}
                type="button"
                aria-label={`Show ${view.label.toLowerCase()}`}
                aria-pressed={imageIndex === index}
                onClick={() => setImageIndex(index)}
              >
                <img src={view.src} alt="" loading="lazy" />
                <span>{view.label}</span>
              </button>)}
            </div>}
            <p className="fs-pdp-photo-note">Reference photography and illustrative design studies.</p>
          </div>

          <div className="fs-pdp-information">
            <div className="fs-pdp-brand">{product.brand} <span>· {product.category}</span></div>
            <h2 id="fs-pdp-title">{product.title}</h2>
            <div className="fs-pdp-price-line">
              <p className="fs-pdp-price">{priceFormat.format(product.price)}</p>
              <span className="fs-pdp-stock-status">{availableVariants.length ? 'Available in the sample edit' : 'Currently unavailable'}</span>
            </div>
            <p className="fs-pdp-description">{product.description}</p>

            <div className="fs-pdp-color"><span>Colour</span><strong>{product.color}</strong></div>

            <fieldset className="fs-pdp-size-picker" aria-describedby="fs-pdp-size-help">
              <legend>Select your size</legend>
              <div className="fs-pdp-sizes">
                {product.variants.map(variant => <button
                  key={variant.sku}
                  type="button"
                  disabled={variant.stock <= 0}
                  aria-pressed={selectedSku === variant.sku}
                  aria-label={`Size ${variant.size}${variant.stock <= 0 ? ', out of stock' : `, ${variant.stock} available`}`}
                  onClick={() => setSelectedSku(variant.sku)}
                >{variant.size}{variant.stock <= 0 && <span className="fs-pdp-sold-mark" aria-hidden="true" />}</button>)}
              </div>
              <p className="fs-pdp-size-help" id="fs-pdp-size-help" aria-live="polite">
                {selectedVariant
                  ? `${selectedVariant.stock} in sample stock · SKU ${selectedVariant.sku}`
                  : availableVariants.length ? 'Choose an available size to continue.' : 'Every size in this sample is out of stock.'}
              </p>
            </fieldset>

            {/* The page enforces bag stock limits and opens the checkout preview. */}
            <div className="fs-pdp-purchase-actions">
              <button type="button" className="fs-pdp-cart" disabled={!selectedVariant} onClick={() => selectedVariant && onAddToCart(product, selectedVariant)}>
                Add to bag <span aria-hidden="true">＋</span>
              </button>
              <button type="button" className="fs-pdp-buy" disabled={!selectedVariant} onClick={() => selectedVariant && onBuyNow(product, selectedVariant)}>
                Buy now <span aria-hidden="true">↗</span>
              </button>
              <button type="button" className="fs-pdp-save" aria-pressed={saved} onClick={() => onToggleSave(product.id)}>
                <span aria-hidden="true">{saved ? '♥' : '♡'}</span> {saved ? 'Saved in your wardrobe' : 'Save to your wardrobe'}
              </button>
            </div>
            <p className="fs-pdp-prototype-note">Frontend preview · Sample prices and inventory. No payment is taken.</p>

            <div className="fs-pdp-specifications">
              <h3>The finer details.</h3>
              <dl>
                <div><dt>Material</dt><dd>{product.material}</dd></div>
                <div><dt>Condition</dt><dd>{product.condition}</dd></div>
                <div><dt>Category</dt><dd>{product.category}</dd></div>
                <div><dt>Colour</dt><dd>{product.color}</dd></div>
              </dl>
            </div>
          </div>
        </div>

        <div className="fs-pdp-editor-note">
          <span className="fs-pdp-editor-index" aria-hidden="true">↗</span>
          <div><span className="fs-pdp-small-label">MAKE IT YOUR OWN</span><h3>A familiar shape.<br /><em>A different story.</em></h3></div>
          <p>Start with the silhouette. Borrow a styling idea, add a piece you already love, and make the look yours.</p>
        </div>
      </div>

      {/* Cultural notes remain in the archive PDP; modern styles require an explicit opt-in. */}
      <aside className="fs-pdp-sidebar" aria-labelledby="fs-pdp-inspiration-title" tabIndex={0}>
        <div className="fs-pdp-sidebar-heading"><span className="fs-pdp-small-label">THE STYLE NOTES</span><h3 id="fs-pdp-inspiration-title">Wear it your way.</h3><p>People, proportions and a little inspiration.</p></div>
        {styleMatchCount > 0 && <div className="fs-pdp-inspire-prompt">
          <span className="fs-pdp-small-label">THE INSPIRE</span>
          <h4>Another way to wear it.</h4>
          <p>Explore modern styles inspired by this study's silhouette and details.</p>
          <button type="button" className="fs-style-match-trigger" aria-haspopup="dialog" onClick={event => {
            // Preserve the real return destination even when pointer clicks do not focus buttons.
            event.currentTarget.focus({ preventScroll: true }); onOpenStyleMatches();
          }}>
            <span>Explore similar styles</span><span className="fs-style-match-count">{styleMatchCount}</span>
          </button>
        </div>}
        <div className="fs-pdp-style-list">{styleLooks.map(look => <StyleNote key={look.id} look={look} />)}</div>
        {!styleLooks.length && <p className="fs-pdp-sidebar-empty">More styling notes are on their way. Explore your matches for another silhouette.</p>}
        <p className="fs-pdp-sidebar-disclosure">References connect this study with a design family, a runway moment or a styling idea. They do not authenticate this individual piece or imply an endorsement.</p>
      </aside>
    </div>
  </section>;
}

/** Keep the authored relationship and attribution alongside each source-linked reference. */
function StyleNote({ look }: { look: OutfitLook }) {
  const Source = look.sourceUrl ? 'a' : 'div';
  return <article className="fs-pdp-style-note">
    <div className="fs-pdp-note-label"><span>{contextRelationshipLabel(look.relationship)}</span><span>STYLE REFERENCE</span></div>
    <Source href={look.sourceUrl} target={look.sourceUrl ? '_blank' : undefined} rel={look.sourceUrl ? 'noreferrer' : undefined} className="fs-pdp-look-link" aria-label={look.sourceUrl ? `${look.celebrity}: ${look.title}. View source in a new tab.` : undefined}>
      <img src={look.image} width={look.width} height={look.height} alt={`${look.celebrity} — ${look.title}`} loading="lazy" />
      <h4>{look.celebrity}</h4><p>{look.title}</p><span className="fs-pdp-source">{look.sourceLabel} {look.sourceUrl && <span aria-hidden="true">↗</span>}</span>
    </Source>
    <p className="fs-pdp-look-description">{look.description}</p>
    <details className="fs-pdp-image-credit"><summary>Photo credit</summary><p>{look.credit}{look.license && look.licenseUrl && <> · <a href={look.licenseUrl} target="_blank" rel="noreferrer">{look.license} ↗</a></>}</p></details>
  </article>;
}

export default ProductDetailPanel;
