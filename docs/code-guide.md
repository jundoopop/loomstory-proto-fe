# LoomStory code guide

This guide covers the active `loomstory-web` React/Vite application. Start with the task table below, then open the linked module. Module headers describe ownership; function comments explain transitions and constraints; CSS section comments identify the matching visual area.

## Find the change you want to make

| What you want to change | Where to edit | What controls it |
| --- | --- | --- |
| Routes, desktop navigation, mobile shortcuts | [App.tsx](../src/App.tsx) | Route registry, header links, and mobile navigation. Update both navigation lists when adding a destination. |
| Site colors, fonts, shared buttons, shell spacing | [styles.css](../src/styles.css) | `:root` palette, base typography, header/footer, and original-page layouts. |
| FirstSight journey and stage transitions | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | `Stage`, `discover`, `showMatches`, `selectProduct`, and `changePhoto`. |
| FirstSight layout ratios and responsive behavior | [first-sight.css](../src/pages/first-sight.css) | `.fs-start-layout` (35/65), `.fs-discovery` (50/50), and `.fs-discovery-focused` (full-width shopping). |
| Accepted photo formats, size limit, decoding errors | [PhotoUploadPanel.tsx](../src/features/first-sight/components/PhotoUploadPanel.tsx) | `acceptedTypes` and `select`. The file picker and drop target share this function. |
| Matching explanation text and hover/tap behavior | [PhotoUploadPanel.tsx](../src/features/first-sight/components/PhotoUploadPanel.tsx) | `openMatching`, dismissal listeners, and the explanation markup. Style `.fs-matching-*` in `first-sight.css`. |
| Brand, release year, season, sample prices, sizes, stock | [fixtures.ts](../src/features/first-sight/fixtures.ts) | `sampleIdentity` and `purchaseOptions`. Product titles/base prices/images originate in the shared catalog. |
| Discovery scroll threshold | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | The identity-stage effect compares scroll distance with `100`; `showMatches` supplies the button alternative. |
| Active browsing timeout | [engagement.ts](../src/features/first-sight/engagement.ts) | `DISCOVERY_ENGAGEMENT_MS` is `45_000`. If it changes, update user-facing guide text and timer tests too. |
| Visibility, focus, viewport pauses, permanent engagement | [useDiscoveryTimer.ts](../src/features/first-sight/useDiscoveryTimer.ts) | Browser listeners call the pure engagement rules. `sessionKey` identifies a new photo. |
| Celebrity photos, names, tags, regions, sources | [looks.ts](../src/features/first-sight/looks.ts) | `outfitLooks`. Keep image dimensions, author, source URL, and license together; see [source records](first-sight-sources.md). |
| Geographic filters, masonry batching, look dialog | [OutfitMasonry.tsx](../src/features/first-sight/components/OutfitMasonry.tsx) | Local filter/limit/dialog state; saved-look IDs are passed from the page. |
| Which inspiration appears after a sample scan | [prototype.ts](../src/features/first-sight/services/prototype.ts) | Sample context tags filter and prioritize sourced looks. This is authored matching, not image analysis. |
| Purchase cards in discovery | [PurchaseGrid.tsx](../src/features/first-sight/components/PurchaseGrid.tsx) | Product cards and availability labels; selection delegates to the page. |
| PDP gallery, specifications, size buttons, CTAs | [ProductDetailPanel.tsx](../src/features/first-sight/components/ProductDetailPanel.tsx) | Local gallery/SKU selection and callback wiring. |
| PDP 70/30 split and sticky styling sidebar | [product-detail.css](../src/features/first-sight/components/product-detail.css) | `.fs-pdp-layout`, `.fs-pdp-sidebar`, and mobile overrides. |
| Sample bag quantities, stock limits, Buy Now behavior | [FirstSightPage.tsx](../src/pages/FirstSightPage.tsx) | `cart`, `addToCart`, and `cartOpen`. |
| Bag dialog, quantity/removal controls, checkout preview | [CartPreview.tsx](../src/features/first-sight/components/CartPreview.tsx) | Dialog presentation and callbacks; completion is local to the dialog. |
| Wardrobe persistence across routes/reloads | [App.tsx](../src/App.tsx), [savedItems.ts](../src/domain/savedItems.ts) | App owns storage and notifications; pure rules validate/toggle known catalog IDs. |
| Existing Discover, Vault, item, story, or Submit pages | [pages/](../src/pages/) | Separate route modules listed below; they remain available alongside FirstSight. |
| Future FirstSight API adapter | [services/contracts.ts](../src/features/first-sight/services/contracts.ts) | Implement `FirstSightGateway` and inject it into `FirstSightPage`; use the [integration guide](first-sight-prototype.md). |

## Entry points and module boundaries

```text
index.html
  src/main.tsx                 React mount, BrowserRouter, global CSS
    src/App.tsx                Shared shell, routes, persistent wardrobe
      src/pages/               Route-level screens
        FirstSightPage.tsx     FirstSight flow, photo lifetime, bag, saved looks
          components/          UI sections under features/first-sight/
          services/            Replaceable discovery boundary
          engagement.ts        Pure timer rules
          useDiscoveryTimer.ts Browser visibility/focus adapter
```

| Area | Responsibility |
| --- | --- |
| [src/types.ts](../src/types.ts) | Shared `Item`, `Story`, and page props for the original collection experience. |
| [src/data/catalog.ts](../src/data/catalog.ts) | Fictional catalog and editorial content; stable item IDs connect routing, wardrobe, and FirstSight sample products. |
| [src/components/ItemCard.tsx](../src/components/ItemCard.tsx) | Shared collection card that navigates to the original item-detail route. FirstSight uses selectable `PurchaseGrid` cards instead. |
| [features/first-sight/types.ts](../src/features/first-sight/types.ts) | Feature-specific photo, identity, variant, source, discovery-result, and cart shapes. |
| [src/integrations/contracts.ts](../src/integrations/contracts.ts) | Future app-wide repository, photo-storage, and story-analysis interfaces. These are separate from the currently injectable FirstSight gateway. |
| [public/assets/](../public/assets/) | Static product/reference images, credited celebrity photos, and explicitly labeled garment sketches. |

### Original pages

| Route | Module | Edit here for |
| --- | --- | --- |
| `/` | [DiscoverPage.tsx](../src/pages/DiscoverPage.tsx) | Landing-page editorial content, featured items, and search entry point. |
| `/vault` | [CatalogPage.tsx](../src/pages/CatalogPage.tsx) | URL search parameters, filters, sorting, and no-results state. |
| `/items/:id` | [ItemPage.tsx](../src/pages/ItemPage.tsx) | Original item details, related products, and story links. |
| `/stories`, `/stories/:id` | [StoriesPage.tsx](../src/pages/StoriesPage.tsx) | Story listing and the selected editorial article. |
| `/submit` | [SubmitPage.tsx](../src/pages/SubmitPage.tsx) | Original photo → details → preview walkthrough; styles are in [submit.css](../src/pages/submit.css). |
| `/wardrobe`, `/about` | [App.tsx](../src/App.tsx) | Small inline saved-items and prototype-information views. |

## FirstSight functions and state ownership

| Function or effect | Responsibility |
| --- | --- |
| `discover(nextPhoto)` | Abort the previous request, reset photo-specific state/timer, call the gateway, and reveal the latest result. |
| `changePhoto()` | Return to selection while retaining the page visit's bag and saved inspiration. |
| Identity-stage effect | Position the reveal, establish the scroll baseline, and enter discovery after more than 100px of downward scrolling. |
| `showMatches()` | Enter/return to discovery and position keyboard focus after the section mounts. |
| `collapseFeed()` | Switch to the full-width catalog and keep it within reach after the taller feed disappears. |
| `selectProduct(product)` | Open the inline PDP; its keyed content starts fresh gallery and size selection. |
| `addToCart(product, variant, buyNow)` | Add an SKU within stock limits; Buy Now also opens the bag preview. |
| `useDiscoveryTimer(...).engage()` | Permanently cancel auto-collapse for the current photo, including when restoring inspiration. |

| State | Owner | Lifetime |
| --- | --- | --- |
| `savedIds` | `App` | Browser storage when available; shared across routes and tabs. |
| `photo`, `result`, `stage` | `FirstSightPage` | Current photo journey; accepted upload URLs are revoked when replaced or the page unmounts. |
| `savedLookIds`, `cart` | `FirstSightPage` | Current FirstSight page visit; survive child-component stage changes. |
| Filter, batch limit, selected look | `OutfitMasonry` | Current mounted board; source data and saved IDs come from above. |
| Gallery view, selected SKU | `ProductDetailPanel` | Selected product; the keyed subtree resets them for another product. |
| Checkout-preview completion | `CartPreview` | Current dialog opening; no order is created. |
| Timer accounting | `useDiscoveryTimer` + pure engagement rules | One opportunity per photo/session key; layout changes pause rather than reset it. |

Two cancellation mechanisms serve different boundaries. `PhotoUploadPanel` uses a request token while decoding a local file; `FirstSightPage` uses `AbortController` while awaiting discovery. The panel owns unfinished object URLs, then transfers an accepted URL to the page.

## Data and API changes

Keep content changes in the data modules and behavior changes in their owners. Editing a price or stock count belongs in fixtures; changing what happens after a purchase-card click belongs in `FirstSightPage`; changing the card's appearance belongs in its component and stylesheet.

The local gateway returns a complete `DiscoveryResult`. A future adapter can map server results into the same feature types, honor cancellation, and be injected at the route. Identity labels, no-match/error states, live product IDs, and actual checkout need explicit implementation when services are connected. See [the API integration guide](first-sight-prototype.md) for those boundaries.

## Configuration and checks

| File | Control |
| --- | --- |
| [package.json](../package.json) | Scripts and dependency versions. JSON does not support comments; script explanations belong here or in README. |
| [tsconfig.json](../tsconfig.json) | Strict TypeScript/compiler rules; runtime behavior belongs in source modules. |
| [vite.config.ts](../vite.config.ts) | React plugin and strict dev/preview ports. |
| [index.html](../index.html) | Default metadata, favicon, and the React mount node. |
| [netlify.toml](../netlify.toml), [public/_redirects](../public/_redirects) | Build/publish settings and direct-route SPA fallback. |
| [netlify/functions/README.md](../netlify/functions/README.md) | Future serverless boundary documentation. |
| [tests/savedItems.test.mjs](../tests/savedItems.test.mjs) | Storage recovery and immutable wardrobe toggling rules. |
| [tests/firstSightEngagement.test.mjs](../tests/firstSightEngagement.test.mjs) | Active-time accounting, expiry, pauses, engagement, and reset behavior. |

Run these from the repository root after a behavior change:

```sh
npm run typecheck
npm test
npm run build
```

For visual changes, check the affected route at desktop and narrow mobile widths. Browser walkthroughs and existing captures are recorded in [the verification checklist](verification-checklist.md) and [FirstSight flow guide](first-sight-prototype.md).

## Find and review changes

Search the implementation by its control name rather than searching every page:

```sh
rg --files src
rg -n 'discover|showMatches|collapseFeed|addToCart' src/pages/FirstSightPage.tsx
rg -n 'DISCOVERY_ENGAGEMENT_MS|sessionKey' src/features/first-sight
rg -n 'fs-matching-|fs-discovery|fs-pdp-layout' src
git status --short
git diff --stat
```

`git diff` shows changes to tracked files. Files marked `??` by `git status` are new and must be opened directly until they are tracked. Do not treat an empty diff for a new file as proof that it contains no changes.

When updating code, keep the module header and nearby function comments accurate. Comments explain ownership, constraints, and reasons; the code remains the source of truth for values and behavior. Avoid duplicating implementation details in every callback or repeating the same explanation on every data record.
