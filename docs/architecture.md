# LoomStory architecture

The implemented application is a static React + TypeScript single-page frontend built with Vite. It demonstrates one product journey without creating backend infrastructure.

For specific edits, use the [code guide and change-location map](code-guide.md). It identifies module owners, named flow functions, data sources, styling controls, and state lifetimes. The [FirstSight guide](first-sight-prototype.md) covers its separate comparison journey and future gateway integration.

```mermaid
flowchart LR
    Visitor[Browser] --> UI[React pages and components]
    UI --> Catalog[Local catalogue and story fixtures]
    UI --> Favorites[Browser-local favorites]
    UI --> Photos[In-memory photo preview]
    Vite[Vite build] --> Bundle[Static dist files]
    Bundle -. future hosting .-> CDN[Netlify CDN]
    UI -. future adapter .-> SB[Supabase auth, database, storage]
    UI -. future request .-> Function[One serverless AI function]
    Function -. secret held server-side .-> AI[AI provider]
```

Solid connections are implemented. Dashed connections describe the intended later architecture. Neither the Supabase adapter nor the AI function exists as a working service.

## Current boundaries

| Boundary | Responsibility |
| --- | --- |
| Route shell (`App.tsx`) | Navigation, shared browser state, and the small wardrobe/about views |
| `pages/` | Discover, catalogue, item details, stories, and upload preview screens |
| `components/` | Reusable presentation such as clothing cards |
| `data/` | Shared sample clothing and bag records with stable wardrobe IDs and editorial context |
| `domain/` | Pure saved-item rules that can be tested without rendering React |
| `features/first-sight/` | Continuous-page components, five selectable recognition studies, commerce and source metadata, and an injectable gateway |
| `scripts/setup-analysis-media.mjs` | Restores available Chloé photographs into Git-ignored `public/local-media/chloe/`; supplied originals stay in ignored `src/images/` |
| `integrations/contracts.ts` | Types for future services; no credentials, SDK initialization, or network traffic |
| Vite | Development server and static production bundle |
| `netlify.toml` | Future build command, output folder, and SPA rewrite |

Search and filters act on local records. Saving an item changes browser-local favorites, not inventory. The upload screen reads a user-selected file into a local preview and shows a labeled sample result. Reloading or leaving that screen may discard the draft and photograph. The demo does not submit photos, authenticate users, create database records, or publish listings.

FirstSight is one continuous route with three retained sections: `TrendHero` presents a 50/50 inspiration edit; Section 2 pairs the persistent `PhotoUploadPanel` with results at 35/65; Section 3 contains the selected study's related products and persistent styling feed. Distinct section surfaces and headers make each part of the continuous page easier to locate. Desktop upload stickiness ends with Section 2. Narrow screens stack the content, and the dossier adapts to its own available width.

Choosing a photograph and pressing **Analyze** are separate actions. `PhotoUploadPanel` validates and decodes a browser-local file; `FirstSightPage` owns its accepted URL, request cancellation, selected study, inline PDP, and cart. `DiscoveryResult.items` contains five complete `RecognizedItem` studies. Each carries its own identity, explanation cards, image annotations, resale scenario, cultural context, purchase options, and styling references. `RecognitionResults` selects a study; `FashionDossier` presents it without changing the uploaded photo. Its idle magazine view emphasizes the central image and four connected feature labels. Hover, keyboard focus, or tap reveals a compact floating explanation; longer analysis copy remains available through a disclosure.

The styling feed remains mounted beside the selected edit regardless of browsing time. There is no automatic collapse or manual hide-inspiration mode. Product selection opens the existing 70/30 detail layout inline below that grid, preserving all earlier sections. A study with no styling references can use the full catalog width as an empty-data fallback.

`recognition.ts` composes the studies from `chloe.ts`, `fixtures.ts`, and the sourced `looks.ts` library. Shared catalog IDs make study products saveable across routes. Chloé facts link to primary references, while scores and resale figures remain explicit prototype assumptions. Four original garment SVGs illustrate generic categories; the supplied Chloé photographs stay Git-ignored. The missing TV still is optional and excluded from the active feed.

## Why this fits a three-day prototype

The UI can be developed and demonstrated with no account setup or backend dependencies. Static hosting keeps the deployment small. Separating fixtures, domain rules, and service contracts leaves clear places to connect live data later without turning every screen into an API client.

The tradeoffs are deliberate: favorites do not sync between devices, drafts are not durable, there is no access control or real AI inference, and static sample content does not prove a database integration. Browser history routes need the included host rewrite. These limits must remain visible in the demonstration.

## Later integration, not implemented

1. **Supabase data and identity.** Add an adapter behind the contracts for items, stories, saved items, and submissions. Establish ownership rules and row-level security before enabling browser writes. Use Supabase Storage for photographs and Supabase Auth if a real member account is needed.
2. **One AI function.** Choose either a Supabase Edge Function or a Netlify Function. The browser sends an authorized image reference; the function validates the request and calls the AI provider with a server-held secret. Return proposed characteristics and a draft story, with an explicit error/fallback state. Treat the result as a suggestion, not verified provenance.
3. **Netlify hosting.** Connect the selected repository, build with `npm run build`, and publish `dist`. Configure public Supabase settings only after the adapter exists. Keep the AI secret in the selected function platform’s secret store.

There is no need to add Next.js, Docker, a separate custom server, payments, messaging, or recommendation infrastructure to this frontend milestone.
