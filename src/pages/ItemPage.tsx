/** Standalone /items/:id detail route for the original catalog experience.
 * FirstSight's inline shopping view is implemented separately in ProductDetailPanel.tsx.
 */
import { Link, useParams } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { stories } from '../data/catalog';
import type { CollectionProps } from '../types';

/** Resolve a catalog item, its editorial story, and up to four same-category alternatives. */
export default function ItemPage({ items, savedIds, onToggleSave }: CollectionProps) {
  const { id } = useParams();
  const item = items.find((candidate) => candidate.id === id);
  // Direct links may contain an unknown ID; render a recovery route before reading item fields.
  if (!item) return <div className="form-panel"><div className="page-heading"><div className="eyebrow">Page unavailable</div><h1>This piece is missing.</h1><p>The listing could not be found in this sample collection.</p></div><Link className="btn" to="/vault">Explore the collection ↗</Link></div>;
  const saved = savedIds.includes(item.id);
  // These associations are authored catalog relationships, rather than live recommendations.
  const story = stories.find((candidate) => candidate.id === item.storyId);
  const related = items.filter((candidate) => candidate.id !== item.id && candidate.category === item.category).slice(0, 4);

  return (
    <>
      <section className="details" aria-labelledby="item-title">
        <img src={item.image} alt={`${item.title} — illustrative photograph`} />
        <div>
          <Link className="eyebrow" to="/vault">← The Vault / {item.era}</Link>
          <h1 id="item-title">{item.title}</h1><div className="price">€{item.price} <small style={{ fontSize: 12 }}>sample price</small></div>
          <p>{item.description}</p>
          <div className="facts"><div><small>Style era</small>{item.era}</div><div><small>Size</small>{item.size}</div><div><small>Category</small>{item.category}</div><div><small>Collection</small>The LoomStory edit</div></div>
          <div className="trust"><b>A piece for the imagination.</b><br />Fictional inventory with illustrative photography. Era and cultural context describe a style, not verified provenance or authenticity.</div>
          <div className="actions"><button type="button" className={`btn ${saved ? 'light' : 'red'}`} aria-pressed={saved} onClick={() => onToggleSave(item.id)}>{saved ? 'Saved to your wardrobe ♥' : 'Save to my wardrobe ♡'}</button><Link className="btn light" to="/wardrobe">My wardrobe ↗</Link></div>
          <p className="notice">Saved in this browser. This prototype does not offer checkout.</p>
          {story && <><hr /><h2 style={{ fontSize: 30 }}>More than what you wear.</h2><p>{story.summary}</p><Link className="submit-link" to={`/stories/${story.id}`}>Read the style story ↗</Link></>}
        </div>
      </section>
      {related.length > 0 && <section className="section"><div className="section-head"><h2>Same mood. Another chapter.</h2></div><div className="grid">{related.map((candidate) => <ItemCard key={candidate.id} item={candidate} saved={savedIds.includes(candidate.id)} onToggleSave={onToggleSave} />)}</div></section>}
    </>
  );
}
