# Discover P18 verification record

Recorded: 5 November 2026. Status: **complete and verified; P18 Git delivery explicitly authorised**.
Baseline: `d32ef3c3f700f936b409c06a5dfa7cde4f6b9252` on `new-analysis`.

P17 delivered the reviewed P13–P16 work to `origin/new-analysis` before P18 began. No
`new-home-page` or `main` merge was performed for P17. P18 remained uncommitted through review.
The user subsequently authorised its commit, push and integration through `new-home-page` into
`main`. The containing feature commit records P18; the integration merge preserves main's history.

Use this record with the [P18 plan and activity ledger](plans/discover-p18-plan.md),
[code-location guide](code-guide.md), [architecture](architecture.md) and
[review checklist](verification-checklist.md). The [P16 record](first-sight-verification.md)
preserves earlier results; those historical counts do not verify the changed P18 implementation.

## Delivered P18 acceptance and implementation boundaries

At the P18 checkpoint, Discover owns the four existing editorial collections, a 50/50 cover and its immediately visible
six-photo board. The homepage retains Vault search, four featured catalogue products and Stories/
submission destinations. `?collection=<id>` retains the edit through browser history. The finite
board has no photo search, regional filtering or saved-only mode. Its columns are three
above 1000 px, two at 600–1000 px and one below 600 px.

Cover and photograph-detail actions carry only an authored ID through `/first-sight?look=<id>`.
The resolver uses existing `outfitLooks`; unknown or URL-like input cannot supply an image address.
FirstSight presents that reference and its celebrity/title, photographer, source and licence, then
requires explicit analysis. The adjacent disclosure explains the unchanged five prepared studies.
FirstSight now has photo/dossier and archive/journal chapters, with a compact Discover link.

App owns shared inspiration saves for all forty Commons and four Chloé references. Saves survive
route navigation, reset on full reload and remain separate from durable product wardrobe saves
and FirstSight-only Inspire choices. Reference state initialises once per keyed workspace, so
ordinary rerenders cannot undo a photograph's removal/replacement. Only uploads own revocable URLs.

No new photographs, services, dependencies, authentication, live recognition, inventory or checkout
are added. Expressive magazine animation is deferred to its separately planned later phase.

## Reproducible commands

From the repository root with Node 22.13.0 or newer:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npm run typecheck:browser
npm test
npm run test:browser:all
npm run test:browser:a11y
npm run build
npm run test:browser:preview
git diff --check
```

`playwright.config.ts` owns its development server on port 5183, configurable through
`FIRST_SIGHT_TEST_PORT`. Preview owns port 4183, configurable through `FIRST_SIGHT_PREVIEW_PORT`,
and requires the preceding current production build. Occupied ports fail rather than reusing an
unrelated server. Narrow/cross-engine projects select tagged scenarios; record their actual
distribution and distinguish project executions from unique authored cases.

## P18 final executed gates

| Check | Final result/evidence |
| --- | --- |
| Clean installation | `npm ci` passed |
| Node contracts | 40 passed: 35 retained contracts and 5 new collection/reference cases |
| Application and browser TypeScript | Both passed |
| Development Chromium/Firefox/WebKit matrix | 128 project executions of 42 unique scenarios; no failures, skips, flakes or runner errors |
| Discover entry and editorial edits | Four covers and independently expected six-look orders verified on direct route loads |
| Cover/dialog hand-off | Correct authored photograph and metadata; analysis remains explicit |
| Invalid IDs, reload and Back | Unknown/empty/URL-like IDs keep the upload workspace; valid reload and collection history pass |
| Reference changes and photo ownership | Fresh query-only workspace, stale-result rejection and Remove/Replace retention verified |
| Shared saves | Cross-route save/unsave and reload reset pass; all four Chloé IDs accepted; wardrobe/Inspire remain separate |
| Retained consumer flows | Vault search, four product cards and Stories/submission links pass alongside FirstSight resilience cases |
| Responsive layout | 1440/1024/768/390/320 px checks pass; supplemental 599/600/1000/1001 px columns are 1/2/2/3 with zero overflow |
| Accessibility | 38 project executions / 85 axe state scans; zero reported violations with all six WCAG A/AA tag groups through 2.2 |
| Input modes and reflow | Keyboard/focus return, native dialog dismissal, touch emulation and doubled-text checks pass |
| Browser diagnostics | No unexpected page/console/HTTP/transport failure or application fetch/POST in exercised suite flows |
| Production build | 62 modules; JS 387.59 kB / 116.06 kB gzip; CSS 92.09 kB / 18.17 kB gzip |
| Production preview | 6 checks passed against the current built App; no runner errors |
| Production dependency audit | Zero reported vulnerabilities; existing Vite development advisory remains separate |
| Data preservation | Deep comparison unchanged: 5 studies, 18 offers, 44 references and their source/commerce content |
| Shared CSS and production exclusion | Direct Discover checks pass; built assets contain no test-host controls |
| Diff and media hygiene | Diff check passes; supplied media remain ignored/untracked; verification preceded the separately authorised Git delivery |

Project distribution: Chromium desktop 42; Chromium 1024/768/320 seven each; Chromium 390 seventeen;
Firefox desktop/390 and WebKit desktop/390 twelve each. These are 128 project executions, not 128
unique scenarios. Six additional production checks run in the isolated preview-only Chromium project.

The accessibility command now includes both FirstSight and Discover specs. The tag set is `wcag2a`,
`wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a` and `wcag22aa`; no contrast rule or target is excluded.
Axe retains 74 `color-contrast` and 82 `label-content-name-mismatch` incomplete rule occurrences
across scans. The total of 156 is repeated rule occurrences, not 156 unique defects. Photographic
text and named icon controls still require manual judgement; the zero-violation result does not
establish complete WCAG conformance.

Supplemental integration checks used same-path History/PopState navigation during analysis and
verified a fresh ready workspace, main focus and no late result. All four Chloé save guards pass.
The supplemental run recorded no page/console/HTTP failure or application fetch/POST.

The final A–G assessment and corrections are recorded in the [P18 plan](plans/discover-p18-plan.md).
Historical P16 counts remain unchanged in their original record rather than being reused for P18.

## Evidence, media and environment

Executed on 5 November 2026 with Node 22.16.0, npm 11.6.2 and Playwright 1.64.1, using the existing
managed Chromium/Firefox/WebKit projects. The final development run took approximately 121 seconds.
No new service or test/runtime dependency was introduced for P18.

Disposable evidence is under `/tmp/loomstory-discover-qa/p18/`: `final-browser.json`,
`final-node-tests.log`, `preview.json`, `preservation.json`, `manual-integration.json`,
`visual-review.json` and `production-audit.json`. These paths are execution evidence, not durable
repository assets; the commands and measured results in this record are the repeatable handover.

Exact local-media-present screenshots were taken at 1440/390/320 px. Discover images loaded at each
width and the reference workspace had zero horizontal overflow. Visual review covered the 1440/320
reference views and 1440/390 Discover views. Screenshots remain outside Git. This is separately
labelled visual evidence, not a physical-device or screen-reader test.

Portable browser runs substitute original test artwork only for ignored `/local-media/chloe/*`
photographs. Tracked Discover imagery loads normally and remains subject to diagnostics. This
distinguishes reproducible control/layout verification from exact supplied-photo rendering; label
any local-media-present checks separately. Supplied originals and served copies remain ignored.

Generated Playwright reports, screenshots and traces stay in ignored `playwright-report/` and
`test-results/`; preview has its own nested report directory. Keep screenshots containing supplied
photographs outside Git. Durable documentation records results without embedding those photographs.

## Known limitations to retain in the final report

- Managed WebKit is engine coverage, not a test of the installed Safari application.
- Emulated touch is not physical-device testing; a named screen-reader session remains separate.
- Automated accessibility scans can retain incomplete image-backed checks and do not establish
  complete conformance. Record manual judgement and enlarged-text methodology explicitly.
- The existing Vite 8.0.13 development-tool advisory remains a separate dependency follow-up.
- macOS may retain protected disposable Firefox app-data folders after an access-denied cleanup;
  the fixture reports that warning without changing personal profiles or OS permissions.
- Recognition, commerce and valuations remain illustrative prototype data.

## Landscape workspace follow-up — 5 November 2026

Status: **complete and verified; local commit authorised**. The completed P18 results above remain
historical evidence. The [follow-up workflow and activity ledger](plans/discover-landscape-plan.md)
records the new slice, based on delivered `ad73d91`/`d64b349` content. The subsequent local-commit
authorisation also includes the commented-out dossier resale section; it excludes push and merge.

The current landscape layout activates at width ≥1024 px, height ≥600 px and landscape orientation.
It places equal-width cover and board panels in a `calc(100dvh - 48px)` frame with a 24 px gap.
Header/Discover introduction stay above the frame. The cover image is above its caption and controls;
the board uses two natural-ratio masonry columns. Native scrolling remains independent in each panel
and can continue to the page at a boundary. Named focusable regions provide keyboard access. Outside
the media query, the original stacked page and responsive columns remain in normal document flow.

Collection changes reset only the board's internal scroll. Dialog dismissal retains its position.
Long/enlarged left-panel content remains accessible through native overflow. No data, gateway,
dependency or FirstSight behaviour is changed; expressive animation remains deferred.

### Final follow-up results

| Check | Result |
| --- | --- |
| Application/browser TypeScript | Both pass |
| Node tests | 40 retained cases pass; no new Node cases for this presentation slice |
| Focused cross-engine layout run | 21 executions pass |
| Final affected browser suite | 116 executions of 27 scenarios across nine projects pass; no failures, skips, flakes or runner errors |
| Specs in the affected suite | Discover flow, accessibility and landscape; FirstSight flow for retained hand-off/commerce behaviour |
| Axe | 31 scans, zero detected violations; all six A/AA tags through 2.2, no rule exclusions |
| Production preview | 7 checks pass, including landscape geometry at all five planned sizes |
| Build | 62 modules; CSS 93.98 kB / 18.48 kB gzip; JS 387.01 kB / 115.98 kB gzip |
| Data preservation | Deep comparison unchanged: 5 studies / 18 offers / 44 references, including attribution and commerce |
| Source/Git hygiene | Diff, new-file whitespace and guide links pass; supplied media/reports remain excluded; nothing staged/committed |

Project distribution: Chromium desktop 27; Chromium 1024/768/320 four each; Chromium 390 seventeen;
Firefox desktop/390 and WebKit desktop/390 fifteen each. The final affected run took about 86 seconds.
It replaces, rather than inherits, the interrupted run below. Existing FirstSight resilience and
FirstSight-only accessibility cases were not rerun for this Discover presentation slice.

Incomplete axe rule reports remain attached: 27 contrast and 28 label/name occurrences, not 55
distinct defects. Photographic backgrounds and icon labels require manual judgement; zero detected
violations is not full accessibility conformance. Actual Safari, physical touch and a named
screen-reader session remain unperformed.

Verified geometry at 1024×768, 1280×720, 1366×768, 1920×1080 and 2560×1440. Fallbacks include
768×1024, 1200×1600, 1024×1024, 390×844, 320×844, 1023×768 and 1366×599. The minimum 1024×600
workspace also passes doubled-text access and an axe scan. Native panel/PageDown/wheel scrolling,
boundary chaining, six-photo/source reachability, collection reset, dialog position/focus return and
collection/save retention through resize all pass. Explicit test scrolling aligns the workspace;
entering Discover itself does not automatically scroll.

Visual captures at 1024/1366/1920 show zero page or panel horizontal overflow. At 1366×768 both
panels are 720 px high with aligned tops approximately 24 px below the viewport edge. The intact
cover photo and its caption stay in flow. Full left-panel copy can require native scrolling on
laptop-height displays. Screenshots remain outside Git.

Executed on the same Node 22.16.0/npm 11.6.2/Playwright 1.64.1 environment as P18. Reproduce with:

```sh
npm run typecheck
npm run typecheck:browser
npm test
npx playwright test tests/browser/discover.flow.spec.ts tests/browser/discover.accessibility.spec.ts tests/browser/discover.landscape.spec.ts tests/browser/firstSight.flow.spec.ts
npm run build
npm run test:browser:preview
git diff --check
```

Preview now includes the tagged landscape spec. Disposable evidence is under
`/tmp/loomstory-discover-qa/landscape/`: `cross-layout.json`, `final-browser.json`, `final-summary.json`,
`preview.json`, `final-types.log`, `final-node-tests.log`, `final-build.log`, `preservation.json`,
`visual-layout.json` and screenshot/probe files. Generated browser reports remain ignored.

The first broad run was interrupted after Firefox repeatedly timed out before navigation emitted
an HTTP request, including on unchanged FirstSight cases. A standalone `data:` page worked. A second
probe with proxy routing disabled in the disposable Firefox profile reached the local server;
the fixture now uses a proxy-disabled disposable Firefox profile for loopback tests. This disables
proxy routing throughout that disposable profile, without changing personal profiles or OS permissions. Those interrupted attempts are diagnostic evidence, not a passing matrix.

During this work the user independently disabled the dossier resale section and edited its styling. Those edits remain
intact; its now-unused currency formatter was removed after TypeScript reported TS6133. The
landscape slice does not otherwise change FirstSight. Report the final checks against this combined
workspace state and keep canonical data preservation separate from the user's presentation edit.

### Local commit verification — 5 November 2026

The user subsequently authorised a local commit including the commented-out `fs-dossier-resale`
patch. Its sample data and CSS hooks remain intact. Unrelated dossier stylesheet changes and
`OutfitMasonry` indentation are excluded from the index and preserved in the working tree.

An isolated export of the staged source passes both TypeScript checks, all 40 Node tests, the
production build, all 116 affected browser executions and seven production-preview checks.
There are no failures, skipped cases, flakes or runner errors. Its 31 axe scans report zero
violations; incomplete results and the manual accessibility limitations above remain applicable.
The browser run took approximately 121 seconds. Candidate build: 62 modules, CSS 94.00 kB /
18.48 kB gzip and JS 387.01 kB / 115.98 kB gzip. These are the candidate's figures; earlier build
figures above include the independent dossier styling.

The fresh Ultra review also passed 21 additional cross-browser executions, with no blocking
findings from either independent reviewer. Generated evidence remains outside Git:
`/tmp/loomstory-discover-qa/landscape/ultra-review.json` and
`/tmp/loomstory-discover-qa/landscape/commit/` (`candidate.json`, `types.log`, `node.log`,
`build.log`, `browser.json` and `preview.json`). No source fixture, runtime dependency or public
contract changes. The local commit does not include a push or merge.
