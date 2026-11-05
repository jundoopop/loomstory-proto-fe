/**
 * A magazine-style product study: labels frame the image and reveal short floating
 * explanations on demand. Full design notes remain in a separate disclosure.
 * This module owns interaction and geometry; all editorial content comes from the study.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AnalysisCard, ProductAnnotation, RecognizedItem } from '../types';
import './fashion-dossier.css';

interface Props {
  item: RecognizedItem;
  onExplore: () => void;
}

interface Connector {
  id: string;
  path: string;
  startX: number;
  startY: number;
}

/** Keep callouts and the optional full notes in the same reading order. */
function annotationNumber(annotation: ProductAnnotation, cards: AnalysisCard[]) {
  return String(cards.findIndex(card => card.id === annotation.cardId) + 1).padStart(2, '0');
}

/** Render one data-driven study; the parent keys it by item ID to reset selected details. */
export function FashionDossier({ item, onExplore }: Props) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [focusedAnnotation, setFocusedAnnotation] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const [imageRatio, setImageRatio] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imagePlaneRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef(new Map<string, HTMLButtonElement>());
  // Scrolling a keyboard-focused label under the pointer must not replace its explanation.
  const activeId = focusedAnnotation ?? hoveredAnnotation ?? selectedAnnotation;
  const titleId = `fs-dossier-title-${item.id}`;

  /** Recalculate endpoints after wrapping, resizing, or image loading, without fixed pixel paths. */
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const imagePlane = imagePlaneRef.current;
    if (!canvas || !imagePlane) return;

    const measure = () => {
      const bounds = canvas.getBoundingClientRect();
      const image = imagePlane.getBoundingClientRect();
      if (!bounds.width || !image.width) return;
      setCanvasSize({ width: bounds.width, height: bounds.height });
      setConnectors(item.annotations.flatMap(annotation => {
        const label = labelRefs.current.get(annotation.id)?.getBoundingClientRect();
        if (!label) return [];
        // Labels sit beside the photo on desktop, and above/below it on narrow screens.
        const imageWindow = imagePlane.parentElement!.getBoundingClientRect();
        const above = label.bottom <= imageWindow.top;
        const below = label.top >= imageWindow.bottom;
        const fromLeft = label.left + label.width / 2 < image.left + image.width / 2;
        const startX = (above || below ? label.left + label.width / 2 : fromLeft ? label.right : label.left) - bounds.left;
        const startY = (above ? label.bottom : below ? label.top : label.top + label.height / 2) - bounds.top;
        const endX = image.left - bounds.left + image.width * annotation.x / 100;
        const endY = image.top - bounds.top + image.height * annotation.y / 100;
        return [{
          id: annotation.id, startX, startY,
          path: `M ${startX} ${startY} L ${endX} ${endY}`,
        }];
      }));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(imagePlane);
    labelRefs.current.forEach(label => observer.observe(label));
    return () => observer.disconnect();
  }, [item, imageRatio]);

  /** Outside taps dismiss a pinned card; they never move the photo or the surrounding page. */
  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      // A deliberate pointer action ends keyboard-preview ownership, including on this same label.
      setFocusedAnnotation(null);
      if (event.target instanceof Element && !event.target.closest('.fs-dossier-callout, .fs-dossier-point')) {
        setSelectedAnnotation(null); setHoveredAnnotation(null);
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, []);

  /** Click/tap pins a detail, while pointer hover and keyboard focus offer temporary previews. */
  const toggleAnnotation = (id: string) => {
    setSelectedAnnotation(current => current === id ? null : id);
  };

  return <article id="fs-fashion-dossier" className="fs-dossier" aria-labelledby={titleId}>
    <div className="fs-dossier-sheet">
      <div className="fs-dossier-header">
        <div className="fs-dossier-overline"><span>THE LOOMSTORY STUDY</span><span>Illustrated archive</span></div>
        <h3 id={titleId} tabIndex={-1}>{item.name}</h3>
        <p className="fs-dossier-identity"><span>{item.era}</span><span aria-hidden="true">·</span><span>{item.category}</span></p>
        <p className="fs-dossier-intro">{item.summary}</p>
      </div>

      <div className="fs-dossier-canvas" ref={canvasRef} onKeyDown={event => {
        if (event.key === 'Escape') {
          setSelectedAnnotation(null); setHoveredAnnotation(null); setFocusedAnnotation(null);
        }
      }}>
        {/* Connector endpoints follow the rendered labels and original image coordinates. */}
        <svg className="fs-dossier-connectors" viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} aria-hidden="true">
          {connectors.map(connector => <g key={connector.id} className={activeId === connector.id ? 'is-active' : undefined}>
            <path d={connector.path} />
            <circle cx={connector.startX} cy={connector.startY} r="3" />
          </g>)}
        </svg>

        <figure className="fs-dossier-figure">
          <div className={`fs-dossier-image-window${item.analysis.imagePresentation === 'trim-top-space' ? ' is-trimmed' : ''}`}>
            {/* The full image plane keeps data coordinates accurate even when blank studio space is trimmed. */}
            <div className="fs-dossier-image-plane" ref={imagePlaneRef} style={{ '--fs-image-ratio': imageRatio } as CSSProperties}>
              <img src={item.analysis.image} alt={item.analysis.imageAlt} onLoad={event => {
                const image = event.currentTarget;
                setImageRatio(image.naturalWidth / image.naturalHeight || 1);
              }} />
              {item.annotations.map(annotation => <button
                key={annotation.id}
                type="button"
                className={`fs-dossier-point${activeId === annotation.id ? ' is-active' : ''}`}
                style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                aria-label={`Explore ${annotation.label}`}
                aria-pressed={selectedAnnotation === annotation.id}
                aria-expanded={activeId === annotation.id}
                aria-controls={`fs-dossier-detail-${annotation.id}`}
                aria-describedby={activeId === annotation.id ? `fs-dossier-description-${annotation.id}` : undefined}
                onPointerEnter={event => { if (event.pointerType !== 'touch') setHoveredAnnotation(annotation.id); }}
                onPointerLeave={() => setHoveredAnnotation(null)}
                onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setFocusedAnnotation(annotation.id); }}
                onBlur={() => setFocusedAnnotation(null)}
                onClick={() => toggleAnnotation(annotation.id)}
              ><span aria-hidden="true" /></button>)}
              {/* Narrow images use the equivalent large label buttons; preserve these visual anchors. */}
              {item.annotations.map(annotation => <span key={annotation.id}
                className={`fs-dossier-point-marker${activeId === annotation.id ? ' is-active' : ''}`} aria-hidden="true"
                style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }} />)}
            </div>
          </div>
        </figure>

        {item.annotations.map(annotation => {
          const expanded = activeId === annotation.id;
          const labelId = `fs-dossier-label-${annotation.id}`;
          return <div key={annotation.id}
            className={`fs-dossier-callout fs-dossier-callout-${annotation.cardId}${expanded ? ' is-active' : ''}`}
            onPointerEnter={event => { if (event.pointerType !== 'touch') setHoveredAnnotation(annotation.id); }}
            onPointerLeave={() => setHoveredAnnotation(null)}
          >
            <button type="button" id={labelId} className="fs-dossier-feature-label"
              ref={element => { if (element) labelRefs.current.set(annotation.id, element); else labelRefs.current.delete(annotation.id); }}
              aria-expanded={expanded} aria-controls={`fs-dossier-detail-${annotation.id}`}
              aria-describedby={expanded ? `fs-dossier-description-${annotation.id}` : undefined}
              aria-pressed={selectedAnnotation === annotation.id}
              onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setFocusedAnnotation(annotation.id); }}
              onBlur={() => setFocusedAnnotation(null)}
              onClick={() => toggleAnnotation(annotation.id)}
            ><span aria-hidden="true">{annotationNumber(annotation, item.analysis.cards)}</span>{annotation.label}</button>
            {/* Absolute positioning keeps the magazine composition still when a card opens. */}
            <div className="fs-dossier-popover" hidden={!expanded}>
              <section id={`fs-dossier-detail-${annotation.id}`} className="fs-dossier-panel" aria-labelledby={labelId}>
                <h4>{annotation.label}</h4><p id={`fs-dossier-description-${annotation.id}`}>{annotation.detail}</p>
              </section>
            </div>
          </div>;
        })}
      </div>
      <div className="fs-dossier-caption"><span>{item.analysis.image.endsWith('.svg') ? 'Illustrated study · representative silhouette' : 'Studio reference · every detail tells a story'}</span><p>Use a labelled feature to look closer.</p></div>

      {/* Preserve the full authored analysis without crowding the idle magazine view. */}
      <details className="fs-dossier-notes">
        <summary><span>Read the full design notes</span><span aria-hidden="true">+</span></summary>
        <div className="fs-dossier-notes-grid">{item.analysis.cards.map((card, index) => <section key={card.id} className="fs-dossier-note" aria-labelledby={`fs-note-${item.id}-${card.id}`}>
          <div className="fs-dossier-panel-heading"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h4 id={`fs-note-${item.id}-${card.id}`}>{card.title}</h4></div>
          <ul>{card.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>
        </section>)}</div>
      </details>

      {/* Keep resale disabled for the current business model; retain the sample markup for review.
          Restore its currency formatter before re-enabling this section. */}
      {/* <section className="fs-dossier-resale" aria-labelledby={`fs-dossier-resale-${item.id}`}>
        <div className="fs-dossier-panel-heading"><span aria-hidden="true">05</span><h4 id={`fs-dossier-resale-${item.id}`}>Resale value</h4></div>
        <p>{item.analysis.resale.description}</p>
        <div className="fs-dossier-valuation">
          <div><span>Suggested resale range</span><small>Illustrative estimate · condition dependent</small></div>
          <strong>{currency.format(item.analysis.resale.minimum)}<span>–</span>{currency.format(item.analysis.resale.maximum)}</strong>
        </div>
      </section> */}

      <details className="fs-dossier-culture">
        <summary><span><small>CULTURAL SIGNIFICANCE</small><strong>The story behind the piece</strong></span><span className="fs-dossier-culture-toggle" aria-hidden="true">+</span></summary>
        <div className="fs-dossier-culture-article">
          <h4>{item.culture.title}</h4>
          {item.culture.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {item.culture.sources.length > 0 && <div className="fs-dossier-sources"><span>Further reading</span><ul>{item.culture.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span aria-hidden="true">↗</span><span className="fs-sr-only"> (opens in a new tab)</span></a></li>)}</ul></div>}
        </div>
      </details>
      <div className="fs-dossier-footer"><p>A piece of history.<br /><em>A new chapter with you.</em></p><button type="button" onClick={onExplore}>Find similar pieces <span aria-hidden="true">↓</span></button></div>
    </div>
  </article>;
}
