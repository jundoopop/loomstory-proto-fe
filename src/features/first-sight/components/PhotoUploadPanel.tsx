/** Persistent photo workspace: selection, decoding, and analysis are separate actions. */
import { useEffect, useRef, useState } from 'react';
import type { PhotoInput } from '../types';
import { chloePhoto } from '../chloe';
import './upload-workspace.css';

interface Props {
  photo: PhotoInput | null;
  busy: boolean;
  hasResults: boolean;
  onPhotoChange: (photo: PhotoInput | null) => void;
  onAnalyze: () => void;
  onCancel: () => void;
}
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

/** Keep the selected photograph visible while the adjacent results change. */
export function PhotoUploadPanel({ photo, busy, hasResults, onPhotoChange, onAnalyze, onCancel }: Props) {
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [matchingOpen, setMatchingOpen] = useState(false);
  const [matchingSide, setMatchingSide] = useState<'above' | 'below'>('above');
  const matchingRef = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const pendingUrl = useRef<string | null>(null);

  // Only pending URLs belong here. The parent releases accepted upload URLs.
  useEffect(() => () => {
    request.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
  }, []);

  // An externally started analysis must not accept an older, unfinished image decode.
  useEffect(() => {
    if (!busy) return;
    request.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    pendingUrl.current = null;
    setReading(false); setDragging(false); setMatchingOpen(false); setError('');
  }, [busy]);

  /** Float the explanation toward the available space without resizing the upload panel. */
  function openMatching() {
    const bounds = matchingRef.current?.getBoundingClientRect();
    if (bounds) setMatchingSide(bounds.top > window.innerHeight - bounds.bottom ? 'above' : 'below');
    setMatchingOpen(true);
  }

  // Pointer, keyboard, and touch users can all dismiss the same explanation card.
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

  /** Invalidate a pending decode before switching to a sample or removing the photo. */
  function cancelDecode() {
    request.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    pendingUrl.current = null;
    setReading(false); setError('');
  }

  /** Validate and decode locally; accepting a photo never starts analysis itself. */
  async function select(file?: File) {
    if (!file) return;
    cancelDecode();
    const token = request.current;
    if (!acceptedTypes.includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError('Choose a nonempty JPG, PNG, or WebP photo up to 5 MB.');
      return;
    }
    // Replacing a valid photo also stops an in-flight scan before its delayed result lands.
    if (busy) onCancel();
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
      onPhotoChange({ kind: 'upload', url, name: file.name });
    } catch {
      URL.revokeObjectURL(url);
      if (token === request.current) {
        pendingUrl.current = null;
        setError('This photo could not be opened. Please choose another image.');
      }
    } finally { if (token === request.current) setReading(false); }
  }

  /** The authored sample follows the same explicit Analyze action as an uploaded photo. */
  function chooseSample() {
    cancelDecode();
    onPhotoChange(chloePhoto);
  }

  const status = reading ? 'Opening your photograph…' : busy ? 'Finding the threads…' : hasResults ? 'Your story is ready to explore.' : photo ? 'Photo ready. Let’s look a little closer.' : 'JPG, PNG, WebP · up to 5 MB';
  const reference = photo?.kind === 'reference' ? photo.reference : null;

  return <section className="fs-upload-panel fs-photo-workspace" data-state={busy ? 'analyzing' : hasResults ? 'result' : photo ? 'ready' : 'upload'} aria-labelledby="fs-upload-title" aria-busy={busy}>
    <div className="fs-section-kicker"><span>01 / YOUR PHOTO, YOUR STORY</span><span aria-hidden="true">✧</span></div>
    <h2 id="fs-upload-title">Find the Story<br /><em>Behind Your Style</em></h2>
    <p className="fs-workspace-intro">One photo. A closer look at the design, the details, and the possibilities.</p>
    <div className={`fs-dropzone fs-workspace-photo${photo ? ' has-photo' : ''}${dragging ? ' is-dragging' : ''}`}
      onDragOver={event => { event.preventDefault(); setDragging(true); }}
      onDragLeave={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={event => { event.preventDefault(); setDragging(false); void select(event.dataTransfer.files[0]); }}>
      {photo ? <><img className="fs-workspace-preview" src={photo.url} alt={reference ? `${reference.celebrity} — ${reference.title}` : photo.kind === 'sample' ? 'Chloé Paddington bag selected for the sample journey' : 'Your selected fashion photograph'} /><span className="fs-workspace-photo-label">{reference ? 'DISCOVER REFERENCE' : photo.kind === 'sample' ? 'THE CHLOÉ STUDY' : 'YOUR PHOTOGRAPH'}</span></> : <>
        <svg width="37" height="37" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="12" width="34" height="28" rx="3" stroke="currentColor" strokeWidth="1.4" /><path d="M16 12l3-5h10l3 5M24 22v12m-6-6h12" stroke="currentColor" strokeWidth="1.4" /></svg>
        <strong>Drop a photo here</strong><span>or choose one from your device</span>
      </>}
      {!photo && <label className="fs-button fs-file-label fs-workspace-file">Choose a photo <span aria-hidden="true">↗</span><input className="fs-file-input" aria-label="Choose a garment photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || reading} onChange={event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; void select(file); }} aria-describedby="fs-photo-help" /></label>}
      {(busy || reading) && <span className="fs-scan-line" aria-hidden="true" />}
    </div>
    {photo && <div className="fs-workspace-file-tools">
      <span className="fs-workspace-filename" title={photo.name}>{photo.kind === 'sample' ? 'Chloé Paddington · sample' : photo.name}</span>
      <label className={`fs-file-label fs-workspace-replace${reading ? ' is-disabled' : ''}`}>Replace<input className="fs-file-input" aria-label="Replace selected photograph" type="file" accept="image/jpeg,image/png,image/webp" disabled={reading} onChange={event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; void select(file); }} aria-describedby="fs-photo-help" /></label>
      <button type="button" onClick={() => { cancelDecode(); onPhotoChange(null); }}>Remove</button>
    </div>}
    {/* Authored references retain their identity and credits; they are not user uploads. */}
    {reference && <div className="fs-workspace-reference-credit">
      <strong>{reference.celebrity} — {reference.title}</strong>
      <span>Photo: {reference.credit}</span>
      {reference.sourceUrl && <a href={reference.sourceUrl} target="_blank" rel="noreferrer">{reference.sourceLabel} (opens in a new tab) ↗</a>}
      {reference.license && reference.licenseUrl && <a href={reference.licenseUrl} target="_blank" rel="noreferrer">{reference.license} (opens in a new tab) ↗</a>}
    </div>}
    <p className="fs-workspace-status" id="fs-photo-help" role="status">{status}</p>
    {error && <p className="fs-error fs-workspace-error" role="alert">{error}</p>}
    <div className="fs-workspace-analysis-controls">
      <button className="fs-button fs-primary fs-analyze-button" type="button" disabled={!photo || busy || reading} onClick={onAnalyze}>{busy ? 'Preparing your story…' : hasResults ? 'Analyze again' : 'Analyze photo'}<span aria-hidden="true">{busy ? '◌' : '↗'}</span></button>
      {busy && <button type="button" className="fs-workspace-cancel" onClick={onCancel}>Cancel</button>}
    </div>
    {reference && <p className="fs-reference-disclosure">This reference opens the prepared five-study demonstration. Results are sample studies, not an identification of this outfit.</p>}

    <div className="fs-matching-explainer" ref={matchingRef} data-side={matchingSide}
      onPointerEnter={event => { if (event.pointerType === 'mouse') openMatching(); }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') setMatchingOpen(false); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMatchingOpen(false); }}>
      <button className="fs-matching-trigger" type="button" aria-expanded={matchingOpen} aria-controls="fs-matching-details" onClick={() => matchingOpen ? setMatchingOpen(false) : openMatching()}><span>How a photo becomes a match</span><span aria-hidden="true">?</span></button>
      {matchingOpen && <div className="fs-matching-popover" id="fs-matching-details" role="region" aria-label="How photo matching would work">
        <div className="fs-matching-content" tabIndex={0}>
          <p>A closer look, in three steps:</p>
          <ol>
            <li><strong>Read the details</strong><p>Shape, texture, color, and visible labels offer the first clues.</p></li>
            <li><strong>Follow the references</strong><p>Compare those clues with catalog imagery and documented designs.</p></li>
            <li><strong>Connect the story</strong><p>Discover possible matches, styling references, and related pieces.</p></li>
          </ol>
          <p className="fs-matching-note">This interactive prototype uses prepared examples. Your photograph stays in this tab; no image analysis is performed.</p>
        </div>
      </div>}
    </div>
    <button className="fs-sample fs-workspace-sample" type="button" disabled={busy} onClick={chooseSample}><img src={chloePhoto.url} alt="" /><span><small>NEED A STARTING POINT?</small><strong>Try the Chloé bag</strong></span><b aria-hidden="true">↗</b></button>
    <p className="fs-local-note"><span aria-hidden="true">◈</span> Local photo · Prepared sample results</p>
  </section>;
}
