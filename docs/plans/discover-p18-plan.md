# P18 — Discover renewal and inspiration hand-off

Approved: 5 November 2026. Status: **complete and verified; Git delivery explicitly authorised**.
Baseline: `d32ef3c3f700f936b409c06a5dfa7cde4f6b9252` on `new-analysis`.

The user explicitly authorised P17's commit and push before P18. P17 is delivered to
`origin/new-analysis`; `new-home-page` and `main` were not changed at that checkpoint. After reviewing
P18, the user explicitly authorised its commit, push and merge to `main`, through `new-home-page`.
The approved scope is the Discover renewal, not the later expressive animation work.

## A. Requirement and intended result

Delivered the magazine-style inspiration finder on Discover, moved from FirstSight. Kept a hybrid homepage:
editorial cover → visible six-photo collection → Vault search → four featured products → Stories
and submission links. FirstSight begins with its analysis workspace and retains archive shopping,
the contextual Style Journal and opt-in Inspire.

Keep the four authored collections: 90s Streetwear, Vintage Denim, Retro Cinema and Iconic Designer
Accessories. Collection selection updates the cover and board together. The main path is collection
→ reference details → Explore in FirstSight → explicit analysis → prepared studies and shopping.

## B. Agreed boundaries and engineering defaults

- Preserve five studies, eighteen offers, forty-four references and their authored metadata.
- No live APIs, new photographs, authentication, inventory, checkout or new runtime dependencies.
- Keep product wardrobe, visit-local inspiration saves and visit-local Inspire saves distinct.
- Shared inspiration saves survive route navigation, then reset on a full reload.
- Use authored reference IDs in `/first-sight?look=<id>`, never user-supplied image URLs.
- A hand-off prepares a photograph; it never starts analysis or claims a real outfit identification.
- Preserve Discover's selected collection in `?collection=<id>` using replacement navigation, so
  browser Back restores the edit. Unknown collections use the first authored collection.
- Cover: 50/50 desktop, stacked mobile. Board: three columns above 1000 px, two from 600–1000 px,
  one below 600 px. No new photo search, region filter or saved-only view.
- Later animation work follows Discover and requires its own plan. The user's subsequent delivery
  instruction authorises P18 Git actions and supersedes the implementation-only restriction.

## C. Exact owners and data flow

| Owner | Change |
| --- | --- |
| `src/pages/DiscoverPage.tsx` | Replace the original hero; keep search, four products and destination sections |
| `src/features/discover/components/TrendHero.tsx`, `trend-hero.css` | Move the cover; Discover branding, always-visible board, collection URL and hand-off actions |
| `src/features/discover/collections.ts` | Export authored collections, deterministic six-photo ranking and collection type |
| `src/features/discover/references.ts` | Pure authored-ID resolver to a reference `PhotoInput` |
| `src/features/first-sight/components/OutfitMasonry.tsx` | Optional region-filter visibility and reference action; reusable shared styles |
| `outfit-masonry.css`, `outfit-magazine.css`, `src/pages/first-sight.css` | Explicit reusable ownership; retain specialised contextual-journal and cart presentation |
| `src/features/first-sight/types.ts` | `SavedLookProps`; reference-photo variant with canonical `OutfitLook` metadata |
| `src/App.tsx` | App-visit inspiration saves; reference lookup; fresh keyed FirstSight entry and route focus/title |
| `src/pages/FirstSightPage.tsx`, `first-sight-flow.css` | Two chapters, Discover link, optional initial photo/unavailable notice; preserve request/commerce guards |
| `PhotoUploadPanel.tsx`, `upload-workspace.css` | Reference labels, photograph identity, credit/licence links and prepared-result disclosure |
| Node/browser tests and harness | Collection/reference invariants; move trend coverage; retain FirstSight regression coverage |
| `playwright.preview.config.ts` | Include tagged Discover checks in the production-only project |
| Existing guides/roadmap/verification record | Reconcile final ownership, journey, commands, results and known limitations |

App resolves the reference once per route render and keys FirstSight by the requested ID. FirstSight
initialises its photo state once per mount; saving a look cannot restore a removed/replaced image.
Changing reference ID remounts the workspace, aborting pending recognition and releasing only owned
upload object URLs. The gateway interface and deterministic five-study response remain unchanged.

## D. Trade-offs and final self-assessment

Reused the sourced library and photo-detail component, with explicit shared style ownership. App owns
the inspiration state needed across routes; catalogue persistence and FirstSight's bag, study selection
and Inspire choices retain their existing lifetimes. The gateway contract and runtime dependencies
are unchanged. `OutfitMasonry` stays in its established directory while its stylesheet is imported by
the component itself; a broader feature-directory migration is unnecessary for this slice.

Assessment: the approved prototype journey is ready for review. Reference input is canonical and typed;
state ownership, cancellation and cleanup are explicit; independently authored collection expectations
and real-route tests protect the integration. Review found no remaining blocking source issue. The
final matrix verifies responsive and cross-engine behaviour, with accessibility scans on Chromium
and keyboard/modal coverage across engines. Tests wait for the actual selected edit before measuring
its geometry; they do not hide zero-sized controls or exclude accessibility rules.

The interface preserves the ivory/burgundy editorial language, natural photo ratios, readable text
backings and large Discover controls. Its later expressive animation remains deferred. Automated
passes do not certify accessibility: photograph contrast and icon-label checks retain manual-review
items, and actual Safari, physical touch and a named screen-reader session remain unperformed.

## E. Activity ledger

| Task | Status | Evidence/action |
| --- | --- | --- |
| P17 prerequisite | Verified | `d32ef3c` committed with the prepared detailed EC-style message and pushed to `origin/new-analysis`; remote SHA confirmed; clean working tree |
| P18.1 baseline | Verified | Branch, original plan, routing, photo ownership, shared CSS and browser-test owners inspected; independent audits completed |
| P18.2 cover/Discover | Verified | Four covers and independently recorded six-look edits; visible board; hybrid homepage and Back restoration pass |
| P18.3 shared presentation | Verified | Extracted board/dialog styles; 3/2/1 columns; every visible Discover control has a 44 px target; journal regression passes |
| P18.4 state/hand-off | Verified | Both entry points, exact metadata, explicit analysis, invalid IDs, reload, Remove/Replace rerenders and cross-route saves pass |
| P18.5 FirstSight | Verified | Two chapters with retained anchors, Discover link and unchanged analysis/commerce/modal contracts |
| P18.6 verification | Verified | Clean install, both typechecks, 40 Node tests, 128 development and 6 production browser executions, 85 axe scans, preservation and diff checks pass |
| Handover | Reviewed; delivery authorised | A–G assessment, owner map, results and limitations reviewed; user authorised commit/push and integration into main |
| Integration: extracted module | Corrected and verified | Node's native TypeScript execution required the explicit `.ts` runtime import in `collections.ts`; all 40 tests pass |
| Integration: accessible names | Corrected and verified | Removed redundant collection `aria-label` values and hid the decorative heading dot; full six-tag scans pass |
| Integration: text reflow | Corrected and verified | Doubled text revealed board-heading/banner min-content overflow; scoped reflow fixes pass at 320/390 px |
| Integration: retained controls | Corrected and verified | Desktop product saves, product links and search controls now meet the same 44 px Discover target requirement |
| Integration: pre-analysis contrast | Corrected and verified | New reference-ready scan exposed three idle-state text styles at 4.00–4.03; scoped darker text passes at all five widths |
| Test integration | Corrected and verified | Aligned public button/link selectors; then replaced a six-card-count-only readiness check with selected-button, cover and exact-board assertions before geometry measurement |
| Supplemental boundaries | Verified | 599/600/1000/1001 px columns are 1/2/2/3 with zero overflow; query-only reference change aborts obsolete analysis and focuses main; all four Chloé save actions accepted |

## F. Acceptance and verification

Test all four collection covers and independently expected six-photo edits; immediate board
visibility; direct homepage load; exact cover/dialog reference hand-off; explicit analysis;
valid/invalid/URL-like IDs; reload and Back; query-only reference changes; replacement/removal;
cross-route inspiration saves and reload reset; unchanged wardrobe/Inspire semantics; existing search,
products and destination links. Preserve FirstSight failure, cancellation, SKU/stock and modal tests.

Check 1440/1024/768/390/320 px, specified column breakpoints, keyboard, focus return, Escape/backdrop,
touch emulation, enlarged text, image loading, overflow, console/network diagnostics and axe states.
Run Chromium/Firefox/WebKit, both TypeScript checks, Node tests, build, production-preview checks,
data comparison and `git diff --check`. Record actual counts and incomplete/manual coverage.

### Final executed results

- Clean `npm ci`, application/browser typechecks and all forty Node tests pass.
- The final development run passes 128 project executions of 42 authored scenarios across nine
  projects, with zero failures, skips, flakes or runner errors.
- Distribution: Chromium desktop 42; Chromium 1024/768/320 seven each; Chromium 390 seventeen;
  Firefox desktop/390 and WebKit desktop/390 twelve each.
- The accessibility specifications account for 38 project executions. Their 85 axe scans report
  zero violations using all six WCAG A/AA tag groups through 2.2, with no rule exclusions.
- Incomplete results remain attached: 74 contrast-rule and 82 label/name-rule occurrences across
  states. These are repeated rule reports, not 156 distinct defects. Photograph text and named
  icon-only controls still require human judgement; no full conformance claim is made.
- All six production-preview cases pass against the current built App, with no runner errors.
- The production build transforms 62 modules: JS 387.59 kB / 116.06 kB gzip; CSS 92.09 kB /
  18.17 kB gzip. Built assets exclude the development host and its controls.
- Production dependency audit reports zero vulnerabilities. The existing Vite development-tool
  advisory remains a separate follow-up; runtime versions and the lockfile are unchanged.
- Deep comparison confirms five studies, eighteen offers and forty-four references, including
  source and commerce data, are unchanged. `SubmitPage.tsx` is untouched.
- Actual local-photo visual checks at 1440/390/320 show loaded Discover images and zero reference
  workspace overflow. Reviewed desktop/mobile Discover and desktop/320 reference screenshots.
- Supplemental history, breakpoint and Chloé-save checks recorded no page/console/HTTP error or
  application fetch/POST. The durable suite also retains strict transport/request diagnostics.
- Diff, relative links and media/report exclusions pass. At the verification checkpoint P18 was
  unstaged and uncommitted; the subsequent delivery instruction authorises Git integration.

Commands, environment, evidence paths and limitations are in the
[Discover verification record](../discover-verification.md). Detailed JSON/log evidence is disposable
under `/tmp/loomstory-discover-qa/p18/`; generated reports and screenshots remain outside Git.

## G. Handover

P18 is implemented and verified on `new-analysis`, based on delivered P17 `d32ef3c`. The earlier
commit used `git commit --file=docs/plans/first-sight-p13-p16-commit-message.txt` followed by
`git push origin new-analysis`; its remote SHA was confirmed. Its detailed type/scope/imperative
subject and body follow the requested [EC Git conventions](https://ec.europa.eu/component-library/v1.14.2/ec/docs/conventions/git/).

Review Discover's four collections, both photograph hand-offs, the two FirstSight chapters and the
shared-save behaviour using the owner map and verification record above. The user has now explicitly
authorised P18's commit, push and merge to main. The delivery path is `new-analysis` → `new-home-page`
→ `main`, preserving the existing main merge history. The detailed message is saved in
[the P18 commit record](discover-p18-commit-message.txt); Git history records the resulting commit IDs.
The next feature discussion remains the separately deferred expressive magazine animation plan.
