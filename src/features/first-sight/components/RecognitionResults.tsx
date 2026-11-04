/** Compact selection strip; selection is page-owned so the dossier and shopping edit update together. */
import type { RecognizedItem } from '../types';
import './recognition-results.css';

interface Props {
  items: RecognizedItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Each complete card is one keyboard-accessible selection control with a visible demo score. */
export function RecognitionResults({ items, selectedId, onSelect }: Props) {
  return <div className="fs-recognition-results">
    <div className="fs-recognition-topline"><span>{String(items.length).padStart(2, '0')} STORIES TO DISCOVER</span><span>Sample recognition</span></div>
    <ul className="fs-recognition-strip" aria-label="Choose a fashion story">
      {items.map((item, index) => <li key={item.id}>
        <button type="button" className={`fs-recognition-card${selectedId === item.id ? ' is-selected' : ''}`} aria-pressed={selectedId === item.id} aria-controls="fs-fashion-dossier" onClick={() => onSelect(item.id)}>
          <span className="fs-recognition-image"><img src={item.analysis.image} alt="" className={item.analysis.imagePresentation === 'trim-top-space' ? 'is-trimmed' : undefined} /><span className="fs-recognition-index">{String(index + 1).padStart(2, '0')}</span>{selectedId === item.id && <span className="fs-recognition-selected" aria-label="Selected">✓</span>}</span>
          <span className="fs-recognition-copy"><span className="fs-recognition-category">{item.category}</span><strong>{item.name}</strong><span className="fs-recognition-era">{item.era}</span><span className="fs-recognition-description">{item.summary}</span><span className="fs-recognition-score"><span>Demo match</span><span>{Math.round(item.confidence)}%</span></span><span className="fs-recognition-action">Explore story <span aria-hidden="true">↗</span></span></span>
        </button>
      </li>)}
    </ul>
    <p className="fs-recognition-note">Five curated examples to explore. Match scores illustrate the experience.</p>
  </div>;
}
