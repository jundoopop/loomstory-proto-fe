# VintEdge prototype

A working, persistent VintEdge journey: a member submits garment photos, staff record an evidence-scoped review and publish a demo listing, and a different member discovers it and registers interest. Built from `VintEdge_Prototype_Specification.docx` (2 November 2026).

## Run locally

Node.js 22.13+ is required.

```sh
npm ci
npm run demo:prepare
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_heavy_black_cat.sql
npm run dev
```

After the server starts at `http://localhost:5173`, use a second terminal:

```sh
npm run demo:seed
```

The three generated logins are in `.demo-accounts.json` (ignored by Git, permissions 0600): consignor, buyer, and editor. The editor is granted both reviewer and operator capabilities by trusted setup. The sign-in screen never offers a public staff role selector. New registrations can only become members. Use fictional details; there is no email delivery, verification, recovery, or production identity lifecycle in this closed demonstration.

This workspace is already initialized. Open the app and use those local credentials. For the private hosted Site, use the same supplied demo accounts after the initial ChatGPT access gate.

## Checks

```sh
npm run typecheck
npm run test:acceptance
npm run build
```

The acceptance script requires a running, seeded local server. It refuses non-loopback origins and creates clearly named test submissions. It covers server ownership, staff authority, media validation, private/public projections, unknown and failed recognition, evidence requests, reviewed revisions, publication, deduplicated interest, reporting, withdrawal and audit events. These checks do not substitute for browser QA.

## Rehearse in three minutes

1. As a guest, open Discover, select **After hours**, and inspect an item’s evidence and four independent trust labels.
2. Sign in as the consignor. Choose **Submit a piece → Use prepared sample**. Select the leather candidate scenario, inspect the form, and submit for review. Refresh: the same record and candidates remain.
3. Sign out; sign in as the editor. Open **Editorial workspace**, select the submission, choose the matching fictional model, and click **Use context reference**. Inspect the cited source. Add a private decision reason and confirm the public explanation is appropriately limited. Record the decision, then explicitly **Publish demo page**.
4. Sign out; sign in as the buyer. Find the newly published piece in the Vault, open its sources, compare an Inspire alternative, and **Register interest**. The acknowledgement explicitly creates no payment, reservation, or purchase.
5. Optional recovery: report the page as buyer; withdraw it as editor. The public page and public image derivatives disappear immediately. The changed submission needs a fresh review before republishing.

Other prepared scenarios demonstrate a missing label, no match, and a provider failure that recovers on retry. Arbitrary uploaded photographs always enter manual identification; no live recognition model is connected.

## Architecture and boundaries

React and TypeScript run on the supplied Vinext/Cloudflare Worker starter. D1 persists records; R2 holds private originals and re-encoded public derivatives. This substitutes managed Cloudflare services for the specification’s recommended Supabase stack while preserving the modular-monolith and server-enforced authorization boundaries. D1 and R2 are not exposed as browser APIs, so access is controlled in the server data layer rather than Supabase row-level policies.

- `lib/server/core.ts`: opaque sessions, PBKDF2 password hashes, role/ownership/revision checks, rate limits, event records.
- `lib/server/api.ts`: authenticated commands, public projections, prepared recognition, review and publication.
- `lib/server/media.ts`: signature/dimension checks, full image decoding, metadata-stripped WebP derivatives.
- `db/schema.ts`, `drizzle/`: separate models, physical items, submissions, media, recognition runs, reviews, claims, listings, interest, reports and events.
- `lib/catalogue.ts`: 18 fictional item records, three collections, six source-linked cultural notes, and eight curated similar-style alternatives.
- `app/page.tsx`, `app/globals.css`: responsive buyer, member and staff experiences; keyboard focus and dialog handling.

Money is stored in integer EUR cents. A unique index enforces one interest per member/listing. Publication requires a current reviewed revision. Withdrawal resets review eligibility and suppresses public content. Private decision notes are excluded from the public explanation. Physical authenticity and screen-used provenance remain unassessed regardless of editorial decisions.

Uploads: up to five JPEG, PNG or WebP files per submission; 8 MB/file; a deliberately stricter **6-megapixel** decoded limit fits the Worker memory budget. HEIC and animated WebP are rejected. Original uploads stay private. Publication requires the contributor’s explicit public-image permission and exposes only a re-encoded derivative. Generated fixtures are unbranded, fictional and labelled throughout; one image is reused for several fictional study records.

## Local reset

Stop the preview first. Then run:

```sh
npm run demo:reset -- --confirm-local-demo-reset
npm run dev
# In a second terminal:
npm run demo:seed
```

Reset moves only this checkout’s `.wrangler/state` into a recoverable local backup and reapplies local migrations. It cannot target a hosted database and does not change the saved account credentials. There is no public reset or role-assignment endpoint.

## Deployment

The private Site identity and D1/R2 bindings are recorded in `.openai/hosting.json`. Use the Sites plugin’s source helper to push the exact source, build/package it, save a version, and publish privately. Runtime `SETUP_SECRET` is stored as a Site secret and never committed. `/api/setup` is protected by this secret and refuses to run after accounts exist. Local secrets, credentials, uploads, runtime state, and test artifacts are excluded from the source archive.

The deployment is owner-private. Sharing is a separate, explicit access change. The two member accounts are separate application identities behind that private gate; this does not itself invite external collaborators.

## Verification limits and deferred scope

TypeScript, production build, and API acceptance checks passed. Browser control was unavailable in the build environment, so desktop/mobile visual inspection, keyboard walkthrough, and a measured three-second mobile performance profile remain unverified. Responsive layouts include 360-pixel widths, but this needs human visual QA before presentation.

This is a closed prototype, not production consignment or commerce. Real inventory, physical authentication, payments, shipping, returns, live vision, and production account operations are intentionally absent. The general historical summaries are sourced; a fashion/content lead still needs to approve real inventory, item-specific associations, media permissions, and external alternatives before a public release.
