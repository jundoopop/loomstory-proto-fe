# LoomStory code guide

This guide covers the active React/Vite application, including the archive-first FirstSight journey, repository-owned browser tooling and the P18 Discover renewal. P18 implementation and verification are complete and remain uncommitted; see the [phase plan](plans/discover-p18-plan.md) and [Discover verification record](discover-verification.md). Start with the change-location map, then open the relevant module. Module headers describe ownership; function comments explain transitions and constraints; CSS section comments identify the visual area.

## Find the change you want to make

| Change | Where to edit | Main controls |
| --- | --- | --- |
| Routes, desktop navigation, mobile shortcuts | [App.tsx](../src/App.tsx) | Route registry and both navigation lists |
| Site palette, fonts, shell, original-page styling | [styles.css](../src/styles.css) | `:root`, shared typography, header/footer |
| Continuous FirstSight flow and commerce separation | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | `changePhoto`, `analyze`, `selectRecognition`, `openProduct`, `openStyleMatches`, guarded save/bag actions |
| Dashboard section surfaces and Section 1 35/65 split | [first-sight-flow.css](../src/pages/first-sight-flow.css) | `.fs-recognition-layout`, sticky boundary, section headings, responsive rules |
| Section 2 shopping/feed layout and shared FirstSight controls | [first-sight.css](../src/pages/first-sight.css) | `.fs-discovery`, no-looks full-width fallback, feature buttons and cart dialog |
| Discover cover and always-visible six-look board | [TrendHero.tsx](../src/features/discover/components/TrendHero.tsx), [trend-hero.css](../src/features/discover/components/trend-hero.css) | `selectCollection`, `exploreLook`, `?collection=<id>`, board breakpoints |
| Four authored collections and ordered six-look ranking | [collections.ts](../src/features/discover/collections.ts) | `inspirationCollections`, `InspirationCollection`, `collectionLooks` |
| Discover reference hand-off | [references.ts](../src/features/discover/references.ts), [App.tsx](../src/App.tsx) | `resolveInspirationPhoto`, authored ID lookup, `workspaceKey`, route focus |
| File formats, 5 MB limit, local decoding, persistent photo | [PhotoUploadPanel.tsx](../src/features/first-sight/components/PhotoUploadPanel.tsx), [upload-workspace.css](../src/features/first-sight/components/upload-workspace.css) | `acceptedTypes`, `select`, `cancelDecode`, explicit Analyze/Replace/Remove controls |
| Matching-explanation floating card | [PhotoUploadPanel.tsx](../src/features/first-sight/components/PhotoUploadPanel.tsx) | `openMatching`, dismissal listeners, `.fs-matching-*` styles in `first-sight.css` |
| Five studies, annotations, stories, related edits | [recognition.ts](../src/features/first-sight/recognition.ts) | `recognitionStudies`, `garmentStudy`, `archiveProductIds`, `styleMatchProductIds`, `contextReferenceIds` |
| Chloé photo, identity, explanation copy, resale, sources | [chloe.ts](../src/features/first-sight/chloe.ts) | `chloePhoto`, `chloeIdentity`, `chloeAnalysis`, `chloeSources`, `chloeLooks` |
| Recognition-choice cards and sample confidence scores | [RecognitionResults.tsx](../src/features/first-sight/components/RecognitionResults.tsx), [recognition-results.css](../src/features/first-sight/components/recognition-results.css) | Selection callbacks and active-choice presentation |
| Dossier feature labels, floating explanations, connectors, resale bar | [FashionDossier.tsx](../src/features/first-sight/components/FashionDossier.tsx), [fashion-dossier.css](../src/features/first-sight/components/fashion-dossier.css) | `measure`, `toggleAnnotation`, container queries, `imagePresentation` |
| Garment-study drawing | [public/assets/first-sight/studies/](../public/assets/first-sight/studies/) | Four original SVGs; annotation coordinates are percentages of the full image |
| Prices, product descriptions, saveable IDs | [catalog.ts](../src/data/catalog.ts) | Shared `items`; every FirstSight product ID must exist here |
| Sample stock, variants, condition, material labels | [fixtures.ts](../src/features/first-sight/fixtures.ts) | `offerDetails`, `sampleOffers`, `offersFor` |
| Archive card presentation | [PurchaseGrid.tsx](../src/features/first-sight/components/PurchaseGrid.tsx) | `archiveProducts`, explicit listing labels, empty state, selection/save callbacks |
| Commerce classification and canonical purchase guard | [commerce.ts](../src/features/first-sight/commerce.ts) | `createCommerceEdit`, `isArchiveOffer`, `isStyleMatchOffer`, `resolveArchivePurchase`, shared labels |
| Inline PDP, size selection, 70/30 sidebar | [ProductDetailPanel.tsx](../src/features/first-sight/components/ProductDetailPanel.tsx), [product-detail.css](../src/features/first-sight/components/product-detail.css) | Gallery/SKU state, archive CTAs, cultural notes, `styleMatchCount`, `onOpenStyleMatches` |
| Opt-in modern styles, sizes and preview cards | [StyleMatchDrawer.tsx](../src/features/first-sight/components/StyleMatchDrawer.tsx), [style-match-drawer.css](../src/features/first-sight/components/style-match-drawer.css) | `StyleMatchDrawer`, `StyleMatchCard`, per-product SKUs, native modality, status feedback |
| Cart quantities and Buy Now behaviour | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx), [CartPreview.tsx](../src/features/first-sight/components/CartPreview.tsx) | Canonical `addToCart`, `cart`, `cartOpen`; explicit dismissal requests and local checkout preview |
| Celebrity captions, sources, dimensions, relationships | [looks.ts](../src/features/first-sight/looks.ts), [source record](first-sight-sources.md) | `outfitLooks`; keep source, author, licence, dimensions and authored relationship together |
| Masonry, regional filters, saved looks, detail dialog | [OutfitMasonry.tsx](../src/features/first-sight/components/OutfitMasonry.tsx) | Local filter/limit/dialog state; `contextName`, optional `showRegionFilters` and `onExploreLook` |
| Shared board, photo dialog and supporting controls | [outfit-masonry.css](../src/features/first-sight/components/outfit-masonry.css) | Imported by `OutfitMasonry`; Discover has no implicit FirstSight CSS dependency |
| Wine outfit journal, ivory photo cards, caption sizes and narrow-screen columns | [outfit-magazine.css](../src/features/first-sight/components/outfit-magazine.css) | `--fs-journal-*` palette, `.fs-outfits-magazine`, `outfit-journal` container query |
| Restore supplied Chloé photos after cloning | [setup-analysis-media.mjs](../scripts/setup-analysis-media.mjs) | `npm run setup:analysis-media`; ignored originals → ignored served copies |
| Shared visit-local inspiration saves | [App.tsx](../src/App.tsx), [feature types](../src/features/first-sight/types.ts) | `savedLookIds`, `lookProps`, `SavedLookProps`; all forty Commons plus four Chloé IDs; no storage |
| Wardrobe persistence | [App.tsx](../src/App.tsx), [savedItems.ts](../src/domain/savedItems.ts) | Browser storage, known catalog IDs, immutable save/toggle rules |
| FirstSight gateway and cancellation | [contracts.ts](../src/features/first-sight/services/contracts.ts), [prototype.ts](../src/features/first-sight/services/prototype.ts) | `FirstSightGateway`, `createPrototypeGateway`, 900 ms delay, complete result assembly, abort guards |
| Ordered cultural-reference lookup | [content/contracts.ts](../src/features/first-sight/services/content/contracts.ts), [content/prototype.ts](../src/features/first-sight/services/content/prototype.ts) | `ContextContentProvider`, `createPrototypeContextContentProvider`, registry and requested-ID validation |
| Future content adapters | [provider guidance](../src/features/first-sight/services/content/providers/README.md) | Metadata, server credentials, cancellation, untrusted-data validation and future embed-renderer boundaries |

## Routes and module boundaries

| Route | Owner | Responsibility |
| --- | --- | --- |
| `/` | [DiscoverPage.tsx](../src/pages/DiscoverPage.tsx) | Hybrid homepage: editorial cover, selected collection, Vault search, four products and destinations |
| `/first-sight` | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | Two retained sections: photo/dossier, archive edit and journal; modern styles require opt-in; `?look=<id>` prepares a reference |
| `/vault` | [CatalogPage.tsx](../src/pages/CatalogPage.tsx) | Shared catalog search, filters, sorting |
| `/items/:id` | [ItemPage.tsx](../src/pages/ItemPage.tsx) | Original item details and story links |
| `/stories`, `/stories/:id` | [StoriesPage.tsx](../src/pages/StoriesPage.tsx) | Editorial list and article |
| `/submit` | [SubmitPage.tsx](../src/pages/SubmitPage.tsx) | Original photo → details → preview flow |
| `/wardrobe`, `/about` | [App.tsx](../src/App.tsx) | Saved items and prototype information |

`main.tsx` mounts React and the router. `App.tsx` owns the shared shell, durable wardrobe and visit-local inspiration saves. Original collection types live in `src/types.ts`; FirstSight's `PhotoInput`, `RecognizedItem`, `ProductAnnotation`, `PurchaseOption`, and `DiscoveryResult` live in [feature types](../src/features/first-sight/types.ts). App-wide future service interfaces in `src/integrations/contracts.ts` remain separate from FirstSight's injectable gateway.

## Discover-to-FirstSight reference flow

`TrendHero` reads the selected collection from `?collection=<id>` and updates it with replacement
navigation, preserving the edit when the visitor returns through browser Back. Cover and photo-detail
actions navigate to `/first-sight?look=<id>`. Only `outfitLooks` IDs resolve; unknown or URL-like input
opens the normal workspace with an unavailable-reference notice. No arbitrary image URL is fetched.

`PhotoUploadPanel` displays the celebrity/title, photographer, source and licence of a reference.
Analyse remains explicit and the adjacent disclosure explains the five prepared studies. The gateway
never identifies the selected outfit. Reloading a valid reference URL restores that photo; changing
its ID remounts FirstSight and aborts obsolete work. App also updates focus for a query-only reference
change. Discover collection changes retain focus on their selected control.

## FirstSight functions and state

| Function | Responsibility |
| --- | --- |
| `changePhoto(nextPhoto)` | Close Inspire, abort the old request, replace/remove the accepted preview, and clear results/PDP while retaining the visit's cart |
| `analyze()` | Start the explicit sample scan and accept only the latest response |
| `cancelAnalysis()` | Stop a scan while keeping the selected image available |
| `selectRecognition(id)` | Update dossier, archive/style edits and context together; close Inspire and the previous PDP |
| `scrollToSection(element)` | Move to an existing section with focus and reduced-motion-aware scrolling |
| `openProduct(product)` / `closeProduct()` | Resolve the current archive offer, open/close its inline PDP and coordinate Inspire/focus |
| `toggleArchiveSave(id)` | Allow only the selected archive edit to call the shared wardrobe callback |
| `addToCart(product, variant, buyNow)` | Use `resolveArchivePurchase` to obtain canonical product/SKU objects and positive integer stock, then clamp quantities; optionally open the bag |
| `openBag()` | Close Inspire before showing the page-owned bag |
| `openStyleMatches()` / `closeStyleMatches(target)` | Share the current style edit between both triggers and coordinate bag visibility and focus fallback |
| `restoreStyleMatchFocus()` | Focus the retained recognition/shopping section or PDP if the original trigger was removed or hidden |
| `toggleStyleMatchSave(id)` | Update visit-local style IDs without calling archive wardrobe storage |
| `previewPartnerOffer(product, variant)` | Revalidate current style/SKU availability and show local feedback without adding to the bag or visiting a partner |

| State | Owner | Lifetime |
| --- | --- | --- |
| `savedIds` | `App` | Browser storage when available; shared across routes |
| `photo`, `result`, `selectedId` | `FirstSightPage` | Current analysis; accepted upload URLs are revoked on replacement/unmount |
| `product` | `FirstSightPage` | Current inline product detail; shopping, outfits, and earlier sections stay mounted |
| `savedLookIds` | `App` | Current App visit; shared across Discover/FirstSight navigation, reset on full reload |
| `cart` | `FirstSightPage` | Current mounted visit; survives photo changes and study selection |
| `savedStyleMatchIds` | `FirstSightPage` | Current mounted FirstSight visit; independent of the persistent archive wardrobe |
| `styleMatchOpen`, `styleMatchFocusTarget` | `FirstSightPage` | Controlled drawer visibility and the current transition's fallback destination |
| `selectedSkusByProductId` | `StyleMatchDrawer` | Current mounted visit; one unkeyed drawer preserves choices across reopen and study switches |
| Discover collection | `TrendHero` | `?collection=<id>` in the URL; board always visible |
| Unfinished image decode and explanation popover | `PhotoUploadPanel` | Current panel; token guards discard stale decodes |
| Highlighted/pinned annotation | `FashionDossier` | Selected study; its keyed component resets on study change |
| Filter, batch limit, selected look | `OutfitMasonry` | Current mounted board |
| Gallery view and selected SKU | `ProductDetailPanel` | Selected product |
| Checkout-preview completion | `CartPreview` | Current dialog opening; no order is created |

The upload panel owns unfinished object URLs, then transfers an accepted upload URL to the page. A `PhotoInput` reference variant carries its canonical `OutfitLook`; authored reference URLs are not revoked. App passes optional `initialPhoto`/`referenceUnavailable` props and keys FirstSight by the requested reference ID. Initial photo state is not resynchronised on ordinary rerenders, preserving Remove/Replace actions. Its decode token and the page's `AbortController` protect different asynchronous boundaries. Preserve both when changing file handling.

Both Inspire triggers explicitly focus their actual button before opening the drawer. This preserves the return destination in WebKit, where pointer activation need not focus a button. The drawer captures that opener, owns exact overflow-axis restoration and falls back through `onRestoreFocus` if the opener is hidden or removed. Its user dismissal callbacks are separate from native reconciliation. `CartPreview` follows the same controlled-visibility principle: Escape/button/backdrop request closure; a queued native `close` event must not cancel a newly requested opening.

## Data and API changes

Keep copy and product edits in data modules. `recognition.ts` assembles each study's content and related IDs; `chloe.ts` owns the supplied example's factual/source records and authored valuation. Confidence scores use 0–100 and are explicitly seeded. Chloé's **€700–€1,000** range and retention percentages are sample assumptions; they do not appraise an upload.

`recognitionStudies` contains authored `RecognitionStudy` records with ordered `contextReferenceIds`. `createPrototypeGateway(contentProvider)` waits for the cancellable 900 ms scan delay, resolves all studies concurrently through `ContextContentProvider.getReferences`, and preserves their authored order. The local provider rejects ambiguous registry IDs and missing/repeated requested IDs; empty requests remain valid. Provider failure rejects the complete analysis and leaves the page's photo/retry flow available. The gateway stops waiting promptly on abort and consumes late settlement; stopping underlying work still requires the provider to honour its signal.

The gateway returns `DiscoveryResult = { items: RecognizedItem[] }`. Each resolved study has `commerce.archive`, `commerce.styleMatches` and `looks`, alongside its dossier and cultural narrative. `RecognizedItem.products`, `PurchaseOption.affordable` and the former synchronous resolver/export bridges have been retired. Track membership comes from authored `commerce.track`, never price. `PurchaseGrid` receives archive offers only; the PDP receives a style count/action rather than an alternative catalogue. Modern styles render only inside the opt-in drawer.

`OutfitLook.relationship` carries authored `same-design`, `runway-reference` or `styling-inspiration` metadata. `contextRelationshipLabel` owns wording for contextual cards, dialogs and PDP notes. Inspiration boards retain geographic labels. Relationship labels do not authenticate an item or infer exact identity from a photograph.

A future adapter can map into these contracts and be injected without moving service work into presentation. Live confidence/valuation status, uploads, runtime validation of external responses, partial-result policy, inventory IDs and actual checkout remain integration work. See [the FirstSight guide](first-sight-prototype.md) and [content-adapter guidance](../src/features/first-sight/services/content/providers/README.md).

`FashionDossier` replaces the earlier upload-panel result component. It shows compact connected feature labels at rest; hover/focus/tap reveals the associated detail in a floating card without moving surrounding content. Longer explanation cards remain in an optional disclosure. The styling board has no timer or hide control, so it remains alongside products while browsing. Image-point coordinates refer to the complete source frame. The optional `imagePresentation: 'trim-top-space'` removes empty Chloé studio background while preserving that coordinate plane; the four square garment SVGs use `full`.

At dossier widths up to 329 px, duplicate image buttons become non-interactive markers while the
large feature-label controls retain all four actions. `.fs-dossier-point-marker` preserves coordinates
and active highlighting. Focused keyboard details take priority over hover caused by scrolling;
pointer input clears that keyboard-preview ownership. Cover captions grow intrinsically with text,
and local contrast colours/backings live in the feature CSS rather than the global site palette.

## Configuration and checks

| File | Control |
| --- | --- |
| [package.json](../package.json), [tsconfig.json](../tsconfig.json), [tsconfig.browser.json](../tsconfig.browser.json) | Scripts, locked test-only dependencies and separate application/browser-test typechecks |
| [vite.config.ts](../vite.config.ts), [index.html](../index.html) | Development/build setup, page metadata, React mount |
| [netlify.toml](../netlify.toml), [public/_redirects](../public/_redirects) | Future static hosting and direct-route fallback |
| [tests/firstSightRecognition.test.mjs](../tests/firstSightRecognition.test.mjs) | Study/product integrity, annotation targets, SVG assets, cancelled requests |
| [tests/firstSightCommerce.test.mjs](../tests/firstSightCommerce.test.mjs) | Explicit tracks, edit validation, canonical offer/SKU/stock guards |
| [tests/firstSightContentProvider.test.mjs](../tests/firstSightContentProvider.test.mjs) | Registry integrity, order, attribution, failure, cancellation and independent result arrays |
| [tests/savedItems.test.mjs](../tests/savedItems.test.mjs) | Storage recovery and wardrobe toggling |
| [tests/discoverInspiration.test.mjs](../tests/discoverInspiration.test.mjs) | Four six-look edits, authored-reference resolution and canonical metadata |
| [playwright.config.ts](../playwright.config.ts), [playwright.preview.config.ts](../playwright.preview.config.ts) | Managed browser projects, owned development/preview servers and failure artefacts |
| [tests/browser/firstSight.flow.spec.ts](../tests/browser/firstSight.flow.spec.ts) | Real App route, five edits, archive/Inspire separation, upload, persistence and source labels |
| [tests/browser/firstSight.resilience.spec.ts](../tests/browser/firstSight.resilience.spec.ts) | Controlled empty/error/pending/stale data and native modal regressions |
| [tests/browser/firstSight.accessibility.spec.ts](../tests/browser/firstSight.accessibility.spec.ts) | Study/drawer/bag accessibility, keyboard, touch and text reflow |
| [tests/browser/discover.flow.spec.ts](../tests/browser/discover.flow.spec.ts) | Four independently expected edits, reference hand-off/history, saves and retained homepage actions |
| [tests/browser/discover.accessibility.spec.ts](../tests/browser/discover.accessibility.spec.ts) | Direct homepage/open-dialog scans, reference metadata, keyboard/focus, touch and enlarged text |
| [expected-inspiration.ts](../tests/browser/fixtures/expected-inspiration.ts) | Independent cover and six-look ID/order expectations |
| [browser helpers](../tests/browser/helpers/), [test host](../tests/browser/harness/) | Scoped media substitution, diagnostics and typed development-only host controls |

Install with `npm ci`, then `npx playwright install chromium firefox webkit` for managed browser binaries. `@playwright/test`, `@axe-core/playwright` and direct Node typings are development dependencies; application runtime dependencies are unchanged.

```sh
npm run typecheck
npm run typecheck:browser
npm test
npm run test:browser
npm run test:browser:all
npm run test:browser:a11y
npm run build
npm run test:browser:preview
git diff --check
```

`test:browser:a11y` includes both FirstSight and Discover accessibility specs. `test:browser` runs the five Chromium viewport projects. `test:browser:all` includes the declared Firefox/WebKit core cases. `test:browser:preview` needs the preceding build and checks only real App-route scenarios tagged `@preview`; it does not serve the harness. The runner owns ports 5183 and 4183 by default and fails on collision; set `FIRST_SIGHT_TEST_PORT` or `FIRST_SIGHT_PREVIEW_PORT` to use another port. Do not depend on a separately running development server.

The historical P13 checkpoint passed 35 Node tests and 49 browser executions. P16 verification passed
74 development executions across nine projects, including 55 accessibility state scans with no
reported violations, plus three production-preview checks. The thirty-five Node tests and both
TypeScript checks passed after a clean install. P17 delivered this checkpoint as `d32ef3c`; do not reuse its counts as evidence for changed P18 source. The [verification record](first-sight-verification.md)
contains measured corrections and the remaining manual-testing/environment limitations. Final P18 results are recorded in the [Discover verification record](discover-verification.md): 40 Node tests, 128 development executions of 42 unique scenarios, 85 accessibility scans and six production-preview checks pass. Incomplete axe checks remain manual-review items; no complete conformance claim is made.

The browser fixture substitutes original test artwork only for ignored `/local-media/chloe/*` URLs. It continues to load tracked assets normally and checks unexpected console/page/HTTP/request failures. This makes a fresh clone independent of supplied photographs; a separate exact-photo visual check is still needed. Reports, screenshots and traces stay in ignored `playwright-report/` and `test-results/` directories. The typed host is a development-only HTML entry, not a production import or test hook in the application.

On macOS, the Firefox worker uses disposable app data to avoid the bundled browser reading protected personal Firefox data. It attempts cleanup; macOS access-denied cleanup can retain a temporary test directory and produces an explicit warning. No OS permission or personal profile is changed. Other cleanup errors remain failures.

Useful searches:

```sh
rg -n 'inspirationCollections|collectionLooks|resolveInspirationPhoto' src/features/discover
rg -n 'workspaceKey|routeFocusKey|savedLookIds' src/App.tsx
rg -n 'analyze|selectRecognition|openStyleMatches|addToCart' src/pages/FirstSightPage.tsx
rg -n 'recognitionStudies|archiveProductIds|styleMatchProductIds|contextReferenceIds|annotations' src/features/first-sight/recognition.ts
rg -n 'getReferences|createPrototypeGateway|withAbort' src/features/first-sight/services
rg -n 'fs-recognition-layout|fs-dossier|fs-pdp-layout' src
git status --short
git diff --stat
```

New files marked `??` are absent from ordinary `git diff` until tracked; open them directly when reviewing. Keep comments about ownership and constraints accurate instead of repeating each line of implementation.

## Photo handling

Supplied originals remain in ignored `src/images/`; served Chloé copies remain in ignored `public/local-media/`. Keep screenshots containing them outside the repository and do not force-add those photos. The active example uses four styling references; the unavailable TV still is optional and excluded. Original garment and bag SVG artwork stays tracked, as does the earlier attributed Commons library. Filename mappings and provenance are in [the source record](first-sight-sources.md).
