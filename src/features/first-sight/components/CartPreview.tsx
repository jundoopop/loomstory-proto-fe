/**
 * Browser-local bag and checkout-preview dialog for FirstSight.
 * FirstSightPage owns the cart lines; this component requests quantity/removal
 * updates through onChange and keeps only its preview-completion screen locally.
 */
import { useEffect, useRef, useState } from 'react';
import type { CartLine } from '../types';

/** Present the supplied bag without submitting an order or invoking a payment service. */
export function CartPreview({ open, lines, onClose, onChange }: { open: boolean; lines: CartLine[]; onClose: () => void; onChange: (lines: CartLine[]) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [finished, setFinished] = useState(false);
  // Every reopening starts at the bag; showModal supplies native focus trapping and Escape.
  useEffect(() => {
    if (open) { setFinished(false); dialog.current?.showModal(); }
    else dialog.current?.close();
  }, [open]);
  // Totals and quantity menus derive from the supplied fixtures; inventory is never reserved.
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <dialog ref={dialog} className="fs-cart-dialog" aria-labelledby="fs-cart-title" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="fs-cart-content"><button className="fs-dialog-close" aria-label="Close bag preview" onClick={onClose}>×</button><span className="fs-section-kicker">THE NEXT CHAPTER / PROTOTYPE</span><h2 id="fs-cart-title">{finished ? 'A good choice. A new story.' : 'Your edit.'}</h2>
      {finished ? <div className="fs-cart-finished"><span aria-hidden="true">✓</span><p>You’ve reached the end of the shopping preview. No order was placed and no payment was taken.</p><button className="fs-button fs-primary" onClick={onClose}>Keep exploring ↗</button></div> : <>
        <p className="fs-muted">A local bag preview. Prices and stock are illustrative.</p>
        {!lines.length ? <div className="fs-cart-empty"><p>A little room for something special.</p><button className="fs-button" onClick={onClose}>Find your piece ↗</button></div> : <>
          <div className="fs-cart-lines">{lines.map(line => <article className="fs-cart-line" key={line.sku}><img src={line.product.image} alt="" /><div><h3>{line.product.title}</h3><p>Size {line.size} · €{line.product.price}</p><small>{line.sku}</small><div className="fs-cart-controls"><label>Quantity <select aria-label={`Quantity of ${line.product.title}, size ${line.size}`} value={line.quantity} onChange={event => onChange(lines.map(current => current.sku === line.sku ? { ...current, quantity: Number(event.target.value) } : current))}>{Array.from({ length: line.product.variants.find(variant => variant.sku === line.sku)?.stock ?? 1 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label><button onClick={() => onChange(lines.filter(current => current.sku !== line.sku))} aria-label={`Remove ${line.product.title}, size ${line.size}`}>Remove</button></div></div><strong>€{line.product.price * line.quantity}</strong></article>)}</div>
          <div className="fs-cart-total"><span>Sample subtotal</span><strong>€{total}</strong></div><p className="fs-muted">Shipping, tax, and payment services are not connected.</p><button className="fs-button fs-primary fs-checkout" onClick={() => setFinished(true)}>Preview checkout <span aria-hidden="true">↗</span></button>
        </>}
      </>}
    </div>
  </dialog>;
}
