# P18 follow-up — Landscape inspiration workspace

Approved: 5 November 2026. Status: **complete and verified; local commit authorised**.
Working branch: `new-analysis`, baseline `d64b3495562a7f0a594d4c53514a294019fdf138`.
Its starting files match delivered `main` merge `ad73d911a67a29c13cc206a514b0c8e673afa113`.
The user subsequently authorised a local EC-style commit, including the commented-out
`fs-dossier-resale` patch in `FashionDossier.tsx`. This delivery does not authorise a push or merge.
Expressive animation remains a separate later phase.

## A. Requirement

Present the hero on the left and its selected six-photo board on the right in one viewport-height
landscape workspace. Keep the site header and Discover heading above it. The image sits above its
text and collection controls. Each panel can scroll independently; normal page scrolling continues
to the retained search, products and editorial sections.

## B. Agreed defaults and boundaries

- Enable at width ≥1024 px, height ≥600 px and landscape orientation.
- Use equal columns, a 24 px gap and `calc(100dvh - 48px)` height; align in view with 24 px margins.
- Preserve all text, sources, actions and natural board-image proportions; keep 44 px controls.
- Allow left-panel overflow for long or enlarged content. Use two masonry columns on the right.
- Outside this mode, retain the stacked layout and original responsive board columns.
- Reset only board scroll on collection change. Preserve it through photo-dialog dismissal.
- Retain URL selection, visit-local saves, hand-off and FirstSight behaviour. No data, API,
  dependency or public contract changes.

## C. Implementation owners

| File | Responsibility |
| --- | --- |
| `src/features/discover/components/TrendHero.tsx` | Named focusable panel regions, board ref and collection-change scroll reset |
| `src/features/discover/components/trend-hero.css` | Landscape grid, viewport sizing, compact vertical hero, native scrolling and responsive fallbacks |
| `tests/browser/discover.flow.spec.ts` | Existing board-column expectations and retained hand-off regressions |
| `tests/browser/discover.landscape.spec.ts` | Geometry, panel scroll ownership, reachability, resizing, keyboard and enlarged-text checks |
| `tests/browser/helpers/diagnostics.ts` | Isolated macOS Firefox profiles bypass machine proxy routing for the owned loopback test server |
| `src/features/first-sight/components/FashionDossier.tsx` | Keep the requested resale section commented out; remove its unused formatter and tidy the explanatory comment |
| Existing guides and `docs/discover-verification.md` | Current layout ownership and independently recorded follow-up evidence |

## D. Trade-offs and assessment

Use native CSS scrolling and the existing React component. The workspace stays in document flow;
there is no fixed page shell, wheel interception, body scroll lock or automatic page navigation.
The left panel can grow internally, so preserving credits and accessible text takes priority over
forcing every control above the fold. Keep caption content in flow and let it exceed the image's
minimum height when necessary.

Final assessment: the approved landscape workspace is ready for review. Equal panels fit all five
specified landscape displays, while native overflow preserves complete copy and attribution. Native
keyboard/wheel scrolling, dialog focus/position return and responsive state retention pass across
Chromium, Firefox and WebKit. No runtime dependency, service or public contract changed.

The left cover uses an intact contained photograph and a caption below it in landscape mode. This
avoids cropping the portrait behind a headline in a short frame. Its full marketing copy may require
left-panel scrolling on laptop-height screens; that is the agreed overflow behaviour. Portrait/narrow
screens retain the existing presentation. Actual Safari, physical devices and screen readers remain
unverified; automated scans retain explicit manual-review items.

## E. Activity ledger

| Activity | Status | Evidence |
| --- | --- | --- |
| Baseline | Verified | Clean main checkout inspected; working branch has identical starting files |
| Panel structure and scroll reset | Verified | Existing siblings retained; named keyboard regions and board-only layout effect; collection/dialog cases pass across engines |
| Landscape presentation | Verified | Scoped 1024/600/landscape rule, 50/50 frame, native overflow and two-column board; all five landscape sizes and seven fallbacks pass |
| Browser assertions | Verified | Updated existing expectations; added six focused scenarios; final affected matrix passes 116 project executions |
| Intrinsic cover height | Corrected and verified in focused Chromium checks | Prevented grid-row shrinking from clipping the caption; complete photo/caption content now scrolls with the left panel |
| Native scroll verification | Verified | Tests observe scroll completion and hit-test visible panels before wheel input; the cross-engine focused run passes all 21 executions |
| Firefox environment | Corrected for owned tests | Default profile timed out before HTTP requests; an isolated proxy-disabled test profile restored access. All final Firefox cases pass; personal settings and OS permissions unchanged |
| Concurrent user edits | Preserved | User disabled resale and edited dossier styling during this task. Removed only the unused currency formatter to resolve TS6133; did not overwrite their presentation changes |
| Documentation | Complete | Preserved historical P18 evidence; current layout, ownership, results and limitations recorded |
| Verification | Passed | Both typechecks, 40 Node tests, 116 affected browser executions, 31 axe scans, build, 7 preview checks, preservation, links and diff checks |

## F. Acceptance checks

Check 1024×768, 1280×720, 1366×768, 1920×1080 and 2560×1440. Test portrait tablet, 390/320 px phones,
width and height boundaries, independent panel/page scrolling, all six images/credits/actions,
collection scroll reset, dialog focus/position return, keyboard paging, enlarged text and resizing
without losing collection selection or saves. Keep strict browser diagnostics and existing Node
coverage. Record actual browser engines, counts, incomplete axe checks and manual limitations.

### Final executed results

- Application and browser TypeScript checks pass. All 40 existing Node tests pass; no new Node tests
  were added for this presentation change.
- Six focused landscape scenarios pass 21 project executions across the declared engine variants.
- The final affected suite passes 116 executions of 27 authored scenarios in nine projects, with
  zero failures, skips, flakes or runner errors. This runs Discover flow/accessibility/landscape and
  retained FirstSight flow specs; it does not claim a rerun of every FirstSight resilience/axe case.
- Distribution: Chromium desktop 27; Chromium 1024/768/320 four each; Chromium 390 seventeen;
  Firefox desktop/390 and WebKit desktop/390 fifteen each.
- All 31 axe scans report zero violations with the six WCAG A/AA tag groups through 2.2. Incomplete
  results remain attached: 27 contrast and 28 label/name rule occurrences across states, not 55
  distinct defects. Human judgement remains necessary for photograph text and icon labels.
- Seven production-preview checks pass, including the five-size landscape geometry scenario.
- Production build passes: 62 modules; CSS 93.98 kB / 18.48 kB gzip; JS 387.01 kB / 115.98 kB gzip.
  These sizes describe the combined workspace, including the user's independent dossier edits.
- Canonical deep comparison passes unchanged: five studies, eighteen offers, forty-four references,
  source attribution and commerce content. Public contracts, gateway, App, upload/Submit and data
  fixture files are unchanged by this follow-up.
- Visual review at 1024/1366/1920 shows equal panel tops, viewport-sized frames and zero page/panel
  horizontal overflow. At 1366×768 the panels are 720 px high and align approximately 24 px from the
  viewport top after explicit user-equivalent scrolling. Screenshots remain outside Git.
- Strict diagnostics reject unexpected application fetch/POST, console/page errors and HTTP/transport
  failures. The final suite and preview runs pass these checks.
- Tracked/new-file whitespace, guide links and media/report exclusions pass. No file is staged, and
  no commit, push or merge was performed for this follow-up.

The first broad run was interrupted during repeated Firefox pre-navigation timeouts. Subsequent
profile-only proxy configuration and a fresh complete run replaced that failed diagnostic evidence;
the interrupted run is not counted as verified coverage. The native scroll tests also replaced
immediate snapshots/locator hover with settled scroll observations and explicit panel hit testing.
No accessibility rule, zero-sized target or failure was excluded to obtain the final pass.

Commands and evidence are in [the Discover verification record](../discover-verification.md), under
its landscape follow-up section. Disposable JSON/logs/screenshots are in
`/tmp/loomstory-discover-qa/landscape/`.

## G. Handover

Implementation, verification and this A–G assessment are complete. The user has now authorised a
local EC-style commit on `new-analysis`, including their commented-out resale section. The separate
dossier stylesheet edits and `OutfitMasonry` indentation remain unstaged and intact. They are not
part of this commit. Push and merge remain pending a separate instruction. Expressive animation
remains the separately deferred later task.

## Local commit checkpoint — 5 November 2026

- Apply the user's subsequent explicit instruction to create a local EC-style commit, including
  the commented-out `fs-dossier-resale` section in `FashionDossier.tsx`.
- Retain its fixture data and CSS hooks. Remove the unused runtime currency formatter, tidy the
  explanatory comment and remove a stray character inside the disabled markup.
- Exclude the independent `fashion-dossier.css` changes and `OutfitMasonry.tsx` indentation; leave
  those working-tree edits intact and unstaged.
- Verify an isolated export of the staged source, using the installed dependencies. Both TypeScript
  checks, 40 Node tests, the production build, 116 affected browser executions and seven preview
  checks pass. All 31 axe scans report zero violations; manual-review limitations still apply.
- Record the candidate build separately: CSS 94.00 kB / 18.48 kB gzip; JS 387.01 kB / 115.98 kB gzip.
  Earlier build sizes above describe the combined workspace before excluding the unrelated CSS.
- Preserve the fresh Ultra review: two independent reviews found no blockers and its additional
  21 cross-browser executions passed. This checkpoint adds no new feature or animation work.
- Keep verification logs outside Git in `/tmp/loomstory-discover-qa/landscape/commit/`.
- Use the [detailed EC-style message](discover-landscape-commit-message.txt) for the local commit.
  Do not push or merge this follow-up without a separate instruction.
