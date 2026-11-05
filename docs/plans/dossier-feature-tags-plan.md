# Dossier features and editorial tags

Approved: 5 November 2026. Branch: `new-analysis`; baseline HEAD `00578d6`.
Status: implemented and verified; Git delivery authorised by the user on 5 November 2026.

Delivery follows `new-analysis` → `new-home-page` → `main`. Supporting card/outfit work is
committed separately as `8fe0d9a`; the reviewed EC-style dossier message follows it. The assessment
below preserves the implementation checkpoint. Its earlier Git restrictions are superseded by
the user's explicit push-and-merge instruction. Commit and remote history record delivery hashes.

## A. Requirement

Give every ROSÉ model the four connected features already available for Chloé, and replace the
shared oval controls with clearer editorial tags. Preserve the central photograph, floating
explanations, existing interaction behaviour and the site's ivory/burgundy/serif language.

## B. Confirmed design and boundaries

- Six ROSÉ models receive four visible-feature annotations each: 24 in total.
- Tags use 10 px corners, a 56 px minimum height, numbered badge, upright serif text and `+`/`−`.
- Idle is ivory/brown; preview is warm ivory with a subtle shadow; pinned is burgundy/ivory.
- Keyboard focus has its own burgundy outline. Labels grow and wrap; no fixed-height truncation.
- Numbers and symbols are decorative. Native feature text remains the accessible name.
- `aria-expanded` describes the current explanation; `aria-pressed` describes pinning. A keyboard
  or hover preview does not replace the pinned selection.
- Preserve all original Chloé coordinates, other study records, shopping and disabled resale.
- No public type, provider, catalogue, dependency, commit, push or merge changes.

## C. Actual implementation owners

| Owner | Changes |
| --- | --- |
| `src/features/first-sight/data/outfitStudies.ts` | Required `ProductAnnotation[]` on `OutfitStudyContent`, passed through `outfitStudy`; 24 anchors, explanations and aligned design notes. |
| `src/features/first-sight/components/FashionDossier.tsx` | Dedicated number/text/toggle spans; decorative elements hidden from assistive technology. Existing IDs, refs and state priority retained. Activation explicitly focuses the button without scrolling so WebKit routes Escape into the existing canvas handler. |
| `src/features/first-sight/components/fashion-dossier.css` | Scoped feature palette, rectangular tags, preview/pinned/focus states, responsive content layout and targeted child selectors. Other dossier styling preserved. |
| `tests/firstSightDossierAnnotations.test.mjs` | Independent label/card expectations, unique/bounded anchors, gateway delivery and unchanged Chloé coordinates. |
| `tests/browser/firstSight.dossier.spec.ts` | All 24 explanations, connector alignment, stable image geometry, pin/preview semantics, Chloé keyboard/touch regression, doubled text and axe. |
| `playwright.preview.config.ts` | Include the new real-App dossier scenario in production-preview checks. |
| README, code/architecture guides, walkthrough and this ledger | Update feature behaviour, editing locations, verification and limitations. |

Full-image anchors below are percentages of the existing 1000×1000 product photographs. They
are not regions on the celebrity photograph and do not establish physical composition.

| Model | Design concept | Key features | Craftsmanship | Common materials |
| --- | --- | --- | --- | --- |
| Micro Grip | Domed silhouette `(30,46)` | Twin handles `(45,32)` | Curved panel seams `(43,61)` | Textured surface `(69,67)` |
| Longsleeve | Cropped silhouette `(35,65)` | Round neckline `(53,20)` | Finished cuffs `(22,86)` | Smooth surface `(61,49)` |
| Mini skirt | Mini silhouette `(25,45)` | ROSIE badge `(70,33)` | Curved hem `(36,72)` | Smooth fabric `(68,57)` |
| Mesh top | Sleeveless cut `(22,43)` | 97 graphic `(62,53)` | Bound hem `(38,83)` | Open mesh `(76,73)` |
| T7 trousers | Wide leg `(39,63)` | Drawcord waist `(50,20)` | Finished hems `(41,86)` | Smooth surface `(61,60)` |
| Speedcat | Low profile `(24,62)` | Wrapping laces `(64,55)` | Stitched panels `(46,55)` | Smooth upper `(80,45)` |

## D. Approach and trade-offs

Reuse the existing annotation renderer rather than adding a second callout system. Its resize
observer continues measuring labels and the original image plane. Colour/shadow-only state
changes keep the border width and geometry stable; no button transforms are introduced.

At dossier widths 560–799 px the side columns leave little room for inline badge/text/symbol.
Those tags place the text on a second row using the full card width. The canvas and popover sizing
remain unchanged. Below 329 px only the number is hidden; feature text and disclosure remain visible.

Descriptions explain photograph-visible shapes, seams, edges and finishes. They do not infer
fibre percentages, leather species, artisan techniques or production methods. Full notes remain
consistent with the corresponding feature, while the original source/evidence disclosures remain.

## E. Activity ledger

| Step | Outcome |
| --- | --- |
| Baseline | Saved hashes for 183 files and copies of the three changed source files outside Git; existing dirty work retained. |
| Feature data | Six actual packshots inspected; 24 labels and full-image anchors authored, one per explanation category. |
| Shared presentation | Added dedicated spans, scoped palette, upright serif tags and separate open/pinned semantics without replacing event handlers. |
| Narrow-screen selectors | Replaced generic child-span styling/hiding so text and `+`/`−` remain visible. |
| Real-image review | Thirty product/width combinations passed geometric checks. Visual inspection caught cramped 1024 px labels despite no overflow; compact two-row tags corrected the readability issue. |
| Compact recheck | All six real-photo dossiers passed at 1024 px, with text columns at least 70 px wide and no overflow. |
| Independent review | No blocking defect found in pin/preview priority, CSS scope, connector sizing, data content or preserved styling. |
| WebKit correction | Initial matrix passed 25/27; pointer clicks could leave focus outside the canvas, so Escape did not dismiss. Focusing the activated native control fixes routing without a global key handler or scroll jump. Assertions remain unchanged. |
| New browser matrix | Fresh serial run passes 27/27 across nine projects, with 18 scoped axe scans and zero violations; no retries, skipped cases or runner errors. |
| Retained regressions | Twelve checks pass: five legacy dossiers and expanded explanations at five Chromium widths, plus cross-piece save/bag flows on desktop and phone. Forty further axe scans report zero violations. |
| Automated verification | Application/browser types, 47 Node tests, 39 browser checks, production build and eleven production-preview checks pass. |

## F. Verification

Executed checks:

- Application TypeScript, browser TypeScript and all 47 Node tests pass.
- New initial Chromium desktop coverage: three scenarios, two scoped axe scans, zero violations.
- Final new dossier matrix: 27 executions of three scenarios across Chromium, Firefox and
  Playwright WebKit desktop/phone projects; all pass in one serial run, with 18 scoped axe scans
  and zero detected violations.
- Retained regression matrix: twelve executions pass, with forty additional axe scans. All five
  legacy dossiers and expanded explanations are checked at the five Chromium widths. The current
  cross-piece wardrobe/journal save and mixed-item bag flow passes on desktop and phone.
- Total affected browser checks: 39 pass; no retries, skips, flakes or runner errors in the final
  runs. All eleven production-preview checks pass, including the complete six-item feature flow
  and retained Discover/FirstSight hand-off and landscape behaviour.
- Real photographs at 1440, 1024, 768, 390 and 320 px: 30 combinations; four visible tags and
  connector endpoints within one pixel of the authored image positions, no page errors or overflow.
- Six additional real-photo compact-tag checks passed after the 1024 px refinement.
- Actual rendered mesh, trouser, shoe and bag targets inspected. Portable test artwork is not
  treated as evidence that an anchor points to a real photographed feature.

The production build passes: 67 modules; CSS 98.35 kB / 19.34 kB gzip; JavaScript 409.48 kB /
121.73 kB gzip. The 183-file baseline audit confirms that 173 existing files outside the agreed
implementation/documentation/configuration owners remain unchanged.

The 58 axe scans report zero detected violations. Incomplete contrast/name results remain in the
JSON evidence for manual review; repeated node occurrences are not distinct confirmed defects.
Diff/new-file whitespace, local documentation links, unchanged out-of-scope files and an empty
Git index are checked at handover. Generated evidence stays outside Git at
`/tmp/loomstory-dossier-tags-qa/`.

Automated tests and touch emulation do not establish physical-device, actual Safari or
screen-reader compatibility; those manual checks remain unperformed.

## G. Assessment and handover

The implementation supplies the missing ROSÉ interaction through the established dossier model,
and makes the shared controls clearer without expanding explanations into the page layout. The
compact middle-width adjustment was driven by actual-image review rather than overflow alone.

The approved scope is complete and verified. Feature content, accessible names and responsive
behaviour are covered independently of the source records, while actual photographs validate
their visual placement. The WebKit pointer-focus fix closes a real Escape-routing gap exposed
by the new coverage. The wider project renewal and expressive flow animations remain separate.
No staging, commit, push or merge was performed at that implementation checkpoint. The later
delivery authorisation is recorded above.
