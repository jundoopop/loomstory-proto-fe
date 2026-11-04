# LoomStory code guide

This guide covers the active React/Vite application. Start with the change-location map, then open the relevant module. Module headers describe ownership; function comments explain transitions and constraints; CSS section comments identify the visual area.

## Find the change you want to make

| Change | Where to edit | Main controls |
| --- | --- | --- |
| Routes, desktop navigation, mobile shortcuts | [App.tsx](../src/App.tsx) | Route registry and both navigation lists |
| Site palette, fonts, shell, original-page styling | [styles.css](../src/styles.css) | `:root`, shared typography, header/footer |
| Continuous FirstSight flow | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | `changePhoto`, `analyze`, `selectRecognition`, `openProduct`, `closeProduct` |
| Continuous section layout and Section 2 35/65 split | [first-sight-flow.css](../src/pages/first-sight-flow.css) | `.fs-recognition-layout`, sticky boundary, section headings, responsive rules |
| Section 3 shopping/feed layout and shared FirstSight controls | [first-sight.css](../src/pages/first-sight.css) | `.fs-discovery`, `.fs-discovery-focused`, masonry, buttons, dialogs |
| Tendances collections, hero photo, six-look board | [TrendHero.tsx](../src/features/first-sight/components/TrendHero.tsx), [trend-hero.css](../src/features/first-sight/components/trend-hero.css) | `collections`, `collectionLooks`, collection selection |
| File formats, 5 MB limit, local decoding, persistent photo | [PhotoUploadPanel.tsx](../src/features/first-sight/components/PhotoUploadPanel.tsx), [upload-workspace.css](../src/features/first-sight/components/upload-workspace.css) | `acceptedTypes`, `select`, `cancelDecode`, explicit Analyze/Replace/Remove controls |
| Matching-explanation floating card | [PhotoUploadPanel.tsx](../src/features/first-sight/components/PhotoUploadPanel.tsx) | `openMatching`, dismissal listeners, `.fs-matching-*` styles in `first-sight.css` |
| Five studies, annotations, stories, related edits | [recognition.ts](../src/features/first-sight/recognition.ts) | `recognitionItems`, `garmentStudy`, `productIds`, `lookIds` |
| Chloé photo, identity, explanation copy, resale, sources | [chloe.ts](../src/features/first-sight/chloe.ts) | `chloePhoto`, `chloeIdentity`, `chloeAnalysis`, `chloeSources`, `chloeLooks` |
| Recognition-choice cards and sample confidence scores | [RecognitionResults.tsx](../src/features/first-sight/components/RecognitionResults.tsx), [recognition-results.css](../src/features/first-sight/components/recognition-results.css) | Selection callbacks and active-choice presentation |
| Dossier panels, connectors, image points, resale bar | [FashionDossier.tsx](../src/features/first-sight/components/FashionDossier.tsx), [fashion-dossier.css](../src/features/first-sight/components/fashion-dossier.css) | `measure`, `toggleAnnotation`, container queries, `imagePresentation` |
| Garment-study drawing | [public/assets/first-sight/studies/](../public/assets/first-sight/studies/) | Four original SVGs; annotation coordinates are percentages of the full image |
| Prices, product descriptions, saveable IDs | [catalog.ts](../src/data/catalog.ts) | Shared `items`; every FirstSight product ID must exist here |
| Sample stock, variants, condition, material labels | [fixtures.ts](../src/features/first-sight/fixtures.ts) | `offerDetails`, `sampleOffers`, `offersFor` |
| Purchase-card presentation | [PurchaseGrid.tsx](../src/features/first-sight/components/PurchaseGrid.tsx) | Availability, era/source labels, selection/save callbacks |
| Inline PDP, size selection, 70/30 sidebar | [ProductDetailPanel.tsx](../src/features/first-sight/components/ProductDetailPanel.tsx), [product-detail.css](../src/features/first-sight/components/product-detail.css) | Gallery/SKU state, CTAs, styling/alternative cards |
| Cart quantities and Buy Now behavior | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx), [CartPreview.tsx](../src/features/first-sight/components/CartPreview.tsx) | `addToCart`, `cart`, `cartOpen`; checkout is a local preview |
| Section 3 active browsing timeout | [engagement.ts](../src/features/first-sight/engagement.ts), [useDiscoveryTimer.ts](../src/features/first-sight/useDiscoveryTimer.ts) | `DISCOVERY_ENGAGEMENT_MS = 45_000`, `sessionKey`, visibility/focus rules, `engage` |
| Celebrity captions, sources, dimensions, tags | [looks.ts](../src/features/first-sight/looks.ts), [source record](first-sight-sources.md) | `outfitLooks`; keep source, author, license, and dimensions together |
| Masonry, regional filters, saved looks, detail dialog | [OutfitMasonry.tsx](../src/features/first-sight/components/OutfitMasonry.tsx) | Local filter/limit/dialog state; `contextName` identifies the selected study |
| Restore supplied Chloé photos after cloning | [setup-analysis-media.mjs](../scripts/setup-analysis-media.mjs) | `npm run setup:analysis-media`; ignored originals → ignored served copies |
| Wardrobe persistence | [App.tsx](../src/App.tsx), [savedItems.ts](../src/domain/savedItems.ts) | Browser storage, known catalog IDs, immutable save/toggle rules |
| Future FirstSight service adapter | [contracts.ts](../src/features/first-sight/services/contracts.ts), [prototype.ts](../src/features/first-sight/services/prototype.ts) | `FirstSightGateway`, injected through the page's `gateway` prop |

## Routes and module boundaries

| Route | Owner | Responsibility |
| --- | --- | --- |
| `/` | [DiscoverPage.tsx](../src/pages/DiscoverPage.tsx) | Original editorial discovery page |
| `/first-sight` | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | Three retained sections: inspiration, photo/dossier, related pieces |
| `/vault` | [CatalogPage.tsx](../src/pages/CatalogPage.tsx) | Shared catalog search, filters, sorting |
| `/items/:id` | [ItemPage.tsx](../src/pages/ItemPage.tsx) | Original item details and story links |
| `/stories`, `/stories/:id` | [StoriesPage.tsx](../src/pages/StoriesPage.tsx) | Editorial list and article |
| `/submit` | [SubmitPage.tsx](../src/pages/SubmitPage.tsx) | Original photo → details → preview flow |
| `/wardrobe`, `/about` | [App.tsx](../src/App.tsx) | Saved items and prototype information |

`main.tsx` mounts React and the router. `App.tsx` owns the shared shell and wardrobe. Original collection types live in `src/types.ts`; FirstSight's `PhotoInput`, `RecognizedItem`, `ProductAnnotation`, `PurchaseOption`, and `DiscoveryResult` live in [feature types](../src/features/first-sight/types.ts). App-wide future service interfaces in `src/integrations/contracts.ts` remain separate from FirstSight's injectable gateway.

## FirstSight functions and state

| Function | Responsibility |
| --- | --- |
| `changePhoto(nextPhoto)` | Abort the old request, replace/remove the accepted preview, and clear results/PDP while retaining the visit's cart |
| `analyze()` | Start the explicit sample scan, reset its timer session, and accept only the latest response |
| `cancelAnalysis()` | Stop a scan while keeping the selected image available |
| `selectRecognition(id)` | Update dossier and related products together; close any previously selected PDP |
| `scrollToSection(element)` | Move to an existing section with focus and reduced-motion-aware scrolling |
| `collapseFeed()` | Expand only Section 3's purchase grid; photo and dossier stay intact |
| `openProduct(product)` / `closeProduct()` | Open/close the PDP below the retained shopping grid |
| `addToCart(product, variant, buyNow)` | Clamp quantities to sample stock; optionally open the local bag preview |
| `useDiscoveryTimer(...).engage()` | Cancel automatic feed collapse for the analysis session; restoration also engages |

| State | Owner | Lifetime |
| --- | --- | --- |
| `savedIds` | `App` | Browser storage when available; shared across routes |
| `photo`, `result`, `selectedId` | `FirstSightPage` | Current analysis; accepted upload URLs are revoked on replacement/unmount |
| `product`, `catalogFocused` | `FirstSightPage` | Current shopping view; earlier sections stay mounted |
| `savedLookIds`, `cart` | `FirstSightPage` | Current page visit; survive photo changes and study selection |
| Trend collection and expanded board | `TrendHero` | Current page visit |
| Unfinished image decode and explanation popover | `PhotoUploadPanel` | Current panel; token guards discard stale decodes |
| Highlighted/pinned annotation | `FashionDossier` | Selected study; its keyed component resets on study change |
| Filter, batch limit, selected look | `OutfitMasonry` | Current mounted board |
| Gallery view and selected SKU | `ProductDetailPanel` | Selected product |
| Checkout-preview completion | `CartPreview` | Current dialog opening; no order is created |
| Timer accounting | `useDiscoveryTimer` and pure engagement rules | Fresh on Analyze; study changes pause/resume the same opportunity |

The upload panel owns unfinished object URLs, then transfers an accepted URL to the page. Its decode token and the page's `AbortController` protect different asynchronous boundaries. Preserve both when changing file handling.

## Data and API changes

Keep copy and product edits in data modules. `recognition.ts` assembles each study's content and related IDs; `chloe.ts` owns the supplied example's factual/source records and authored valuation. Confidence scores use 0–100 and are explicitly seeded. Chloé's **€700–€1,000** range and retention percentages are sample assumptions; they do not appraise an upload.

The gateway returns `DiscoveryResult = { items: RecognizedItem[] }`. Each study includes its own dossier, products, and styling context. A future adapter can map into those shapes, honor cancellation, and be injected at the route. Live confidence/valuation status, uploads, no-match handling, inventory IDs, and actual checkout need explicit integration. See [the FirstSight guide](first-sight-prototype.md).

`FashionDossier` replaces the earlier upload-panel result component. Image-point coordinates refer to the complete source frame. The optional `imagePresentation: 'trim-top-space'` removes empty Chloé studio background while preserving that coordinate plane; the four square garment SVGs use `full`.

## Configuration and checks

| File | Control |
| --- | --- |
| [package.json](../package.json), [tsconfig.json](../tsconfig.json) | Scripts, dependencies, strict compiler options |
| [vite.config.ts](../vite.config.ts), [index.html](../index.html) | Development/build setup, page metadata, React mount |
| [netlify.toml](../netlify.toml), [public/_redirects](../public/_redirects) | Future static hosting and direct-route fallback |
| [tests/firstSightRecognition.test.mjs](../tests/firstSightRecognition.test.mjs) | Study/product integrity, annotation targets, SVG assets, cancelled requests |
| [tests/firstSightEngagement.test.mjs](../tests/firstSightEngagement.test.mjs) | Active time, expiry, pauses, engagement, reset |
| [tests/savedItems.test.mjs](../tests/savedItems.test.mjs) | Storage recovery and wardrobe toggling |

Run `npm run typecheck`, `npm test`, and `npm run build` after behavior changes. For visual changes, check the affected route at desktop and narrow mobile widths, plus keyboard and reduced-motion behavior. The [FirstSight checklist](first-sight-prototype.md#verification) covers the current flow.

Useful searches:

```sh
rg -n 'analyze|selectRecognition|openProduct|collapseFeed' src/pages/FirstSightPage.tsx
rg -n 'recognitionItems|productIds|lookIds|annotations' src/features/first-sight/recognition.ts
rg -n 'DISCOVERY_ENGAGEMENT_MS|sessionKey' src/features/first-sight
rg -n 'fs-recognition-layout|fs-dossier|fs-pdp-layout' src
git status --short
git diff --stat
```

New files marked `??` are absent from ordinary `git diff` until tracked; open them directly when reviewing. Keep comments about ownership and constraints accurate instead of repeating each line of implementation.

## Photo handling

Supplied originals remain in ignored `src/images/`; served Chloé copies remain in ignored `public/local-media/`. Keep screenshots containing them outside the repository and do not force-add those photos. The active example uses four styling references; the unavailable TV still is optional and excluded. Original garment and bag SVG artwork stays tracked, as does the earlier attributed Commons library. Filename mappings and provenance are in [the source record](first-sight-sources.md).
