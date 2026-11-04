/**
 * FirstSight's continuous editorial → recognition → shopping journey.
 * Sections stay mounted while photo/selection state changes. The page owns
 * request cancellation, object URLs, wardrobe callbacks, and the local cart.
 */
import { useEffect, useRef, useState } from 'react';
import type { CollectionProps } from '../types';
import type { CartLine, DiscoveryResult, PhotoInput, PurchaseOption, PurchaseVariant } from '../features/first-sight/types';
import type { FirstSightGateway } from '../features/first-sight/services/contracts';
import { prototypeGateway } from '../features/first-sight/services/prototype';
import { chloePhoto } from '../features/first-sight/chloe';
import { TrendHero } from '../features/first-sight/components/TrendHero';
import { PhotoUploadPanel } from '../features/first-sight/components/PhotoUploadPanel';
import { RecognitionResults } from '../features/first-sight/components/RecognitionResults';
import { FashionDossier } from '../features/first-sight/components/FashionDossier';
import { OutfitMasonry } from '../features/first-sight/components/OutfitMasonry';
import { PurchaseGrid } from '../features/first-sight/components/PurchaseGrid';
import { ProductDetailPanel } from '../features/first-sight/components/ProductDetailPanel';
import { CartPreview } from '../features/first-sight/components/CartPreview';
import './first-sight.css';
import './first-sight-flow.css';

/** A future server adapter can replace the local gateway without changing the presentation. */
type Props = CollectionProps & { gateway?: FirstSightGateway };

/** Honor reduced motion for explicit section links and product-detail navigation. */
function scrollToSection(element: HTMLElement | null) {
  element?.scrollIntoView({
    block: 'start',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  element?.focus({ preventScroll: true });
}

/** Keep the user's photograph, selected study, shopping edit, and saved state coordinated. */
export default function FirstSightPage({ savedIds, onToggleSave, gateway = prototypeGateway }: Props) {
  const [photo, setPhoto] = useState<PhotoInput | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<PurchaseOption | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [savedLookIds, setSavedLookIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const controller = useRef<AbortController | null>(null);
  const recognitionRef = useRef<HTMLElement>(null);
  const matchesRef = useRef<HTMLElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const selected = result?.items.find(item => item.id === selectedId) ?? result?.items[0];

  // The page owns accepted URLs; the upload workspace owns only unfinished image decodes.
  useEffect(() => () => { if (photo?.kind === 'upload') URL.revokeObjectURL(photo.url); }, [photo]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  /** Replace/remove invalidates recognition immediately while preserving the visit's cart. */
  function changePhoto(nextPhoto: PhotoInput | null) {
    controller.current?.abort();
    setPhoto(nextPhoto); setResult(null); setSelectedId(''); setProduct(null);
    setLoading(false); setError(''); setNotice('');
  }

  /** Explicit Analyze action; choosing a file alone never starts the sample recognition. */
  async function analyze() {
    if (!photo || loading) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true); setError(''); setResult(null); setProduct(null);
    setSelectedId('');
    try {
      const response = await gateway.discover(photo, request.signal);
      if (request.signal.aborted || controller.current !== request) return;
      setResult(response); setSelectedId(response.items[0]?.id ?? '');
      if (!response.items.length) setError('No studies were returned. Try the sample photograph or analyze again.');
    } catch {
      if (!request.signal.aborted) setError('The sample analysis could not be prepared. Your photograph is still here; please try again.');
    } finally {
      if (!request.signal.aborted && controller.current === request) setLoading(false);
    }
  }

  /** Cancellation keeps the selected image available for another attempt. */
  function cancelAnalysis() {
    controller.current?.abort();
    setLoading(false); setError('');
  }

  /** Switching a study updates both sections together without scrolling or replacing the photo. */
  function selectRecognition(id: string) {
    setSelectedId(id);
    setProduct(null);
  }

  /** Product details open within Section 3; every earlier section remains in the document. */
  function openProduct(nextProduct: PurchaseOption) {
    setProduct(nextProduct);
    requestAnimationFrame(() => scrollToSection(productRef.current));
  }

  /** Close only the inline PDP and return to the retained shopping grid. */
  function closeProduct() {
    setProduct(null);
    requestAnimationFrame(() => scrollToSection(matchesRef.current));
  }

  /** Clamp cart quantities to the chosen sample SKU's stock, including rapid repeated clicks. */
  function addToCart(nextProduct: PurchaseOption, variant: PurchaseVariant, buyNow = false) {
    if (!variant.stock) return;
    const existing = cart.find(line => line.sku === variant.sku);
    if (existing && existing.quantity >= variant.stock) {
      setNotice('Your bag already contains the available sample stock for this option.');
      if (buyNow) setCartOpen(true);
      return;
    }
    setCart(current => {
      const line = current.find(item => item.sku === variant.sku);
      return line
        ? current.map(item => item.sku === variant.sku ? { ...item, quantity: Math.min(item.quantity + 1, variant.stock) } : item)
        : [...current, { product: nextProduct, sku: variant.sku, size: variant.size, quantity: 1 }];
    });
    setNotice(nextProduct.title + ' added to your sample bag.');
    if (buyNow) setCartOpen(true);
  }

  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const lookSaveProps = {
    savedLookIds,
    onToggleSaveLook: (id: string) => setSavedLookIds(current => current.includes(id)
      ? current.filter(value => value !== id) : [...current, id]),
  };

  return <div className="first-sight fs-continuous">
    <div className="fs-page-top">
      <div><span className="fs-section-kicker">THE FASHION ENCYCLOPEDIA / VOL. 01</span><h1>First sight<span>.</span></h1></div>
      <div className="fs-page-intro"><p>A photograph. A piece of history.<br />A story waiting to be worn.</p><span className="fs-prototype-pill"><i aria-hidden="true" /> INTERACTIVE PROTOTYPE</span></div>
    </div>
    <div className="fs-journey-bar">
      <nav aria-label="FirstSight sections">
        <a href="#fs-trends">01 <span>Find inspiration</span></a>
        <a href="#fs-recognition">02 <span>Discover the story</span></a>
        <a href="#fs-similar-pieces">03 <span>Find your piece</span></a>
      </nav>
      <button className="fs-bag-button" onClick={() => setCartOpen(true)}>Your bag <span>{count}</span></button>
    </div>

    <TrendHero {...lookSaveProps} />

    {/* The grid itself defines the sticky boundary: the upload column ends with Section 2. */}
    <section id="fs-recognition" className="fs-recognition-section" ref={recognitionRef} tabIndex={-1} aria-labelledby="fs-recognition-title">
      <div className="fs-chapter-label"><span>02 / A CLOSER LOOK</span><span>FROM INSPIRATION TO UNDERSTANDING</span></div>
      <div className="fs-recognition-layout">
        <PhotoUploadPanel photo={photo} busy={loading} hasResults={Boolean(selected)}
          onPhotoChange={changePhoto} onAnalyze={() => void analyze()} onCancel={cancelAnalysis} />
        <div className="fs-recognition-content">
          <div className="fs-recognition-heading">
            <span className="fs-section-kicker">THE STORY IS IN THE DETAILS</span>
            <h2 id="fs-recognition-title">Discover the Story<span>.</span></h2>
            <p>Every piece has a history. Uncover the design, culture, and craftsmanship behind your inspiration.</p>
          </div>
          <p className="fs-sr-only" role="status">{loading ? 'Preparing five demonstration studies.' : selected ? 'Five sample studies ready. Choose a piece to explore its story.' : ''}</p>
          {error && <p className="fs-error" role="alert">{error}</p>}
          {loading ? <div className="fs-recognition-loading" aria-hidden="true">
            <span className="fs-section-kicker">LOOKING CLOSER</span><h3>A story taking shape.</h3>
            <p>Gathering five sample studies, their design details, and a few possibilities for your wardrobe.</p>
            <div className="fs-result-skeletons">{[0, 1, 2, 3, 4].map(index => <span key={index} />)}</div>
            <div className="fs-dossier-skeleton" />
          </div> : selected && result ? <>
            <RecognitionResults items={result.items} selectedId={selected.id} onSelect={selectRecognition} />
            <FashionDossier key={selected.id} item={selected} onExplore={() => scrollToSection(matchesRef.current)} />
          </> : <div className="fs-recognition-empty">
            <div className="fs-empty-copy"><span className="fs-section-kicker">AN OPEN INVITATION</span><h3>Start with a detail.<br /><em>Stay for the story.</em></h3><p>Choose a photograph, then select Analyze to explore five prepared fashion studies.</p><button className="fs-text-button" onClick={() => changePhoto(chloePhoto)}>Use the Chloé example ↗</button></div>
            <figure><img src={chloePhoto.url} alt="Chloé Paddington Bag, a preview of the example study" /><figcaption>THE PADDINGTON / A STORY TO DISCOVER</figcaption></figure>
          </div>}
        </div>
      </div>
    </section>

    {/* This section is always present. Its edit follows the selected study, not a separate route. */}
    <section id="fs-similar-pieces" className="fs-similar-section" ref={matchesRef} tabIndex={-1} aria-labelledby="fs-similar-title">
      <div className="fs-chapter-label"><span>03 / THE NEXT CHAPTER</span><span>CURATED POSSIBILITIES</span></div>
      <div className="fs-similar-heading"><div><span className="fs-section-kicker">FROM THE ARCHIVE TO YOUR WARDROBE</span><h2 id="fs-similar-title">Find Similar Pieces<span>.</span></h2><p>Continue the story. Discover pieces with a similar design heritage.</p></div>{selected && <span className="fs-selected-edit">THE CURRENT EDIT<strong>{selected.name}</strong></span>}</div>

      {selected ? <>
        <div className="fs-shop-toolbar"><span>ILLUSTRATIVE PRICES & INVENTORY</span></div>
        <div className={'fs-discovery' + (!selected.looks.length ? ' fs-discovery-focused' : '')}>
          <div className="fs-purchase-section">
            <PurchaseGrid products={selected.products} savedIds={savedIds} onToggleSave={onToggleSave} onSelect={openProduct} />
          </div>
          {/* Styling stays beside the edit for as long as this study is selected. */}
          {selected.looks.length > 0 && <aside className="fs-context-section" aria-label="Contextual outfit feed">
            <OutfitMasonry key={selected.id} looks={selected.looks} {...lookSaveProps} contextual
              contextName={selected.name} loadingEnabled={!product && !cartOpen} />
          </aside>}
        </div>
        <details className="fs-shopping-explainer"><summary>How this sample edit works</summary><p>These are fictional offers, paired with styling references for the selected study. The outfits remain alongside your finds while you browse. Your photograph and dossier remain above.</p></details>

        {product && <div className="fs-inline-product" ref={productRef} tabIndex={-1}>
          <ProductDetailPanel product={product} alternatives={selected.products} looks={selected.looks}
            saved={savedIds.includes(product.id)} onToggleSave={onToggleSave} onBack={closeProduct}
            onSelectProduct={openProduct} onAddToCart={(item, variant) => addToCart(item, variant)}
            onBuyNow={(item, variant) => addToCart(item, variant, true)} />
        </div>}
      </> : <div className="fs-products-empty"><span aria-hidden="true">↗</span><div><h3>Your next chapter starts with a story.</h3><p>Analyze a photograph above. Choose a study and its related edit will appear here.</p></div><button className="fs-text-button" onClick={() => scrollToSection(recognitionRef.current)}>Find a story ↑</button></div>}
    </section>

    <CartPreview open={cartOpen} lines={cart} onClose={() => setCartOpen(false)} onChange={setCart} />
    <div className="fs-toast" role="status" aria-live="polite" data-visible={Boolean(notice)}>{notice}</div>
  </div>;
}
