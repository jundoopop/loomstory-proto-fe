/**
 * Completed analysis content for PhotoUploadPanel's existing section.
 * Copy and valuation belong to the gateway result; this component only presents
 * them and delegates navigation to FirstSightPage. Styles: item-analysis.css.
 */
import type { AnalysisCard, GarmentIdentity, ItemAnalysis } from '../types';
import './item-analysis.css';

interface Props {
  identity: GarmentIdentity;
  analysis: ItemAnalysis;
  onExplore: () => void;
  onChangePhoto: () => void;
}

/** Keep the four editorial cards consistent while leaving their full copy visible. */
function ExplanationCard({ card, number }: { card: AnalysisCard; number: number }) {
  const headingId = `fs-analysis-${card.id}`;
  return <article className="fs-analysis-card" aria-labelledby={headingId}>
    <div className="fs-analysis-card-heading">
      <span aria-hidden="true">{String(number).padStart(2, '0')}</span>
      <h3 id={headingId}>{card.title}</h3>
    </div>
    <ul>{card.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>
  </article>;
}

/** Render the authored item result without changing the upload panel's outer frame. */
export function ItemAnalysisResult({ identity, analysis, onExplore, onChangePhoto }: Props) {
  const currency = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: analysis.resale.currency, maximumFractionDigits: 0,
  });

  return <div className="fs-analysis-result">
    <div className="fs-analysis-topline">
      <span className="fs-analysis-status"><span aria-hidden="true">✓</span> ITEM DETECTED</span>
      <span>Sample result</span>
    </div>
    <h2 id="fs-upload-title" tabIndex={-1}>{identity.brand} {identity.name}</h2>
    <dl className="fs-analysis-identity">
      <div><dt>Brand</dt><dd>{identity.brand}</dd></div>
      <div><dt>Introduced</dt><dd>{identity.year}</dd></div>
    </dl>

    {/* The result photograph is fixture data, independent of the user's local upload preview. */}
    <figure className="fs-analysis-photo">
      <img src={analysis.image} alt={analysis.imageAlt} />
      <figcaption>A closer look at an icon.</figcaption>
    </figure>
    <p className="fs-analysis-introduction">The design, the details, and the story behind the piece.</p>
    <p className="fs-analysis-disclosure">An authored example for this prototype. Your photo has not been analyzed.</p>

    <div className="fs-analysis-cards">
      {analysis.cards.map((card, index) => <ExplanationCard key={card.id} card={card} number={index + 1} />)}

      {/* Resale spans the full panel width, following all four design explanation cards. */}
      <article className="fs-analysis-card fs-analysis-resale" aria-labelledby="fs-analysis-resale-title">
        <div className="fs-analysis-card-heading">
          <span aria-hidden="true">05</span>
          <h3 id="fs-analysis-resale-title">Resale value</h3>
        </div>
        <p>{analysis.resale.description}</p>
      </article>
    </div>

    <div className="fs-analysis-price" aria-label="Suggested resale price, prototype estimate">
      <span>Suggested resale price</span>
      <strong>{currency.format(analysis.resale.minimum)}–{currency.format(analysis.resale.maximum)}</strong>
      <small>Prototype estimate · illustrative range</small>
    </div>

    {/* Explicit continuation lets readers scroll through every card before shopping begins. */}
    <div className="fs-analysis-actions">
      <button type="button" className="fs-button fs-primary" onClick={onExplore}>Explore buying options <span aria-hidden="true">↗</span></button>
      <button type="button" className="fs-text-button" onClick={onChangePhoto}>Analyze another photo</button>
    </div>
  </div>;
}
