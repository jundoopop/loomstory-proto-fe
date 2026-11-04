/** Shared catalog card used by Discover, the Vault, item recommendations, and the wardrobe.
 * It displays supplied data; App owns saving and browser persistence.
 */
import { Link } from 'react-router-dom';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  saved: boolean;
  onToggleSave: (id: string) => void;
}

/** Keep detail navigation separate from the save button so saving does not leave the grid. */
export function ItemCard({ item, saved, onToggleSave }: ItemCardProps) {
  return (
    <article className="card">
      <div className="card-photo">
        <Link to={`/items/${item.id}`} aria-label={`View ${item.title}`}>
          <img src={item.image} alt={`${item.title} — illustrative photograph`} loading="lazy" />
        </Link>
        <button
          type="button"
          className="save"
          aria-label={`${saved ? 'Unsave' : 'Save'} ${item.title}`}
          aria-pressed={saved}
          onClick={() => onToggleSave(item.id)}
        >
          <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
        </button>
        <span className="badge">{item.era} · SAMPLE PIECE</span>
      </div>
      <Link to={`/items/${item.id}`} className="card-meta">
        <span>{item.title}</span><b>€{item.price}</b>
      </Link>
      <small>{item.category} · Size {item.size} · Illustrative price</small>
    </article>
  );
}
