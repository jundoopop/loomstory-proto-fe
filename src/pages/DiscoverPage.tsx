/** Hybrid Discover homepage: editorial inspiration, Vault search and featured archive pieces. */
import { Link, useNavigate } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { TrendHero } from '../features/discover/components/TrendHero';
import type { SavedLookProps } from '../features/first-sight/types';
import type { CollectionProps } from '../types';

/** App owns product wardrobe and visit-local inspiration saves as separate collections. */
export default function DiscoverPage({ items, savedIds, onToggleSave, savedLookIds, onToggleSaveLook }: CollectionProps & SavedLookProps) {
  const navigate = useNavigate();
  return (
    <div className="discover-page">
      <div className="discover-heading"><div className="eyebrow">THE LOOMSTORY EDIT / VOL. 01</div><h1 id="discover-title">Discover<span aria-hidden="true">.</span></h1><p>A feeling. A silhouette. A story to follow.</p></div>
      <TrendHero savedLookIds={savedLookIds} onToggleSaveLook={onToggleSaveLook} />

      <section className="discover-bar" aria-label="Search the Vault">
        <div><h2>A feeling. A decade. A favourite.</h2><p>Search the Vault for a piece with a story.</p></div>
        <form className="search-form" onSubmit={(event) => {
          event.preventDefault();
          // Pass search through the URL so the Vault can restore and share the same filter.
          const query = String(new FormData(event.currentTarget).get('q') ?? '').trim();
          navigate(query ? `/vault?q=${encodeURIComponent(query)}` : '/vault');
        }}>
          <input name="q" aria-label="Search the Vault collection" placeholder="Try denim, leather, or the 1990s…" />
          <button type="submit" aria-label="Search">↗</button>
        </form>
      </section>

      <section className="section" aria-labelledby="latest-title">
        <div className="section-head"><div><div className="eyebrow">Selected for the archive</div><h2 id="latest-title">The latest chapter.</h2></div><Link to="/vault">View all pieces ↗</Link></div>
        <div className="grid">{items.slice(0, 4).map((item) => <ItemCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSave={onToggleSave} />)}</div>
      </section>

      <section className="split-banner" aria-label="Explore LoomStory">
        <div><div className="eyebrow">More than what you wear</div><h2>Follow the story.</h2><p>From city streets to music scenes, explore the cultural moods that make familiar shapes feel personal.</p><Link className="btn light" to="/stories">Open the journal <span aria-hidden="true">↗</span></Link></div>
        <div><div className="eyebrow">A new beginning</div><h2>Your wardrobe has a past.</h2><p>Photograph a piece, add what you know, and preview the story it could tell.</p><Link className="btn" to="/submit">Submit a piece <span aria-hidden="true">↗</span></Link></div>
      </section>
    </div>
  );
}
