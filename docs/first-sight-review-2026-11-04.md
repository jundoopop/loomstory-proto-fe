# FirstSight engineering and consumer review

Reviewed 4 November 2026. Implementation scope: FirstSight's outfit journal and the adjacent marketplace's visual priority. Review scope: all available route families in the local React application. This is browser simulation and code review, not research with real consumers or an accessibility certification.

## Delivered

- Replace the grey-divider sidebar with a muted wine surface, burgundy masthead, ivory cards, numbered captions, and photographs at their natural proportions.
- Keep the outfit board available throughout browsing. Use two masonry columns when space permits and a single column at the narrowest panel width.
- Preserve photo sources, attribution in the detail dialog, saved looks, keyboard navigation, and touch interaction.
- Give marketplace prices more emphasis and make **View piece** a filled, 44px-high button. Its accessible name now matches its visible label. Marketplace and journal save buttons are 44×44px.
- Separate outfit-category badges from image buttons so voice-control labels describe the visible View action correctly.
- Keep the original Discover and Submit pages, local-only photographs, and existing service boundaries.

The main styling owner is [outfit-magazine.css](../src/features/first-sight/components/outfit-magazine.css). Journal copy and card markup live in [OutfitMasonry.tsx](../src/features/first-sight/components/OutfitMasonry.tsx); marketplace emphasis lives in [first-sight-flow.css](../src/pages/first-sight-flow.css).

## Engineering assessment against current guidance

**A sound interactive prototype, with further work needed before a consumer marketplace launch.** Keeping React, TypeScript, and Vite is reasonable. Current React guidance documents Vite as a build-from-scratch option, while explaining that the team then owns routing, data loading, and rendering decisions. React Router supports several adoption modes; there is no demonstrated need to migrate this prototype merely to follow a framework trend. [React guidance](https://react.dev/learn/build-a-react-app-from-scratch), [React Router modes](https://reactrouter.com/start/modes).

The strongest parts are strict typing; the injectable discovery gateway; request cancellation and stale-response protection; local photo URL cleanup; separation of fixture data and presentation; and clear ownership of selection, cart, and wardrobe state. Native dialogs, explicit status messages, keyboard controls, reduced motion, and container-based layouts provide useful foundations. Nine automated domain tests cover meaningful data, cancellation, and storage behavior.

The main gaps are operational rather than a lack of frameworks:

| Priority | Evidence in this project | Recommended revision |
| --- | --- | --- |
| High | Two supplied styling sources total **4,974,379 bytes**. Card images have dimensions but no responsive source variants; the first four load eagerly. | Generate smaller card derivatives, add `srcset`/`sizes`, lazy-load below-fold media, and use originals for detail viewing. Preserve originals and derivatives outside Git. |
| High | Browser checks currently live in temporary local scripts; the repository runs domain tests but has no browser-test CI workflow. | Check in a small repeatable suite for upload races, study selection, keyboard/touch callouts, dialogs, cart, wardrobe, and narrow layouts. |
| Before live APIs | Analysis state spans several independent state variables; provider output is currently trusted local fixtures. | Introduce an explicit analysis-state union and runtime response validation, including uncertain/no-match/error states and provenance. |
| Medium | Shared FirstSight CSS is over 1,500 lines, with component overrides and repeated palette values. | Consolidate shared tokens and continue moving styles into clearly owned components; avoid accumulating more selector overrides. |
| Before production | Routes are statically imported; no application error boundary or deployed performance instrumentation was found. | Add recoverable error handling and route chunks where measurements justify them; establish field performance monitoring. |

Responsive image selection is supported by standard HTML rather than requiring a new framework. Explicitly grouping related state follows React's guidance on avoiding contradictory states. [Responsive images](https://web.dev/learn/images/responsive-images), [React state structure](https://react.dev/learn/choosing-the-state-structure).

The production build passes, but that is not a performance benchmark. Current Core Web Vitals targets are LCP ≤2.5s, INP ≤200ms, and CLS ≤0.1 at the 75th percentile. No deployed real-user measurements were collected in this review. [Web Vitals](https://web.dev/articles/vitals).

## Simulated interface coverage

| Area | Checked behavior | Result |
| --- | --- | --- |
| FirstSight inspiration | Four collections, six-look boards, section anchors | Pass |
| Photo workspace | Sample and local files; invalid, oversized, and corrupt input; Analyze, Cancel, Replace, Remove; stale decode/request handling | Pass |
| Recognition and dossier | All five studies and distinct product edits; label hover/focus/tap; Escape; full notes; resale and cultural story | Pass |
| Outfit journal | Four references per study; saved state; source links; detail modal; Escape/focus return; continued visibility beyond 60 seconds | Pass |
| FirstSight commerce | Product gallery, sizes, unavailable options, stock limits, save, bag quantities, checkout preview, return to matches | Pass |
| Discover and Vault | Search, era/category filters, sorting, reset, no-results recovery | Pass |
| Item and story routes | All 24 item routes and four story routes; images and missing-ID recovery | Pass |
| Wardrobe | Save, reload, detail navigation, removal, empty state | Pass |
| Submit | Local/sample photos, validation, details, preview, edit, finish, reset | Pass |
| Shared navigation | Skip link, desktop/mobile navigation, About, unknown route | Pass |

FirstSight was checked at 320, 390, 768, 1024, and 1440 CSS pixels. Nine other route templates were checked at 320, 390, 768, and 1440 pixels, with an additional 320px touch journey. No application errors or document-level horizontal overflow were observed in these runs. No real photo upload, order, or payment was made.

These checks use desktop Chrome and mobile emulation. They do not cover every possible state, Safari/Firefox differences, physical assistive devices, or usability with real consumers. Automated accessibility scans supplement the interaction checks; they cannot establish whole-site conformance.

## Accessibility findings

The journal's selected text colors have at least **5.21:1** contrast against their backgrounds; its heading contrast is **7.82:1**. New controls have visible focus states and comfortable touch targets. Text contrast should meet at least 4.5:1 for ordinary text. WCAG 2.2's AA target minimum is 24×24 CSS pixels or an applicable exception; 44px is the comfort target used here, not a claim about the AA minimum. [W3C contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Remaining issues in existing sections need a dedicated pass:

- Small, muted recognition metadata, trend numbering, upload help, and dossier small print produce automated contrast failures. Some visible values are only 8–11px. Larger text alone will not fix insufficient contrast.
- Existing product-detail sidebar links/buttons have three accessible-name mismatches. Their visible text should be part of their accessible name.
- The shared edition strip sits outside a page landmark, which the scanner flags as a structural improvement.
- Mobile header Search has an approximately 49×14px clickable area. Increase its comfortable target area; this measurement alone is not a formal WCAG failure because spacing exceptions require inspection.

The original pages were reviewed but not redesigned in this change. These findings prevent a claim that the entire application is accessibility-compliant.

The final targeted axe scan reports **zero violations in the new journal** on desktop and mobile, and none in the tested outfit/cart dialog states. The full result document still reports 48 legacy contrast-node instances; the inline product-detail state reports 45, plus the three sidebar naming issues. These counts overlap between states and are not counts of unique defects. The updated marketplace action measures 114×44px in the desktop check.

## More attractive, thoughtful, and broadly usable

The brand's useful philosophy is **understand a piece, then choose how it fits your life**. Keep the poetic headlines and fashion imagery, but make the practical steps explicit.

1. **Shorten the route from a match to a decision.** At a 390px viewport, the analyzed example places shopping roughly 4,865px down the document. Anchors work, but a compact “Shop these matches” shortcut beside the result identity would reduce effort while keeping the story optional.
2. **Unify the product journey.** A product opened in FirstSight supports a sample bag; the same saved product opened from Wardrobe leads to the legacy ItemPage with save-only controls. A shared product-detail entry point would make the experience predictable.
3. **Use plain navigation with editorial subtitles.** Desktop “The Vault” and mobile “Explore” lead to the same place. Prefer a consistent “Shop” or “Collection” label; retain the poetic name as supporting copy. Pair “Tendances” with “Style inspiration.”
4. **Help different budgets and bodies.** Add price range, size, availability, and condition filters to curated results. Explain what makes an affordable alternative similar: silhouette, material, or hardware.
5. **Raise everyday readability.** Preserve expressive serif headlines, but use a stronger, larger scale for prices, condition, sources, and actionable labels. Remove decorative copy where it competes with the next step.
6. **Treat recognition as an informed suggestion.** Before live AI, design explicit uncertain and no-match results, show evidence/source dates, and separate verified product facts from estimated resale values. This supports trust without promising authentication.

**Recommended next engineering revision:** responsive image derivatives and measured network savings. The two large styling sources alone provide a clear baseline. Follow with a focused accessibility/readability revision and a shorter story-to-shopping path.

## Commit convention

Use the linked European Commission format: `type(scope): subject`, imperative lowercase subject, no final period, and lines of at most 100 characters. This is a visible feature change, so `feat(first-sight)` is appropriate; that convention reserves `style` for formatting-only changes. No issue number or breaking-change footer should be invented. [EC Git convention](https://ec.europa.eu/component-library/v1.14.2/ec/docs/conventions/git/).
