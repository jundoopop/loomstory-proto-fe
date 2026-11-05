/** Compact selection strip; selection is page-owned so the dossier and shopping edit update together. */
import type { OutfitExample, RecognizedItem } from '../types';
import './recognition-results.css';

interface Props {
  items: RecognizedItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  outfit?: OutfitExample;
}

/** Each complete card is one keyboard-accessible selection control with a visible demo score. */
export function RecognitionResults({ items, selectedId, onSelect, outfit }: Props) {
  return <div className={`fs-recognition-results${outfit ? ' is-outfit' : ''}`}>
    <div className="fs-recognition-topline"><span>{String(items.length).padStart(2, '0')} {outfit ? 'PIECES IN THIS LOOK' : 'STORIES TO DISCOVER'}</span><span>{outfit ? 'Curated example' : 'Sample recognition'}</span></div>
    <ul className="fs-recognition-strip" aria-label="Choose a fashion story">
      {items.map((item, index) => <li key={item.id}>
        <button type="button" data-item-id={item.id} className={`fs-recognition-card${selectedId === item.id ? ' is-selected' : ''}`} aria-pressed={selectedId === item.id} aria-controls="fs-fashion-dossier" onClick={() => onSelect(item.id)}>
          <span className="fs-recognition-image"><img src={item.analysis.image} alt="" className={item.analysis.imagePresentation === 'trim-top-space' ? 'is-trimmed' : undefined} /><span className="fs-recognition-index">{String(index + 1).padStart(2, '0')}</span>{selectedId === item.id && <span className="fs-recognition-selected" aria-label="Selected">✓</span>}</span>
          <span className="fs-recognition-copy"><span className="fs-recognition-category">{item.category}{outfit?.primaryItemId === item.id ? ' · Featured piece' : ''}</span><strong>{item.name}</strong><span className="fs-recognition-era">{item.era}</span><span className="fs-recognition-description">{item.summary}</span>{outfit ? <span className="fs-recognition-evidence">Published model · curated association</span> : item.confidence !== undefined && <span className="fs-recognition-score"><span>Demo match</span><span>{Math.round(item.confidence)}%</span></span>}<span className="fs-recognition-action">Explore story <span aria-hidden="true">↗</span></span></span>
        </button>
      </li>)}
    </ul>
    <p className="fs-recognition-note">{outfit ? 'Real collection models, curated to this campaign photograph. Select a piece to explore its design; all pieces remain in the shopping edit.' : 'Five curated examples to explore. Match scores illustrate the experience.'}</p>
  </div>;
}
