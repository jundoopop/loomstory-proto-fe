# LoomStory · React + Vite frontend

A local, frontend-only version of LoomStory’s editorial vintage-fashion experience. It includes discovery, filters, item details, stories, a photo-to-preview walkthrough, and a saved wardrobe.

For editing, start with the [code guide and change-location map](docs/code-guide.md). It links each feature to the module, function, data, or stylesheet that controls it.

**Supabase and AI are not connected. Netlify is configured but has not been provisioned or deployed.** The sample catalogue is fictional, favorites stay in this browser, and uploaded photographs stay in the current page session.

## Run locally

Use Node.js 22.13 or later. `.nvmrc` pins the development version to 22.16.0.

Run from the `loomstory-web` repository root:

```sh
npm ci
npm run setup:analysis-media
npm run setup:outfit-media
npm run dev
```

Open the Local URL printed by Vite, normally [http://127.0.0.1:5173](http://127.0.0.1:5173). Keep the terminal open. Press **Control + C** to stop it. No environment variables, login, database, Docker, or separate application server are required.

The media setup command restores available Chloé example photographs into `public/local-media/chloe/`. It first copies the supplied originals from `src/images/`, preserving their files there, and uses reviewed download URLs when no local original is available. Both directories are ignored by Git, so these photographs are not included in GitHub and need to be supplied or restored after a fresh clone. The app serves its copies at `/local-media/chloe/`; see [the source record](docs/first-sight-sources.md) for the filename mapping and provenance.

The active Chloé example uses the bag and four available styling photographs. The optional TV-scene original (`styling-05.jpg`) is excluded from the active flow while unavailable. The floral-dress and dog-walking photographs use the exact local originals supplied in `src/images/`.

`setup:outfit-media` restores two ROSÉ × PUMA campaign frames and six single-product reference
photographs into ignored `public/local-media/outfits/`. Valid existing copies work offline. These
named-model examples are curated collection references; they are not live recognition results.

To check and preview a production build:

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

The production preview normally opens at [http://127.0.0.1:4173](http://127.0.0.1:4173). `npm run preview` serves the built `dist/` folder locally; it does not publish a website.

## What works

| Experience | Current behavior |
| --- | --- |
| Discover and The Vault | Shared sample clothing and bag records, search, era/category filters, and sorting |
| FirstSight | Photo analysis and shopping; two three-piece ROSÉ × PUMA examples, retained Chloé/five-study library, dossiers, styling references, product details and bag preview |
| Item details and stories | Navigable editorial pages using local content |
| My wardrobe | Save/unsave sample items; favorites persist in this browser when storage is available |
| Submit a piece | Select a local photograph or sample, enter details, and preview the result |
| AI result | Clearly labeled, prepared demonstration; no image analysis or API request |
| Supabase | Future contracts and blank environment placeholders only |
| Netlify | Build and SPA-routing configuration only; no hosted project or account connection |

The existing `LoomStory-source` export and the previously deployed `loomstory-prototype` remain separate projects.

## Project map

```text
src/
  components/       Shared presentation
  pages/            Route screens
  data/             Fictional items and editorial stories
  domain/           Browser-independent rules
  features/first-sight/  Feature UI, types, sample data, and discovery gateway
  integrations/     Future service contracts; no clients or requests
  images/           Ignored user-supplied originals for local media setup
public/assets/      Tracked illustrative photography and sketches
public/local-media/ Ignored Chloé and outfit photographs, restored by the two media setup commands
scripts/            Local media setup
netlify.toml        Static build and routing configuration
netlify/functions/  Documentation placeholder; no executable function
docs/               Architecture and manual verification checklist
```

Read [the architecture](docs/architecture.md) and follow [the verification checklist](docs/verification-checklist.md).

## Netlify, when requested later

For a repository containing only this app, leave the base directory at the repository root. If the repository contains the whole `challenge-proto` workspace, set the base directory to `loomstory-fe/loomstory-web`; for a repository rooted at `loomstory-fe`, use `loomstory-web`. Build and publish paths are relative to that base.

Use build command `npm run build` and publish directory `dist`. The included `netlify.toml` supplies the history-route fallback. These are the settings recommended in [Netlify’s Vite guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/); see [Netlify’s base-directory documentation](https://docs.netlify.com/build/configure-builds/overview/) for a multi-project repository.

An eventual manual deployment can upload the completed `dist/` folder instead of linking GitHub. For that workflow, preserve the generated `_redirects` file so direct links such as `/vault` work. No Netlify deployment has been performed for this frontend.

## Environment and media

`.env.example` contains empty future Supabase public settings. It is not needed for this demo. Browser-exposed `VITE_*` variables must never contain AI API secrets or Supabase service-role credentials; a future serverless function would hold those secrets.

Photography is reused from the user-supplied LoomStory export and is illustrative rather than evidence about individual listings. The source described it as Unsplash photography; original attribution and licensing provenance have not been independently verified. The app makes no brand-authentication, ownership, or verified historical-provenance claims.

The Chloé analysis photographs live separately in the ignored `public/local-media/` directory, with supplied originals retained in the ignored `src/images/` directory. Keep those photographs and screenshots containing them out of Git commits. The authored bag and garment SVGs under `public/assets/first-sight/chloe/` and `public/assets/first-sight/studies/` are source artwork and remain tracked. Vite copies local public assets into a build when they are present, so repository exclusion is separate from the contents of a future deployed build.

## FirstSight flow prototype

Visit `/first-sight` alongside the preserved Discover and Submit pages. Discover owns the editorial
hero and inspiration board. FirstSight has two retained sections:

1. **Discover the Story:** choose a photograph or celebrity example, then press **Analyse photo**.
   The city example presents PUMA's Micro Grip bag, slim long-sleeve tee and mini skirt; the track
   example presents T7 trousers, mesh top and Speedcat PRM trainers. Each named model opens its
   own product reference, four connected interactive feature tags and design notes. Tags preview on
   hover/focus and turn burgundy when pinned. The campaign associations are curated, not exact worn-SKU
   identifications. Chloé, uploads and Discover references retain the five-study demonstration.
2. **Find Your Piece:** celebrity examples retain all three pieces in the shopping edit when the
   dossier selection changes. Product images/names open the inline PDP; saves and bag actions resolve
   canonical product/SKU data. Affordable alternatives remain behind the opt-in Inspire drawer.

The original library covers Paddington, leather bomber, denim jacket, oversized blazer and workwear
jacket. The dossier resale section remains commented out. Prices, condition and stock are sample
data; no AI, photo-upload service, live checkout or payment is connected. The
[whole-outfit ledger](docs/plans/whole-outfit-example-plan.md) records the new example owners and checks.

The UI depends on an injectable service port under `src/features/first-sight/services/`, with the current behavior supplied by a local adapter. Read [the flow and future API integration guide](docs/first-sight-prototype.md) and [the celebrity media source record](docs/first-sight-sources.md).
