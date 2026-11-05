/**
 * The opt-in Inspire view. The host owns visibility, saves and partner previews;
 * this component owns visit-local size choices and the native modal lifecycle.
 * FirstSight mounts it once per visit. It never writes to the archive bag or storage.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { isStyleMatchOffer, listingKindLabel } from '../commerce';
import type { PurchaseOption, PurchaseVariant } from '../types';
import './style-match-drawer.css';

/** Keep the drawer mounted between openings to retain its per-product size choices. */
export interface StyleMatchDrawerProps {
  open: boolean;
  itemName: string;
  products: PurchaseOption[];
  savedIds: string[];
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onPreviewPartner: (product: PurchaseOption, variant: PurchaseVariant) => void;
  /** Let the host choose a destination if a transition removes or hides the original trigger. */
  onRestoreFocus?: () => void;
}

const priceFormat = new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
});

/** Reconcile a controlled prop with a native dialog without notifying the host twice. */
export function StyleMatchDrawer({
  open, itemName, products, savedIds, onClose, onToggleSave, onPreviewPartner, onRestoreFocus,
}: StyleMatchDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dismissalRequested = useRef(false);
  const backdropPointer = useRef<number | null>(null);
  const restoreFocus = useRef(onRestoreFocus);
  const titleId = useId();
  const descriptionId = useId();
  const [selectedSkusByProductId, setSelectedSkusByProductId] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const styleMatches = products.filter(isStyleMatchOffer);

  // A host render may replace its callback; this must not restart the modal's lifecycle.
  useEffect(() => { restoreFocus.current = onRestoreFocus; }, [onRestoreFocus]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    // Native modality makes the background inert; scroll locking has a separate owner.
    // Capture each axis: a shorthand read loses independently prioritised x/y declarations.
    const previousOverflow = (['overflow-x', 'overflow-y'] as const).map(property => ({
      property,
      value: root.style.getPropertyValue(property),
      priority: root.style.getPropertyPriority(property),
    }));
    for (const { property } of previousOverflow) root.style.setProperty(property, 'hidden', 'important');
    dismissalRequested.current = false;
    backdropPointer.current = null;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      // Cleanup also runs during Strict Mode and unmount, with no host close callback.
      if (dialog.open) dialog.close();
      for (const { property, value, priority } of previousOverflow) {
        if (value) root.style.setProperty(property, value, priority);
        else root.style.removeProperty(property);
      }
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      // A closed sibling dialog can retain a connected but unfocusable opener in the DOM.
      if (!opener || document.activeElement !== opener) restoreFocus.current?.();
      backdropPointer.current = null;
    };
  }, [open]);

  useEffect(() => {
    // A new opening or study must not announce an earlier edit's partner preview.
    setStatus('');
  }, [open, itemName]);

  /** User dismissal requests a parent update; native close events are reconciliation only. */
  function requestClose() {
    if (!open || dismissalRequested.current) return;
    dismissalRequested.current = true;
    onClose();
  }

  function isBackdrop(event: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }

  /** Both ends of the gesture must be on the backdrop; dragging out of a card stays open. */
  function handleBackdropPointerDown(event: PointerEvent<HTMLDialogElement>) {
    backdropPointer.current = event.isPrimary && event.button === 0 && isBackdrop(event)
      ? event.pointerId : null;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const beganOutside = backdropPointer.current !== null;
    backdropPointer.current = null;
    if (beganOutside && isBackdrop(event)) requestClose();
  }

  function selectSku(productId: string, sku: string) {
    setSelectedSkusByProductId(previous => ({ ...previous, [productId]: sku }));
    setStatus('');
  }

  /** Resolve stock again at activation; stale selections must never reach the host. */
  function previewPartner(product: PurchaseOption) {
    const variant = product.variants.find(candidate =>
      candidate.sku === selectedSkusByProductId[product.id] && candidate.stock > 0);
    if (!isStyleMatchOffer(product) || !variant) return;
    onPreviewPartner(product, variant);
    setStatus(`Preview ready: ${product.title}, size ${variant.size}. No purchase has been made.`);
  }

  return <dialog
    ref={dialogRef}
    className="fs-style-drawer"
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); requestClose(); }}
    onPointerDown={handleBackdropPointerDown}
    onPointerCancel={() => { backdropPointer.current = null; }}
    onClick={handleBackdropClick}
  >
    <div className="fs-style-drawer-shell">
      <header className="fs-style-drawer-header">
        <div>
          <p className="fs-style-drawer-kicker">THE INSPIRE</p>
          <h2 id={titleId}>Explore similar styles</h2>
        </div>
        <button ref={closeRef} type="button" className="fs-style-drawer-close" onClick={requestClose} aria-label="Close The Inspire">×</button>
        <p className="fs-style-drawer-context">Inspired by <strong>{itemName}</strong></p>
        <p id={descriptionId}>A different way to wear the details you love. Explore modern silhouettes and save the styles that feel like you.</p>
        <p className="fs-style-match-disclosure">Sample offers. Prices and availability are illustrative.</p>
      </header>

      <p className="fs-style-drawer-status" role="status" aria-atomic="true">{status}</p>

      <div className="fs-style-drawer-grid">
        {styleMatches.map(product => <StyleMatchCard
          key={product.id}
          product={product}
          selectedSku={selectedSkusByProductId[product.id]}
          saved={savedIds.includes(product.id)}
          onSelectSku={sku => selectSku(product.id, sku)}
          onToggleSave={() => onToggleSave(product.id)}
          onPreview={() => previewPartner(product)}
        />)}
        {!styleMatches.length && <div className="fs-style-drawer-empty">
          <h3>A little space for inspiration.</h3>
          <p>There are no similar styles in this edit yet. You can keep exploring the archive.</p>
          <button type="button" onClick={requestClose}>Back to your edit <span aria-hidden="true">↗</span></button>
        </div>}
      </div>
    </div>
  </dialog>;
}

interface StyleMatchCardProps {
  product: PurchaseOption;
  selectedSku?: string;
  saved: boolean;
  onSelectSku: (sku: string) => void;
  onToggleSave: () => void;
  onPreview: () => void;
}

/** Present one style match; callbacks preserve the drawer/host ownership boundary. */
function StyleMatchCard({ product, selectedSku, saved, onSelectSku, onToggleSave, onPreview }: StyleMatchCardProps) {
  const titleId = useId();
  const sizeHelpId = useId();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const selectedVariant = product.variants.find(variant => variant.sku === selectedSku && variant.stock > 0);
  const available = product.variants.some(variant => variant.stock > 0);

  return <article className="fs-style-match-card" aria-labelledby={titleId}>
    <div className="fs-style-match-image">
      {product.image && failedImage !== product.image
        ? <img src={product.image} alt={product.title} loading="lazy" onError={() => setFailedImage(product.image)} />
        : <span>Preview image unavailable</span>}
    </div>
    <div className="fs-style-match-details">
      <p className="fs-style-match-label">{listingKindLabel(product.commerce.listingKind)}</p>
      <h3 id={titleId}>{product.title}</h3>
      <p className="fs-style-match-price">{priceFormat.format(product.price)} <span>sample price</span></p>
      <p>{product.commerce.matchReason}</p>
      <dl>
        <div><dt>Material</dt><dd>{product.material}</dd></div>
        <div><dt>Colour</dt><dd>{product.color}</dd></div>
      </dl>

      <fieldset className="fs-style-match-sizes" aria-describedby={sizeHelpId}>
        <legend>Select your size</legend>
        <div>{product.variants.map(variant => <button
          key={variant.sku}
          type="button"
          disabled={variant.stock <= 0}
          aria-pressed={selectedVariant?.sku === variant.sku}
          aria-label={`Size ${variant.size}${variant.stock <= 0 ? ', out of stock' : `, ${variant.stock} available`}`}
          onClick={() => onSelectSku(variant.sku)}
        >{variant.size}</button>)}</div>
        <p id={sizeHelpId}>{!available ? 'Currently unavailable in this sample edit.'
          : selectedVariant ? `Size ${selectedVariant.size} selected · ${selectedVariant.stock} available in the sample edit.`
            : 'Choose an available size to preview this offer.'}</p>
      </fieldset>

      <div className="fs-style-match-actions">
        <button type="button" aria-pressed={saved} onClick={onToggleSave} aria-label={`Save style: ${product.title}`}>
          <span aria-hidden="true">{saved ? '♥' : '♡'}</span> Save style
        </button>
        <button type="button" className="fs-style-match-preview" disabled={!selectedVariant} onClick={onPreview}>
          Preview partner offer <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="fs-style-match-disclosure">A local preview — no purchase or partner visit takes place. Saved styles stay for this visit.</p>
    </div>
  </article>;
}
