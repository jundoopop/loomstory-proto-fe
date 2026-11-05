# Whole-outfit examples — proposed implementation slice

Recorded: 5 November 2026. Status: implemented and verified; uncommitted for review.

The user confirmed placing real branded results in FirstSight's analyse examples. The delivered
slice uses two ROSÉ × PUMA campaign examples with six published model identities and clearly
curated outfit associations. The original proposal below is retained for traceability; the
implementation record at the end distinguishes actual decisions from the original options.

This refines the researched example expansion and the proposed project improvements. It does not
authorise the wider shopping, engineering or visual roadmap, or any Git delivery. Existing
uncommitted card, heart and dossier styling edits remain intact.

## A. Requirement and confirmed decisions

The main FirstSight demonstration should start from a celebrity photograph and reveal several real
pieces worn in that same photograph. The user explicitly chose:

- Show only items whose real brand and model are documented.
- Initially show all eligible pieces from the look, with the featured bag highlighted.

The featured bag is the initial selection, not a filter that removes the other pieces. Selecting
trousers, a top, skirt, dress or footwear should open that piece's own story and shopping context.
The current five independent studies remain available as a secondary demonstration library.

## B. Evidence, prototype boundaries and readiness

Use an authored whole-outfit example registry rather than real image recognition. A named example
has one exact source photograph and an explicitly ordered membership list. General brand credits,
ambassadorship, similar-looking products and membership of a campaign collection do not establish
that a particular model is worn in a frame.

Every eligible piece needs a named brand/model, item-identification evidence and a visible region
in the chosen photograph. A published model family can be documented without a retail SKU; do
not invent an edition, colour code or exact SKU beyond the evidence. Generic descriptions such as
"cashmere hoodie" do not qualify as an exact named model under the user's selected policy.

Keep item identity evidence separate from image attribution and from illustrative commerce. A
real design does not establish an authenticated physical listing or live stock. Current-season
campaign clothing must not be described as authenticated vintage.

Candidate readiness and primary sources: [whole-outfit research](../research/whole-outfit-cases.md).
The current pack includes documented bag/footwear pairs and a stronger three-category PUMA
candidate. Its frame-to-product mapping must be settled before it becomes the main example.
Do not fill an outfit with unverified garments to reach a target count.

For arbitrary uploads and Discover references, retain local previews and an explicit prepared-demo
explanation. Do not overlay the registered example's regions on a different photograph. Choosing a
reference or sample still requires an explicit Analyse action.

## C. End-to-end principle

1. Choose an authored celebrity example, retaining its photo ID, credit and item evidence.
2. Explicitly analyse; the prototype resolves only that example's eligible members.
3. Show the same photograph with selectable item markers and an equivalent visible item list.
4. Initially select the featured bag; show every eligible piece in the shopping edit.
5. Selecting another piece changes its dossier and Style Journal while retaining the whole-look edit.
6. Opening any offer resolves its owning piece and canonical product together.
7. Saving and bag actions validate against the complete displayed archive edit and canonical SKUs.
8. Similar modern alternatives remain behind the explicit Inspire action for the relevant piece.

If no bag is eligible, use a separately authored primary piece; do not invent a bag. For a piece
without an authored offer, retain its documented result and say that no sample listing is available.

## D. Exact owners and proposed changes

All helper and new-component names below are proposed; existing named functions are current owners.

| File | Functions, types or components | Planned change |
| --- | --- | --- |
| New `src/features/first-sight/data/outfitExamples.ts` | `outfitExamples`, `resolveOutfitExample()` | Store exact photo metadata, primary piece ID, ordered documented members, model evidence and normalised photo regions. Reject missing or contradictory membership. |
| New `src/features/first-sight/data/outfitStudies.ts` | Authored `RecognitionStudy` records | Add source-supported dossiers for accepted models, with accurate edition wording and no fabricated historical or material claims. |
| `src/features/first-sight/types.ts` | `PhotoInput`, `DiscoveryResult`; new outfit/member/evidence types | Add an explicit sample `exampleId` and optional same-photo result metadata. Retain the existing gateway boundary and reference/upload variants. Make legacy resale metadata optional for new studies rather than inventing valuations. |
| `src/features/first-sight/services/prototype.ts` | `createPrototypeGateway().discover()` | Resolve the selected registry entry rather than ignoring `_photo`. Hydrate only its member studies through the existing content provider. Preserve delay, cancellation, concurrent order and late-rejection handling. |
| `src/features/first-sight/recognition.ts` | `recognitionStudies` | Preserve the five existing studies as a deliberate secondary library; distinguish library mode from a registered whole-outfit result. |
| `src/features/first-sight/commerce.ts` | New `createOutfitCommerceEdit()`; existing `resolveArchivePurchase()` | Derive ordered canonical archive offers and an offer-to-piece index. Reject conflicting ownership/IDs and misplaced partner offers. Feed the aggregate archive set into the existing purchase resolver. |
| `src/data/catalog.ts` | `items` | Register new offer IDs so product routes and persistent wardrobe saves can resolve them. Preserve current IDs and records. |
| `src/features/first-sight/fixtures.ts` | Offer enrichment and `offersFor()` | Add deliberate model-to-offer mappings and category-appropriate sizes. Keep price, condition and stock illustrative; ensure SKUs are globally unique or use product-plus-SKU cart keys. |
| `src/features/first-sight/components/PhotoUploadPanel.tsx` | `PhotoUploadPanel`, `chooseSample()` | Replace hard-coded primary Chloé text/image with the approved whole look. Preserve upload validation, local URL ownership, decoding, replacement, removal and explicit analysis. Retain the outer `fs-upload-panel` section. |
| New `src/features/first-sight/components/OutfitPhotoMap.tsx` and associated stylesheet | `OutfitPhotoMap` | Position documented-piece markers on the actual contained image plane, accounting for letterboxing. Provide the same selection through a labelled native-button list; no hover-only selection. |
| `src/features/first-sight/components/upload-workspace.css` | `fs-workspace-preview` and stage rules | Provide sufficient portrait-photo height for meaningful selection. Keep responsive stacking, controls, credits and enlarged text reachable. |
| `src/features/first-sight/components/RecognitionResults.tsx` and `recognition-results.css` | `RecognitionResults`, `fs-recognition-strip`, `fs-recognition-card` | Render photo-member results and variable counts. Use documented identity wording instead of invented match percentages in outfit mode. Preserve legacy library wording separately. |
| `src/pages/FirstSightPage.tsx` | `analyze()`, `changePhoto()`, `selectRecognition()` | Coordinate photo, result membership, selected piece and aggregate shopping without applying one photo's markers to another input. Remove fixed-five wording from the primary journey. |
| Same page | `archiveProducts`, `openProduct()`, `toggleArchiveSave()`, `addToCart()` | Resolve all displayed pieces through the aggregate edit. Set owning piece and PDP together so selecting a different piece does not immediately clear the newly opened PDP. Preserve canonical stock and quantity guards. |
| Same page | `openStyleMatches()`, `toggleStyleMatchSave()`, `previewPartnerOffer()` | Resolve Inspire products from the selected/opened piece; retain independent saves, mutually exclusive modals and focus return. |
| `src/features/first-sight/components/PurchaseGrid.tsx` | `PurchaseGrid` | Keep the simplified condition/brand/name/price cards, greyscale unavailable state and separate save control. Add a restrained featured-piece cue and piece grouping only where needed; retain all eligible pieces. |
| `src/features/first-sight/components/ProductDetailPanel.tsx` | `ProductDetailPanel` integration | Use canonical product details and the opened product's owning piece for cultural context and Inspire options. Retain sizes, stock guards and unavailable saves. |
| `src/features/first-sight/components/FashionDossier.tsx` | `FashionDossier` | Reuse the existing dossier for the selected documented model. Keep `fs-dossier-resale` commented out; no speculative valuation required. Preserve concurrent user styling. |
| `src/pages/first-sight.css` and `first-sight-flow.css` | Recognition/shopping layout owners | Integrate photo selection and whole-look shopping within the existing ivory, burgundy and serif language. Avoid redesigning unrelated homepage cards. |
| `scripts/setup-analysis-media.mjs` and local media guidance | Media setup | Add only approved, credited example assets through the existing ignored-media mechanism. Preserve source dimensions; keep user photos outside Git. |

`OutfitMasonry` remains supplementary contextual inspiration. Its unrelated celebrity photographs
must not become detected pieces. `App` remains the owner of wardrobe and visit-local inspiration
saves; no new global state library or backend is needed.

## E. Original planning checkpoints

The status column below records the proposal checkpoint. The actual implementation ledger follows
the original assessment at the end of this document.

| Step | Work | Exit condition | Status |
| --- | --- | --- | --- |
| WO.1 | Record user's two decisions; inspect provider, photo, dossier, commerce and catalogue owners. | Same-photo membership and cross-piece guard risks understood. | Complete, read-only. |
| WO.2 | Research named-model outfits and inspect source frames against documentary evidence. | At least one example contains a bag and another documented garment model in the same frame; no unresolved identity claims. | In progress; findings recorded. |
| WO.3 | Add typed registry, studies and provider resolution; preserve the legacy library. | Exact-member, evidence and cancellation tests pass. | Proposed, not started. |
| WO.4 | Integrate photo map, result selection and outfit-wide commerce ownership. | Bag remains highlighted initially; every other eligible piece opens/saves/purchases through its own canonical data. | Proposed, not started. |
| WO.5 | Verify responsive, keyboard, touch-emulation and modal integrations. | Acceptance checks below pass with recorded actual results. | Proposed, not started. |
| WO.6 | Update guides, walkthrough, activity ledger and A–G assessment. | Reviewable handover; no unapproved Git delivery. | Proposed, not started. |

This is a proposed prerequisite to the wider shopping-coherence work. It does not silently expand
that roadmap or implement the deferred animation work.

## F. Verification plan

- `tests/firstSightRecognition.test.mjs`: exact independently authored photo/member identities,
  documented-only eligibility, primary piece, stable order and preserved five-study library.
- `tests/firstSightContentProvider.test.mjs`: only the chosen members are resolved; retain
  out-of-order completion, synchronous failure, abort and late-settlement checks.
- `tests/firstSightCommerce.test.mjs`: offer ownership, duplicate/conflicting IDs, canonical SKU and
  stock resolution, partner rejection and mixed-piece quantity isolation.
- `tests/browser/fixtures/expected-edits.ts` and `helpers/firstSight.ts`: add independent whole-look
  expectations; retain explicit legacy-library assertions rather than deleting their coverage.
- `firstSight.flow.spec.ts`: select by marker/list, synchronised dossier, all-piece shopping,
  cross-piece opening/saving/bag actions, correct PDP context, independent saves and unavailable pieces.
- `firstSight.resilience.spec.ts` and the typed harness: malformed membership, unknown example IDs,
  unsupported inputs, replacement/cancellation and stale result protection.
- FirstSight/Discover hand-off regressions: explicit analysis and attribution remain intact;
  arbitrary references do not acquire unrelated example markers.
- Browser/accessibility checks at 1440, 1024, 768, 390 and 320 px: contained-image alignment,
  portrait/landscape resizing, 44 px controls, focus visibility, keyboard operation, touch emulation,
  dialog dismissal/return, 200% text, contrast and no horizontal page overflow.
- Both TypeScript checks, Node tests, affected Chromium/Firefox/WebKit suites, production build,
  preview checks, real-image loading checks and `git diff --check`. Record actual counts and gaps.

At the proposal checkpoint no application checks had been run. The implementation record below
supersedes that checkpoint. Browser emulation is not physical-device or screen-reader testing.

## G. Self-assessment and next action

The architecture supports the requested experience while preserving prototype scope. The critical
integration improvement is deriving the displayed offer set and piece ownership together; a visual
list alone would leave non-selected-piece actions rejected by current guards. Catalogue registration
is also required for durable wardrobe saves.

The remaining readiness issue is content evidence, not recognition technology. Resolve one complete
eligible example before implementation; withhold uncertain members rather than assigning plausible
model names. Submit this slice for review, then implement its accepted owners in order. No commit,
push or merge is included.

## Implementation record — 5 November 2026

### A. Delivered requirement

FirstSight's retained photo workspace now offers **Try ROSÉ · the city look**, **Try ROSÉ · the
track look** and the original Chloé shortcut. Explicit analysis returns three real PUMA models
for the chosen campaign frame. City selects the Micro Grip bag; track selects the T7 trousers.
Selecting another model changes its dossier and context while retaining all three sample offers.

### B. Evidence and boundaries

Six model identities and product references come from PUMA's published collection material.
The outfit associations are explicitly **curated campaign-to-collection references**, not a
brand-confirmed worn-SKU list, measured recognition or authenticated vintage stock. Unverified
additional clothing is not assigned a model. The seated look contains no invented bag.

The examples use real model names, product photos and four source-bounded design notes each.
Condition, price and stock remain illustrative. New studies omit confidence and resale instead
of fabricating those values. Chloé/uploads/Discover references retain the five-study library.
No external API, account, checkout, new runtime dependency or Git delivery was added.

### C. Actual changed owners

| Owner | Actual responsibility |
| --- | --- |
| `data/outfitExamples.ts` | Two source frames, photo dimensions/credits, canonical sample IDs, member order, primary piece and two context references. |
| `data/outfitCatalog.ts` and `data/outfitStudies.ts` | Six published model records, explicit category sizes, illustrative offer metadata and four-note dossiers. |
| `types.ts` | Explicit sample `exampleId`, optional `DiscoveryResult.outfit`, `OutfitExample`, identity evidence and optional confidence/resale. The gateway method signature is unchanged. |
| `services/prototype.ts` and `services/content/prototype.ts` | Resolve only the chosen example's members and context, reject unknown/mismatched samples, retain cancellation and legacy hydration. |
| `commerce.ts` | Aggregate canonical archive offers with their owning model, reject duplicate IDs/SKUs and misplaced partners. |
| `src/data/catalog.ts`, `fixtures.ts` | Register the six saveable offers, preserve the original order and eighteen existing offers, honour authored brand/size metadata. |
| `PhotoUploadPanel.tsx`, new `ExampleChooser.tsx` and `outfit-examples.css` | Example selection, explicit Analyse, accurate attribution, natural native accessible names and non-destructive central photo framing. |
| `RecognitionResults.tsx` and `recognition-results.css` | Three-model selection, published-model wording, featured-piece indication and no fabricated percentages. |
| `FashionDossier.tsx` | Published-design source link, design notes without invented feature coordinates; resale markup remains commented out. Its user-edited stylesheet is unchanged. |
| `FirstSightPage.tsx` | Keep outfit shopping independent of selection; coordinate cross-piece owner/PDP opening; derive the PDP by current product ID; validate saves and bag actions against the full edit. |
| `PurchaseGrid.tsx` | Retain the four-field card and unavailable behaviour, add product-ID metadata and a restrained featured-piece cue. |
| `App.tsx` | Accept the two new journal reference IDs in visit-local inspiration saves; persistent wardrobe uses canonical catalogue IDs. |
| `scripts/setup-outfit-media.mjs`, `package.json` | Restore eight reviewed, byte-validated images into ignored storage; valid local files work offline. |
| New Node/browser outfit tests and independent fixtures | Same-photo membership, real model identities, ownership guards, native keyboard selection, journal/product saves, bag quantities, cancellation and enlarged text. |
| Media helper and preview config | Substitute only the additional ignored media prefix in portable tests; include the new App-route preview scenarios. |
| README, architecture/code guides, walkthrough, roadmap and research record | Setup, module ownership, current result modes, evidence limits and handover. |

Paths without a prefix in this table belong to `src/features/first-sight/`; component paths belong
to its `components/` directory. Browser files are under `tests/browser/`.

### D. Implementation decisions and trade-offs

- Use the existing native result-card list to select pieces rather than a new photo-hotspot map.
  This supplies a clear same-photo journey without unmeasured regions or competing touch targets.
- Keep dossier feature coordinates separate from source-photo membership. Empty annotations are
  deliberate for unmeasured new packshots; all four design notes remain accessible.
- Display every model's offers together; derive product ownership at the same time. A visual
  aggregation alone would have failed the old selected-study purchase/save guards.
- Keep the original five studies and forty-four references intact. Six new offers are appended
  to the global catalogue so Discover's established first four featured products retain their order.
- Keep product facts distinct from fictional listing assumptions. The wider Vault classification
  renewal and additional researched brands remain separate work.

### E. Activity ledger

| Step | Actual outcome |
| --- | --- |
| WO.1 — Baseline | Recorded branch `new-analysis`, HEAD `00578d6`, dirty files and fingerprints of four protected user-edited files. No staging or delivery. |
| WO.2 — Content/media | Two authored looks, six named models, eight locally restored photographs; correct colours and single-product packshots verified. Actual WebP uses a `.webp` filename. |
| WO.3 — Contracts/provider | Added explicit example mode without changing the gateway method. Legacy five-study requests, reference ordering and cancellation remain covered. |
| WO.4 — Consumer integration | Three-piece results, model-specific dossier, complete outfit shopping, cross-piece PDP/save/bag flow and two journal saves integrated. |
| WO.4 review correction | App's original valid-look registry omitted the two new reference IDs; added them and verified that journal saves remain separate from product wardrobe saves. |
| WO.5 — Visual correction | Real-image inspection caught a stretched caption backing caused by top/bottom CSS rules; corrected the selector and checked the badge geometry across engines. |
| WO.5 — Keyboard test correction | Initial full run passed 204/206. Two new Firefox checks used programmatic focus after a mouse action; replaced that setup with native Tab navigation while retaining the focus-ring assertion. |
| WO.5 — Final gates | 206 distinct browser cases have passing latest results: 197 passed in the repeated full matrix and nine timing failures passed serially. Ten production-preview cases pass. Parallel timing instability remains recorded. |
| WO.6 — Documentation | Setup, ownership map, walkthrough, roadmap and this A–G record updated. |

### F. Verification evidence

- Both TypeScript checks and all **45 Node tests** pass.
- Independent data audit: **5 legacy studies / 18 legacy offers / 44 legacy references** preserved;
  **2 new examples / 6 new studies and offers / 2 new references**; 30 catalogue IDs, 24 unique offers
  and 58 globally distinct SKUs.
- Ten real-photo Chromium width/example combinations passed at 1440, 1024, 768, 390 and 320 px,
  with no broken outfit media, overflow, page errors or unexpected application requests.
- Twelve further unsubstituted real-media checks passed across Chromium and Playwright WebKit at
  1440, 390 and 320 px. Photo badges stayed compact and all displayed outfit images decoded.
- Four protected file fingerprints remain unchanged: `fashion-dossier.css`, `OutfitMasonry.tsx`,
  `outfit-masonry.css` and `outfit-magazine.css`.
- Browser matrix: 206 distinct cases across nine projects, all with passing latest results.
  The repeated full run passed 197 and timed out in nine; all nine passed a serial rerun without
  relaxed assertions or time limits. This is not a claim of one clean 206-case parallel run.
- The passing case set includes 95 axe evidence attachments and their zero-violation assertions.
  Coverage includes FirstSight flow/resilience/accessibility, Discover flow/accessibility/landscape
  and the new whole-outfit scenarios. Incomplete/manual-review rules remain outside that guarantee.
- All ten production-preview checks pass. Production build passes: 67 modules, CSS 97.12 kB
  (19.13 kB gzip), JS 404.61 kB (120.77 kB gzip). No new runtime dependency was added.
- Node syntax, diff checks and ignored-image checks pass; nothing is staged, committed or pushed.

Detailed generated logs, screenshots and JSON results are outside Git at
`/tmp/loomstory-whole-outfit-qa/`. Portable browser tests substitute ignored images; the separate
checks above used actual photographs. Actual Safari, physical touch devices and screen readers
have not been tested. Automated accessibility scans do not replace those manual checks.

### G. Assessment and delivery

The integrated journey now demonstrates more than a bag while retaining the prototype's service
boundary and canonical commerce guards. Product identity and editorial association are explicit;
no false AI score, garment maker, manufacturing claim or resale value was added to complete a look.

Implementation and scoped verification are complete; hand over the uncommitted change for review.
Parallel-run timing reliability remains a testing limitation on this machine. Additional Fendi/Levi's
cases, the wider project renewal and expressive animations are
not part of this implementation. No commit, push or merge is authorised by this slice.
