# FirstSight prototype

Open `/first-sight` from the main or mobile navigation. Both FirstSight sections remain on this route. Discover (`/`) now owns the editorial inspiration collections; Submit (`/submit`) remains available. Recognition, prices, stock and valuations are deterministic prototype data; the application does not authenticate garments or place orders.

## Walk through the continuous page

1. **Discover the Story — photo and dossier.** The desktop layout is 35/65. The `fs-upload-panel` stays on the left and is sticky only within this section. Choose a local photo or the Chloé example, then press **Analyze**. Selection alone does not start analysis. The selected image remains visible through loading and results; Replace, Remove and Cancel keep the flow controllable.
2. **Find Your Piece — archive shopping.** The selected study supplies an archive edit beside the persistent Style Journal. Selecting an archive offer opens its 70/30 detail view inline below the retained grid. Choose an available size to add it to the local bag or preview checkout. **Explore similar styles** opens The Inspire from either the marketplace toolbar or archive PDP. Modern style matches appear in this opt-in drawer rather than the default grid or PDP sidebar.

Distinct surfaces, numbered section headers and spacing separate the two areas like a dashboard. The sections stack on narrow screens. The dossier adapts its magazine view to its own column width, keeping the central image and compact feature labels readable.

## Start with inspiration on Discover

Discover is a hybrid homepage: a 50/50 editorial cover, an immediately visible six-photo collection,
Vault search, four featured products and links to Stories and submission. Choose 90s Streetwear,
Vintage Denim, Retro Cinema or Iconic Designer Accessories. Selection updates the cover and finite
board together; `?collection=<id>` preserves the selected edit through browser history. The board
uses three columns above 1000 px, two at 600–1000 px and one below 600 px. It has no regional filter,
photo search or saved-only mode.

Open a photograph's details or use the cover action, then choose **Explore in FirstSight**. The
`/first-sight?look=<id>` link resolves a canonical authored reference, displays its celebrity/title
and credits, and leaves **Analyse** explicit. A disclosure beside the action explains that results
are the prepared five studies rather than an identification of the outfit. Source links remain
separate from the hand-off action.

Reloading a valid hand-off URL restores the reference without analysing it. An unknown ID leaves the
normal upload/sample workspace available with an unavailable-reference notice. Replace and Remove
work within the current visit and ordinary saved-heart rerenders do not restore the original image.
Changing the reference ID starts a fresh workspace and cancels obsolete work. Browser Back returns
to the URL-selected Discover collection.

Saved photograph hearts are App-visit state shared by Discover and the contextual FirstSight feed,
including all forty Commons and four Chloé references. They survive route navigation and reset on a
full reload. They are separate from durable product wardrobe saves and FirstSight-only Inspire saves.

## Five selectable studies

Every successful Analyze run returns the same five prepared choices:

| Study | Example era | Central image | Archive offers | Inspire offers |
| --- | --- | --- | ---: | ---: |
| Chloé Paddington Bag | 2005 design; reissue shown | Supplied product photograph | 3 | 1 |
| Vintage leather bomber | 1980s inspired | Original silhouette SVG | 3 | 1 |
| Classic denim jacket | 1990s inspired | Original silhouette SVG | 3 | 1 |
| Oversized tailored blazer | 1980s–1990s inspired | Original silhouette SVG | 3 | 1 |
| Vintage workwear jacket | Mid-century inspired | Original silhouette SVG | 2 | 2 |

Selecting a study updates its dossier, archive edit, Inspire edit and four contextual references together without replacing the uploaded photo. The counts above are per-study memberships; the shared fixture catalogue contains eighteen unique offers.

Each idle dossier shows a central product image surrounded by four compact feature labels connected to image points. Hover, focus or tap reveals that detail's name and short explanation in a floating card without expanding the layout. Design concept, key features, craftsmanship and common materials remain in a separate optional disclosure. The resale bar, cultural-story disclosure and four contextual references remain available. SVG connectors follow the rendered elements as the dossier resizes.

In dossier containers up to 329 px wide, overlapping image hit areas become decorative markers;
all four large labelled controls retain the same actions and keyboard access. Coordinates and
connectors are unchanged. Keyboard focus takes precedence over a coincidental pointer hover, and
deliberate pointer input returns ownership to pointer interaction.

Recognition scores, era matches and valuations are authored sample data. The selected image stays in browser memory and is never uploaded or inspected by a recognition model. Generic garments do not claim a real maker, verified production date or celebrity product match.

Chloé's design history and the pictured reissue's specifications link to primary references in the cultural story. The reissue is distinct from the original vintage design. The resale percentages and **€700–€1,000** suggested range remain an illustrative scenario, not measured retention rates or a current market appraisal. Purchase prices, conditions, sizes, inventory and partner-preview offers are fictional.

## Archive and Inspire action boundaries

`selected.commerce.archive` supplies the default marketplace and archive PDP. `selected.commerce.styleMatches` supplies The Inspire. Explicit `commerce.track` metadata chooses the surface; price does not decide whether an offer belongs to the archive. Cards use Vintage original, Designer reissue, Archive study or Partner-offer preview labels as appropriate.

Archive PDP, save and bag actions resolve membership against the selected archive edit. `resolveArchivePurchase` re-resolves the canonical product and SKU and requires positive integer stock before a bag update. Quantities cannot exceed that canonical sample stock. Callback objects cannot substitute partner offers, prices or invented inventory.

The Inspire drawer remains mounted once for the FirstSight visit. Its per-product SKU choices survive closing, reopening and switching studies. Style saves live separately in `FirstSightPage`; they never call the shared wardrobe callback. A partner preview requires an available size and produces local feedback without visiting a partner, reserving stock or changing the archive bag. Style saves and size choices reset on a fresh mounted FirstSight visit.

Archive wardrobe saves use the existing app-owned browser storage and survive navigation/reload when storage is available. The sample bag and style saves remain page-local. Saved inspiration/contextual looks now belong to `App`: they are shared across Discover and FirstSight navigation, reset on a full reload and never enter product wardrobe storage. Photo changes and study switches retain the visit's bag while closing stale product or Inspire views. The bag and Inspire are coordinated so they do not remain open together.

Both Inspire triggers synchronously focus their button before opening, preserving return focus on pointer-driven WebKit as well as keyboard activation. Ordinary dismissal returns there; a removed or hidden opener uses a page-owned persistent fallback. The native bag close event is reconciliation-only: explicit Escape, close-button and backdrop actions request host state changes, so a queued earlier close cannot cancel a newly requested opening.

If an archive stream is empty, show the archive empty state without substituting partner offers. If the style stream is empty, hide the Inspire trigger. These boundaries apply to FirstSight; the shared catalogue and global Vault migration remain a separate scope.

## Persistent styling references

The contextual feed stays beside the selected archive edit for the browsing session. It does not expire or collapse, and there is no manual hide-inspiration mode. Opening the PDP, bag or Inspire leaves the underlying journal mounted. Dynamic batch injection pauses while those views are open. Switching studies changes the edit and references together; no-reference data can use the full catalogue width. The former 45-second collapse timer and its domain modules have been removed.

**The Style Journal** uses a muted wine surface, ivory photo cards, burgundy headings, natural image proportions and compact captions. Two-column masonry becomes one column when the panel is too narrow. The marketplace retains larger prices and filled **View piece** controls as the primary shopping destination. Edit the journal presentation in `components/outfit-magazine.css`.

Context cards, their detail dialogs and PDP notes display the authored relationship: Styling inspiration, Runway reference or Same design. Geographic labels remain on Discover inspiration cards, which have no regional filter in this finite edit. These labels do not establish ownership, endorsement, authentication or the same production edition. Sources and credits stay with each photograph; see the [relationship and source record](first-sight-sources.md#cultural-relationship-metadata).

## Where to edit

| Content or behaviour | Owner |
| --- | --- |
| Section coordination, analysis/cancellation, selected study, archive actions, bag and Inspire visibility | `src/pages/FirstSightPage.tsx` |
| Dashboard surfaces, 35/65 layout, archive toolbar and Inspire trigger | `src/pages/first-sight-flow.css` |
| Section 2 50/50 edit/journal, feature controls and cart | `src/pages/first-sight.css` |
| Discover collections, cover and always-visible six-look board | `src/features/discover/collections.ts`, `src/features/discover/components/TrendHero.tsx`, `trend-hero.css` |
| Canonical reference hand-off / shared inspiration saves | `src/features/discover/references.ts` / `src/App.tsx` |
| Reusable photo board/dialog styles | `components/outfit-masonry.css`, imported by `OutfitMasonry` |
| Local validation/decoding, photo and explanation popover | `components/PhotoUploadPanel.tsx`, `components/upload-workspace.css` |
| Authored studies and explicit archive/style/reference IDs | `recognition.ts` / `recognitionStudies` |
| Chloé photograph, factual/source copy, sample resale and four references | `chloe.ts` |
| Choice cards and sample scores | `components/RecognitionResults.tsx`, `components/recognition-results.css` |
| Magazine labels, floating details, connectors and resale bar | `components/FashionDossier.tsx`, `components/fashion-dossier.css` |
| Prices and wardrobe IDs / stock, variant and condition enrichment | `src/data/catalog.ts` / `fixtures.ts` |
| Track predicates, listing/relationship labels and canonical archive SKU resolution | `commerce.ts` |
| Archive cards / archive PDP with cultural notes and opt-in prompt | `components/PurchaseGrid.tsx` / `components/ProductDetailPanel.tsx`, `components/product-detail.css` |
| Inspire modal lifecycle, retained SKU choices and partner-preview cards | `components/StyleMatchDrawer.tsx`, `components/style-match-drawer.css` |
| Local bag quantity controls and checkout preview | `components/CartPreview.tsx` |
| Ordered context lookup / delayed, cancellable study composition | `services/content/prototype.ts` / `services/prototype.ts` |
| Photograph metadata, dimensions and relationships | `looks.ts`, `chloe.ts`, [source record](first-sight-sources.md) |

Paths without `src/` are relative to `src/features/first-sight/`. Use the [code guide](code-guide.md) for named functions and state lifetimes. The older `ItemAnalysisResult`, flattened `RecognizedItem.products` and `PurchaseOption.affordable` bridge are absent from the active feature.

## Local media and portable test artwork

For a local review with the supplied Chloé photographs, run `npm run setup:analysis-media`. It prefers originals in ignored `src/images/`, copies them into ignored `public/local-media/chloe/` and uses reviewed download URLs as fallbacks. Source originals are preserved. Active references are 01–04; missing TV still 05 is optional and excluded.

Keep supplied photographs and screenshots containing them out of Git. Original garment-study and alternative-bag SVGs remain tracked, together with the attributed Commons library. An ignored public asset is still copied into a local Vite build when present; Git exclusion does not remove it from a future deployment.

The repository-owned browser suite does not require those private files or media downloads. `tests/browser/helpers/media.ts` substitutes only `/local-media/chloe/*` with the original generated `tests/browser/fixtures/test-photo.png`. Tracked assets load normally and unexpected failures remain test errors. This verifies controls/layout with portable artwork; it does not establish that the exact supplied photograph rendered correctly. Check real-photo framing separately when the local media is present. Reports, screenshots and traces are ignored generated output.

## Provider composition and future services

The page accepts `FirstSightGateway` through its `gateway` prop. `createPrototypeGateway` keeps the 900 ms demonstration delay, then requests references for every canonical `RecognitionStudy` through an injected `ContextContentProvider`. Concurrent completion preserves authored study order. The local provider preserves requested reference order, returns fresh arrays and rejects missing, repeated or ambiguous IDs instead of silently omitting references.

```ts
interface FirstSightGateway {
  discover(photo: PhotoInput, signal: AbortSignal): Promise<DiscoveryResult>;
}

interface DiscoveryResult {
  items: RecognizedItem[];
}

interface CommerceEdit {
  archive: PurchaseOption[];
  styleMatches: PurchaseOption[];
}
```

Each resolved item contains identity, analysis/resale, annotations, culture, `commerce` and resolved `looks`. Authored input uses `contextReferenceIds`; the UI result does not expose that unresolved lookup list. `recognition.ts` supplies the studies, the content provider resolves references and the gateway assembles the complete result. The retired synchronous `recognitionItems`, `toRecognizedItem` and `looksFor` bridge is no longer used.

Cancellation is normalised to `AbortError`, releases the gateway's timers/listeners and prevents obsolete results from replacing current work. The gateway stops waiting promptly even if an injected provider ignores its signal; stopping underlying work still requires the provider to honour cancellation. Provider failure rejects the complete analysis and uses the page's error/retry state while retaining the selected photograph. There is no silent partial-success policy.

For a future live adapter:

- Add an explicit upload boundary: a browser object URL is not a server-readable image address.
- Validate untrusted responses before mapping into typed studies and references. TypeScript does not validate network data.
- Add live/uncertain/unknown statuses and sourced valuations rather than presenting prototype fields as verified results.
- Honour `AbortSignal`, retain source attribution/dimensions and register live IDs with the shared catalogue/wardrobe boundary.
- Keep credentials server-side. Storage, authentication, inventory and checkout remain separate integrations.

The [future content-adapter guide](../src/features/first-sight/services/content/providers/README.md) records Instagram, YouTube, Commons and licensed-curator connection points, failure policy and image/embed rendering boundaries. No external provider is connected by the current prototype.

## Repeatable verification

Use Node 22.13.0 or newer. From the repository root:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npm run typecheck:browser
npm test
npm run test:browser
npm run test:browser:all
npm run test:browser:a11y
npm run build
npm run test:browser:preview
```

`npm test` runs the Node contracts without a browser server. `test:browser` runs the Chromium behaviour matrix; `test:browser:all` adds the declared Firefox/WebKit core projects. The runner owns a server on port 5183; `FIRST_SIGHT_TEST_PORT` changes that port. `test:browser:preview` requires the current `dist/` build and owns port 4183, configurable with `FIRST_SIGHT_PREVIEW_PORT`. An occupied port fails clearly rather than reusing an unrelated server. Browser TypeScript is checked separately because Playwright transpilation alone is not a typecheck.

The tests use visible roles/labels, independent expected edits and a development-only injected-data host. They cover archive/Inspire isolation, persistence, stock, upload validation/cancellation, failure/retry, stale SKUs and modal transitions. The harness is not imported into the production application. Playwright reports and traces live in ignored `playwright-report/` and `test-results/`.

On macOS, the Firefox worker uses disposable app data to avoid reading protected personal Firefox data. macOS can retain protected folders inside that temporary data; access-only cleanup failures emit a warning rather than changing permissions. Other cleanup failures still fail the runner.

### Current checkpoint: P18, 5 November 2026

The Discover renewal and reference hand-off are complete and approved for Git delivery. Clean installation,
both TypeScript checks, 40 Node tests and the 62-module production build pass. The development
matrix passes 128 project executions of 42 unique scenarios across nine projects, with no failures,
skips, flakes or runner errors. Six production-preview checks pass.

The 38 accessibility project executions include 85 scans with zero reported violations. Axe retains
74 incomplete contrast-rule occurrences and 82 incomplete label/name-rule occurrences across states;
these are repeated rule occurrences, not 156 unique defects. Manual judgement remains necessary,
and automation does not establish complete conformance. Supplemental breakpoint, query-navigation,
Chloé-save and exact local-photo checks are recorded in the [Discover verification record](discover-verification.md).
Actual Safari, physical devices and named screen readers remain unverified.

### Historical checkpoint: P16, 5 November 2026

At P16, the existing **35 Node tests**, both TypeScript checks, clean installation and production build passed.
That development matrix passed **74 project executions across nine projects**, including
**19 accessibility executions and 55 axe state scans with zero reported violations**. Three additional
production-preview checks passed. See the [measured verification record](first-sight-verification.md). P17 delivered this checkpoint as `d32ef3c`; [P18 checks](discover-verification.md) are recorded separately and must verify the changed route ownership.

The forty-five recorded workwear contrast nodes are corrected, with further sold-out/topline fixes,
known hero-text backings and reflow at doubled text sizes. Actual local photographs were separately
inspected at 1440/390/320 px. WebKit is engine coverage rather than actual Safari; touch is emulated;
screen-reader testing remains unperformed. Incomplete image-backed scan checks remain documented;
passing automation does not establish complete accessibility conformance.

### Historical verification: 4 November 2026

After the sketch feedback, the production build and the nine tests available at that checkpoint passed. Browser checks covered hidden-at-rest explanations, floating-card pointer/keyboard/touch behaviour, Escape/outside dismissal and full design notes. The five studies retained references beyond 60 seconds and through product/bag views. Checked widths were 320, 390, 768, 1024 and 1440 px. Those historical counts do not describe the current suite.

The [4 November engineering and consumer-interface review](first-sight-review-2026-11-04.md) remains a historical assessment. Use the current [verification checklist](verification-checklist.md) and [P13–P16 activity ledger](plans/first-sight-p13-p16-plan.md) for ongoing work.

## Branch workflow

P5–P12 were committed as `0b4328086e8b44a85ddf3085a44ada69c4ff0c88`, pushed on `new-analysis`, then fast-forward merged and pushed to `new-home-page` on 5 November 2026. `main` remains at the earlier checkpoint.

P17 committed the reviewed P13–P16 implementation as `d32ef3c3f700f936b409c06a5dfa7cde4f6b9252` and pushed it to `origin/new-analysis` on 5 November 2026. No `new-home-page` or `main` merge was performed for that checkpoint. The approved [P18 renewal](plans/discover-p18-plan.md) begins there and remained uncommitted through review. The user subsequently explicitly authorised its commit, push and integration through `new-home-page` into `main`. The detailed [commit message](plans/discover-p18-commit-message.txt) records the changes, verification and boundaries.
