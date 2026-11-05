/** Editorial entry point: a small, selectable edit leads into the photo workspace. */
import { useState } from 'react';
import { outfitLooks } from '../looks';
import type { OutfitLook } from '../types';
import { OutfitMasonry } from './OutfitMasonry';
import './trend-hero.css';

interface Props {
  savedLookIds: string[];
  onToggleSaveLook: (id: string) => void;
}

interface Collection {
  id: string;
  title: string;
  chapter: string;
  headline: string;
  description: string;
  tags: string[];
  heroId: string;
  position: string;
}

// These are contemporary styling references to an era or mood, not archival identifications.
const collections: Collection[] = [
  {
    id: 'streetwear', title: '90s Streetwear', chapter: 'THE EVERYDAY, REIMAGINED',
    headline: 'A little attitude.\nA lasting impression.',
    description: 'Leather layers, relaxed proportions, and a familiar off-duty feeling. Discover present-day looks with a little nineties spirit.',
    tags: ['Street style', 'Leather', 'Casual', 'Layers'], heroId: 'zendaya-8', position: '50% 30%',
  },
  {
    id: 'denim', title: 'Vintage Denim', chapter: 'WORN IN. NEVER WORN OUT.',
    headline: 'Blue, in every\nchapter of life.',
    description: 'Faded blues and easy silhouettes: a modern edit inspired by the denim we return to, year after year.',
    tags: ['Denim', 'Casual', 'Print'], heroId: 'iu-singer-6', position: '50% 28%',
  },
  {
    id: 'cinema', title: 'Retro Cinema', chapter: 'A LEADING-ROLE FEELING',
    headline: 'Some looks deserve\na second scene.',
    description: 'Sharp tailoring, evening silhouettes, and old-screen elegance. Contemporary red-carpet references with a cinematic point of view.',
    tags: ['Tailoring', 'Evening', 'Monochrome'], heroId: 'tom-holland-5', position: '50% 20%',
  },
  {
    id: 'accessories', title: 'Iconic Designer Accessories', chapter: 'THE DETAILS WE REMEMBER',
    headline: 'One detail.\nThe whole story.',
    description: 'A necklace, a shoulder bag, a flash of metal. Explore styling where a small detail gives the entire look its character.',
    tags: ['Jewellery', 'Leather', 'Texture', 'Evening'], heroId: 'lisa-blackpink-2', position: '50% 22%',
  },
];

/** Rank by the collection's ordered tags, then keep the board deliberately small. */
function collectionLooks(collection: Collection): OutfitLook[] {
  const score = (look: OutfitLook) => collection.tags.reduce((total, tag, index) => total + (look.tags.includes(tag) ? collection.tags.length - index : 0), 0);
  return outfitLooks.filter(look => score(look) > 0)
    .sort((left, right) => score(right) - score(left))
    .slice(0, 6);
}

/** Collection selection changes the hero immediately; the optional board retains saved looks. */
export function TrendHero({ savedLookIds, onToggleSaveLook }: Props) {
  const [selectedId, setSelectedId] = useState(collections[0].id);
  const [boardOpen, setBoardOpen] = useState(false);
  const collection = collections.find(entry => entry.id === selectedId) ?? collections[0];
  const hero = outfitLooks.find(look => look.id === collection.heroId) ?? outfitLooks[0];

  return <section className="fs-trends" id="fs-trends" aria-labelledby="fs-trends-title">
    <div className="fs-chapter-label"><span>01 / FIND INSPIRATION</span><span>THE EDITORIAL BOARD</span></div>
    <div className="fs-trend-hero">
      <figure className="fs-trend-visual">
        <img key={hero.id} src={hero.image} alt={`${hero.celebrity}: ${hero.title}`} width={hero.width} height={hero.height} style={{ objectPosition: collection.position }} fetchPriority="high" />
        <div className="fs-trend-image-top"><span>THE FIRSTSIGHT EDIT</span><span>VOL. 01</span></div>
        <figcaption>
          <span className="fs-trend-chapter">{collection.chapter}</span>
          <strong>{collection.headline}</strong>
          <span className="fs-trend-credit">{hero.celebrity} · Photo: {hero.credit} {hero.sourceUrl && <a href={hero.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>}{hero.license && hero.licenseUrl && <> · <a href={hero.licenseUrl} target="_blank" rel="noreferrer">{hero.license}</a></>}</span>
        </figcaption>
      </figure>

      <div className="fs-trend-copy">
        <div className="fs-trend-eyebrow"><span>A WARDROBE OF POSSIBILITIES</span><span aria-hidden="true">✧</span></div>
        <h2 id="fs-trends-title">Tendances<span aria-hidden="true">.</span></h2>
        <p className="fs-trend-subtitle">Explore fashion through time.</p>
        <p className="fs-trend-introduction">A familiar silhouette. An unexpected detail.<br />Find the thread that makes a look your own.</p>

        <div className="fs-trend-collections" role="group" aria-label="Choose an inspiration collection">
          {collections.map((entry, index) => <button key={entry.id} type="button" aria-pressed={selectedId === entry.id} onClick={() => setSelectedId(entry.id)}>
            <span className="fs-trend-number">0{index + 1}</span><span>{entry.title}</span><span aria-hidden="true">↗</span>
          </button>)}
        </div>
        <p className="fs-trend-description" aria-live="polite">{collection.description}</p>
        <div className="fs-trend-actions">
          <button className="fs-button fs-trend-explore" type="button" aria-expanded={boardOpen} aria-controls="fs-trend-board" onClick={() => setBoardOpen(value => !value)}>{boardOpen ? 'Close collection' : 'Explore collection'} <span aria-hidden="true">{boardOpen ? '−' : '+'}</span></button>
          <a href="#fs-recognition" className="fs-trend-upload-link">Start with your photo <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </div>

    <div className="fs-trend-board" id="fs-trend-board" hidden={!boardOpen}>
      {boardOpen && <><div className="fs-trend-board-label"><span>{collection.title} / THE EDIT</span><span>Six looks, one feeling.</span></div><OutfitMasonry key={collection.id} looks={collectionLooks(collection)} savedLookIds={savedLookIds} onToggleSaveLook={onToggleSaveLook} loadingEnabled={false} /></>}
    </div>
  </section>;
}
