/**
 * FirstSight flow coordinator. Owns stage transitions, request cancellation, photo
 * lifetime, moodboard saves, and the sample bag; child components render each area.
 * Layout rules: first-sight.css. Data boundary: FirstSightGateway. See docs/code-guide.md.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CollectionProps } from '../types';
import type { CartLine, DiscoveryResult, PhotoInput, PurchaseOption, PurchaseVariant } from '../features/first-sight/types';
import type { FirstSightGateway } from '../features/first-sight/services/contracts';
import { prototypeGateway } from '../features/first-sight/services/prototype';
import { outfitLooks } from '../features/first-sight/looks';
import { chloePhoto } from '../features/first-sight/chloe';
import { useDiscoveryTimer } from '../features/first-sight/useDiscoveryTimer';
import { PhotoUploadPanel } from '../features/first-sight/components/PhotoUploadPanel';
import { OutfitMasonry } from '../features/first-sight/components/OutfitMasonry';
import { PurchaseGrid } from '../features/first-sight/components/PurchaseGrid';
import { ProductDetailPanel } from '../features/first-sight/components/ProductDetailPanel';
import { CartPreview } from '../features/first-sight/components/CartPreview';
import './first-sight.css';

/** The focused catalog is a discovery layout variant, not a separate journey stage. */
type Stage = 'inspiration' | 'identity' | 'discovery' | 'product';
/** Inject a future gateway here; shared wardrobe operations continue to come from App. */
type Props = CollectionProps & { gateway?: FirstSightGateway };

/** Coordinate inspiration → identity → discovery → product without changing routes. */
export default function FirstSightPage({ savedIds, onToggleSave, gateway = prototypeGateway }: Props) {
  // Journey and photo state reset for each scan; the bag and saved looks last for this page visit.
  const [stage, setStage] = useState<Stage>('inspiration');
  const [photo, setPhoto] = useState<PhotoInput | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionKey, setSessionKey] = useState(0);
  const [catalogFocused, setCatalogFocused] = useState(false);
  const [product, setProduct] = useState<PurchaseOption | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [savedLookIds, setSavedLookIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');
  // Separate request ownership from DOM refs used to preserve focus during layout changes.
  const controller = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const matchesRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  /** Expand shopping after timeout and keep the shorter catalog within reach of the viewport. */
  const collapseFeed = useCallback(() => {
    setCatalogFocused(true);
    setNotice('Your matches now have more room. You can bring inspiration back at any time.');
    requestAnimationFrame(() => {
      const bounds = matchesRef.current?.getBoundingClientRect();
      if (bounds && (bounds.bottom < 120 || bounds.top > window.innerHeight)) matchesRef.current?.scrollIntoView({ block: 'start' });
    });
  }, []);
  // Only the visible discovery feed participates; PDP and bag browsing pause the opportunity.
  const timer = useDiscoveryTimer({ enabled: stage === 'discovery' && !catalogFocused && !cartOpen, sessionKey, feedRef, onExpire: collapseFeed });

  // Leaving the page cancels work so a late response cannot update an unmounted flow.
  useEffect(() => () => controller.current?.abort(), []);
  // Stage changes transfer focus to the newly mounted content without moving it a second time.
  useEffect(() => {
    if (stage === 'discovery') matchesRef.current?.focus({ preventScroll: true });
  }, [stage]);
  // Accepted upload URLs are owned here; the upload component cleans only unfinished reads.
  useEffect(() => () => { if (photo?.kind === 'upload') URL.revokeObjectURL(photo.url); }, [photo]);
  // FirstSight notices have their own lifetime, separate from App's wardrobe notifications.
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  // Reveal the result in its original column. Reading or scrolling never dismisses the analysis.
  useEffect(() => {
    if (stage !== 'identity') return;
    const frame = requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: 'start' });
      panelRef.current?.querySelector<HTMLElement>('#fs-upload-title')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  /** Start a fresh photo session; only its non-aborted gateway result may reveal an identity. */
  async function discover(nextPhoto: PhotoInput) {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setPhoto(nextPhoto); setLoading(true); setError(''); setNotice(''); setStage('inspiration');
    setResult(null); setProduct(null); setCatalogFocused(false); setSessionKey(value => value + 1);
    try {
      const response = await gateway.discover(nextPhoto, request.signal);
      if (request.signal.aborted) return;
      setResult(response); setStage('identity');
    } catch {
      if (!request.signal.aborted) setError('The sample journey could not be prepared. Try the photo again.');
    } finally { if (!request.signal.aborted) setLoading(false); }
  }

  /** Return to photo selection while keeping this visit's bag and saved inspiration. */
  function changePhoto() {
    controller.current?.abort(); setLoading(false); setStage('inspiration'); setError(''); setNotice('');
    setResult(null); setPhoto(null); setProduct(null); setCatalogFocused(false);
    requestAnimationFrame(() => { headingRef.current?.scrollIntoView({ block: 'start' }); headingRef.current?.focus({ preventScroll: true }); });
  }

  /** Enter or return to discovery, then position and focus the mounted results section. */
  function showMatches() {
    setStage('discovery');
    requestAnimationFrame(() => { matchesRef.current?.scrollIntoView({ block: 'start' }); matchesRef.current?.focus({ preventScroll: true }); });
  }

  /** Open the inline PDP; its keyed content resets gallery and size choices for the new item. */
  function selectProduct(nextProduct: PurchaseOption) {
    setProduct(nextProduct); setStage('product');
    requestAnimationFrame(() => { productRef.current?.scrollIntoView({ block: 'start' }); productRef.current?.focus({ preventScroll: true }); });
  }

  /** Add one SKU within sample stock limits; Buy Now also opens the local bag preview. */
  function addToCart(nextProduct: PurchaseOption, variant: PurchaseVariant, buyNow = false) {
    if (!variant.stock) return;
    const existing = cart.find(line => line.sku === variant.sku);
    if (existing && existing.quantity >= variant.stock) {
      setNotice('Your bag already contains all available sample stock for this size.');
      if (buyNow) setCartOpen(true);
      return;
    }
    // Clamp again inside the updater so rapid actions cannot exceed the variant's stock.
    setCart(current => {
      const line = current.find(item => item.sku === variant.sku);
      return line ? current.map(item => item.sku === variant.sku ? { ...item, quantity: Math.min(item.quantity + 1, variant.stock) } : item)
        : [...current, { product: nextProduct, sku: variant.sku, size: variant.size, quantity: 1 }];
    });
    setNotice(`${nextProduct.title}, size ${variant.size}, added to your sample bag.`);
    if (buyNow) setCartOpen(true);
  }

  // Derived UI props keep header progress and moodboard hearts consistent across stage remounts.
  const step = stage === 'inspiration' ? 1 : stage === 'product' ? 3 : 2;
  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const lookSaveProps = { savedLookIds, onToggleSaveLook: (id: string) => setSavedLookIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]) };

  return <div className="first-sight">
    <div className="fs-page-top"><div><span className="fs-section-kicker">A NEW WAY TO FIND YOUR NEXT CHAPTER</span><h1 ref={headingRef} tabIndex={-1}>First sight<span>.</span></h1></div><div className="fs-page-intro"><p>You know it when you see it.<br />Find the piece. Follow its possibilities.</p><span className="fs-prototype-pill"><i aria-hidden="true" /> INTERACTIVE PROTOTYPE</span></div></div>
    <div className="fs-journey-bar"><ol aria-label="FirstSight journey"><li aria-current={step === 1 ? 'step' : undefined}><span>01</span> A first look</li><li aria-hidden="true">→</li><li aria-current={step === 2 ? 'step' : undefined}><span>02</span> The connection</li><li aria-hidden="true">→</li><li aria-current={step === 3 ? 'step' : undefined}><span>03</span> Make it yours</li></ol><button className="fs-bag-button" onClick={() => setCartOpen(true)}>Your bag <span>{count}</span></button></div>
    {/* Review shortcuts use the same handlers as the normal upload and timeout paths. */}
    <details className="fs-prototype-guide"><summary>Try the prototype <span aria-hidden="true">＋</span></summary><div><p>Choose a photo or the Chloé sample → read the item analysis → explore buying options → choose a piece → preview checkout. All identification, pricing, and shopping results are demonstrations.</p><div className="fs-guide-actions"><button type="button" disabled={loading} onClick={() => void discover(chloePhoto)}>Start sample journey ↗</button>{stage === 'discovery' && !catalogFocused && <button type="button" onClick={collapseFeed}>Preview the 45-second outcome ↗</button>}</div><p className="fs-muted">In discovery, inspiration makes room for shopping after 45 active seconds without an interaction. Hidden tabs and offscreen feeds pause the clock. Your analysis stays open until you choose to continue.</p></div></details>

    {error && <p className="fs-error" role="alert">{error}</p>}
    {/* Keep this shell mounted through upload → loading → result; only the panel contents change. */}
    {(stage === 'inspiration' || stage === 'identity') && <div className="fs-start-layout" ref={panelRef}>
      <PhotoUploadPanel photo={photo} busy={loading} result={stage === 'identity' ? result : null} onReady={nextPhoto => void discover(nextPhoto)} onExplore={showMatches} onChangePhoto={changePhoto} />
      <OutfitMasonry key={stage === 'identity' ? `analysis-${sessionKey}` : 'inspiration'} looks={stage === 'identity' && result ? result.looks : outfitLooks} {...lookSaveProps} itemContext={stage === 'identity'} />
    </div>}

    {/* Shopping is an explicit next step; the compact summary also returns to the full analysis. */}
    {result && (stage === 'discovery' || stage === 'product') && <>
      <div className="fs-photo-summary"><img src={result.analysis.image} alt={result.analysis.imageAlt} /><div><span>SAMPLE IDENTIFICATION</span><strong>{result.identity.name} <span>· {result.identity.year}</span></strong></div><button onClick={() => setStage('identity')}>View analysis ↗</button><button onClick={changePhoto}>Change photo ↗</button></div>

      {/* Discovery uses 50/50 columns; the focused modifier expands shopping and unmounts the feed. */}
      {stage === 'discovery' && <section ref={matchesRef} tabIndex={-1} className={`fs-discovery${catalogFocused ? ' fs-discovery-focused' : ''}`} aria-label="Purchase matches and outfit inspiration">
        <div className="fs-purchase-section"><div className="fs-feed-heading"><div><span className="fs-section-kicker">02 / FIND YOUR VERSION</span><h2>{catalogFocused ? 'A little more room to find it.' : 'The pieces. The possibilities.'}</h2></div><span className="fs-look-count">{result.products.length}<br /><span>sample pieces</span></span></div><p className="fs-feed-description">An imagined edit of archive finds and accessible alternatives. Sample prices, sizes, and stock.</p><div className="fs-shop-toolbar"><span>{catalogFocused ? 'Focused on your matches' : 'THE LOOMSTORY EDIT'}</span>{catalogFocused ? <button onClick={() => { timer.engage(); setCatalogFocused(false); setNotice('Outfit inspiration restored. It will stay open for this photo.'); }}>Show inspiration ↗</button> : <span>Curated for the feeling</span>}</div><PurchaseGrid products={result.products} savedIds={savedIds} onToggleSave={onToggleSave} onSelect={selectProduct} /></div>
        {!catalogFocused && <aside ref={feedRef} className="fs-context-section" aria-label="Contextual outfit feed" onClickCapture={timer.engage} onKeyDownCapture={event => { if (event.key === 'Enter' || event.key === ' ') timer.engage(); }}><OutfitMasonry looks={result.looks} {...lookSaveProps} contextual itemContext onEngage={timer.engage} /><p className="fs-feed-state">{timer.engaged ? 'This inspiration board will stay with your matches.' : 'Explore a look to keep this inspiration board open.'}</p></aside>}
      </section>}

      {/* PDP content owns local gallery/size selection; this page retains navigation and bag state. */}
      {stage === 'product' && product && <div ref={productRef} tabIndex={-1}><ProductDetailPanel product={product} alternatives={result.products.filter(option => option.category === product.category)} looks={result.looks} saved={savedIds.includes(product.id)} onToggleSave={onToggleSave} onBack={showMatches} onSelectProduct={selectProduct} onAddToCart={(item, variant) => addToCart(item, variant)} onBuyNow={(item, variant) => addToCart(item, variant, true)} /></div>}
    </>}

    {/* Keep the bag outside stage branches so it can open from the header or Buy Now. */}
    <CartPreview open={cartOpen} lines={cart} onClose={() => setCartOpen(false)} onChange={setCart} />
    <div className="fs-toast" role="status" aria-live="polite" data-visible={Boolean(notice)}>{notice}</div>
  </div>;
}
