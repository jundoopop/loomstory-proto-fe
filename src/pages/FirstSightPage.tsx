/**
 * FirstSight's continuous photo → recognition → shopping journey.
 * Sections stay mounted while photo/selection state changes. The page owns
 * request cancellation, object URLs, archive wardrobe/bag actions and visit-local style saves.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CollectionProps } from '../types';
import type { CartLine, DiscoveryResult, PhotoInput, PurchaseOption, PurchaseVariant, SavedLookProps } from '../features/first-sight/types';
import type { FirstSightGateway } from '../features/first-sight/services/contracts';
import { prototypeGateway } from '../features/first-sight/services/prototype';
import { outfitExamples } from '../features/first-sight/data/outfitExamples';
import { createOutfitCommerceEdit, isArchiveOffer, isStyleMatchOffer, resolveArchivePurchase } from '../features/first-sight/commerce';
import { PhotoUploadPanel } from '../features/first-sight/components/PhotoUploadPanel';
import { RecognitionResults } from '../features/first-sight/components/RecognitionResults';
import { FashionDossier } from '../features/first-sight/components/FashionDossier';
import { OutfitMasonry } from '../features/first-sight/components/OutfitMasonry';
import { PurchaseGrid } from '../features/first-sight/components/PurchaseGrid';
import { ProductDetailPanel } from '../features/first-sight/components/ProductDetailPanel';
import { CartPreview } from '../features/first-sight/components/CartPreview';
import { StyleMatchDrawer } from '../features/first-sight/components/StyleMatchDrawer';
import './first-sight.css';
import './first-sight-flow.css';

/** A future server adapter can replace the local gateway without changing the presentation. */
type Props = CollectionProps & SavedLookProps & {
  gateway?: FirstSightGateway;
  initialPhoto?: PhotoInput;
  referenceUnavailable?: boolean;
};

/** Honor reduced motion for explicit section links and product-detail navigation. */
function scrollToSection(element: HTMLElement | null) {
  element?.scrollIntoView({
    block: 'start',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  element?.focus({ preventScroll: true });
}

/** Keep the user's photograph, selected study, shopping edit, and saved state coordinated. */
export default function FirstSightPage({ savedIds, onToggleSave, savedLookIds, onToggleSaveLook,
  gateway = prototypeGateway, initialPhoto, referenceUnavailable = false }: Props) {
  // App keys reference entries; do not resynchronise this prop and undo a removal/replacement.
  const [photo, setPhoto] = useState<PhotoInput | null>(() => initialPhoto ?? null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productId, setProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [styleMatchOpen, setStyleMatchOpen] = useState(false);
  const [savedStyleMatchIds, setSavedStyleMatchIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const controller = useRef<AbortController | null>(null);
  const recognitionRef = useRef<HTMLElement>(null);
  const matchesRef = useRef<HTMLElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const styleMatchFocusTarget = useRef<'recognition' | 'matches' | 'product'>('matches');
  const selected = result?.items.find(item => item.id === selectedId) ?? result?.items[0];
  // Explicit tracks choose the consumer surface. Price never decides archive membership.
  const outfitEdit = result?.outfit ? createOutfitCommerceEdit(result.items) : null;
  const archiveProducts = outfitEdit?.archive ?? selected?.commerce.archive.filter(isArchiveOffer) ?? [];
  // Derive the open PDP from the current edit, so a replaced result cannot retain stale stock.
  const product = archiveProducts.find(candidate => candidate.id === productId) ?? null;
  const productOwner = product && outfitEdit ? outfitEdit.ownerByProductId.get(product.id) : selected;
  const styleOwner = productOwner ?? selected;
  const styleMatchProducts = styleOwner?.commerce.styleMatches.filter(isStyleMatchOffer) ?? [];
  const inspireOpen = styleMatchOpen && Boolean(selected) && styleMatchProducts.length > 0;
  const featuredProductIds = result?.outfit
    ? result.items.find(item => item.id === result.outfit?.primaryItemId)?.commerce.archive.map(offer => offer.id) ?? [] : [];

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
    closeStyleMatches('recognition');
    controller.current?.abort();
    setPhoto(nextPhoto); setResult(null); setSelectedId(''); setProductId(null);
    setLoading(false); setError(''); setNotice('');
  }

  /** Explicit analysis; choosing a file or celebrity example never starts it automatically. */
  async function analyze() {
    if (!photo || loading) return;
    closeStyleMatches('recognition');
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true); setError(''); setResult(null); setProductId(null);
    setSelectedId('');
    try {
      const response = await gateway.discover(photo, request.signal);
      if (request.signal.aborted || controller.current !== request) return;
      if (response.outfit) {
        const ids = response.items.map(item => item.id);
        if (photo.kind !== 'sample' || photo.exampleId !== response.outfit.id
          || photo.url !== response.outfit.photo.url || !ids.includes(response.outfit.primaryItemId)
          || ids.length !== response.outfit.memberIds.length
          || ids.some((id, index) => id !== response.outfit?.memberIds[index])
          || response.items.some(item => !item.identityEvidence)) {
          throw new Error('The prepared outfit does not match this photograph.');
        }
        createOutfitCommerceEdit(response.items);
      }
      setResult(response); setSelectedId(response.outfit?.primaryItemId ?? response.items[0]?.id ?? '');
      if (!response.items.length) setError('No studies were returned. Try the sample photograph or analyse again.');
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
    closeStyleMatches('matches');
    setSelectedId(id);
    setProductId(null);
  }

  /** Product details open within shopping; analysis remains in the document. */
  function openProduct(nextProduct: PurchaseOption) {
    const archiveProduct = archiveProducts.find(candidate => candidate.id === nextProduct.id);
    if (!archiveProduct) return;
    closeStyleMatches('product');
    // Set the owner and PDP in one transition; selectRecognition intentionally closes a PDP.
    const owner = outfitEdit?.ownerByProductId.get(archiveProduct.id);
    if (owner) setSelectedId(owner.id);
    setProductId(archiveProduct.id);
    requestAnimationFrame(() => scrollToSection(productRef.current));
  }

  /** Close only the inline PDP and return to the retained shopping grid. */
  function closeProduct() {
    closeStyleMatches('matches');
    setProductId(null);
    requestAnimationFrame(() => scrollToSection(matchesRef.current));
  }

  /** Archive actions resolve the current edit; callbacks cannot supply a partner or invented stock. */
  function toggleArchiveSave(id: string) {
    if (archiveProducts.some(candidate => candidate.id === id)) onToggleSave(id);
  }

  /** Keep the two modals mutually exclusive without remounting the drawer's SKU state. */
  function openBag() {
    closeStyleMatches('matches');
    setCartOpen(true);
  }

  /** Both entry points share the selected study and preserve the drawer's existing size choices. */
  function openStyleMatches() {
    if (!styleMatchProducts.length) return;
    styleMatchFocusTarget.current = product ? 'product' : 'matches';
    setCartOpen(false);
    setNotice('');
    setStyleMatchOpen(true);
  }

  /** Record the transition's fallback before closing, in case its original trigger is removed. */
  function closeStyleMatches(target: 'recognition' | 'matches' | 'product' = 'matches') {
    styleMatchFocusTarget.current = target;
    setStyleMatchOpen(false);
  }

  /** The drawer returns to its opener normally; the host handles a removed or hidden trigger. */
  function restoreStyleMatchFocus() {
    const target = styleMatchFocusTarget.current === 'recognition' ? recognitionRef.current
      : styleMatchFocusTarget.current === 'product' ? productRef.current ?? matchesRef.current
        : matchesRef.current;
    target?.focus({ preventScroll: true });
  }

  /** Modern-style saves are page-local and never call the durable archive wardrobe callback. */
  function toggleStyleMatchSave(id: string) {
    if (!styleMatchProducts.some(candidate => candidate.id === id)) return;
    setSavedStyleMatchIds(current => current.includes(id)
      ? current.filter(candidate => candidate !== id) : [...current, id]);
  }

  /** A partner preview acknowledges a currently available style without reserving or buying it. */
  function previewPartnerOffer(nextProduct: PurchaseOption, requestedVariant: PurchaseVariant) {
    const current = styleMatchProducts.find(candidate => candidate.id === nextProduct.id);
    const variant = current?.variants.find(candidate => candidate.sku === requestedVariant.sku && candidate.stock > 0);
    if (!current || !variant) return;
    setNotice(`Partner preview: ${current.title}, size ${variant.size}. Your archive bag is unchanged.`);
  }

  /** Resolve canonical stock, then clamp quantities even when the action is activated repeatedly. */
  function addToCart(nextProduct: PurchaseOption, variant: PurchaseVariant, buyNow = false) {
    const purchase = resolveArchivePurchase(archiveProducts, nextProduct.id, variant.sku);
    if (!purchase) return;
    const { product: archiveProduct, variant: archiveVariant } = purchase;
    const existing = cart.find(line => line.sku === archiveVariant.sku);
    if (existing && existing.quantity >= archiveVariant.stock) {
      setNotice('Your bag already contains the available sample stock for this option.');
      if (buyNow) openBag();
      return;
    }
    setCart(current => {
      const line = current.find(item => item.sku === archiveVariant.sku);
      return line
        ? current.map(item => item.sku === archiveVariant.sku ? { ...item, quantity: Math.min(item.quantity + 1, archiveVariant.stock) } : item)
        : [...current, { product: archiveProduct, sku: archiveVariant.sku, size: archiveVariant.size, quantity: 1 }];
    });
    setNotice(archiveProduct.title + ' added to your sample bag.');
    if (buyNow) openBag();
  }

  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const lookSaveProps = { savedLookIds, onToggleSaveLook };

  return <div className="first-sight fs-continuous">
    <div className="fs-page-top">
      <div><span className="fs-section-kicker">THE FASHION ENCYCLOPEDIA / VOL. 01</span><h1>First sight<span>.</span></h1></div>
      <div className="fs-page-intro"><p>A photograph. A piece of history.<br />A story waiting to be worn.</p><span className="fs-prototype-pill"><i aria-hidden="true" /> INTERACTIVE PROTOTYPE</span></div>
    </div>
    <div className="fs-journey-bar">
      <nav aria-label="FirstSight sections">
        <a href="#fs-recognition">01 <span>Discover the story</span></a>
        <a href="#fs-similar-pieces">02 <span>Find your piece</span></a>
        <Link to="/" className="fs-discover-link">Find inspiration in Discover ↗</Link>
      </nav>
      <button className="fs-bag-button" onClick={openBag}>Your bag <span>{count}</span></button>
    </div>

    {/* The grid defines the sticky boundary; the upload column ends with the analysis chapter. */}
    <section id="fs-recognition" className="fs-recognition-section" ref={recognitionRef} tabIndex={-1} aria-labelledby="fs-recognition-title">
      <div className="fs-chapter-label"><span>01 / A CLOSER LOOK</span><span>FROM INSPIRATION TO UNDERSTANDING</span></div>
      {referenceUnavailable && <p className="fs-reference-unavailable" role="status">That inspiration reference is unavailable. Choose a photograph or try an example below.</p>}
      <div className="fs-recognition-layout">
        <PhotoUploadPanel photo={photo} busy={loading} hasResults={Boolean(selected)}
          onPhotoChange={changePhoto} onAnalyze={() => void analyze()} onCancel={cancelAnalysis} />
        <div className="fs-recognition-content">
          <div className="fs-recognition-heading">
            <span className="fs-section-kicker">THE STORY IS IN THE DETAILS</span>
            <h2 id="fs-recognition-title">Discover the Story<span>.</span></h2>
            <p>Every piece has a history. Uncover the design, culture, and craftsmanship behind your inspiration.</p>
          </div>
          <p className="fs-sr-only" role="status">{loading ? 'Preparing your demonstration studies.' : selected ? result?.outfit ? `${result.items.length} collection pieces ready. Choose a piece to explore its story.` : 'Five sample studies ready. Choose a piece to explore its story.' : ''}</p>
          {error && <p className="fs-error" role="alert">{error}</p>}
          {loading ? <div className="fs-recognition-loading" aria-hidden="true">
            <span className="fs-section-kicker">LOOKING CLOSER</span><h3>A story taking shape.</h3>
            <p>Gathering the prepared studies, their design details, and a few possibilities for your wardrobe.</p>
            <div className="fs-result-skeletons">{[0, 1, 2, 3, 4].map(index => <span key={index} />)}</div>
            <div className="fs-dossier-skeleton" />
          </div> : selected && result ? <>
            <RecognitionResults items={result.items} selectedId={selected.id} onSelect={selectRecognition} outfit={result.outfit} />
            <FashionDossier key={selected.id} item={selected} onExplore={() => scrollToSection(matchesRef.current)} />
          </> : <div className="fs-recognition-empty">
            <div className="fs-empty-copy"><span className="fs-section-kicker">AN OPEN INVITATION</span><h3>Start with a detail.<br /><em>Explore the whole look.</em></h3><p>Try a celebrity example to explore real collection models, from the bag to the clothes and trainers. Choose a photograph, then select Analyse.</p><button className="fs-text-button" onClick={() => changePhoto(outfitExamples[0].photo)}>Try the celebrity look ↗</button></div>
            <figure><img src={outfitExamples[0].photo.url} alt={outfitExamples[0].imageAlt} /><figcaption>ROSÉ × PUMA / ONE LOOK, SEVERAL STORIES</figcaption></figure>
          </div>}
        </div>
      </div>
    </section>

    {/* Shopping stays present; its edit follows the selected study rather than a separate route. */}
    <section id="fs-similar-pieces" className="fs-similar-section" ref={matchesRef} tabIndex={-1} aria-labelledby="fs-similar-title">
      <div className="fs-chapter-label"><span>02 / THE NEXT CHAPTER</span><span>CURATED POSSIBILITIES</span></div>
      <div className="fs-similar-heading"><div><span className="fs-section-kicker">FROM THE ARCHIVE TO YOUR WARDROBE</span><h2 id="fs-similar-title">Find Your Piece<span>.</span></h2><p>{result?.outfit ? 'Explore every documented collection piece in this prepared look.' : 'Explore vintage originals, designer reissues and archive studies with a story to tell.'}</p></div>{selected && <span className="fs-selected-edit">{result?.outfit ? 'THE WHOLE-LOOK EDIT' : 'THE CURRENT EDIT'}<strong>{result?.outfit?.title ?? selected.name}</strong></span>}</div>

      {selected ? <>
        <div className="fs-shop-toolbar">
          <div className="fs-archive-toolbar-copy"><h3>The archive edit <span>{archiveProducts.length} {archiveProducts.length === 1 ? 'piece' : 'pieces'}</span></h3><p>Sample listings · Illustrative prices and availability</p></div>
          {styleMatchProducts.length > 0 && <button type="button" className="fs-style-match-trigger"
            aria-haspopup="dialog" aria-expanded={inspireOpen} onClick={event => {
              // WebKit does not focus a button on pointer activation; retain the actual opener.
              event.currentTarget.focus({ preventScroll: true }); openStyleMatches();
            }}>
            <span><small>THE INSPIRE</small>Explore similar styles</span>
            <span className="fs-style-match-count" aria-label={`${styleMatchProducts.length} similar ${styleMatchProducts.length === 1 ? 'style' : 'styles'}`}>{styleMatchProducts.length}</span>
            <span aria-hidden="true">↗</span>
          </button>}
        </div>
        <div className={'fs-discovery' + (!selected.looks.length ? ' fs-discovery-focused' : '')}>
          <div className="fs-purchase-section">
            <PurchaseGrid archiveProducts={archiveProducts} savedIds={savedIds} onToggleSave={toggleArchiveSave} onSelect={openProduct} featuredProductIds={featuredProductIds} />
          </div>
          {/* Styling stays beside the edit for as long as this study is selected. */}
          {selected.looks.length > 0 && <aside className="fs-context-section" aria-label="Contextual outfit feed">
            <OutfitMasonry key={selected.id} looks={selected.looks} {...lookSaveProps} contextual
              contextName={selected.name} loadingEnabled={!product && !cartOpen && !inspireOpen} />
          </aside>}
        </div>
        <details className="fs-shopping-explainer"><summary>How this sample edit works</summary><p>The archive edit contains fictional vintage, reissue and archive-study listings. Open The Inspire to explore modern style matches separately. Style previews and visit-local saves leave your archive bag and wardrobe untouched. The photographs provide context for the selected study.</p></details>

        {product && <div className="fs-inline-product" ref={productRef} tabIndex={-1}>
          <ProductDetailPanel product={product} looks={productOwner?.looks ?? []}
            styleMatchCount={styleMatchProducts.length} onOpenStyleMatches={openStyleMatches}
            saved={savedIds.includes(product.id)} onToggleSave={toggleArchiveSave} onBack={closeProduct}
            onAddToCart={(item, variant) => addToCart(item, variant)}
            onBuyNow={(item, variant) => addToCart(item, variant, true)} />
        </div>}
      </> : <div className="fs-products-empty"><span aria-hidden="true">↗</span><div><h3>Your next chapter starts with a story.</h3><p>Analyse a photograph above. Choose a study and its related edit will appear here.</p></div><button className="fs-text-button" onClick={() => scrollToSection(recognitionRef.current)}>Find a story ↑</button></div>}
    </section>

    {/* One mounted drawer preserves visit-local sizes across both entry points and all studies. */}
    <StyleMatchDrawer open={inspireOpen} itemName={styleOwner?.name ?? ''} products={styleMatchProducts}
      savedIds={savedStyleMatchIds} onClose={() => closeStyleMatches()}
      onToggleSave={toggleStyleMatchSave} onPreviewPartner={previewPartnerOffer}
      onRestoreFocus={restoreStyleMatchFocus} />
    <CartPreview open={cartOpen} lines={cart} onClose={() => setCartOpen(false)} onChange={setCart} />
    <div className="fs-toast" role="status" aria-live="polite" data-visible={Boolean(notice)}>{notice}</div>
  </div>;
}
