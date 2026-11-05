# FirstSight P13–P16 workflow and P17 approval boundary

Prepared: 5 November 2026. Status: **P13–P16 complete and verified; P17 Git approval pending**.

Implementation baseline: `0b4328086e8b44a85ddf3085a44ada69c4ff0c88`, delivered on both
`new-analysis` and `new-home-page`. The workspace moved to other branches during planning;
no branch was switched by this planning task. File and symbol references below describe the
delivered P5–P12 baseline, not the older `main`/`refact-home` checkout.

The user approved this workflow on 5 November 2026 with “Can you start your work following the
phases?”. Planning used read-only inspection and independent audits. Execution now follows the
phase order below. P17 remains subject to fresh explicit authorisation; do not stage, commit or push.

Related references on the delivered branch: `docs/plans/first-sight-roadmap.md`,
`first-sight-engineering-role.md`, `first-sight-p5-p7-plan.md` and `first-sight-p8-p12-plan.md`.

## A. Requirement and intended result

Complete one coordinated assignment in the original order:

**P13 tests → P14 documentation → P15 browser/accessibility checks and corrections →
P16 final gates → user review → P17 only after explicit Git authorisation.**

Deliver a repeatable, documented and more accessible FirstSight prototype. Preserve the consumer
journey, commerce boundaries and editorial design. Replace reliance on disposable `/tmp` browser
scripts with repository-owned verification that another developer can run.

P14 documents the implemented system and P13 tooling. If P15 changes a detail, amend the affected
documentation in that task. This is reconciliation, not a change in phase order.

## B. Scope, assumptions and starting evidence

### Already delivered

- Five deterministic studies, eighteen offers and forty-four attributed references.
- Injectable local content resolution with ordering, failure handling and cancellation.
- Archive-only default commerce, canonical purchase guards and an opt-in Inspire drawer.
- Separate persistent archive wardrobe, sample bag, visit-local style saves and drawer SKU choices.
- Thirty-five Node tests covering the principal commerce/provider contracts.
- Earlier five-width browser checks covering both entry points, upload, transitions, empty/failure
  states, keyboard and touch emulation. These are evidence, not a durable browser suite.

### Remaining problems

- Temporary scripts depend on absolute workstation paths, fixed ports, external installations,
  ignored photos and some React-private handler access. They cannot be copied unchanged.
- General code/architecture guides describe retired contracts and mixed shopping behaviour.
- A recorded 1440 px workwear scan contains forty-five contrast nodes in five CSS ownership groups.
- Whole-page accessibility, broader browser checks and production-preview checks need a final record.

### Boundaries

- Implement only after approval. Proposed implementation branch: reuse `new-analysis` from the
  delivered checkpoint. Recheck the branch situation before execution; do not incorporate older or
  unrelated `refact-home` work implicitly. A different baseline requires an explicit plan adjustment.
- Retain React, TypeScript, Vite, plain CSS, routes, local gateway and the approved layout.
- Retain the burgundy journal, dossier interactions, section proportions and no-collapse behaviour.
- Keep photographs local; exclude supplied media and generated browser artefacts from Git.
- Keep authentication, live APIs, real inventory, checkout and global Vault migration outside scope.
- Add browser-testing development dependencies only; no application runtime dependency.
- Do not commit, push or merge the future slice before fresh P17 authorisation.

## C. Exact files, components and functions

### P13: durable verification

| File | Planned responsibility |
| --- | --- |
| `package.json` | Keep `npm test` Node-only. Add `test:browser`, `test:browser:all`, `test:browser:preview`, `typecheck:browser`; add the accessibility command in P15 |
| `package-lock.json` | Lock compatible `@playwright/test`, `@axe-core/playwright` and direct `@types/node` development dependencies; avoid unrelated upgrades |
| `playwright.config.ts` | Managed browser projects, viewport selection, isolated contexts, owned server/base URL, timeouts and failure artefacts |
| `playwright.preview.config.ts` | Shared settings for built-bundle smoke checks; exclude the development harness |
| `tsconfig.browser.json` | Typecheck browser specs, helpers, harness and configs; application tsconfig currently excludes them |
| `.gitignore` | Ignore generated `playwright-report/` and `test-results/`, retaining existing media exclusions |
| `tests/browser/firstSight.flow.spec.ts` | Real `/first-sight` route: five studies, upload/cancel, archive/PDP/Inspire, state separation, stock and wardrobe persistence |
| `tests/browser/firstSight.resilience.spec.ts` | Controlled empty/mixed/failure/pending data, stale SKU, modal lifecycle, long copy and visit-state reset |
| `tests/browser/helpers/firstSight.ts` | Named helpers such as `analyseSample`, `selectStudy`, `openInspire`, `expectArchiveEdit`; public roles/labels and scoped stable classes |
| `tests/browser/helpers/media.ts` | Original test artwork and substitution limited to ignored Chloé media URLs |
| `tests/browser/helpers/diagnostics.ts` | Unexpected console/page/HTTP failures and application fetch/POST; explicitly distinguish intentional negative-test failures |
| `tests/browser/fixtures/expected-edits.ts` | Independent expected IDs, counts and commerce membership; do not derive expectations with the grouping code being tested |
| `tests/browser/fixtures/test-photo.png` | Small original generated upload image, containing no supplied photo or third-party likeness |
| `tests/browser/harness/index.html` | Development-only host served by the controlled Vite server |
| `tests/browser/harness/main.tsx` | Relative imports, real global CSS, StrictMode, injected gateway and typed host controls; never import into the production app |
| Existing `tests/*.test.mjs` | Retain all meaningful cases; modify only when execution identifies a material untested invariant |

Do not promise a unit-test count increase. Existing tests already cover ordered resolution,
missing/duplicate IDs, cancellation races/listener cleanup, canonical archive SKU/stock, fixture
membership, relationships and retired fields. The principal gap is repeatable browser behaviour.

### P14: existing documentation

| File | Exact sections and changes |
| --- | --- |
| `docs/code-guide.md` | Owner/file map, named page handlers, provider/gateway, explicit commerce IDs, drawer state, CSS owners, tests and useful `rg` examples |
| `docs/first-sight-prototype.md` | Current **Find Your Piece** walkthrough; archive 3/3/3/3/2 and Inspire 1/1/1/1/2; both entry points; state separation; explicit `commerce`; gateway delay/cancellation; delivered baseline |
| `docs/architecture.md` | Study → gateway → provider → references; two commerce streams; page/drawer/PDP ownership; local state versus persistent wardrobe |
| `docs/first-sight-sources.md` | Relationship semantics, current 42 styling/2 runway assignments, metadata preservation and future-adapter cross-link; preserve attribution tables |
| `docs/verification-checklist.md` | Repeatable commands and current FirstSight checks; preserve and clearly date the historical 3 November record |
| `docs/plans/first-sight-roadmap.md` | Phase statuses, links, remaining gaps and P17 boundary |
| `docs/plans/first-sight-engineering-role.md` | Current approved slice and verification duties; retain British English and user decision ownership |

Replace retired names when they describe the current system: `recognitionItems`, `toRecognizedItem`,
`looksFor`, flattened `products`, `affordable`, and old study field names. Retain intentional historical
migration descriptions and established code identifiers such as `analyze`.

### P15: bounded corrections and final browser evidence

| File | Known selectors and correction targets |
| --- | --- |
| `src/pages/first-sight-flow.css` | `.fs-chapter-label > span:last-child` in earlier sections; shopping already has a darker scoped treatment |
| `src/features/first-sight/components/trend-hero.css` | `.fs-trend-number`, its inherited colour/opacity, normal/selected/hover backgrounds |
| `src/features/first-sight/components/upload-workspace.css` | `.fs-workspace-filename`, `.fs-workspace-file-tools > button`, `.first-sight .fs-photo-workspace > .fs-workspace-status` |
| `src/features/first-sight/components/recognition-results.css` | `.fs-recognition-topline > :last-child`, `.fs-recognition-index`, `.fs-recognition-category`, `.fs-recognition-era`, `.fs-recognition-description`, `.fs-recognition-score`, `.fs-recognition-note`; selected/unselected states |
| `src/features/first-sight/components/fashion-dossier.css` | `--fs-dossier-brown`, `.fs-dossier-feature-label > span`, `.fs-dossier-valuation small`; check light text on brown as well as brown text on light surfaces |
| `tests/browser/firstSight.accessibility.spec.ts` | Full-page/open-state axe assertions, keyboard/focus, motion, overflow and text enlargement |
| `package.json` | Add `test:browser:a11y` when the strict spec and corrections are ready |
| `docs/first-sight-verification.md` | Durable environment/command/result record, before/after contrast findings and unperformed checks |
| P14 guide files | Targeted reconciliation when a documented selector, command, behaviour or limitation changes |

The forty-five recorded nodes map to two chapter labels, four trend numbers, three workspace nodes,
twenty-seven recognition nodes and nine dossier nodes. Repeated card states inflate the node count;
these are five ownership groups, not forty-five independent source changes.

The recorded contrast findings do not require TSX changes. Inspect these owners while verifying:

- `FirstSightPage`: `changePhoto`, `analyze`, `cancelAnalysis`, `selectRecognition`, `openProduct`,
  `openBag`, `openStyleMatches`, `closeStyleMatches`, `restoreStyleMatchFocus`, `addToCart`,
  `toggleArchiveSave`, `toggleStyleMatchSave`, `previewPartnerOffer`.
- `PhotoUploadPanel`: `select`, `cancelDecode`, `chooseSample`, `openMatching` and URL ownership.
- `StyleMatchDrawer`: modal effect, `requestClose`, backdrop handlers, `selectSku`, `previewPartner`.
- `CartPreview`: close-event reconciliation, Escape/backdrop and quantity controls.
- `FashionDossier`, `RecognitionResults`, `TrendHero`, `PurchaseGrid`, `ProductDetailPanel`,
  `OutfitMasonry`: keyboard operation, labels, source links and responsive geometry.

Modify a TSX owner only for a reproduced FirstSight defect. Record its failing scenario, affected
symbol, smallest correction and regression check. Do not add production test hooks, access private
`__reactProps$` fields or refactor unrelated components to facilitate testing.

### P16 and P17 preparation

| File | Responsibility |
| --- | --- |
| This plan | Activity ledger, deviations, completion evidence and final A–G assessment |
| `docs/first-sight-verification.md` | Final measured results and reproducible instructions |
| Roadmap/engineering role | Accurate completion and approval statuses |
| `docs/plans/first-sight-p13-p16-commit-message.txt` | Proposed EC-style review message only; no Git commit |

## D. Trade-offs and planning self-assessment

The investment is durable browser verification, not additional application infrastructure.
Playwright can own a local server/base URL; see its
[web-server configuration](https://playwright.dev/docs/test-webserver).

Combine `@axe-core/playwright` scans with keyboard and visual checks. Automated scans detect only
part of accessibility; see [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing).

| Risk | Strengthening |
| --- | --- |
| Machine-specific temporary QA | Repository-local imports, managed browsers/server and independent fixtures |
| Duplicate unit tests | Preserve thirty-five existing cases; add only demonstrated missing protection |
| Untyped browser tests | Separate browser tsconfig and required typecheck command |
| Brittle private React access | Ordinary UI interactions and an isolated typed host |
| Fresh clones lack ignored photos | Disclosed original test-artwork substitution and separate exact-photo checks |
| Accessibility work expands into redesign | Five-file initial CSS boundary, measured contrast and retained hierarchy |
| Documentation precedes final corrections | P15 targeted amendments and P16 reconciliation without reordering phases |
| Browser claims exceed evidence | Explicit matrix, actual versions and completed/unperformed statuses |

The plan passes its planning gate: scope, dependencies, source ownership, testability, phase order
and approval boundaries are explicit. This assesses the plan, not the future implementation.

## E. Detailed execution workflow

### Before P13: establish the execution baseline

1. After approval, inspect branch/HEAD and new user changes. Reconfirm the delivered baseline and
   proposed `new-analysis` work branch. Preserve unrelated work; resolve a different target before edits.
2. Record source, fixture IDs/counts and existing QA evidence. Open the activity ledger.
3. Run the existing typecheck, thirty-five tests and build once as the execution baseline.
4. Record Node/npm, OS and available browser engines. Do not depend on external `/tmp` tooling.

**Exit:** understood baseline, with no unexplained failure carried forward.

### P13: durable regression tests

| Task | Workflow | Expected result |
| --- | --- | --- |
| P13.1 | Compare existing tests with the acceptance matrix | Concrete gap list, no duplicate contract tests |
| P13.2 | Add locked dev dependencies, configs, commands and output exclusions | Portable tooling with no absolute Chrome path |
| P13.3 | Add helpers, independent expected edits and original test media | No private photograph/account/API prerequisite |
| P13.4 | Port consumer interactions to the real App route with roles/labels | Five-study and archive/PDP/Inspire regressions |
| P13.5 | Add a host for empty/mixed/failure/pending/stale data and controlled modal cases | Deterministic resilience without production hooks |
| P13.6 | Add diagnostics and explicit negative-test expectations | Unexpected failures remain visible |
| P13.7 | Typecheck/run Node and browser behaviour suites; review isolation/cleanup | Green behavioural baseline for P14 |

Strict full-page contrast assertions belong to P15. P13 must not hide the known findings using
disabled rules, blanket exceptions or permanently skipped tests.

### P14: document actual implementation and controls

1. Update the five general guides, retaining dated historical evidence.
2. Explain the end-to-end data path, state owners and exact edit locations.
3. Document installation, commands, generated paths, test-media substitution and browser requirements.
4. Describe current contract coverage without promising a future test count.
5. Record the open contrast findings and distinguish implemented features from future adapters.
6. Update roadmap/role to reflect the approved slice and actual progress.

**Exit:** another developer can locate an edit and run available checks. No future result is labelled passed.

### P15: measure, correct and verify

1. Reproduce the earlier workwear full-page scan and retain current selectors, ratios and states.
   Forty-five is a historical node count for one state, not a universal expected total.
2. Group findings by CSS owner and retain a before/after table.
3. Darken local text colours/correct opacity, retaining burgundy/ivory/brown. Select final values from
   rendered measurements across normal, hover and selected backgrounds.
4. Check recorded small text against at least 4.5:1, avoiding rounded borderline values; check large
   text against its applicable threshold. See [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
5. Add strict full-page/open-state assertions and run the matrix below. Do not disable contrast checks,
   hide meaningful text or remove labels to obtain a passing result.
6. Check keyboard, touch emulation, reduced motion and 200% text enlargement. Correct reproduced
   in-scope defects with the smallest change and focused regression assertion.
7. Inspect hierarchy, image proportions, section separation and narrow-screen readability. Avoid
   unrelated layout or typography redesign.
8. Amend affected P14 documentation and record actual results/limitations.

**Exit:** no unresolved recorded contrast failure in tested FirstSight states and no new blocking
regression. Record environment-limited checks as unperformed rather than passed.

### P16: final quality gate and assessment

1. Run application/browser-test typechecks and Node tests on final source.
2. Run durable behaviour/accessibility checks after the last relevant correction.
3. Build, then run real-route smoke checks through Vite preview. Exclude harness cases; the production
   bundle must not contain the development-only host or test controls.
4. Inspect diff/file list, lockfile and build output. Check media exclusions and absence of generated
   artefacts, credentials, live-service code or a test-host route in the production application.
5. Compare studies, offer/reference IDs, track membership and source metadata with baseline.
6. Reconcile documentation with actual test output and remaining limitations.
7. Deliver final A–G report, ledger, exact change index and proposed EC commit message.

**Exit:** required gates pass, evidence is reproducible and work is ready for review. Leave changes uncommitted.

### P17: separate decision

Prepare the concrete message/handoff in P16, then stop for review. Only a later explicit instruction
authorises staging, committing, pushing or merging this slice. The previous P5–P12 authorisation
does not authorise P13–P16 Git delivery or any merge to `main`.

## F. Acceptance and verification matrix

### Functional invariants

| ID | Scenario and required result |
| --- | --- |
| F01 | Choosing a photo never starts analysis automatically; sample/upload use explicit Analyze |
| F02 | Five studies retain identity, dossiers, offer membership and context order |
| F03 | Archive 3/3/3/3/2 and style 1/1/1/1/2; price never selects a track |
| F04 | Default marketplace/PDP are archive-only; both Inspire triggers use the current edit |
| F05 | Style save/preview changes neither archive bag nor wardrobe; visit state resets on remount |
| F06 | Archive saves survive navigation/reload; bag quantities respect canonical stock |
| F07 | Drawer reopen/both triggers preserve visit-local SKU and archive PDP gallery/size |
| F08 | Escape, close/backdrop and controlled closure clean up modal/scroll state and restore focus |
| F09 | Hidden/disconnected opener and delayed native bag-close protections remain intact |
| F10 | Photo/study/reanalysis/PDP/bag transitions remove stale context without stacked modals |
| F11 | Empty/mixed streams, absent context, stale SKU, failure/retry and cancellation remain usable |
| F12 | Valid/invalid/empty/oversized/corrupt upload outcomes; URL/decode cancellation where observable |
| F13 | Relationships, source credits, dossier explanations and persistent journal remain correct |
| F14 | No unexpected fetch/POST, navigation, console/page error or broken tracked image |

### Browser/accessibility coverage

| Coverage | Planned depth |
| --- | --- |
| Managed Chromium | 1440, 1024, 768, 390, 320 px; all five edits, layout, archive/Inspire and full FirstSight scans |
| Firefox | 1440/390 px core journey, studies, both triggers, modal focus/dismissal, upload and overflow, subject to executable availability |
| WebKit | 1440/390 px core journey, native dialog and upload; engine coverage is not actual Safari testing |
| Open states | Scan Inspire, bag, contextual detail and meaningful disclosures/popovers after opening; representative and data-specific studies |
| Keyboard | Logical order, visible focus, labels, dossier explanations, modality and focus return; distinguish browser-chrome focus from background-app focus |
| Text/motion | Long copy, 200% text enlargement, reduced motion, no checked overlap/overflow |
| Touch emulation | Narrow controls and drawer scroll/boundary containment; not physical-device verification |
| Screen reader | Attempt a named reader/browser session if available; record exact interactions or unperformed status |
| Production preview | Real App route, sample/upload, archive PDP, both Inspire triggers and state boundaries; no harness |

Playwright supports Chromium, Firefox and WebKit projects with matching browser binaries; record
versions that actually run. See [Playwright browser guidance](https://playwright.dev/docs/browsers).

Use representative edge cases rather than multiplying every malformed input by every viewport and
engine. Keep complete study/viewport assertions in Chromium and targeted cross-engine checks.
Expand affected coverage when a failure warrants it; do not repeat passing checks without reason.

### Reproducibility and media evidence

- `npm ci` plus documented browser installation prepares the tooling.
- `npm test` remains independent of browser servers and private photos.
- `npm run typecheck:browser` typechecks tests rather than relying on transpilation.
- `test:browser` runs core Chromium behaviour; `test:browser:all` runs declared engine projects;
  `test:browser:a11y` runs the strict P15 accessibility checks.
- `npm run build` precedes `npm run test:browser:preview` against the built bundle.
- The runner owns dedicated configurable ports and reports collisions; it must not kill an unrelated
  server or depend on ports 5174/5178 remaining alive.
- Reports/traces/screenshots stay ignored. Durable Markdown records contain commands, environments,
  measured findings and limitations without embedding supplied photographs.
- Label original-artwork substitution explicitly. Separately inspect exact local photographs when
  present; substitutes do not verify the rendering of the supplied Chloé image.
- This proposes repeatable local tooling, not hosted CI account/workflow configuration.

## G. Activity ledger, checkpoints and handoff

Statuses: **planned**, **in progress**, **verified**, **failed**, **deferred with reason**.
For each material correction, record phase/task ID, file/symbol, observed problem, change and check.
Record commands, environment/viewport and actual result. Never mark a proposed check verified.

| Activity | Current status | Future evidence |
| --- | --- | --- |
| Baseline source and historical QA inspection | Verified for planning | Delivered commit and files/evidence inspected |
| Independent test-plan audit | Verified for planning | Existing coverage and portable-browser gaps mapped |
| Independent docs/contrast audit | Verified for planning | Guide corrections and five CSS groups identified |
| User approval | Verified | User instruction received 5 November 2026 |
| Execution baseline | Verified | Reused `new-analysis` at `0b43280`; Node 22.16.0/npm 11.6.2; 35 tests, typecheck and build pass; snapshot confirms 5 studies/18 offers/44 references |
| P13 | Verified | 49 browser cases across nine Chromium/Firefox/WebKit projects; no failures, skips or runner errors; existing 35 Node tests retained |
| P14 | Verified | Five guides updated; role/roadmap/checklist and pending-result record agree with P13; links/diff checked |
| P15 | Verified | 19 accessibility project executions pass; full-page/open-state scans, 320/390 text simulation, keyboard/touch and local-photo visual checks |
| P16 | Verified | Clean install, both typechecks, 35 Node tests, 74 development browser cases, 3 production cases, preservation and report |
| P17 | Handoff prepared; approval pending | Proposed message and A–G report available; no staging/commit/push/merge |

Provide progress at phase boundaries and material findings. Independent review may inspect tests
or source, but dependent implementation must retain P13 → P14 → P15 → P16. Do not parallelise phase
mutations in a way that obscures the approved sequence.

Final report: **A** requirement/outcome; **B** assumptions/boundaries; **C** exact owners and final
data/state flow; **D** trade-offs/self-assessment; **E** changes/deviations by phase; **F** checks,
measured findings and unperformed coverage; **G** review instructions and P17 decision boundary.

### Execution activity — 5 November 2026

| Task | Status | Action/evidence |
| --- | --- | --- |
| Baseline | Verified | Approved branch reused; unrelated `refact-home` left intact; snapshot stored outside Git |
| P13.1 | Verified | Independent audit found no material missing Node invariant; retain the existing thirty-five tests |
| P13.2 | Verified | Locked Playwright 1.64.1, axe integration 4.14.0 and Node typings; managed browsers, owned servers, typecheck and exclusions |
| P13.3 | Verified | Original PNG, narrow ignored-photo substitution, independent edits and strict diagnostics |
| P13.4–P13.7 | Verified | Seven real-route and fourteen resilience scenarios; 49 project executions pass, no skips or errors |
| P13 regression: bag lifecycle | Verified | A layout-phase queued-close test reproduced an opening race; `CartPreview` now treats native close as reconciliation, with explicit Escape/close/backdrop intent. All fourteen resilience cases pass |
| P13 regression: WebKit focus | Verified | Real pointer tests reproduced missing opener focus; both triggers focus their button before opening; full WebKit/Chromium/Firefox matrix passes |
| P13 browser portability | Verified | Managed Chromium/Firefox/WebKit installed. Firefox 157 launch failed against protected macOS app data; worker-scoped disposable `CFFIXED_USER_HOME` fixes launch without touching personal profiles |
| Dependency audit | Recorded | Existing Vite 8.0.13 has one aggregated high-severity audit entry; new test packages add no reported vulnerability. No forced/unrelated upgrade applied |
| P13 runner cleanup | Verified with environment note | macOS protects some disposable Firefox Library/Downloads folders. Access-only cleanup failures produce an explicit warning; unrelated cleanup errors still fail. Personal profiles and OS permissions remain untouched |
| P14 guides | Verified | Architecture, code guide, prototype, sources and checklist updated; relative file links and diff check pass; pending results explicitly labelled |
| P15 baseline | Verified | Fresh managed Chromium workwear scan reproduces 45 contrast nodes and 31 incomplete image-backed contrast checks at 1440×1000 |
| P15 corrections/assertions | Verified | 55 strict full-page/open-state scans pass without rule exclusions; image-backed incomplete checks retained |
| P15 first scan | Verified with follow-ups | Workwear 45 failures resolved. Full suite found a Chloé sold-out text contrast issue and 200% heading overflow; added a scoped `first-sight.css` colour fix and targeted trend-heading reflow |
| P15 supported media | Verified | Original JPEG/WebP fixtures and cross-engine preview case cover every accepted format, alongside PNG and invalid-file cases |
| P15 responsive details | Verified | Narrow image hit areas overlapped; visual markers now retain coordinates while equivalent 44+ px labelled controls retain every action. Added keyboard checks for all four features |
| P15 text reflow | Verified | Intrinsic cover caption layout preserves normal geometry and fits enlarged text. Bounded collection/title tracks resolve 320/390 overflow without reducing text size |
| P15 local media | Verified | Actual supplied photos load in visited dossier/PDP/journal views at 1440/390/320; 20 loaded images per edit, no broken image, overflow, recorded page/HTTP error or application fetch/POST |
| P16 clean install | Verified | Regenerating optional lock entries repaired `npm ci`; runtime dependency versions remain unchanged |
| P16 full keyboard coverage | Verified | Every feature label exercised across studies/widths; fixed pointer hover overriding focused keyboard explanations, then reran the full matrix |
| P16 preview isolation | Verified | Replaced merged config arguments with one spread object to prevent server/project concatenation; all three preview cases pass on the preview-only project |
| P16 final matrix | Verified | 74 development executions and 3 production executions pass with zero failures/skips/flakes or runner errors |
| P16 production/data hygiene | Verified | 59-module build excludes test host; 5 studies/18 offers/44 references unchanged; production audit reports zero advisories; photos/reports remain outside Git |
| Final independent review | Verified | Added the WCAG 2.1/2.2 A tags alongside the AA tags; the final accessibility rerun passes all 19 executions and 55 scans with zero violations. Reconciled historical/current phase wording in the roadmap and role |

Two minimal behavioural corrections were pulled forward into P13 after durable tests reproduced
them. This keeps P13's behavioural gate meaningful; P14 still follows P13 and P15's contrast work
had not started at that checkpoint. The reproduction, source owner and focused checks are recorded above.

The approved scope covered bounded P13–P16 implementation, test-only dependencies and reproduced
FirstSight corrections. It did not authorise P17 Git delivery, live integrations, a global redesign
or a different feature slice.

## Final A–G implementation assessment — 5 November 2026

### A. Requirement and delivered result

Completed the approved final engineering slice in P13 → P14 → P15 → P16 order. FirstSight now has
repository-owned, repeatable browser verification, updated ownership/architecture guides and measured
accessibility corrections while retaining its archive/Inspire consumer journey and editorial design.

### B. Assumptions and preserved boundaries

Started at delivered `0b43280` on `new-analysis`, preserving the unrelated `refact-home` branch.
Kept all five studies, eighteen unique offers, forty-four references, source metadata, commerce
membership and prototype data unchanged. No route, authentication, API, inventory or checkout
integration was added. Supplied media remains ignored. Browser tests use original test artwork;
exact local photographs were separately inspected at three widths. No Git delivery action was taken.

### C. Exact technical delivery

- P13: `playwright.config.ts`, `playwright.preview.config.ts`, `tsconfig.browser.json`, package/lock
  and ignore rules; typed flow/resilience/accessibility specs, independent expectations, diagnostics,
  original PNG/JPEG/WebP fixtures and a development-only typed gateway/modal host.
- P14: architecture, code guide, prototype guide, sources, checklist, roadmap and engineering role;
  `docs/first-sight-verification.md` records reproducible commands and measured results.
- Controlled modal fixes: `CartPreview` uses explicit close intent rather than queued native close
  notifications; `FirstSightPage` and PDP entry buttons capture their actual opener before opening.
- Contrast/reflow: six scoped FirstSight CSS files cover chapter labels, trend metadata/captions,
  workspace text, recognition cards, dossier text/markers and unavailable-size/product-title text.
- `FashionDossier` retains authored marker coordinates and connectors. At narrow widths, large
  feature-label controls provide all actions; keyboard preview has priority over incidental hover.

The full file/symbol map remains in section C; the verification record has ratios and project counts.

### D. Trade-offs and self-assessment

The implementation strengthens the prototype without introducing runtime dependencies or replacing
its state architecture. The main protection is meaningful boundary testing, not a larger unit-test
count: the original thirty-five Node tests remain, and twenty-nine authored browser scenarios execute
seventy-four times across the declared projects. Source corrections have reproduced regressions.

Independent reviews found no remaining concrete blocker in the tested scope. The narrow-marker
adaptation preserves every action through larger controls instead of accepting overlapping targets.
Normal cover geometry is preserved; enlarged text can grow vertically instead of being clipped.
Opaque caption backings address image-dependent contrast which automated tools could not determine.

This remains a prototype rather than authenticated commerce. Current galleries have one authored
image, so verification proves image retention, not multi-angle choice. Managed WebKit is not Safari;
touch is emulated; no named screen-reader/physical-device session was completed. Axe incomplete
image checks and the existing Vite development advisory remain explicit limitations.

### E. Deviations and corrections found through integration

1. Pulled two reproduced modal/focus corrections forward into P13 to keep its behavioural gate valid.
2. Added worker-scoped disposable Firefox app data for a macOS launch issue; access-only temporary
   cleanup failures are reported without changing OS permissions or personal profiles.
3. Extended the initial five CSS groups with scoped sold-out/product-title corrections in
   `first-sight.css`, plus the narrow-dossier markup needed for non-overlapping interaction.
4. Broadened accepted-format checks with original JPEG/WebP fixtures and text checks to idle/result
   states at 320/390 px. Added caption containment and all-feature keyboard assertions.
5. Final checks caught and repaired an optional lock graph that failed `npm ci` and a preview config
   merge that inherited development servers/projects. Runtime versions were preserved.
6. Final keyboard checks reproduced hover overriding a focused workwear explanation. Input ownership
   now prioritises keyboard focus until a deliberate pointer action; the complete matrix was rerun.

These are bounded corrections within the approved outcome. P14 documentation was reconciled after
P15/P16 rather than changing the execution order.

### F. Actual verification

Clean install, application/browser typechecks, thirty-five Node tests, seventy-four development
browser executions, fifty-five accessibility state scans, three production-preview executions,
production build, data preservation and diff checks pass. There are no skipped/flaky browser cases
or runner errors in the final results. The fifty-five scans report no automatically detected violations.

The build transforms fifty-nine modules and excludes the development harness. Runtime versions are
unchanged; the production-only dependency audit reports zero vulnerabilities. The five studies,
eighteen offers and forty-four references compare equal to the baseline snapshot.

See [the verification record](../first-sight-verification.md) for exact commands, environment,
project distribution, before/after ratios, media distinctions and remaining limitations. HTML reports
and detailed temporary JSON evidence are generated/ignored; the Markdown record is durable.

### G. Review and P17 boundary

Review the implementation, verification record and [proposed commit message](first-sight-p13-p16-commit-message.txt).
All changes remain local on `new-analysis` at `0b43280`. P17's message and handoff are prepared;
staging, committing, pushing or merging require the user's explicit instruction.

Suggested follow-ups are the existing Vite development-tool advisory, a named screen-reader/actual
Safari/physical-device session, and optional hosted CI wiring. They are disclosed rather than
silently represented as completed work.


## Superseding P17 delivery note — 5 November 2026

After the review recorded above, the user explicitly authorised the P17 commit and push. The
reviewed P13–P16 implementation was committed as `d32ef3c3f700f936b409c06a5dfa7cde4f6b9252`
and pushed to `origin/new-analysis`. No merge to `new-home-page` or `main` was performed.
The pending-approval wording above describes the earlier checkpoint; its recorded test counts
remain historical evidence. The approved [P18 Discover renewal](discover-p18-plan.md) now begins from that
delivered commit and remains uncommitted. See the [P18 verification record](../discover-verification.md) for new
results; historical P16 passes do not verify the changed P18 source.
