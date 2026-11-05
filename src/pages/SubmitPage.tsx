/** Original /submit walkthrough: local photo → user-entered details → preview → completion.
 * Keep this comparison flow separate from FirstSight; scoped presentation lives in submit.css.
 */
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './submit.css';

// `upload` URLs need revocation; `sample` URLs point to permanent bundled assets.
type Photo = { kind: 'sample' | 'upload'; url: string; name: string };
type Draft = { title: string; category: string; era: string; size: string; notes: string };

const emptyDraft: Draft = { title: '', category: 'Unknown', era: 'Unknown', size: '', notes: '' };
// Upload constraints and visible step names are configured here for this legacy flow.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];
const stepLabels = ['Photographs', 'Details', 'Preview'];

/** Verify image contents, since an accepted extension/MIME type alone does not ensure readability. */
function canDecodeImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0
      ? resolve() : reject(new Error('Empty image'));
    image.onerror = () => reject(new Error('Unreadable image'));
    image.src = url;
  });
}

/** Own this route's temporary draft and photo; leaving the route discards the walkthrough. */
export default function SubmitPage() {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [showSampleResult, setShowSampleResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Tokens invalidate older asynchronous decodes when the user replaces or cancels a photo.
  const photoRequest = useRef(0);
  const pendingUrl = useRef<string | null>(null);
  const hasMounted = useRef(false);

  // Release an accepted local preview when it is replaced or this page unmounts.
  useEffect(() => {
    return () => {
      if (photo?.kind === 'upload') URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  // A pending decode has not reached photo state yet, so it needs its own unmount cleanup.
  useEffect(() => () => {
    photoRequest.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
  }, []);

  // Announce a new step/completion by moving focus, without stealing focus on initial mount.
  useEffect(() => {
    if (hasMounted.current) headingRef.current?.focus({ preventScroll: true });
    hasMounted.current = true;
  }, [step, finished]);

  /** Invalidate in-flight decoding and release the preview that has not been accepted yet. */
  function cancelPendingPhoto() {
    photoRequest.current += 1;
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    pendingUrl.current = null;
    setReadingPhoto(false);
  }

  /** Validate and decode a selected local file, accepting only the most recent request. */
  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    cancelPendingPhoto();
    setError('');
    if (!photoTypes.includes(file.type) || file.size === 0 || file.size > MAX_PHOTO_BYTES) {
      setError('Choose a nonempty JPG, PNG, or WebP photograph up to 5 MB.');
      event.currentTarget.value = '';
      return;
    }
    const request = photoRequest.current;
    const url = URL.createObjectURL(file);
    pendingUrl.current = url;
    setReadingPhoto(true);
    try {
      await canDecodeImage(url);
      if (request !== photoRequest.current) {
        URL.revokeObjectURL(url);
        return;
      }
      // Ownership passes from pendingUrl to photo; the photo effect handles later cleanup.
      pendingUrl.current = null;
      setPhoto({ kind: 'upload', url, name: file.name });
      setShowSampleResult(false);
    } catch {
      URL.revokeObjectURL(url);
      if (request !== photoRequest.current) return;
      pendingUrl.current = null;
      setError('This file could not be opened as a photograph. Try another JPG, PNG, or WebP.');
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      if (request === photoRequest.current) setReadingPhoto(false);
    }
  }

  /** Replace any pending upload with a bundled sample and preserve an existing draft title. */
  function useSample() {
    cancelPendingPhoto();
    if (inputRef.current) inputRef.current.value = '';
    setPhoto({ kind: 'sample', url: '/assets/jacket.jpg', name: 'LoomStory sample photograph' });
    setShowSampleResult(false);
    setError('');
    setDraft(current => ({ ...current, title: current.title || 'A jacket with a past' }));
  }

  /** Require a usable starting photo before allowing details; focus the input when it is missing. */
  function continueToDetails() {
    if (!photo) {
      setError('Choose a photograph or use the sample jacket to continue.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setStep(1);
  }

  /** Normalize the user's observations and open the local preview after required-title validation. */
  function previewPiece(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError('Give your piece a name before opening its preview.');
      return;
    }
    setDraft(current => ({ ...current, title: current.title.trim(), size: current.size.trim(), notes: current.notes.trim() }));
    setError('');
    setStep(2);
  }

  /** Clear all route-local progress so completion can restart at the photo step. */
  function resetDemo() {
    cancelPendingPhoto();
    setPhoto(null);
    setDraft(emptyDraft);
    setShowSampleResult(false);
    setError('');
    setFinished(false);
    setStep(0);
  }

  // Authored preview copy varies by photo origin; no image analysis runs in this component.
  const sampleDescription = photo?.kind === 'sample'
    ? 'A clean-lined jacket with an understated silhouette. Imagine it as the starting point for a story about everyday style, personal memories, and clothes that stay with us.'
    : 'Your photograph could be the beginning of a new style story. A connected service would propose clothing characteristics here. For now, add what you know in your own words.';

  // Completion is a separate view so the draft can remain available until the user resets it.
  if (finished) {
    return <section className="form-panel submission-panel">
      <div className="eyebrow">The next chapter / Frontend demo</div>
      <h1 ref={headingRef} tabIndex={-1}>A story, ready to imagine.</h1>
      <p>You have completed the photo-to-preview journey for <strong>{draft.title}</strong>.</p>
      {photo && <img className="submission-finished-photo" src={photo.url} alt="Your demo piece" />}
      <div className="notice submission-notice"><strong>Preview complete.</strong> Nothing has been uploaded, saved to a server, or published. This demonstration ends here; your photo stays in this tab until you leave or start again.</div>
      <div className="actions submission-actions">
        <button type="button" className="btn red" onClick={resetDemo}>Try another piece <span aria-hidden="true">↗</span></button>
        <Link className="btn light" to="/vault">Explore the collection <span aria-hidden="true">→</span></Link>
      </div>
    </section>;
  }

  return <section className="form-panel submission-panel">
    <div className="eyebrow">A new chapter starts here</div>
    <h1 ref={headingRef} tabIndex={-1}>Every piece has a story.</h1>
    <p>Start with a photograph. Add what you know. See how your piece could look in LoomStory.</p>
    <ol className="steps submission-steps" aria-label="Photo preview progress">
      {stepLabels.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>
        <span className="submission-step-number">0{index + 1}</span> {label}
      </li>)}
    </ol>

    {error && <p className="submission-error" role="alert">{error}</p>}

    {/* Step 0: choose a local image or a bundled sample. */}
    {step === 0 && <>
      <div className="upload submission-upload">
        <div className="eyebrow">01 / A closer look</div>
        <h2>Bring a piece into the frame.</h2>
        <p>A clear front view is a good place to start. Your photo stays in this tab and is never sent anywhere.</p>
        <label htmlFor="garment-photo">Choose a garment photograph</label>
        <input ref={inputRef} id="garment-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} aria-describedby="photo-help photo-status" />
        <p id="photo-help" className="submission-caption">JPG, PNG, or WebP · Up to 5 MB</p>
        <p id="photo-status" role="status">{readingPhoto ? 'Opening your photograph…' : photo ? `${photo.name} is ready to preview.` : 'No photograph selected yet.'}</p>
        {photo && <img className="submission-photo" src={photo.url} alt="Selected garment preview" />}
        <button type="button" className="btn light" onClick={useSample}>Use the sample jacket <span aria-hidden="true">↗</span></button>
      </div>
      <button type="button" className="btn red" onClick={continueToDetails} disabled={readingPhoto}>Continue to details <span aria-hidden="true">→</span></button>
    </>}

    {/* Step 1: collect the user's observations, with unknown values allowed. */}
    {step === 1 && <>
      <div className="submission-section-intro"><h2>The details make it yours.</h2><p>No need to know everything. Leave the era or category as unknown when you are unsure.</p></div>
      <form onSubmit={previewPiece}>
        <label htmlFor="piece-title">Name your piece <span aria-hidden="true">*</span></label>
        <input id="piece-title" required maxLength={100} value={draft.title} placeholder="e.g. My favourite everyday jacket" onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} />
        <div className="submission-field-grid">
          <div><label htmlFor="piece-category">Category</label>
            <select id="piece-category" value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value }))}>
              {['Unknown', 'Outerwear', 'Denim', 'Knitwear', 'Shirts', 'Dresses', 'Accessories'].map(value => <option key={value}>{value}</option>)}
            </select></div>
          <div><label htmlFor="piece-era">Estimated era</label>
            <select id="piece-era" value={draft.era} onChange={event => setDraft(current => ({ ...current, era: event.target.value }))}>
              {['Unknown', '1970s', '1980s', '1990s', '2000s', 'Contemporary'].map(value => <option key={value}>{value}</option>)}
            </select></div>
        </div>
        <label htmlFor="piece-size">Size <span className="submission-optional">(optional)</span></label>
        <input id="piece-size" maxLength={40} value={draft.size} placeholder="e.g. M, UK 10, or label missing" onChange={event => setDraft(current => ({ ...current, size: event.target.value }))} />
        <label htmlFor="piece-notes">What is its story? <span className="submission-optional">(optional)</span></label>
        <textarea id="piece-notes" rows={4} maxLength={1500} value={draft.notes} placeholder="Where you found it, a favourite memory, or details worth noticing…" onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))} />
        <p className="submission-caption">These are your observations, not verified identification or provenance.</p>
        <div className="actions submission-actions">
          <button className="btn red" type="submit">Preview your piece <span aria-hidden="true">→</span></button>
          <button className="btn light" type="button" onClick={() => { setError(''); setStep(0); }}>Back to photographs</button>
        </div>
      </form>
    </>}

    {/* Step 2: preview the draft and optionally reveal the prepared description. */}
    {step === 2 && <>
      <div className="submission-preview">
        {photo && <img src={photo.url} alt={`${draft.title}, local preview`} />}
        <div><div className="eyebrow">Your piece / Preview only</div><h2>{draft.title}</h2>
          <dl className="submission-facts">
            <div><dt>Category</dt><dd>{draft.category}</dd></div>
            <div><dt>Estimated era</dt><dd>{draft.era}</dd></div>
            <div><dt>Size</dt><dd>{draft.size || 'Not provided'}</dd></div>
          </dl>
          {draft.notes && <p className="submission-user-notes">{draft.notes}</p>}
        </div>
      </div>
      <div className="submission-ai">
        <div className="eyebrow">A glimpse of the next chapter</div>
        <h2>A story behind the silhouette.</h2>
        <p>Explore the shape of a future AI-assisted description with a prepared example.</p>
        <button type="button" className="btn light" onClick={() => setShowSampleResult(true)} disabled={showSampleResult}>Preview sample AI result <span aria-hidden="true">↗</span></button>
        {showSampleResult && <div className="trust" role="status">
          <strong>Demo result · AI is not connected</strong>
          <p>{sampleDescription}</p>
          <small>Prepared sample copy. No image analysis, authentication, or historic verification has taken place.</small>
        </div>}
      </div>
      <div className="notice submission-notice">This is a local preview. Finishing does not create a listing or save anything to a database. Reloading or leaving this page clears the draft and photograph.</div>
      <div className="actions submission-actions">
        <button type="button" className="btn red" onClick={() => setFinished(true)}>Finish demo <span aria-hidden="true">✓</span></button>
        <button type="button" className="btn light" onClick={() => setStep(1)}>Edit details</button>
      </div>
    </>}
    <p className="submission-caption submission-footnote">Frontend demonstration · No account required · No uploads leave your browser</p>
  </section>;
}
