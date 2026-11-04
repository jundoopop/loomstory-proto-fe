/** Stable upload-panel shell: only its contents change during the analysis journey. */
import { useEffect, useRef, useState } from 'react';
import type { DiscoveryResult, PhotoInput } from '../types';
import { chloePhoto } from '../chloe';
import { ItemAnalysisResult } from './ItemAnalysisResult';

interface Props {
  photo: PhotoInput | null;
  busy: boolean;
  result: DiscoveryResult | null;
  onReady: (photo: PhotoInput) => void;
  onExplore: () => void;
  onChangePhoto: () => void;
}
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

/** Validate local photographs and retain the same section through upload, loading, and result. */
export function PhotoUploadPanel({ photo, busy, result, onReady, onExplore, onChangePhoto }: Props) {
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [matchingOpen, setMatchingOpen] = useState(false);
  const [matchingSide, setMatchingSide] = useState<'above' | 'below'>('above');
  const matchingRef = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const pendingUrl = useRef<string | null>(null);
  // Unaccepted object URLs belong here; the parent takes ownership after onReady.
  useEffect(() => () => {
    request.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
  }, []);

  // A sample started elsewhere cancels an unfinished decode and dismisses the hover card.
  useEffect(() => {
    if (!busy && !result) return;
    request.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    pendingUrl.current = null;
    setReading(false); setDragging(false); setMatchingOpen(false); setError('');
  }, [busy, result]);

  /** Place the floating explanation on the side with more room; it never expands the panel. */
  function openMatching() {
    const bounds = matchingRef.current?.getBoundingClientRect();
    if (bounds) setMatchingSide(bounds.top > window.innerHeight - bounds.bottom ? 'above' : 'below');
    setMatchingOpen(true);
  }

  useEffect(() => {
    if (!matchingOpen) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !matchingRef.current?.contains(event.target)) setMatchingOpen(false);
    };
    const dismiss = () => setMatchingOpen(false);
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMatchingOpen(false);
      if (matchingRef.current?.contains(document.activeElement)) matchingRef.current.querySelector('button')?.focus();
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissWithEscape);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissWithEscape);
      window.removeEventListener('resize', dismiss);
    };
  }, [matchingOpen]);

  /** Decode before handing a browser-local preview to the gateway; ignore superseded files. */
  async function select(file?: File) {
    if (!file || busy) return;
    const token = ++request.current;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    pendingUrl.current = null;
    setReading(false);
    setError('');
    if (!acceptedTypes.includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError('Choose a nonempty JPG, PNG, or WebP photo up to 5 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    pendingUrl.current = url;
    setReading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => image.naturalWidth && image.naturalHeight ? resolve() : reject();
        image.onerror = reject;
        image.src = url;
      });
      if (token !== request.current) { URL.revokeObjectURL(url); return; }
      pendingUrl.current = null;
      onReady({ kind: 'upload', url, name: file.name });
    } catch {
      URL.revokeObjectURL(url);
      if (token === request.current) {
        pendingUrl.current = null;
        setError('This photo could not be opened. Please choose another image.');
      }
    } finally { if (token === request.current) setReading(false); }
  }

  /** Enter the same loading flow with the authored Chloé reference instead of a local upload. */
  function sample() {
    request.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    pendingUrl.current = null;
    setReading(false);
    setError('');
    onReady(chloePhoto);
  }

  return <section className="fs-upload-panel" data-state={result ? 'result' : busy ? 'analyzing' : 'upload'} aria-labelledby="fs-upload-title" aria-busy={busy}>
    {result ? <ItemAnalysisResult identity={result.identity} analysis={result.analysis} onExplore={onExplore} onChangePhoto={onChangePhoto} /> : busy ? <div className="fs-analysis-loading">
      <div className="fs-section-kicker"><span>01 / LOOKING CLOSER</span><span aria-hidden="true">✧</span></div>
      <h2 id="fs-upload-title">A story<br /><em>taking shape.</em></h2>
      <div className="fs-analysis-preview">{photo && <img src={photo.url} alt="Your selected photograph" />}<span className="fs-scan-line" aria-hidden="true" /></div>
      <p role="status">Preparing your sample analysis…</p>
      <p className="fs-muted">A closer look at the design, details, and possibilities. This walkthrough uses a prepared Chloé example.</p>
      <button type="button" className="fs-text-button" onClick={onChangePhoto}>Cancel analysis</button>
    </div> : <>
    <div className="fs-section-kicker"><span>01 / YOUR STARTING POINT</span><span aria-hidden="true">↗</span></div>
    <h2 id="fs-upload-title">Seen something<br /><em>you love?</em></h2>
    <p>A piece in your wardrobe. A look you can’t forget. Start with a photo and follow the thread.</p>
    <div className={`fs-dropzone${dragging ? ' is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => {
      event.preventDefault(); setDragging(false); void select(event.dataTransfer.files[0]);
    }}>
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="12" width="34" height="28" rx="3" stroke="currentColor" strokeWidth="1.4" /><path d="M16 12l3-5h10l3 5M24 22v12m-6-6h12" stroke="currentColor" strokeWidth="1.4" /><path d="M34 18h2" stroke="currentColor" strokeWidth="2" /></svg>
      <strong>{reading ? 'Opening your photograph…' : 'Drop a photo here'}</strong>
      <span>or choose one from your device</span>
      <label className="fs-button fs-primary fs-file-label">
        Choose a photo <span aria-hidden="true">↗</span>
        <input className="fs-file-input" aria-label="Choose a garment photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || reading} onChange={event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; void select(file); }} aria-describedby="fs-photo-help" />
      </label>
      <small id="fs-photo-help">JPG, PNG, WebP · up to 5 MB</small>
      {(busy || reading) && <span className="fs-scan-line" aria-hidden="true" />}
    </div>
    {error && <p className="fs-error" role="alert">{error}</p>}
    <div className="fs-matching-explainer" ref={matchingRef} data-side={matchingSide}
      onPointerEnter={event => { if (event.pointerType === 'mouse') openMatching(); }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') setMatchingOpen(false); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMatchingOpen(false); }}>
      <button className="fs-matching-trigger" type="button" aria-expanded={matchingOpen} aria-controls="fs-matching-details"
        onClick={() => matchingOpen ? setMatchingOpen(false) : openMatching()}>
        <span>How a photo becomes a match.</span><span aria-hidden="true">?</span>
      </button>
      {matchingOpen && <div className="fs-matching-popover" id="fs-matching-details" role="region" aria-label="How photo matching would work">
        <div className="fs-matching-content" tabIndex={0}>
          <p>Our planned matching process:</p>
          <ol>
            <li><strong>Read the visual clues</strong><p>Look at the shape, color, pattern, and readable garment labels.</p></li>
            <li><strong>Compare references</strong><p>Compare those clues with catalog images and documented brand and collection details.</p></li>
            <li><strong>Suggest possible matches</strong><p>Bring together likely products, similar silhouettes, and celebrity styling inspiration.</p></li>
          </ol>
          <p className="fs-matching-note">This prototype uses prepared samples and does not analyze your photo. Visual similarity alone does not verify a brand or release year.</p>
        </div>
      </div>}
    </div>
    <span className="fs-sr-only" role="status">{busy ? 'Preparing a demonstration result. No image analysis is performed.' : reading ? 'Opening photo.' : ''}</span>
    <button className="fs-sample" type="button" disabled={busy} onClick={sample}>
      <img src={chloePhoto.url} alt="" /><span><small>JUST LOOKING AROUND?</small><strong>Try the Chloé bag</strong><span>Take the whole journey in a few clicks.</span></span><b aria-hidden="true">↗</b>
    </button>
    <p className="fs-local-note"><span aria-hidden="true">◈</span> Your photo stays in this tab. Results are an interactive demonstration.</p>
    <div className="fs-upload-footer"><span>A PHOTO.</span><span>A CONNECTION.</span><span>A NEW CHAPTER.</span></div>
    </>}
  </section>;
}
