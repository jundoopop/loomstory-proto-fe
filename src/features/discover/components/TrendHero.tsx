/** Discover's selectable magazine cover and finite, always-visible inspiration edit. */
import { useLayoutEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { outfitLooks } from '../../first-sight/looks';
import type { OutfitLook, SavedLookProps } from '../../first-sight/types';
import { OutfitMasonry } from '../../first-sight/components/OutfitMasonry';
import { collectionLooks, inspirationCollections } from '../collections';
import './trend-hero.css';

/** URL collection state preserves the chosen edit when returning from FirstSight. */
export function TrendHero({ savedLookIds, onToggleSaveLook }: SavedLookProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const collection = inspirationCollections.find(entry => entry.id === searchParams.get('collection'))
    ?? inspirationCollections[0];
  const hero = outfitLooks.find(look => look.id === collection.heroId) ?? outfitLooks[0];
  const boardRef = useRef<HTMLDivElement>(null);

  // Restart only this collection's scroll area; page position and the cover remain independent.
  useLayoutEffect(() => {
    if (boardRef.current) boardRef.current.scrollTop = 0;
  }, [collection.id]);

  function selectCollection(id: string) {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('collection', id);
      return next;
    }, { replace: true, preventScrollReset: true });
  }

  /** Only authored IDs cross routes; FirstSight resolves its own canonical reference. */
  function exploreLook(look: OutfitLook) {
    navigate(`/first-sight?look=${encodeURIComponent(look.id)}`);
  }

  return <section className="fs-trends" id="discover-inspiration" aria-labelledby="discover-inspiration-title">
    <div className="fs-trend-hero" role="region" aria-label="Inspiration cover and collections" tabIndex={0}>
      <figure className="fs-trend-visual">
        <img key={hero.id} src={hero.image} alt={`${hero.celebrity}: ${hero.title}`} width={hero.width} height={hero.height} style={{ objectPosition: collection.position }} fetchPriority="high" />
        <div className="fs-trend-image-top"><span>THE DISCOVER EDIT</span><span>VOL. 01</span></div>
        <figcaption>
          <span className="fs-trend-chapter">{collection.chapter}</span>
          <strong>{collection.headline}</strong>
          <span className="fs-trend-credit">{hero.celebrity} · Photo: {hero.credit} {hero.sourceUrl && <a href={hero.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>}{hero.license && hero.licenseUrl && <> · <a href={hero.licenseUrl} target="_blank" rel="noreferrer">{hero.license}</a></>}</span>
        </figcaption>
      </figure>

      <div className="fs-trend-copy">
        <div className="fs-trend-eyebrow"><span>A WARDROBE OF POSSIBILITIES</span><span aria-hidden="true">✧</span></div>
        <h2 id="discover-inspiration-title">The inspiration edit<span aria-hidden="true">.</span></h2>
        <p className="fs-trend-subtitle">Explore fashion through time.</p>
        <p className="fs-trend-introduction">A familiar silhouette. An unexpected detail.<br />Find the thread that makes a look your own.</p>

        <div className="fs-trend-collections" role="group" aria-label="Choose an inspiration collection">
          {inspirationCollections.map((entry, index) => <button key={entry.id} type="button" aria-pressed={collection.id === entry.id} onClick={() => selectCollection(entry.id)}>
            <span className="fs-trend-number" aria-hidden="true">0{index + 1}</span><span>{entry.title}</span><span aria-hidden="true">↗</span>
          </button>)}
        </div>
        <p className="fs-trend-description" aria-live="polite">{collection.description}</p>
        <div className="fs-trend-actions">
          <button className="fs-button fs-trend-explore" type="button" onClick={() => exploreLook(hero)}>Explore in FirstSight <span aria-hidden="true">↗</span></button>
          <Link to="/first-sight" className="fs-trend-upload-link">Start with your photo <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>

    <div className="fs-trend-board" id="fs-trend-board" ref={boardRef} role="region" aria-labelledby="discover-board-title" tabIndex={0}>
      <div className="fs-trend-board-label"><span id="discover-board-title">{collection.title} / THE EDIT</span><span>Six looks, one feeling.</span></div>
      <OutfitMasonry key={collection.id} looks={collectionLooks(collection)} savedLookIds={savedLookIds}
        onToggleSaveLook={onToggleSaveLook} loadingEnabled={false} showRegionFilters={false} onExploreLook={exploreLook} />
    </div>
  </section>;
}
