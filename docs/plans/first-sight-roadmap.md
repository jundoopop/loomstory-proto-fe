# FirstSight P1–P17 implementation roadmap

Recorded: 2026-11-04. Branch inspected: `new-analysis`. Starting commit: `c45cf42`.

This file preserves all seventeen phases from the agreed planning conversation. It is the repository reference for resuming work across chat sessions. The [engineering role](first-sight-engineering-role.md) defines how to work; the [P1–P4 plan and assessment](first-sight-p1-p4-plan.md) records the completed first slice.

The current slice is documented in the [detailed P8–P12 plan](first-sight-p8-p12-plan.md), including its dependency boundaries, exact files/functions, acceptance criteria, self-assessment and verification workflow. The [P5–P7 assessment](first-sight-p5-p7-plan.md) remains the prior slice's historical record. Use British English for new communication and prose.

## Current status and authorization

- Planning documents: saved before implementation and retained here.
- User approval: P1–P4, received 2026-11-04.
- Application implementation: P1–P12 complete within their slice boundaries and verified on `new-analysis`; the P7 drawer is integrated through P8.
- Remote checkpoint: `df562e293f445f0d7cc19e73f5e622ac36b623dd` was pushed to `origin/new-analysis` at the user's request on 4 November 2026. The local branch now tracks that remote branch.
- Current slice: the user authorised P8–P12 end to end, with plan assessment, autonomous implementation, an activity ledger and A–G/EC-format reporting. Implementation and verification are complete; the strengthened plan records the final assessment and review-only message.
- Delivery authorisation, 5 November 2026: the user explicitly authorised the combined P5–P12 commit, a push of `new-analysis`, and merging/pushing that work to `new-home-page`. This supersedes the earlier review-only restriction for this checkpoint. `main` remains outside the authorised merge.
- Checkpoint authorization: the user requested a detailed P1–P4 Git commit after the assessment, following EU System v1.15.0 conventions. Include the implementation, tests, role, roadmap, and assessment in that checkpoint.
- P1–P4 verification: typecheck, 18 tests, production build, diff check, baseline-data comparison, independent code review, and Chrome desktop/mobile regression passed.
- P5–P7 verification: typecheck, 31 tests, production build, preservation comparison, provider error/retry/cancel in the real page, existing page regression and four-width drawer checks passed. Axe reported zero violations in the checked drawer views. Details and limitations are in the P5–P7 assessment.
- P8–P12 verification: typecheck, 35 tests, production build, diff check, baseline comparison and independent source review passed. Fifteen primary and four supplemental Chrome check groups passed, including five widths, both entry points, state isolation, empty/failure cases, local upload, touch and native-dialog transitions. Scoped marketplace/drawer axe checks passed; 45 existing whole-page contrast findings remain documented in the assessment.
- P13–P17 remain deferred as broader phases. The combined P5–P12 checkpoint and its delivery to `new-home-page` are separately authorised; the final P17 feature delivery is still deferred.
- Verification necessary for P1–P4 is part of that slice even though the broader testing phase is P13.
- Further implementation, route changes, the global Vault migration and merging to `main` remain deferred. The separately authorised P1–P4 and P5–P12 checkpoints do not complete the broader P13–P17 phases.

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
| P13 | Complete contract and interaction verification | Deferred; data checks start in P1–P4 |
| P14 | Update existing architecture, source, and code guides | Deferred |
| P15 | Browser simulation and accessibility checks | Deferred; basic regression check in current slice |
| P16 | Final type, test, diff, and production-build gates | Deferred; relevant gates also apply per slice |
| P17 | Reviewed EC-style feature commit | Deferred |

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
