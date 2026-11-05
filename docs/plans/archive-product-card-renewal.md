# Archive product-card renewal

Approved: 5 November 2026. Status: **complete and verified; uncommitted for review** on `new-analysis`.
Baseline: `00578d6988b2d7bc61253af9b4690ad333b2b1e6`.
This approval covers implementation and verification, not staging, committing, pushing or merging.

## A. Requirement

Present FirstSight's archive marketplace as a photographic edit with four visible information
fields: condition, brand, product name and EUR price. Make unavailable pieces recognisable through
greyscale and crossed-out information while preserving their archival value, details and saves.

## B. Agreed choices and boundaries

- Use Excellent, Very good, Good and Fair; preserve authored grades without inferring wear.
- Open a piece through its image or name; retain the separate wardrobe heart.
- Remove card-only era, source, listing type, sizes, stock sentence and bottom action row.
- Keep full condition and size availability in the PDP; add era, listing type and source there.
- Mark a card unavailable only when no variant has positive stock. Keep it viewable and saveable.
- Keep the unavailable badge readable and unstruck; cross out only the four information fields.
- Preserve canonical catalogue records, callbacks, public types, commerce guards and prototype copy.
- Preserve existing uncommitted heart changes and independent dossier/formatting edits.
- Do not redesign Discover products or the opt-in Inspire drawer. Defer animation and Git delivery.

## C. Implementation owners

| Owner | Planned change |
| --- | --- |
| `src/features/first-sight/components/PurchaseGrid.tsx` | Private display formatting, four-field hierarchy, image/name actions, unavailable state and accessible status |
| `src/pages/first-sight.css`, `src/pages/first-sight-flow.css` | Card spacing, typography, native focus targets, greyscale/strikethrough and obsolete rule cleanup |
| `src/features/first-sight/components/ProductDetailPanel.tsx` | Era, listing type and source in the existing specification list |
| `tests/browser/fixtures/expected-edits.ts` | Independent display expectations for thirteen archive offers; canonical expectations retained |
| `tests/browser/helpers/firstSight.ts` | Four-field/order/canonical-navigation assertions; image-button product opener |
| `tests/browser/firstSight.flow.spec.ts` | Unavailable and partial-stock interaction, native keyboard navigation, metadata and doubled-text reflow |
| `tests/browser/firstSight.resilience.spec.ts` | Retain mixed-track filtering checks without obsolete listing badges |
| `docs/code-guide.md`, `docs/architecture.md`, `docs/first-sight-prototype.md`, `docs/plans/first-sight-roadmap.md` and this ledger | Current ownership, consumer journey, executed checks and A–G assessment |

No public interface, runtime dependency, catalogue migration or service integration is required.

## D. Approach and trade-offs

Clean only recognised prototype suffixes at presentation time. Keep canonical IDs, names, values
and product objects for callbacks, the PDP, bag and persistent wardrobe. Preserve the section-level
sample disclosure instead of repeating it on every line. Keep a visible out-of-stock label because
greyscale and strikethrough alone do not communicate availability to every consumer. The unstruck
badge also distinguishes an unavailable price from a crossed-out discount comparison.

Use native buttons and CSS. An unavailable listing remains an archive reference, so its interactive
controls stay enabled and focusable while the existing PDP SKU guards continue to prevent buying.

## E. Activity ledger

| Step | Status | Evidence |
| --- | --- | --- |
| Baseline inspection | Complete | Branch, dirty files and protected source/data fingerprints recorded outside Git |
| Card and detailed-information changes | Complete | Four clean information fields, separate heart, image/name entry points and PDP listing context |
| Availability and accessibility semantics | Verified | Only fully exhausted stock is grey; all four fields crossed out; unstruck badge describes enabled controls |
| Independent browser expectations | Complete | Thirteen authored archive-card records; canonical navigation, order and track boundaries retained |
| Native WebKit navigation | Corrected and verified | macOS WebKit uses Option+Tab for buttons; focus-visible, Space save and Enter opening assertions retained without OS changes |
| Focused integration | Passed | Nineteen executions across nine projects, including mixed-track filtering |
| Full affected integration | Passed | 127 executions of 38 scenarios across nine projects; no failures, skipped cases, flakes or runner errors |
| Accessibility verification | Passed with manual-review limits | 55 axe scans, zero violations; incomplete rules retained |
| Visual review | Complete | Actual local-photo cards inspected at 1440, 390 and 320 px; normal/sold-out appearance, four fields and 44 px controls; no overflow |
| Data and existing edits | Preserved | Deep comparison: five studies, eighteen offers, forty-four references; twelve protected source/data fingerprints unchanged |
| Documentation and final assessment | Complete | Current behaviour, exact owners, measured checks and limitations recorded; no Git delivery |

## F. Executed verification

| Gate | Result |
| --- | --- |
| Application and browser TypeScript | Both pass; browser check rerun after final test edits |
| Existing Node suite | 40 pass; no new Node cases needed for this presentation/interaction slice |
| Focused browser checks | 19 pass, zero failures/skips/flakes/errors |
| Full affected browser matrix | 127 executions of 38 scenarios pass in nine projects |
| Accessibility | 55 axe scans, zero detected violations; six WCAG A/AA tag groups through 2.2, no rule exclusions |
| Production build | Pass; 62 modules, CSS 93.46 kB / 18.43 kB gzip, JS 387.21 kB / 116.09 kB gzip |
| Production preview | Eight checks pass, including the new unavailable-card flow and retained landscape geometry |
| Data preservation | Deep comparison unchanged: five studies, eighteen unique offers, forty-four references and their source/commerce metadata |
| Source/Git hygiene | Protected fingerprints, diff/new-file whitespace and local guide links pass; index empty, supplied media/reports excluded |

The affected suite runs FirstSight flow, resilience and accessibility plus Discover flow. Its project
distribution is Chromium desktop 38; Chromium 1024/768/320 seven each; Chromium 390 sixteen; Firefox
desktop/390 thirteen each; WebKit desktop/390 thirteen each. The complete run took approximately
317 seconds. It does not claim a fresh run of every Discover-only accessibility/landscape scenario;
the production-preview suite retains the landscape geometry check.

Coverage includes the four card fields and cleaned copy across all five edits; prototype disclosure;
archive order/identity and mixed-track filtering; wholly exhausted versus partial-size stock; image
and name opening; keyboard save/unsave and canonical wardrobe IDs; disabled unavailable purchases;
full PDP source/era/listing metadata; long authored names and doubled text; 44 px controls and no
horizontal overflow at 1440, 1024, 768, 390 and 320 px; retained upload, cancellation, bag, Inspire,
modal and Discover hand-off behaviour. Browser diagnostics remain strict for console/page failures,
HTTP/transport errors and unexpected application fetch/POST.

The initial focused run passed fifteen cases and failed four macOS WebKit Tab-to-button assumptions.
An isolated native-navigation probe confirmed Option+Tab includes buttons under that browser's
existing macOS preference. The new tests use that gesture on macOS WebKit and Tab elsewhere. No
profile or OS setting changed; focus-visible and keyboard activation checks were not removed. The
final nineteen-case focused run and subsequent full matrix pass. The initial run is diagnostic
history, not passing coverage.

Incomplete axe results retain 48 contrast and 55 label/name rule occurrences across states, not
103 unique defects. Human judgement is still required for photograph contrast and icon labels.
Actual Safari, physical-device touch and a named screen-reader session remain unperformed. Automated
zero-violation results are not a complete accessibility conformance claim. Browser fixtures substitute
only Git-ignored media; the separate visual review used the actual local bag photograph.

Reproduce from the repository root:

```sh
npm run typecheck
npm run typecheck:browser
npm test
npx playwright test tests/browser/firstSight.flow.spec.ts tests/browser/firstSight.resilience.spec.ts tests/browser/firstSight.accessibility.spec.ts tests/browser/discover.flow.spec.ts
npm run build
npm run test:browser:preview
git diff --check
```

Disposable logs, JSON results and actual-photo screenshots stay outside Git at
`/tmp/loomstory-first-sight-qa/archive-cards/`: `baseline.json`, `catalogue-baseline.json`,
`types.log`, `final-browser-types.log`, `node.log`, `build.log`, `browser.json`, `preview.json`,
`summary.json`, `preservation.json`, `visual.json` and `chloe-*.png`. Focused final evidence is
`/tmp/loomstory-archive-card-focused-final.json`. Canonical data/services/types and all pre-existing
unrelated dossier/heart/formatting edits were fingerprinted and preserved. Build sizes describe the
combined working tree, including those existing edits, rather than an isolated future commit.

## G. Handover and assessment

The approved renewal is complete and ready for review. The hierarchy is simpler while the complete
listing context remains accessible through the PDP. Availability is explicit without sacrificing
archive browsing or persistent wardrobe saves. Independent read-only source review found no
blocking defects, and the final integration gates pass.

Review the condition/brand/name/price hierarchy and the unavailable-piece journey, then decide on
Git delivery separately. All work remains uncommitted on `new-analysis`; nothing was staged, pushed
or merged. The existing heart-colour changes, dossier stylesheet edits, OutfitMasonry formatting and
commented-out dossier resale section remain intact. No external API, authentication, checkout or
expressive animation work was introduced.


## Visual refinement — 5 November 2026

The user found the initial four-field presentation aesthetically disconnected from the site.
Revise its presentation while retaining all agreed data and behaviour. The functional-renewal
results above remain historical; the fresh checks below cover this subsequent CSS revision.

- **Design:** echo the chapter frames with warm ivory surfaces, fine beige borders and restrained
  corners. Let burgundy branding and a larger serif product name lead. Replace the condition chip
  with quiet italic text; use a serif price and align condition/price on wide cards.
- **Responsive layout:** cards stretch consistently within each grid row. The `archive-card`
  container query stacks the lower information line on narrow cards or with enlarged text. Preserve
  image proportions, natural text wrapping, visible focus and 44 px actions. Add no motion effects.
- **Owners:** presentation changes are confined to `src/pages/first-sight.css`. The four card
  elements, product callbacks, public contracts, imagery and commerce data are unchanged. The
  generated production JavaScript retains the same hash (`index-BxIVmX_H.js`).
- **Keyboard-check correction:** the first scoped run passed 31 cases and failed a dossier Escape
  assertion at 320 px. Its trace showed the pointer left by study selection while keyboard focus
  scrolled labels into view. Park the pointer at the page edge for that keyboard-only scan in
  `tests/browser/firstSight.accessibility.spec.ts`; preserve focus, Escape, panel visibility and
  every scan/assertion. The dossier implementation and the user's stylesheet remain unchanged.
- **Fresh verification:** application and browser TypeScript, build and diff checks pass. All
  32 scoped browser executions pass without skips, flakes or runner errors: the five-study card
  journey, unavailable/partial-stock interactions, doubled-text keyboard reflow and five-study
  accessibility at all five declared responsive widths. Cover Chromium, Firefox and WebKit.
- **Accessibility:** all 25 fresh scans report zero violations. Retain 25 contrast and 25 label/name
  incomplete rule occurrences for manual review; these are not fifty distinct defects. Actual
  Safari, physical devices and a named screen reader remain untested.
- **Production:** all eight preview checks pass. Build: 62 modules; CSS 94.41 kB / 18.65 kB gzip;
  JS 387.21 kB / 116.09 kB gzip. The retained 40 Node passes belong to the functional renewal;
  no Node rerun is claimed for this CSS-only product change.
- **Visual review:** inspect the real local Chloé cards at 1440, 390 and 320 px, plus the full
  marketplace beside the Style Journal. Keep idle desktop/phone previews outside Git.
- **Preservation and delivery:** existing heart/dossier edits and source/data fingerprints remain
  intact. Update this ledger, the code guide and walkthrough. Keep all changes unstaged and
  uncommitted; no push or merge is authorised by the visual revision.

Fresh disposable evidence: `/tmp/loomstory-first-sight-qa/archive-card-design/` contains
`final-browser.json`, `summary.json`, `preview.json`, `types.log`, `build.log`, `preserved.json`,
`preview.png`, `after-*.png` and `after-context.png`. `browser.json` and its failure trace record
only the initial diagnostic run. The final scoped run replaces it as passing evidence.
