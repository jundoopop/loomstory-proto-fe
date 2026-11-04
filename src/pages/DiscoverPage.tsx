/** Original home route: editorial introduction, collection search, and featured pieces.
 * Change home-page copy/layout here; edit inventory and journal content in data/catalog.ts.
 */
import { Link, useNavigate } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { stories } from '../data/catalog';
import type { CollectionProps } from '../types';

/** Present the first four catalog items while sharing wardrobe state with App. */
export default function DiscoverPage({ items, savedIds, onToggleSave }: CollectionProps) {
  const navigate = useNavigate();
  const firstStory = stories[0];
  return (
    <>
      <section className="hero" aria-labelledby="discover-title">
        <div className="hero-copy">
          <div className="eyebrow">Good clothes. Great stories.</div>
          <h1 id="discover-title">Every piece<br />has a <em>past.</em></h1>
          <p>Discover vintage with character. Follow the stories behind the silhouettes, and find a piece for your next chapter.</p>
          <Link className="btn red" to="/vault">Explore the collection <span aria-hidden="true">↗</span></Link>
          <div className="issue">THE LOOMSTORY EDIT / VOL. 01</div>
        </div>
        <div className="hero-picture">
          <img src="/assets/hero.jpg" alt="Editorial street-style photograph" fetchPriority="high" />
          <span className="photo-tag">THE ART OF LOOKING BACK</span>
        </div>
        <aside className="contents" aria-label="In this edition">
          <div className="eyebrow">In this edition</div>
          <Link to="/vault"><small>01 / THE VAULT</small><h3>Objects of character.</h3><p>Find your next forever piece.</p></Link>
          <Link to={firstStory ? `/stories/${firstStory.id}` : '/stories'}><small>02 / THE JOURNAL</small><h3>Stories worth wearing.</h3><p>A little context changes everything.</p></Link>
          <Link to="/submit"><small>03 / YOUR CHAPTER</small><h3>What’s in your wardrobe?</h3><p>Give an old favourite a new beginning.</p></Link>
          <div className="end">CURATED FINDS.<br />FRESH PERSPECTIVES.</div>
        </aside>
      </section>

      <section className="discover-bar" aria-label="Find a piece">
        <div><h2>A feeling. A decade. A favourite.</h2><p>Start with a detail. See where the threads lead.</p></div>
        <form className="search-form" onSubmit={(event) => {
          event.preventDefault();
          // Pass search through the URL so the Vault can restore and share the same filter.
          const query = String(new FormData(event.currentTarget).get('q') ?? '').trim();
          navigate(query ? `/vault?q=${encodeURIComponent(query)}` : '/vault');
        }}>
          <input name="q" aria-label="Search the collection" placeholder="Try denim, leather, or the 1990s…" />
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
    </>
  );
}
