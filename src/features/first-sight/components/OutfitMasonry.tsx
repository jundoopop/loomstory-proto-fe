/**
 * Region-filtered celebrity moodboard used before and after photo discovery.
 * Controls card rendering, incremental display, and source details; the page
 * retains saved look IDs while each board owns its filters and open look.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { OutfitLook, Region } from '../types';

interface Props {
  looks: OutfitLook[];
  savedLookIds: string[];
  onToggleSaveLook: (id: string) => void;
  contextual?: boolean;
  // The supplied item references use their own copy and do not imply geographic metadata.
  itemContext?: boolean;
  contextName?: string;
  loadingEnabled?: boolean;
}
const regions: Region[] = ['All', 'Korea', 'Japan', 'China', 'Global'];

/** Render the board; `contextual` adds the sample screen/social editorial cards. */
export function OutfitMasonry({ looks, savedLookIds: saved, onToggleSaveLook, contextual = false, contextName, itemContext = Boolean(contextName), loadingEnabled = true }: Props) {
  // Filtering and the visible batch belong to this board. Saved hearts live in FirstSightPage.
  const [region, setRegion] = useState<Region>('All');
  const [limit, setLimit] = useState(12);
  const [selected, setSelected] = useState<OutfitLook | null>(null);
  const [status, setStatus] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const filtered = region === 'All' ? looks : looks.filter(look => look.region === region);
  // Reveal local records in batches near the sentinel; no service request occurs here.
  // Disabling or unmounting this board also disconnects dynamic feed injection.
  useEffect(() => {
    if (!loadingEnabled || !sentinel.current || limit >= filtered.length) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setLimit(value => value + 8);
    }, { rootMargin: '100px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadingEnabled, limit, filtered.length]);
  // Synchronize selection with the native modal so the browser manages focus and Escape.
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);

  return <div className={`fs-outfits${contextual ? ' fs-outfits-contextual' : ''}${itemContext ? ' fs-outfits-item' : ''}`}>
    <div className="fs-feed-heading"><div><div className="fs-section-kicker">{itemContext ? (contextName ?? 'THE PIECE').toUpperCase() + ' / STYLE REFERENCES' : contextual ? 'THE CULTURAL THREAD' : 'THE WORLD IS YOUR MOODBOARD'}</div><h2>{itemContext ? 'Style, in context.' : contextual ? 'Ways to wear the feeling.' : 'Good style travels.'}</h2></div><span className="fs-look-count">{looks.length} looks<br /><span>worth a closer look</span></span></div>
    <p className="fs-feed-description">{itemContext ? 'A few ways to see the silhouette anew. Selected photographs to inspire your next chapter.' : contextual ? 'Real celebrity references, paired here as sample styling inspiration. Not verified appearances of your piece.' : 'From Seoul to everywhere. A little inspiration for your next favourite piece.'}</p>
    {!itemContext && <div className="fs-filters" role="group" aria-label="Filter outfits by region">
      {regions.map(value => <button type="button" key={value} aria-pressed={region === value} onClick={() => { setRegion(value); setLimit(12); }}>{value === 'All' ? 'All looks' : value}</button>)}
    </div>}
    {/* These are authored prototype context cards; sourced celebrity records follow below. */}
    {contextual && !itemContext && <div className="fs-context-notes">
      <details><summary><img src="/assets/coat.jpg" alt="Illustrative long coat" /><span><small>ON SCREEN / SAMPLE EDITORIAL</small><strong>The city, after hours.</strong><span>A wardrobe study ↗</span></span></summary><p>Imagine the wardrobe of a city drama: a long coat, a simple base, and a generous shoulder. This fictional screen-style card demonstrates how a verified TV or film appearance could sit beside your matches.</p></details>
      <details><summary><img src="/assets/denim.jpg" alt="Illustrative denim styling" /><span><small>SOCIAL STYLE / SAMPLE EDIT</small><strong>The off-duty formula.</strong><span>One layer, many possibilities ↗</span></span></summary><p>Dark denim, a leather layer, one personal detail. A sample social-style note for this moodboard; no live mentions, popularity counts, or product appearances are claimed.</p></details>
    </div>}
    {/* CSS columns arrange the images using their individual source dimensions. */}
    <div className="fs-masonry">
      {filtered.slice(0, limit).map((look, index) => <article className="fs-look" key={look.id}>
        <div className="fs-look-image-wrap">
          <button className="fs-look-open" type="button" aria-label={`View ${look.celebrity}: ${look.title}`} onClick={() => { setSelected(look); }}>
            <LookImage look={look} eager={index < 4} />
            <span className="fs-look-region">{itemContext ? look.kind : look.region}</span><span className="fs-look-peek">View look ↗</span>
          </button>
          <button className="fs-look-save" type="button" aria-pressed={saved.includes(look.id)} aria-label={`${saved.includes(look.id) ? 'Unsave' : 'Save'} ${look.celebrity} look`} onClick={() => {
            onToggleSaveLook(look.id);
            setStatus(saved.includes(look.id) ? 'Look removed from this moodboard.' : 'Look saved in this moodboard for this visit.');
          }}>{saved.includes(look.id) ? '♥' : '♡'}</button>
        </div>
        <div className="fs-look-caption"><h3>{look.celebrity}</h3><p>{look.title}</p>{look.sourceUrl ? <a href={look.sourceUrl} target="_blank" rel="noreferrer">{look.sourceLabel} <span aria-hidden="true">↗</span></a> : <span className="fs-muted">{look.sourceLabel}</span>}</div>
      </article>)}
    </div>
    {!filtered.length && <p className="fs-muted">This edit is still being collected. Explore another region.</p>}
    {limit < filtered.length && <div ref={sentinel} className="fs-load-more"><button type="button" className="fs-button" onClick={() => { setLimit(value => value + 8); }}>More inspiration <span aria-hidden="true">↓</span></button></div>}
    <p className="fs-feed-footnote">{filtered.length} {itemContext ? 'provided' : 'sourced'} references · Saved looks stay in this page session.</p>
    <span className="fs-sr-only" role="status">{status}</span>
    {/* Keep the original source, photographer, and license accessible for every look. */}
    <dialog className="fs-look-dialog" ref={dialog} aria-labelledby={headingId} onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      {selected && <div className="fs-look-dialog-content"><button className="fs-dialog-close" aria-label="Close outfit details" onClick={() => setSelected(null)}>×</button><LookImage look={selected} eager /><div className="fs-look-dialog-copy"><span className="fs-section-kicker">{itemContext ? selected.kind : selected.region} / STYLE REFERENCE</span><h2 id={headingId}>{selected.celebrity}</h2><h3>{selected.title}</h3><p>{selected.description}</p><div className="fs-tags">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{selected.sourceUrl && <a className="fs-button fs-primary" href={selected.sourceUrl} target="_blank" rel="noreferrer">Open original source <span aria-hidden="true">↗</span></a>}<p className="fs-photo-credit">Photo: {selected.credit}{selected.license && selected.licenseUrl && <><br /><a href={selected.licenseUrl} target="_blank" rel="noreferrer">{selected.license} ↗</a></>}</p><p className="fs-muted">Style reference only. No endorsement or exact product match is implied.</p></div></div>}
    </dialog>
  </div>;
}

/** Preserve the photograph's aspect ratio, including when a failed image needs a fallback. */
function LookImage({ look, eager = false }: { look: OutfitLook; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="fs-image-fallback" style={{ aspectRatio: `${look.width} / ${look.height}` }}><span>{look.celebrity}</span><small>{look.sourceUrl ? "Photo unavailable · open source to view" : "Original photograph pending"}</small></div> : <img src={look.image} alt={`${look.celebrity} — ${look.title}`} width={look.width} height={look.height} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />;
}
