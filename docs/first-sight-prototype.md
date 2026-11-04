# FirstSight prototype

Open `/first-sight` from the main or mobile navigation. This is a separate comparison experience: `DiscoverPage.tsx` at `/` and `SubmitPage.tsx` at `/submit` remain available.

## Walk through the flow

1. **Inspiration:** a desktop 35/65 split pairs the photo panel with a masonry outfit feed. Cards retain their individual image proportions.
2. **Identity:** choose a local photograph or reveal the sample result. The sample brand, release year, and collection season appear above the fold. This identity card becomes a compact photo summary in discovery and product views.
3. **Discovery:** scroll more than 100px after the identity reveal, or activate **View matches**, to enter the 50/50 purchase-options and cultural-context layout.
4. **Focused shopping:** after 45 seconds of active browsing without right-feed engagement, the purchase catalog expands to full width. **Show inspiration** restores the feed. Prototype controls also let a reviewer preview this timeout without waiting.
5. **Product:** selecting a purchase option opens a 70/30 product-detail and styling-sidebar layout. Explore the gallery, choose an available size, save the item, or preview the local cart. Buy Now opens a purchase preview; it does not place an order or charge a payment method. Back to results returns to discovery.

The desktop ratios become stacked sections on mobile. The 45-second clock starts when the discovery feed is onscreen and pauses when the tab is hidden, the window loses focus, the feed leaves the viewport, or another phase is open. Keyboard focus inside the feed also pauses it to avoid removing focused content. A feed click, tap, or keyboard activation cancels automatic collapse for the current photograph; a new photograph resets the opportunity. Restoring the feed keeps it open.

## What is simulated

The selected photo stays in browser memory. The prototype does not upload or analyze it. Every image receives the same authored sample identity and purchase fixtures; these results are unrelated to the contents of the user's photograph. Brands, seasons, prices, variants, stock, matching, and cart behavior demonstrate the intended UI and are not live commerce data.

Celebrity imagery and references have their own source metadata. They do not prove that a sample product is the exact garment pictured. See [the media source record](first-sight-sources.md) for attribution and coverage.

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
- Map backend identity, purchase variants, availability, galleries, and source provenance into the feature types. Extend the prototype-only identity status to represent live, uncertain, and unknown results instead of treating fixtures as verified data.
- Update the shared catalog and wardrobe ID validation when introducing live product IDs; the current wardrobe recognizes the existing twelve sample products.
- Honor `AbortSignal` so a cancelled request or older photograph cannot replace the latest result. Return useful failure and no-match states.
- Keep provider secrets and authenticated catalog operations server-side. A live cart and checkout need separate commerce integration; replacing `discover` alone does not enable transactions.

Timer rules are isolated in `engagement.ts`, with browser lifecycle handling in `useDiscoveryTimer.ts`. Run `npm test`, `npm run typecheck`, and `npm run build` after changes. For UI verification, exercise each phase, hidden-tab and offscreen pauses, feed engagement, timeout restoration, photo replacement, available and unavailable sizes, and mobile keyboard navigation.

## Verification — 2026-11-03

- TypeScript validation, all 11 domain tests, and the production build passed.
- Browser walkthrough passed for region filtering, outfit details, sample and real local-photo previews, corrupt-image rejection, size selection, unavailable sizes, bag stock limits, and checkout preview. No JavaScript errors were recorded.
- Timer integration passed with a browser clock: 45-second expiry, offscreen pause/resume, right-feed engagement, keyboard focus protection, restoration, and new-photo reset. The 99px/101px scroll boundary and focus transfer were verified with native browser timing. Hidden-tab/blur accounting is covered by the domain tests and lifecycle code review.
- Saved outfit hearts persisted through upload and product/back transitions. Wardrobe products continue to use the existing shared save controls.
- Layouts were checked at 320, 390, 768, 1024, and 1440px. All five mobile navigation links fit; no horizontal document overflow was detected. All 40 celebrity image assets returned successfully. Original Discover and Submit routes remain available and their source files are unchanged.

Preview captures: [desktop](previews/first-sight-desktop.png), [mobile](previews/first-sight-mobile.png), [discovery](previews/first-sight-discovery.png), and [product detail](previews/first-sight-product.png).
