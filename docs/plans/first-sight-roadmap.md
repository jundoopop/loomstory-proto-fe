# FirstSight P1–P17 roadmap and Discover P18 renewal

Latest implementation slice: [whole-outfit analysis examples](whole-outfit-example-plan.md),
confirmed by the user on 5 November 2026. Two ROSÉ × PUMA samples add six documented real models
to FirstSight's example chooser, with whole-look commerce and the original five-study library
retained. This is separate from the proposed wider project renewal and deferred animations.
Git delivery requires a separate explicit instruction.

Recorded: 2026-11-04. Branch inspected: `new-analysis`. Starting commit: `c45cf42`.

This file preserves all seventeen original FirstSight phases and the separately approved Discover P18 renewal. It is the repository reference for resuming work across chat sessions. The [engineering role](first-sight-engineering-role.md) defines how to work; the [P1–P4 plan and assessment](first-sight-p1-p4-plan.md) records the completed first slice.

The delivered P8–P12 slice is documented in the [detailed P8–P12 plan](first-sight-p8-p12-plan.md), including its dependency boundaries, exact files/functions, acceptance criteria, self-assessment and verification workflow. The [P5–P7 assessment](first-sight-p5-p7-plan.md) remains an earlier historical record. Use British English for new communication and prose.

The approved completion slice is documented in the [P13–P16 workflow](first-sight-p13-p16-plan.md).
The user authorised implementation on 5 November 2026. Execution preserves P13 → P14 → P15 → P16;
P17 was subsequently authorised, committed as `d32ef3c3f700f936b409c06a5dfa7cde4f6b9252` and
pushed to `origin/new-analysis`. No `new-home-page` or `main` merge was performed at that checkpoint.
The approved [Discover P18 plan](discover-p18-plan.md) is complete and verified. The user has now
explicitly authorised its commit, push and integration into `main` through `new-home-page`.

## Current status and authorisation

- Planning documents: saved before implementation and retained here.
- User approval: P1–P4, received 2026-11-04.
- Application implementation: P1–P12 delivered at `0b43280` on `new-analysis` and `new-home-page`. P13–P16 were verified and delivered through P17 as `d32ef3c` on `origin/new-analysis`. P18 is complete and verified, with its Git delivery now explicitly authorised.
- Remote checkpoint: `df562e293f445f0d7cc19e73f5e622ac36b623dd` was pushed to `origin/new-analysis` at the user's request on 4 November 2026. It was superseded by the authorised P5–P12 checkpoint `0b43280` on both remote branches. P17 then advanced `origin/new-analysis` to `d32ef3c`; the local branch tracks that remote branch.
- Current slice: the user authorised P18 Discover renewal after P17 delivery, retaining a hybrid homepage, four editorial collections, shared visit-local inspiration saves and an authored-photo hand-off. The [P18 plan](discover-p18-plan.md) records exact owners and activity; the [Discover record](../discover-verification.md) records the completed verification and manual limitations.
- Historical delivery authorisation, 5 November 2026: the user explicitly authorised the combined P5–P12 commit, a push of `new-analysis`, and merging/pushing that work to `new-home-page`. This superseded the earlier review-only restriction for that checkpoint; `main` was outside that earlier authorisation.
- Current delivery authorisation, 5 November 2026: the user instructed, “Show me a commit and push it, and merge to the main”. Deliver the verified P18 work with the [detailed EC-style message](discover-p18-commit-message.txt), following `new-analysis` → `new-home-page` → `main`. Git history and remote verification will record completed delivery actions; this authorisation does not itself claim they have occurred.
- Historical checkpoint authorisation: the user requested the detailed P1–P4 Git commit after the assessment, following EU System v1.15.0 conventions. That checkpoint included the implementation, tests, role, roadmap and assessment.
- P1–P4 verification: typecheck, 18 tests, production build, diff check, baseline-data comparison, independent code review, and Chrome desktop/mobile regression passed.
- P5–P7 verification: typecheck, 31 tests, production build, preservation comparison, provider error/retry/cancel in the real page, existing page regression and four-width drawer checks passed. Axe reported zero violations in the checked drawer views. Details and limitations are in the P5–P7 assessment.
- P8–P12 verification: typecheck, 35 tests, production build, diff check, baseline comparison and independent source review passed. Fifteen primary and four supplemental Chrome check groups passed, including five widths, both entry points, state isolation, empty/failure cases, local upload, touch and native-dialog transitions. Scoped marketplace/drawer axe checks passed; 45 existing whole-page contrast findings remain documented in the assessment.
- P17 delivery was explicitly authorised and completed before P18 implementation. P18 Git actions were initially deferred for review and are now authorised by the separate current delivery instruction above.
- P13–P16 final verification, 5 November 2026: clean install, both TypeScript checks, 35 Node tests, 74 development browser executions, 55 accessibility state scans with zero reported violations, three production-preview checks, data preservation and diff checks pass. The earlier 45 contrast findings are corrected. See the current verification record for incomplete image checks, manual-testing gaps and the existing Vite advisory.
- Verification necessary for P1–P4 is part of that slice even though the broader testing phase is P13.
- P18 changes are limited to the approved Discover renewal and FirstSight hand-off. Integration into `main` is now authorised. Global Vault migration and live services remain deferred. Expressive magazine animation follows Discover and requires a separate plan.

The previous full plan assumed a single migration across all phases. Splitting it required temporary compatibility fields. P5 removed `recognitionItems`, `toRecognizedItem()` and `looksFor()`; the gateway resolves references through its provider. P6 populated required `OutfitLook.relationship`. P8–P10 removed `RecognizedItem.products` and `PurchaseOption.affordable` after migrating their consumers. Canonical commerce data is `commerce` throughout the current interface. Phase descriptions below preserve the original planned sequence; use the ledger and compatibility checklist for final status.

## Phase ledger

| Phase | Objective | Status |
| --- | --- | --- |
| P1 | Explicit commerce and recognition contracts | Complete; verified 2026-11-04 |
| P2 | Pure commerce rules and presentation labels | Complete; verified 2026-11-04 |
| P3 | Classify all eighteen existing sample offers | Complete; verified 2026-11-04 |
| P4 | Split the five recognition edits with a compatible output | Complete; verified 2026-11-04 |
| P5 | Local content-provider boundary and future adapter documentation | Complete; verified 2026-11-04; included in authorised P5–P12 checkpoint |
| P6 | Authored cultural relationship metadata | Complete; all 44 references; included in authorised P5–P12 checkpoint |
| P7 | Opt-in Inspire drawer and its interaction design | Complete; independently verified and integrated through P8; included in checkpoint |
| P8 | FirstSight page state, archive defaults, and drawer orchestration | Complete; integration verified 2026-11-04; included in checkpoint |
| P9 | Archive-only PurchaseGrid contract and labels | Complete; integration verified 2026-11-04; included in checkpoint |
| P10 | Cultural PDP sidebar with an opt-in Inspire entry | Complete; integration verified 2026-11-04; included in checkpoint |
| P11 | Relationship labels in journal cards and dialogs | Complete; integration verified 2026-11-04; included in checkpoint |
| P12 | Toolbar, responsive controls, and Section 3 styling | Complete; five-width checks passed; included in checkpoint |
| P13 | Complete contract and interaction verification | Complete; 35 Node tests retained; durable browser suite delivered |
| P14 | Update existing architecture, source, and code guides | Complete; final implementation/results reconciled |
| P15 | Browser simulation and accessibility checks | Complete; 55 axe state scans pass; manual limitations documented |
| P16 | Final type, test, diff, and production-build gates | Complete; 74 development + 3 production browser executions pass |
| P17 | Reviewed EC-style feature commit | Complete; `d32ef3c` pushed to `origin/new-analysis`; no home/main merge at that checkpoint |
| P18 | Discover renewal and reference hand-off | Complete and verified; 40 Node / 128 development / 6 preview checks; commit, push and main integration explicitly authorised |

## P1 — Explicit domain contracts

Modify `src/features/first-sight/types.ts`:

- Add `CommerceTrack`, `ArchiveListingKind`, `ListingKind`, `CommerceProfile`, and `CommerceEdit`.
- Make `CommerceProfile` a discriminated union so `archive` cannot use `partner-preview` and `style-match` cannot use an archive listing kind.
- Add required `PurchaseOption.commerce`; keep derived, deprecated `affordable` until P9/P10 are migrated.
- Add required `RecognizedItem.commerce`; keep derived, deprecated `products` during the migration.
- Add `RecognitionStudy` with `contextReferenceIds`, without resolved `looks` or legacy `products`.
- Define `ContextRelationship`; defer its required use in `OutfitLook` to P6.

Deliverable: precise data contracts with an explicit migration path and no additional React state.

## P2 — Commerce helpers and invariants

Create `src/features/first-sight/commerce.ts`:

- `listingKindLabel(kind)` and `contextRelationshipLabel(relationship)` own display wording.
- `isArchiveOffer(product)` and `isStyleMatchOffer(product)` inspect explicit metadata.
- `createCommerceEdit(archive, styleMatches)` validates track membership and duplicate IDs before constructing an edit.

Deliverable: one dependency-free location for the business rules. Price does not choose a track.

## P3 — Offer metadata

Modify `src/features/first-sight/fixtures.ts`:

- Add commerce metadata to `OfferDetails` and all eighteen `offerDetails` entries.
- Assign two vintage-original Paddington offers, one designer reissue, ten archive studies, and five partner previews.
- Populate `PurchaseOption.commerce` in `sampleOffers`.
- Derive the temporary `affordable` field from `commerce.track`.
- Preserve stable catalog IDs, prices, sizes, stock, gallery references, materials, and conditions.
- Keep `offersFor(ids)` as ordered, explicit catalog resolution.
- Remove the mixed `purchaseOptions` export after P4 switches its sole application consumer to explicit lists.

Deliverable: every offer has one authored classification and a short match reason.

## P4 — Recognition-study assembly

Modify `src/features/first-sight/recognition.ts`:

- Replace `GarmentStudyInput.productIds` with `archiveProductIds` and `styleMatchProductIds`.
- Rename `lookIds` to `contextReferenceIds`.
- Change `garmentStudy()` and `paddingtonStudy` to produce `RecognitionStudy` values.
- Export canonical `recognitionStudies` in the existing five-study order.
- Retain and extend `looksFor()` for local resolution of Chloé and general reference IDs.
- Add `toRecognizedItem(study)` as a temporary synchronous compatibility adapter.
- Keep `recognitionItems = recognitionStudies.map(toRecognizedItem)` for the current gateway and tests.
- Derive legacy `products` from `commerce.archive` plus `commerce.styleMatches`; retain resolved `looks`.

Deliverable: separate commerce streams in every study while the current page and gateway continue working.

## P5 — Content-provider architecture

Create `src/features/first-sight/services/content/contracts.ts` with `ContextContentRequest` and `ContextContentProvider.getReferences(request, signal)`.

Create `services/content/prototype.ts` with a local registry of Chloé and general references, ordered lookup, duplicate/missing-ID validation, and abort behavior.

Create `services/content/providers/README.md` documenting future Instagram, YouTube, Commons, and licensed-curator adapters: normalized metadata, server credential ownership, cancellation, provider failures, caching, attribution, and embed rendering boundaries.

Modify `services/prototype.ts` to add `createPrototypeGateway(contentProvider)` and compose `recognitionStudies` with resolved references after the existing demonstration delay. Update contract comments in `services/contracts.ts`.

Retire the temporary `recognitionItems` export, `toRecognizedItem()` adapter, and local `looksFor()` after tests and the gateway use the new composition path. Retain legacy `products` only until P8 migrates the page.

No external API, account, token, SDK, iframe, or paid service is connected in this phase.

## P6 — Cultural relationship metadata

Add required `OutfitLook.relationship` in `types.ts`. Populate it in `chloe.ts` and `looks.ts` using `same-design`, `runway-reference`, and `styling-inspiration`.

Keep labels authored and avoid treating the photographed reissue as the exact edition of every historical reference. Preserve source URLs, credit, licenses, dimensions, and images.

## P7 — The Inspire drawer

Create `components/StyleMatchDrawer.tsx` with `StyleMatchDrawer`, `StyleMatchDrawerProps`, and an internal `StyleMatchCard`.

Inputs: `open`, `itemName`, `products`, `savedIds`, `onClose`, `onToggleSave`, `onPreviewPartner`.

Each card includes image, partner-preview label, name, price, sizes/availability, material, color, match reason, visit-local save, and a partner-offer preview action. Retain selections when closing and reopening during the visit.

Use a native dialog with Escape, close button, backdrop dismissal, contained focus, and return to the triggering control. Alternatives remain in the drawer and use separate preview actions.

Create `components/style-match-drawer.css`: `.fs-style-drawer`, `.fs-style-drawer-shell`, `.fs-style-drawer-header`, `.fs-style-drawer-close`, `.fs-style-drawer-grid`, `.fs-style-match-card`, `.fs-style-match-image`, `.fs-style-match-details`, `.fs-style-match-sizes`, `.fs-style-match-actions`, and `.fs-style-match-disclosure`. Use the existing burgundy/ivory palette, responsive drawer/sheet behavior, and 44 px controls.

## P8 — Page orchestration

Modify `src/pages/FirstSightPage.tsx`:

- Add `styleMatchOpen` and visit-local `savedStyleMatchIds`.
- Derive `archiveProducts` and `styleMatchProducts` from `selected.commerce`.
- Close the drawer on photo changes, new analysis, study changes, and archive PDP entry.
- Guard `openProduct()` and `addToCart()` with archive-track predicates.
- Add `toggleStyleMatchSave()` and `previewPartnerOffer()`.
- Send only archive products to the main grid and add an opt-in toolbar trigger.
- Mount the drawer near the existing cart dialog; preserve the journal and page sections.
- Update the PDP props for its Inspire entry point.

Remove legacy `RecognizedItem.products` once all page consumers have migrated. Keep style-match saves separate from global wardrobe storage.

## P9 — Archive-specific purchase cards

Modify `components/PurchaseGrid.tsx`: rename `products` to `archiveProducts`, use explicit listing-kind labels, and remove its `affordable` read. Update component ownership comments. Archive cards retain current save and PDP navigation callbacks.

## P10 — PDP commerce separation

Modify `components/ProductDetailPanel.tsx`:

- Remove `alternatives`, `onSelectProduct`, `affordableAlternatives`, price-based sorting, and `AlternativeNote`.
- Add `styleMatchCount` and `onOpenStyleMatches`.
- Keep gallery/SKU state, specifications, sample bag actions, and `StyleNote`.
- Render cultural references plus an explicit Inspire prompt in the sidebar.
- Show relationship labels in `StyleNote`.

Modify `components/product-detail.css`: replace obsolete `.fs-pdp-alternative*` rules with `.fs-pdp-style-list` and `.fs-pdp-inspire-prompt` styles, including responsive and focus states.

Remove `PurchaseOption.affordable` and its fixture projection after P9 and P10 have removed all readers.

## P11 — Style Journal relationship labels

Modify `components/OutfitMasonry.tsx`: use relationship labels for item-context badges and the detail-dialog kicker; keep geographic regions on the trends board. Update authored-metadata explanatory copy.

Modify `components/outfit-magazine.css` and the base selector in `pages/first-sight.css` to support `.fs-look-relationship`, preserving geographic badges elsewhere. Preserve burgundy surfaces, natural image proportions, and Pinterest-like columns.

## P12 — Toolbar and responsive layout

Modify `pages/first-sight-flow.css`: add `.fs-archive-toolbar-copy`, `.fs-style-match-trigger`, `.fs-style-match-count`, mobile stacking, focus states, and empty-result treatment. Keep commerce visually primary and the journal persistently visible. Do not restore the old timer.

## P13 — Contract and behavior tests

Extend `tests/firstSightRecognition.test.mjs` for distinct edits, explicit tracks, catalog membership, stock/SKU integrity, reference relationships, and abort races.

Create `tests/firstSightCommerce.test.mjs` for meaningful edit invariants and classification independent of price. P1–P4 will add the data checks they need before this broader phase.

Create `tests/firstSightContentProvider.test.mjs` for ordered resolution, missing/duplicate references, and abort behavior after P5 is implemented. Verify drawer behavior during the browser phase; use existing tooling without adding unnecessary test infrastructure.

## P14 — Existing project documentation

Update `docs/code-guide.md`, `docs/first-sight-prototype.md`, `docs/architecture.md`, `docs/first-sight-sources.md`, and `docs/verification-checklist.md` to match implemented ownership, data flow, adapters, relationships, and state lifetimes.

Record implemented behavior separately from the roadmap. Preserve `docs/first-sight-review-2026-11-04.md` as a historical assessment. Keep this roadmap's statuses and adapter-removal checklist current as work proceeds.

## P15 — Browser and accessibility simulation

Check 1440, 1024, 768, 390, and 320 px. Cover upload/sample analysis, all five study switches, archive-only default cards, persistent journal, both drawer entry points, size/save retention, partner preview, unchanged archive bag, PDP behavior, focus return, Escape/backdrop close, keyboard/touch use, console errors, images, overflow, and network activity.

Only claim the browsers, viewports, and interactions actually checked. Browser simulation is not a consumer study or an accessibility certification.

## P16 — Final quality gate

Run `git diff --check`, `npm run typecheck`, `npm test`, and `npm run build`. Inspect the final diff and file list. Verify removal of temporary adapters, absence of ignored photographs, and the remaining limitations. Resolve failures before delivery.

## P17 — Commit and handoff

Planned commit subject:

```text
feat(first-sight): separate archive and style-match shopping
```

Use the requested EC type/scope/subject/body conventions; review current changes and verification before committing. Provide the commit ID, behavior change, files/symbols changed, checks run, known limitations, and recommended next increment. Do not push or merge without authorization.

## Compatibility removal checklist

| Temporary construct | Added/retained in | Removal condition |
| --- | --- | --- |
| `recognitionItems` export | P4 | Removed in P5; gateway/tests consume provider composition |
| `toRecognizedItem()` local adapter | P4 | Removed in P5; gateway owns asynchronous context composition |
| `looksFor()` local resolver | Existing; retained P4 | Removed in P5; content provider resolves all references |
| `RecognizedItem.products` | Existing; retained P1–P4 | Removed in P8; page/tests consume explicit `commerce` streams |
| `PurchaseOption.affordable` | Existing; derived P3 | Removed after P9/P10 migrated the last readers |

## Separate future sitewide decision

Global `/vault`, homepage routing, the shared catalog, legacy item detail, and wardrobe integration require a separately approved scope. Likely owners are `src/types.ts`, `src/data/catalog.ts`, `pages/CatalogPage.tsx`, `components/ItemCard.tsx`, `pages/ItemPage.tsx`, and `App.tsx`. Completing the FirstSight roadmap does not by itself complete that migration.

## P18 — Discover renewal and inspiration-to-FirstSight hand-off

Approved on 5 November 2026 after the user explicitly authorised P17 delivery. Baseline:
`d32ef3c3f700f936b409c06a5dfa7cde4f6b9252` on `new-analysis`, pushed to `origin/new-analysis`.
No `new-home-page` or `main` merge was performed at the P17 checkpoint. The user subsequently
authorised committing and pushing P18, then integrating through `new-home-page` into `main`.

- Move `TrendHero` into Discover as the homepage cover; show the selected six-photo board immediately.
- Retain the hybrid homepage's Vault search, four products and Stories/submission destinations.
- Keep four existing editorial collections and source metadata; `?collection=<id>` retains the edit.
- Use `/first-sight?look=<id>` to prepare a canonical authored reference with its credits, followed
  by explicit analysis of the unchanged five-study prototype.
- Share saved inspiration through App-visit state across Discover/FirstSight, including all forty
  Commons and four Chloé references; reset on reload and keep wardrobe/Inspire state separate.
- FirstSight retains its photo/dossier and archive/journal chapters with renumbered navigation.
- See the [detailed P18 workflow](discover-p18-plan.md) and [verification record](../discover-verification.md).
  Final P18 checks pass: clean install, both typechecks, 40 Node tests, 128 development browser
  executions, 85 accessibility state scans and six preview checks. Data preservation passes;
  incomplete accessibility checks and remaining manual gaps stay explicit in the A–G assessment.
- Use the [detailed P18 commit message](discover-p18-commit-message.txt). The fetched `origin/main`
  checkpoint `4c7c737` retains the prior homepage merge history and has the same tree as `0b43280`.
  Fast-forward the homepage branch where possible, then use a normal merge into `main` to preserve
  that history. Confirm the resulting tree and remote branch tips before reporting delivery complete.

The later expressive magazine animation phase remains deferred until Discover's layout is settled
and its separate plan is agreed. P18 staging, committing, pushing and main integration are explicitly
authorised by the latest delivery instruction. No later feature work is included in that instruction.

### P18 follow-up — Landscape inspiration workspace

After delivery of P18 (`d64b349`, merged to main as `ad73d91`), the user approved the
[landscape workspace plan](discover-landscape-plan.md). Implementation and verification are complete:
116 affected browser executions, 31 axe scans, seven preview checks, both typechecks and 40 Node
tests pass. On
landscape displays at least 1024×600, the hero and board share a viewport-height frame with native
independent scrolling. Portrait, narrow and short windows keep stacked page flow. The earlier P18
Git authorisation did not initially cover this follow-up. The user has now explicitly authorised
a local EC-style commit, including the commented-out `fs-dossier-resale` patch. Do not push or merge
this follow-up without a separate instruction. Expressive magazine animation remains a later task.


### Archive product-card renewal — 5 November 2026

After the landscape follow-up's local commit `00578d6`, the user approved the
[archive-card renewal](archive-product-card-renewal.md). Simplify FirstSight cards to condition,
brand, product name and EUR price; move listing context into the PDP. Mark only wholly unavailable
pieces with greyscale and crossed-out information, preserving viewing and saves. Retain canonical
catalogue data, archive/Inspire boundaries and all current uncommitted heart/dossier edits.
Implementation and verification are authorised; staging, commit, push and merge are not included.
The renewal is complete and verified: both TypeScript checks, 40 Node tests, 127 affected browser
executions, 55 axe scans with zero detected violations, production build and eight preview checks
pass. See its activity ledger and A–G assessment for exact coverage and manual-review limitations.
