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
| `data/` | Twelve fictional clothing records and their editorial context |
| `domain/` | Pure saved-item rules that can be tested without rendering React |
| `features/first-sight/` | Feature components, typed discovery data, local gateway adapter, and pure engagement rules with a browser lifecycle hook |
| `integrations/contracts.ts` | Types for future services; no credentials, SDK initialization, or network traffic |
| Vite | Development server and static production bundle |
| `netlify.toml` | Future build command, output folder, and SPA rewrite |

Search and filters act on local records. Saving an item changes browser-local favorites, not inventory. The upload screen reads a user-selected file into a local preview and shows a labeled sample result. Reloading or leaving that screen may discard the draft and photograph. The demo does not submit photos, authenticate users, create database records, or publish listings.

## Why this fits a three-day prototype

The UI can be developed and demonstrated with no account setup or backend dependencies. Static hosting keeps the deployment small. Separating fixtures, domain rules, and service contracts leaves clear places to connect live data later without turning every screen into an API client.

The tradeoffs are deliberate: favorites do not sync between devices, drafts are not durable, there is no access control or real AI inference, and static sample content does not prove a database integration. Browser history routes need the included host rewrite. These limits must remain visible in the demonstration.

## Later integration, not implemented

1. **Supabase data and identity.** Add an adapter behind the contracts for items, stories, saved items, and submissions. Establish ownership rules and row-level security before enabling browser writes. Use Supabase Storage for photographs and Supabase Auth if a real member account is needed.
2. **One AI function.** Choose either a Supabase Edge Function or a Netlify Function. The browser sends an authorized image reference; the function validates the request and calls the AI provider with a server-held secret. Return proposed characteristics and a draft story, with an explicit error/fallback state. Treat the result as a suggestion, not verified provenance.
3. **Netlify hosting.** Connect the selected repository, build with `npm run build`, and publish `dist`. Configure public Supabase settings only after the adapter exists. Keep the AI secret in the selected function platform’s secret store.

There is no need to add Next.js, Docker, a separate custom server, payments, messaging, or recommendation infrastructure to this frontend milestone.
