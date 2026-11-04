/**
 * An interactive product study, composed from the selected recognition fixture.
 * Content lives in the discovery provider; this module owns annotation interaction
 * and the measured SVG connections between the image and its explanatory panels.
 */
import { useLayoutEffect, useRef, useState } from 'react';
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

/** Numbering follows the explanatory panels so points and text share one reading order. */
function annotationNumber(annotation: ProductAnnotation, cards: AnalysisCard[]) {
  return String(cards.findIndex(card => card.id === annotation.cardId) + 1).padStart(2, '0');
}

/** Render one data-driven study; the parent keys it by item ID to reset selected details. */
export function FashionDossier({ item, onExplore }: Props) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [previewAnnotation, setPreviewAnnotation] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const [imageRatio, setImageRatio] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imagePlaneRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef(new Map<string, HTMLElement>());
  const activeId = previewAnnotation ?? selectedAnnotation;
  const activeAnnotation = item.annotations.find(annotation => annotation.id === activeId);
  const titleId = `fs-dossier-title-${item.id}`;
  const detailId = `fs-dossier-detail-${item.id}`;
  const currency = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: item.analysis.resale.currency, maximumFractionDigits: 0,
  });

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
        const panel = panelRefs.current.get(annotation.cardId)?.getBoundingClientRect();
        if (!panel) return [];
        const fromLeft = panel.left < image.left;
        const startX = (fromLeft ? panel.right : panel.left) - bounds.left;
        const endX = image.left - bounds.left + image.width * annotation.x / 100;
        const endY = image.top - bounds.top + image.height * annotation.y / 100;
        // Use the nearest panel edge height so lower connectors never cross the detail caption.
        const startY = Math.max(panel.top + 20 - bounds.top, Math.min(endY, panel.bottom - 20 - bounds.top));
        const imageEdge = (fromLeft ? image.left : image.right) - bounds.left;
        const elbowX = startX + (imageEdge - startX) * 0.55;
        const approachX = endX + (fromLeft ? -17 : 17);
        return [{
          id: annotation.id, startX, startY,
          // Stop before the numbered button; its circle is the endpoint, not a line through its label.
          path: `M ${startX} ${startY} H ${elbowX} L ${approachX} ${endY}`,
        }];
      }));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(imagePlane);
    panelRefs.current.forEach(panel => observer.observe(panel));
    return () => observer.disconnect();
  }, [item, imageRatio]);

  /** A tap or keyboard activation pins a detail; hover/focus temporarily previews another. */
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

      <div className="fs-dossier-canvas" ref={canvasRef}>
        {/* These paths follow actual element geometry. They never occupy a text panel. */}
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
                aria-controls={detailId}
                onPointerEnter={event => { if (event.pointerType !== 'touch') setPreviewAnnotation(annotation.id); }}
                onPointerLeave={() => setPreviewAnnotation(null)}
                onFocus={() => setPreviewAnnotation(annotation.id)}
                onBlur={() => setPreviewAnnotation(null)}
                onClick={() => toggleAnnotation(annotation.id)}
                onKeyDown={event => { if (event.key === 'Escape') { setSelectedAnnotation(null); setPreviewAnnotation(null); } }}
              ><span>{annotationNumber(annotation, item.analysis.cards)}</span></button>)}
            </div>
          </div>
          <figcaption><span aria-hidden="true">✦</span> {item.analysis.image.endsWith('.svg') ? 'Illustrated study · representative silhouette' : 'Studio reference · every detail tells a story'}</figcaption>
          <div id={detailId} className={`fs-dossier-feature-detail${activeAnnotation ? ' is-active' : ''}`} aria-live="polite" aria-atomic="true">
            <span className="fs-dossier-detail-label">{activeAnnotation ? `DETAIL ${annotationNumber(activeAnnotation, item.analysis.cards)}` : 'LOOK A LITTLE CLOSER'}</span>
            <strong>{activeAnnotation?.label ?? 'Explore the details'}</strong>
            <p>{activeAnnotation?.detail ?? 'Hover, focus, or tap a numbered point to uncover the thinking behind the piece.'}</p>
          </div>
        </figure>

        {item.analysis.cards.map((card, index) => {
          const annotation = item.annotations.find(point => point.cardId === card.id);
          const highlighted = activeAnnotation?.cardId === card.id;
          return <section
            key={card.id}
            ref={element => { if (element) panelRefs.current.set(card.id, element); else panelRefs.current.delete(card.id); }}
            className={`fs-dossier-panel fs-dossier-panel-${card.id}${highlighted ? ' is-active' : ''}`}
            aria-labelledby={`fs-dossier-${item.id}-${card.id}`}
            onPointerEnter={event => { if (annotation && event.pointerType !== 'touch') setPreviewAnnotation(annotation.id); }}
            onPointerLeave={() => setPreviewAnnotation(null)}
          >
            <div className="fs-dossier-panel-heading"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h4 id={`fs-dossier-${item.id}-${card.id}`}>{card.title}</h4></div>
            <ul>{card.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>
            {annotation && <button type="button" className="fs-dossier-detail-link"
              aria-pressed={selectedAnnotation === annotation.id} aria-controls={detailId}
              onFocus={() => setPreviewAnnotation(annotation.id)} onBlur={() => setPreviewAnnotation(null)}
              onClick={() => toggleAnnotation(annotation.id)}
            >{annotation.label}<span aria-hidden="true">↗</span></button>}
          </section>;
        })}
      </div>

      {/* Resale remains explicitly illustrative until a marketplace-backed provider replaces the fixture. */}
      <section className="fs-dossier-resale" aria-labelledby={`fs-dossier-resale-${item.id}`}>
        <div className="fs-dossier-panel-heading"><span aria-hidden="true">05</span><h4 id={`fs-dossier-resale-${item.id}`}>Resale value</h4></div>
        <p>{item.analysis.resale.description}</p>
        <div className="fs-dossier-valuation">
          <div><span>Suggested resale range</span><small>Illustrative estimate · condition dependent</small></div>
          <strong>{currency.format(item.analysis.resale.minimum)}<span>–</span>{currency.format(item.analysis.resale.maximum)}</strong>
        </div>
      </section>

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
