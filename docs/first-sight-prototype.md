# FirstSight prototype

Open `/first-sight` from the main or mobile navigation. This is a separate comparison experience: `DiscoverPage.tsx` at `/` and `SubmitPage.tsx` at `/submit` remain available.

After a fresh clone, run `npm run setup:analysis-media` to restore the Chloé photographs. The setup script downloads them into the separate, Git-ignored `public/local-media/chloe/` folder. Their browser paths start with `/local-media/chloe/`. These six image binaries and analysis screenshots are kept out of GitHub; the authored alternative-bag SVG remains tracked. See [the media source record](first-sight-sources.md).

Current media coverage: the bag and styling references 02–04 are available. References 01 (floral-dress street photograph) and 05 (TV still) retain their planned slots but await exact image URLs or local originals. The setup command reports these missing files instead of substituting different photographs.

## Walk through the flow

1. **Inspiration:** a desktop 35/65 split pairs the photo panel with a masonry outfit feed. Cards retain their individual image proportions.
2. **Item analysis:** choose a local photograph or the Chloé Paddington sample. The same `fs-upload-panel` remains in the left column through selection, loading, and result; only its contents change. The result shows the supplied bag photograph, identity information, four expanded explanation cards, a fifth resale-value card, and a prominent **€700–€1,000** suggested resale range labeled as a prototype estimate. The right board changes to the five supplied styling references. Scroll freely to read the cards; analysis does not automatically advance or start a countdown.
3. **Discovery:** activate **Explore buying options** to enter the 50/50 purchase-options and cultural-context layout. The result becomes a compact photo summary in discovery and product views.
4. **Focused shopping:** after 45 seconds of active browsing without right-feed engagement, the purchase catalog expands to full width. **Show inspiration** restores the feed. Prototype controls also let a reviewer preview this timeout without waiting.
5. **Product:** selecting a purchase option opens a 70/30 product-detail and styling-sidebar layout. Explore the gallery, choose an available size, save the item, or preview the local cart. Buy Now opens a purchase preview; it does not place an order or charge a payment method. Back to results returns to discovery.

The desktop ratios become stacked sections on mobile. The 45-second clock starts when the discovery feed is onscreen and pauses when the tab is hidden, the window loses focus, the feed leaves the viewport, or another phase is open. Keyboard focus inside the feed also pauses it to avoid removing focused content. A feed click, tap, or keyboard activation cancels automatic collapse for the current photograph; a new photograph resets the opportunity. Restoring the feed keeps it open.

## What is simulated

The selected photo stays in browser memory. The prototype does not upload or analyze it. Every image receives the same authored **Chloé Paddington Bag** example; the app does not verify whether that bag appears in a selected upload. The example's design, features, craftsmanship, materials, and resale copy come from the user-provided brief. Its resale percentages and **€700–€1,000** range are sample values, not a current market appraisal. Purchase prices, variants, condition, stock, matching, and cart behavior demonstrate the intended UI and are not live commerce data.

The initial celebrity board retains its sourced photographs and metadata. After analysis, references use publisher-established names where available and descriptive captions otherwise; names are not inferred from faces. Neither board proves that a sample purchase listing is the exact piece pictured. See [the media source record](first-sight-sources.md) for attribution and coverage.

## Where to edit the Chloé example

| Content or behavior | Owner |
| --- | --- |
| Sample photo, brand/year, four explanation cards, resale prose/range | `src/features/first-sight/chloe.ts`: `chloePhoto`, `chloeIdentity`, `chloeAnalysis` |
| Five post-analysis styling references and natural image dimensions | `src/features/first-sight/chloe.ts`: `chloeLooks` |
| Local photograph setup and download URLs | `scripts/setup-analysis-media.mjs`, run through `npm run setup:analysis-media` |
| Analysis content layout and EUR formatting | `src/features/first-sight/components/ItemAnalysisResult.tsx` and `item-analysis.css` |
| Upload/loading/result shell | `src/features/first-sight/components/PhotoUploadPanel.tsx` |
| Explicit transition to buying options, reset, and request cancellation | `src/pages/FirstSightPage.tsx` |
| Bag listings recognized by the shared wardrobe | `src/data/catalog.ts`, enriched in `src/features/first-sight/fixtures.ts` |

All four explanation cards are expanded. The resale prose follows them as the fifth card, with the suggested range displayed in its own prominent bar. Keep the authored copy in the fixture rather than duplicating it in JSX. Keep the existing shell and responsive column rules when changing result presentation.

## Connect services later

Feature code lives under `src/features/first-sight/`. The page depends on the `FirstSightGateway` port in `services/contracts.ts`:

```ts
interface FirstSightGateway {
  discover(photo: PhotoInput, signal: AbortSignal): Promise<DiscoveryResult>;
}
```

`services/prototype.ts` implements that port using local fixtures and a short simulated delay. It adds no endpoint, credential, storage client, or AI request. `FirstSightPage` accepts an optional `gateway` prop, so a future adapter can be injected at the route without putting provider calls into UI components:

```tsx
<FirstSightPage {...collectionProps} gateway={liveGateway} />
```

When adding a real adapter:

- Define an explicit photo-upload boundary; the current object URL is a browser-local preview, not a server-readable image address.
- Map backend identity, explanation cards, valuation basis, purchase variants, availability, galleries, and source provenance into the feature types. `DiscoveryResult.analysis` carries `ItemAnalysis`; its `cards` and `resale` fields are independent of presentation. Extend the prototype-only identity and valuation status to represent live, uncertain, and unknown results instead of treating fixtures as verified data.
- Update the shared catalog and wardrobe ID validation when introducing live product IDs. FirstSight's sample bag offers use shared catalog IDs so saved products remain recognizable across routes.
- Honor `AbortSignal` so a cancelled request or older photograph cannot replace the latest result. Return useful failure and no-match states.
- Keep provider secrets and authenticated catalog operations server-side. A live cart and checkout need separate commerce integration; replacing `discover` alone does not enable transactions.

Timer rules are isolated in `engagement.ts`, with browser lifecycle handling in `useDiscoveryTimer.ts`. Run `npm test`, `npm run typecheck`, and `npm run build` after changes.

## Analysis verification checklist

- Confirm the same upload-panel DOM section and desktop column width remain through upload, loading, and result.
- Check all five card headings and supplied copy, the bag image, and the labeled EUR resale range.
- Scroll beyond 100px and spend more than 45 seconds reading analysis: it must stay visible. Only **Explore buying options** enters shopping.
- Verify all five reference images, their varied aspect ratios, original-image links, and neutral captions. Confirm the initial 40-image board still works after reset.
- Exercise sample selection, a real local preview, invalid/corrupt files, reset during loading, and replacing a photo. A late response must not restore an abandoned result.
- Exercise 45-second discovery expiry, hidden-tab and offscreen pauses, feed interaction, restoration, product/back navigation, available and unavailable variants, wardrobe saves, bag stock limits, and checkout preview.
- Check desktop and narrow mobile widths, keyboard navigation, image failures, horizontal overflow, and browser console errors.
- Keep analysis screenshots in a temporary local directory. Confirm the six photograph files remain ignored and absent from `git ls-files` before committing.

## Branch workflow

`new-analysis` starts from the homepage checkpoint on `new-home-page` (`5f2573f`). Review the analysis feature there before merging in the intended order: `new-analysis` → `new-home-page` → `main`. Creating this branch does not merge, push, or publish either branch.

## Analysis verification — 2026-11-04

- Production build and all 11 existing domain tests pass.
- Twelve browser-check groups pass: same panel DOM/width through all states; all five cards and valuation; no scroll/time-triggered analysis exit; explicit shopping transition; 45 active-second expiry, restoration and engagement; available/unavailable SKUs; stock-bound cart and checkout preview; persistent wardrobe saves; cancellation and invalid/valid uploads; credit rendering; and no uncaught JavaScript errors.
- Result, discovery, and PDP layouts have no horizontal overflow at 320, 390, 768, and 1440 pixels.
- The bag and references 02–04 load. Exact images 01 and 05 remain the open media dependency. Screenshot captures containing these reference photos stay in temporary local storage.

## Earlier homepage verification — 2026-11-03

These results and captures document the homepage checkpoint before the Chloé analysis change. They do not replace the analysis checklist above.

- TypeScript validation, all 11 domain tests, and the production build passed.
- Browser walkthrough passed for region filtering, outfit details, sample and real local-photo previews, corrupt-image rejection, size selection, unavailable sizes, bag stock limits, and checkout preview. No JavaScript errors were recorded.
- Timer integration passed with a browser clock: 45-second expiry, offscreen pause/resume, right-feed engagement, keyboard focus protection, restoration, and new-photo reset. The 99px/101px scroll boundary and focus transfer were verified with native browser timing. Hidden-tab/blur accounting is covered by the domain tests and lifecycle code review.
- Saved outfit hearts persisted through upload and product/back transitions. Wardrobe products continue to use the existing shared save controls.
- Layouts were checked at 320, 390, 768, 1024, and 1440px. All five mobile navigation links fit; no horizontal document overflow was detected. All 40 celebrity image assets returned successfully. Original Discover and Submit routes remain available and their source files are unchanged.

Preview captures: [desktop](previews/first-sight-desktop.png), [mobile](previews/first-sight-mobile.png), [discovery](previews/first-sight-discovery.png), and [product detail](previews/first-sight-product.png).
