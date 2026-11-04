# FirstSight prototype

Open `/first-sight` from the main or mobile navigation. All three FirstSight sections remain on this route. The original Discover (`/`) and Submit (`/submit`) pages remain available.

## Walk through the continuous page

1. **Tendances — inspiration.** A desktop 50/50 hero pairs a photograph with four collections: 90s Streetwear, Vintage Denim, Retro Cinema, and Iconic Designer Accessories. Selection changes the hero and editorial copy. **Explore collection** opens a six-look board drawn from the sourced reference library.
2. **Discover the Story — photo and dossier.** The desktop layout is 35/65. The existing `fs-upload-panel` stays on the left and is sticky only within this section. Choose a local photo or the Chloé example, then press **Analyze**. Selection alone does not start analysis. The original selected image remains visible through loading and results; Replace, Remove, and Cancel keep the flow controllable.
3. **Find Similar Pieces — shopping.** The selected study supplies a related product edit and an always-visible styling feed. The dossier's **Find similar pieces** button scrolls here. Selecting a product opens its 70/30 detail view inline below the retained grid. Size selection, wardrobe saves, a local bag, and checkout preview remain available. No order or payment is created.

Distinct surfaces, numbered section headers, and spacing separate the three areas like a dashboard. The sections stack on narrow screens. The dossier adapts its magazine view to its own column width, keeping the product image and compact feature labels readable.

## Five selectable studies

Every Analyze run returns the same five prepared choices:

| Study | Example era | Central image |
| --- | --- | --- |
| Chloé Paddington Bag | 2005 design; reissue shown | Supplied product photograph |
| Vintage leather bomber | 1980s inspired | Original silhouette SVG |
| Classic denim jacket | 1990s inspired | Original silhouette SVG |
| Oversized tailored blazer | 1980s–1990s inspired | Original silhouette SVG |
| Vintage workwear jacket | Mid-century inspired | Original silhouette SVG |

Selecting a study updates its dossier and four related offers together, without replacing the uploaded photo. Each idle dossier shows a large central product image surrounded by four compact feature labels connected to the relevant image points. Hover, focus, or tap a label or point to reveal only that detail’s name and short explanation in a floating card; the surrounding layout does not expand. Detailed design concept, key features, craftsmanship, and common materials copy remains in a separate optional disclosure. The resale bar, cultural-story disclosure, and four styling references remain available. SVG connectors follow the rendered elements as the dossier resizes.

Recognition scores, era matches, and valuations are authored sample data. A selected image stays in browser memory and is never uploaded or inspected. The generic garments do not claim a real maker, a verified production date, or a celebrity match.

Chloé's design history and the pictured reissue's specifications link to primary references in the cultural story. The reissue is distinct from the original vintage design. The resale percentages and **€700–€1,000** suggested range remain an illustrative scenario, not measured retention rates or a current market appraisal. Purchase prices, condition, sizes, inventory, and affordable alternatives are fictional offers.

## Persistent styling references

The contextual outfit feed stays beside the selected shopping edit for the whole browsing session. It does not expire or collapse, and there is no manual hide-inspiration mode. Opening product details or the sample bag leaves the underlying board mounted. Switching studies updates both the products and their styling references; a result with no references can use the full catalog width. The previous 45-second timer and its domain modules have been removed.

## Where to edit

| Content or behavior | Owner |
| --- | --- |
| Section coordination, Analyze, cancellation, selected study, inline PDP, cart | `src/pages/FirstSightPage.tsx` |
| Dashboard section surfaces and 35/65 photo/dossier layout | `src/pages/first-sight-flow.css` |
| Section 3 50/50 feed, shared controls, masonry, dialogs | `src/pages/first-sight.css` |
| Trend collections, hero selection, six-look edit | `components/TrendHero.tsx`, `components/trend-hero.css` |
| Local file validation, persistent photo, matching-explanation popover | `components/PhotoUploadPanel.tsx`, `components/upload-workspace.css` |
| Five studies, annotations, cultural copy, related product/reference IDs | `recognition.ts` |
| Chloé example photo, verified copy, sample resale, source links, four styling references | `chloe.ts` |
| Choice buttons and sample scores | `components/RecognitionResults.tsx`, `components/recognition-results.css` |
| Magazine feature labels, floating details, measured connectors, resale bar | `components/FashionDossier.tsx`, `components/fashion-dossier.css` |
| Prices and wardrobe IDs / size, stock, condition enrichment | `src/data/catalog.ts` / `fixtures.ts` |
| Photograph source metadata and dimensions | `looks.ts`, `chloe.ts`, [source record](first-sight-sources.md) |

Paths without `src/` are relative to `src/features/first-sight/`. The older `ItemAnalysisResult` presentation has been replaced by `FashionDossier`; it is no longer part of the active feature.

## Local media

Run `npm run setup:analysis-media` after cloning. It prefers originals in ignored `src/images/`, copies them into ignored `public/local-media/chloe/`, and uses reviewed download URLs as fallbacks. Source originals are preserved. The active flow uses the product image and references 01–04. The missing TV still, reference 05, is optional and excluded; its absence does not make setup fail.

Keep the supplied photographs and screenshots containing them out of Git. The original garment-study and alternative-bag SVGs are tracked source artwork. The earlier Commons reference library retains its existing tracked assets and per-image credits. See [the source record](first-sight-sources.md) for exact filename mappings. An ignored public asset is still copied into a local Vite build when present; Git exclusion does not remove it from a future deployment.

## Connect services later

The page accepts an injectable gateway defined in `services/contracts.ts`:

```ts
interface FirstSightGateway {
  discover(photo: PhotoInput, signal: AbortSignal): Promise<DiscoveryResult>;
}

interface DiscoveryResult {
  items: RecognizedItem[];
}
```

`services/prototype.ts` waits 900 ms and returns local studies. Each `RecognizedItem` contains identity, analysis cards and resale metadata, annotations, cultural context, products, and looks. Presentation components consume that result rather than calling providers.

For a live adapter:

- Add an explicit upload boundary: a browser object URL is not a server-readable image address.
- Map provider output into the study contract. Add live/uncertain/unknown statuses and a valuation source instead of presenting the current prototype fields as verified results.
- Honor `AbortSignal`; cancelled or older responses must not replace the current photo's result. Return useful empty-result and failure states.
- Register live product IDs with the shared catalog/wardrobe boundary. Keep source attribution and image dimensions with every reference.
- Keep provider secrets server-side. Upload storage, authentication, actual inventory, and checkout each need their own integration; replacing `discover` alone does not enable them.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run build`. The recognition tests check independent shopping edits, wardrobe-compatible IDs, annotation targets, bundled study assets, and cancellation. Saved-item tests cover browser-storage rules.

For browser review:

- Switch each Tendances collection, open its board, and follow the upload anchor.
- Choose a sample and a real local file. Confirm that **Analyze** is explicit and the selected image stays visible through all results.
- Exercise empty, oversized, unsupported, corrupt, and valid files; Replace, Remove, Cancel, and retry. Old responses must not restore abandoned results.
- Select all five studies. Check their imagery, four feature labels, floating explanations on hover/focus/tap, optional detailed notes, cultural story, resale range, and different related edits. Explanations must be hidden at rest and must not shift the layout when shown.
- Confirm the upload panel's sticky boundary ends with Section 2; checking shopping or an inline PDP must leave earlier sections intact.
- Leave the styling board idle beyond the former 45-second threshold. It must stay visible, including after viewing a product, opening/closing the bag, and switching studies.
- Check available and unavailable sizes, saves across routes, stock-bound quantities, and the local checkout preview.
- Review desktop and narrow mobile widths, reduced motion, keyboard navigation, overflow, image loading, and console errors. Keep screenshots containing supplied photos in temporary local storage.

Validated on 2026-11-04 after the sketch feedback: the production build and all nine current tests pass. Browser checks cover hidden-at-rest explanations, hover without layout movement, pointer access to the floating card, keyboard focus/Escape, touch toggling/outside dismissal, and full design notes. All five studies retain their styling references beyond 60 seconds and through product/bag views. Layouts at 320, 390, 768, 1024, and 1440 px have no document overflow; no application errors were reported. Screenshots remain in temporary local storage.

## Branch workflow

Work remains on `new-analysis`, derived from the `new-home-page` checkpoint. Review there before the intended merge sequence: `new-analysis` → `new-home-page` → `main`. Local implementation and verification do not merge, push, or publish these branches.
