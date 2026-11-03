# VintEdge prototype setup and user guide

VintEdge demonstrates a complete vintage-discovery workflow: a member submits a garment, a staff account reviews its identification and evidence, an operator publishes a demo listing, and a buyer registers interest. This guide explains how to open the deployed prototype, install and run it from Terminal, use each account, and publish later updates.

The prototype follows `VintEdge_Prototype_Specification.docx`, dated 2 November 2026. Recognition uses prepared samples, and every listing is a demonstration. No payment, reservation, shipment, or real sale takes place.

## Choose where to start

| What you want to do | Where to go |
| --- | --- |
| Try the existing website without installing anything | [Open the deployed prototype](#1-open-the-deployed-prototype) |
| Run the existing project on this Mac | [Start this workspace](#2-start-this-workspace) |
| Set up a fresh copy on another computer | [Install from a fresh copy](#3-install-from-a-fresh-copy) |
| Understand the screens and complete the demo | [Use the prototype](#5-use-the-prototype) |
| Publish your changes online | [Deploy an update](#7-deploy-an-update) |
| Fix a setup problem | [Troubleshooting](#10-troubleshooting) |

## 1. Open the deployed prototype

**Website:** [Open VintEdge](https://vintedge-archive-prototype-joon.fresh-cream-0312.chatgpt.site)

1. Open the link in your browser.
2. Complete the ChatGPT access gate if prompted. This deployment is private to its owner.
3. Browse Discover, Vault, Inspire, and Stories.
4. Use the profile icon to sign in to a VintEdge demo account when you want to submit, review, or register interest.

There are two separate sign-in layers: ChatGPT controls access to the private website, and VintEdge accounts control the member and staff journeys inside it. Giving someone a VintEdge demo password does not grant access through the private website gate. The Site owner must separately grant website access when sharing with a teammate.

The original workspace contains the credentials used to initialize this hosted demo. See [Demo accounts](#4-demo-accounts). A fresh checkout generates its own local passwords; those newly generated passwords do not change the hosted accounts.

## 2. Start this workspace

The original workspace on this Mac already has dependencies, a local database, sample content, and demo credentials. For normal use, you only need to start the server.

Open **Terminal** and run:

```sh
cd ./vintedge
npm run dev
```

Wait for a message like:

```text
Local: http://127.0.0.1:5173/
```

Open that address in your browser. `http://localhost:5173` also normally works. Use one hostname consistently when signing in because browser cookies belong to that hostname.

Keep this terminal open while using the local prototype. To stop the server, click in that terminal and press **Control + C**. Your saved records remain on disk.

To start it again later, run the same two commands. Do not repeat database creation or reset for an ordinary restart.

If you see missing-package or missing-database errors, follow the fresh-install instructions below, applying only the setup steps that are missing.

## 3. Install from a fresh copy

These commands are written for macOS Terminal with zsh or bash. They assume you have obtained the project source folder, including `package.json`, `package-lock.json`, `scripts/`, `drizzle/`, and `.openai/hosting.json`.

Run each block in order and wait for it to finish before continuing. If a command fails, resolve the error before running the next step. Do not type a `$` prompt before the commands.

### Step A. Check Node.js and npm

```sh
node --version
npm --version
```

The project requires **Node.js 22.13.0 or newer**. The original build used Node.js 22.16.0. If Node is missing, install Node.js and npm using an official installer, then reopen Terminal. The [official Node.js 22.16.0 archive](https://nodejs.org/en/download/archive/v22.16.0) includes the macOS `.pkg` installer used to reproduce that runtime version.

A Cloudflare account, Supabase project, OpenAI API key, and payment-provider account are not needed for local use. The development server runs local D1 database and R2 storage emulators.

### Step B. Enter the application folder

On the original Mac:

```sh
cd ./vintedge
```

On another computer, replace that path with the actual location of your `vintedge` folder. You must be inside the folder containing `package.json`.

Check your location:

```sh
pwd
ls package.json package-lock.json
```

### Step C. Install the libraries

```sh
npm run install:ci
```

This project wrapper runs `npm ci` with its development and optional dependencies enabled. It installs the versions recorded in `package-lock.json` into `node_modules/`. There is no need to install React, TypeScript, Wrangler, or the other libraries individually. See the [npm ci documentation](https://docs.npmjs.com/cli/v11/commands/npm-ci/) for how the locked installation works.

The first installation needs an internet connection. Run it again after obtaining a changed dependency lockfile, rather than on every server restart.

### Step D. Generate local demo credentials

```sh
npm run demo:prepare
```

This creates the following files when they do not already exist:

| File | Purpose |
| --- | --- |
| `.dev.vars` | A random `SETUP_SECRET` used to authorize initial database seeding |
| `.demo-accounts.json` | Three demo accounts with randomly generated passwords |

Existing files are preserved. These files are ignored by Git and are not part of the published source. Keep them private; do not copy their values into the README or commit them.

Run preparation **before** starting the development server so the server loads `.dev.vars`.

### Step E. Build the application

```sh
npm run build
```

This compiles the frontend and Worker server into `dist/`. It also produces `dist/server/wrangler.json`, which the next command needs.

A successful local build does not publish the website.

### Step F. Create the local database tables once

For a new, empty local database, run:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_heavy_black_cat.sql
```

This applies the initial schema: accounts, sessions, submissions, media records, reviews, listings, reports, and related tables. The `--local` flag targets this checkout’s local emulator, not the hosted database.

**Do not run the initial migration again on an already initialized database.** A `table already exists` message usually means this step has already been completed. Normal restarts do not require migrations.

If future development adds migrations, apply only the new SQL files, in order. Do not edit or replay a migration that has already been applied.

### Step G. Start the server in Terminal A

```sh
npm run dev
```

Leave this terminal running and note the printed `Local` URL. The usual address is:

```text
http://localhost:5173
```

### Step H. Load the sample content in Terminal B

Open another terminal tab or window, enter the same application folder, and run:

```sh
cd ./vintedge
npm run demo:seed
```

Replace the `cd` path if you are using another computer.

Expected output includes:

```text
Seeded 18 items, six garment models, and three separate accounts.
```

The application also includes three collections, six source-linked cultural stories, and eight curated similar-style alternatives. Seeding loads the database records; the stories and alternatives are prepared application content.

If the command says the environment is already seeded, existing records are preserved. Do not create an account through the website before the first seed: setup intentionally refuses to initialize a database that already contains accounts.

### Step I. Open the website

Visit the printed local URL and refresh the page. You should see the VintEdge landing page and sample garments in the Vault.

You now have a local installation. For future sessions, use only `npm run dev` from this folder.

## 4. Demo accounts

Read the passwords from `.demo-accounts.json`. For example, on your own terminal:

```sh
cat .demo-accounts.json
```

This displays credentials; do not include the output in shared screenshots or logs.

| Account | Role | Use it for |
| --- | --- | --- |
| `consignor@vintedge.demo` | Member | Create drafts, upload photos, submit, respond to requests |
| `buyer@vintedge.demo` | Member | Register interest and report a concern |
| `editor@vintedge.demo` | Operator, including reviewer permissions | Review evidence, record decisions, publish and withdraw pages |

Use the profile icon in the header to sign in. Once signed in, open the same menu to visit **My submissions**, the **Review workspace** if permitted, or **Sign out**.

Sign out before switching roles in the same browser session. Separate browser profiles or private windows can also be used for simultaneous demonstrations.

New accounts created through the interface are members only. There is no public role selector. Staff permissions come from trusted setup. There is no email verification, password-reset email, or production account-management workflow in this prototype.

## 5. Use the prototype

### Browse as a buyer

1. Open **Discover** and choose a collection such as **After hours**.
2. In **Vault**, search by title, era, category, brand, or cultural tag. Combine the category, decade, and price filters; use **Clear filters** if no pieces match.
3. Open a garment card to inspect its description, measurements, condition, demo price, and evidence.
4. Read the separate identity, cultural-context, physical-authenticity, and provenance labels.
5. Follow a source link to inspect the cited reference.
6. Choose **Explore similar styles in Inspire** to compare an external alternative. The destination and merchant are shown, and all current links are non-affiliate. Illustrations are generated samples, not photographs of the linked products.
7. Sign in as the buyer and select **Register interest** on a Vault item.

The confirmation means interest was recorded. It does not reserve an item, take payment, or create a purchase. Repeated requests do not create duplicate interest records.

### Submit a prepared sample

This is the quickest way to demonstrate the full workflow.

1. Sign in as the consignor and open **Submit a piece**.
2. Under **Start with a sample**, choose **Leather blouson · candidates**.
3. Select **Use prepared sample**. This creates a private draft and attaches the named fictional sample.
4. Inspect the prefilled details and permission declaration. You can adjust the title, era, size, measurements, or notes.
5. Select **Save draft** if you want to stop here, or **Submit for review** to continue.
6. Read the explicitly labelled **Sample provider** suggestions.
7. Open **My submissions** to revisit the record. Refreshing its page preserves its saved state.

Use a new empty draft for each prepared scenario. The sample picker is disabled after media has been attached.

### Upload your own photographs

1. Start a new submission and enter a descriptive title.
2. Add the details you know. The brand or exact year can remain unknown; declare a missing label if appropriate.
3. Confirm that you own the photos or have permission to submit them.
4. If the photos may appear on a published demo page, also enable the separate public-image permission **before uploading them**.
5. Choose a photo angle and select **Add a photograph**. A front photograph is required; add back and label/detail photographs when available.
6. Save the draft or submit for review.

Limits are **five images per submission**, **8 MB per image**, and **6 megapixels**. Accepted formats are JPEG, PNG, and WebP. HEIC and animated WebP are unsupported. Export or resize an image in your photo editor if necessary.

Original uploads remain private to their owner and authorized staff. Public pages use metadata-stripped derivatives with publication permission. Arbitrary uploads receive an unknown/manual-identification result because no live vision provider is connected; they are never assigned a prepared exact match.

### Review and publish as staff

1. Sign out of the member account and sign in as the editor.
2. Open **Editorial workspace** from the footer or **Review workspace** from the profile menu.
3. Open a submission and inspect its photographs, contributor observations, and candidate suggestions.
4. Select a decision: accept/correct, request more information, or reject.
5. For acceptance, select a garment model or leave identity unresolved. Confirm the public title, era, and illustrative price.
6. Choose the cultural-assertion scope. For the prepared leather example, **Use context reference** fills in a historical source and a limited context statement. Inspect the source before accepting it.
7. For a factual cultural statement, provide a source URL, title, publisher, supporting passage/locator, and public explanation of what the source supports. A URL alone is insufficient.
8. Add a private decision reason of at least 12 characters, explaining what you reviewed.
9. Select **Record decision**. The reviewer, time, revision, evidence, and reason are retained.
10. After acceptance, select **Publish demo page**, then **Open public page**.

Acceptance and publication are separate actions. Publication requires the current approved revision and an image permitted for public display. If another change has made the review stale, refresh and review the current revision.

Approving editorial content never changes physical authenticity to authenticated, establishes screen-used provenance, or claims that VintEdge has received the garment.

### Request and supply more evidence

As editor, choose **Request more information**, enter a specific request, and record the decision. As consignor, open that submission, read the request, update the details or add a photo, save, and submit again. The record returns to human review.

### Report or correct a page

As a signed-in member, open an item, select **Report a concern**, explain the issue, and send it. An acknowledgement confirms the report entered the staff queue.

As editor, open the report in **Editorial workspace**, supply a withdrawal reason, and select **Withdraw page**. You can also withdraw a published submission from its review screen. The public page and its public image derivatives stop being served. For a community submission, the revised record returns to review and requires a fresh decision before republication; the earlier decisions remain in its history.

The 18 initial catalogue records are prepared seed fixtures. Their content lives in `lib/catalogue.ts`; the interactive correction/republication journey is demonstrated on community submissions. Editing seed definitions does not overwrite already stored catalogue records automatically.

## 6. Recognition scenarios and a short presentation

| Prepared scenario | What to demonstrate |
| --- | --- |
| Leather blouson, city trench, or straight-leg denim | Ranked, explicitly labelled sample candidates |
| Missing label | A request for further information; staff can still review manually |
| Unfamiliar piece | No match; an unresolved result remains usable |
| Provider failure | An explicit failure; **Retry sample identification** recovers to prepared candidates |
| Your own uploaded photograph | Manual identification without a fabricated sample match |

A three-minute presentation can follow this sequence:

1. **Discover:** open a collection and show an item’s source and independent trust labels.
2. **Consignor:** create the prepared leather sample and submit it.
3. **Editor:** inspect it, record a scoped decision, and publish explicitly.
4. **Buyer:** find the published item, compare an Inspire alternative, and register interest.

For a recovery demonstration, add a report and withdrawal, or choose the prepared failure scenario and retry it.

## 7. Deploy an update

### What the terminal commands do

| Action | Command or workflow | Result |
| --- | --- | --- |
| Develop locally | `npm run dev` | Starts a local server with automatic reloads |
| Compile a release | `npm run build` | Writes deployable output to `dist/` |
| Preview the compiled release locally | `npm start -- --port 5174` | Runs the built Worker on this computer |
| Publish the website online | Connected **Sites** deployment workflow | Updates the private hosted website |

There is currently **no `npm run deploy` script**. Running `npm run build` or `npm start` does not update the live website. The current deployment depends on its Worker server, D1 database, R2 bucket, and runtime secret; uploading only the HTML or frontend assets is not sufficient.

### Publish changes to the existing private Site

First, run the local checks from the application directory:

```sh
npm run typecheck
npm run build
```

With a seeded development server running in another terminal, also run:

```sh
npm run test:acceptance
```

Review the changes locally. Browser testing should include the complete journey at desktop and 360-pixel widths, especially photo upload, account switching, review, and publication.

Then use the connected Sites tools in the environment that created this project. A concrete request to use is:

```text
Deploy the current VintEdge project in
./vintedge
to its existing private Site. Reuse the project_id in .openai/hosting.json,
preserve the current audience and stored data, run the appropriate checks,
push the exact source, build and package it, and publish the saved version.
Do not reset or reseed the hosted database. Return the verified live URL.
```

The deployment tooling performs these steps:

1. Reuses the existing Site identity from `.openai/hosting.json`.
2. Obtains short-lived source-repository access and synchronizes the exact source revision.
3. Builds and packages that revision, including the Worker and static assets.
4. Saves a version and publishes it with the existing private access setting.
5. Applies any new hosted schema migrations and connects the declared D1/R2 bindings.
6. Checks the deployment result and returns the live URL.

This workflow requires the connected Sites service and its authenticated tools; a plain terminal checkout does not include those credentials. Do not copy repository access tokens into commands or source files. Publishing directly to a separate Cloudflare account would require a separate deployment configuration and resource provisioning; it is not configured by this project.

### Hosted data and initial setup

The existing hosted demo is already seeded. Normal redeployment should preserve its accounts, submissions, and other database records. Local `.wrangler/` data is not uploaded to it, and local changes are not automatically synchronized with it.

For a genuinely new hosted environment, deployment must provision D1/R2, apply the schema, set `SETUP_SECRET` as a runtime secret, and initialize `/api/setup` through an authorized private request. The endpoint refuses setup after accounts exist. The `demo:seed` script intentionally accepts only loopback addresses and cannot seed or reset a hosted Site.

The runtime secret belongs in the Site’s secret settings, not `.openai/hosting.json`. Website sharing is a separate access-management action; preserve the current audience during an ordinary deployment.

## 8. Test and preview the production build

With the development server running and the local database seeded, use a second terminal:

```sh
npm run typecheck
npm run test:acceptance
npm run build
```

The acceptance script covers 21 groups of server checks: account separation, ownership, staff permissions, composed filters, draft persistence, image validation, recognition failure/retry, evidence requirements, stale revisions, publication, repeated interest, reports, withdrawal, and audit events.

**Tests create demo submissions and reports in the local database.** They refuse non-loopback origins. Use the local reset procedure when you want a clean presentation dataset afterward.

To preview the compiled app, stop the development server with Control + C and run:

```sh
npm start -- --port 5174
```

Open `http://127.0.0.1:5174`. This preview shares the local persisted database and uploads with development mode. Seed through `npm run dev` first; the built-preview command does not automatically load the root `.dev.vars` setup secret.

To run the API acceptance checks against that built preview, use a second terminal:

```sh
TEST_ORIGIN=http://127.0.0.1:5174 npm run test:acceptance
```

Stop the preview with Control + C when finished.

## 9. Reset the local demo

Use this when you want to clear test submissions and start a fresh local demonstration. Stop **all** development and built-preview servers for this checkout first.

From the application folder, run:

```sh
npm run build
npm run demo:reset -- --confirm-local-demo-reset
npm run dev
```

Leave the new server running. In a second terminal, enter the same application folder and run:

```sh
npm run demo:seed
```

Reset moves `.wrangler/state` to a recoverable `.wrangler/demo-backup-<timestamp>` directory and creates a new local database using the migrations. It preserves `.demo-accounts.json`, so the same local demo passwords can be reused. It does not modify the hosted website or its database.

There is no public reset endpoint. Do not delete the credential file as a way to change a password: generating a new file does not update passwords in an already seeded database.

## 10. Troubleshooting

| Symptom | What to check or do |
| --- | --- |
| `node: command not found` or `npm: command not found` | Install Node.js and npm, reopen Terminal, then check their versions. |
| `package.json` not found or npm reports `ENOENT` | Run `pwd`. Enter the inner `vintedge` folder, not just `challenge-proto`. |
| `vinext` or another dependency cannot be found | Run `npm run install:ci` from the application folder. |
| `dist/server/wrangler.json` is missing | Run `npm run build` before database setup or `npm start`. |
| `no such table` | Apply the initial local migration if this database has never been initialized. |
| `table already exists` during the initial migration | The schema is already present. Continue with startup/seeding; do not replay the initial migration. |
| Seed command says `fetch failed` | Start `npm run dev` first and check the printed port. |
| Seed command returns `Not found` | Ensure `.dev.vars` exists and contains `SETUP_SECRET`. Restart the development server after running `npm run demo:prepare`. |
| Seed command reports already initialized | Existing data is preserved. Continue, or use the local reset flow if you intentionally need a clean demo. |
| The Vault is empty | Confirm you are using the intended local or hosted URL. For a new local environment, run `npm run demo:seed` while the development server is running. |
| Demo login fails | Use the exact password for that environment. New local passwords do not replace hosted ones. Check that the database has been seeded. |
| Sign-in disappears after changing the address | `localhost` and `127.0.0.1` use different browser cookies. Keep using the same hostname. |
| Review workspace denies access | Sign out and sign in as `editor@vintedge.demo`; member accounts cannot review or publish. |
| Publish says there is no eligible public image | Public-image permission must be enabled when uploading a photo. Add a permitted image if there is room, or use a new prepared-sample draft. |
| A review or update reports a revision conflict | Refresh the record, inspect the latest content, and repeat the decision on that revision. |
| An uploaded photograph has no recognition candidates | Expected for arbitrary uploads. The live vision provider is not connected; staff can review manually. |
| HEIC or a large photograph is rejected | Export JPEG, PNG, or WebP and resize below both 8 MB and 6 megapixels. |
| The hosted website remains unchanged after local edits | Publish through Sites. Local saving, building, and starting do not deploy. |
| Another person cannot open the private website | The Site owner must grant website access separately from providing a VintEdge account. |

If port 5173 is occupied, choose another port in Terminal A:

```sh
npm run dev -- --port 5175
```

Then point Terminal B’s seed or test command at that same port:

```sh
DEMO_ORIGIN=http://localhost:5175 npm run demo:seed
TEST_ORIGIN=http://localhost:5175 npm run test:acceptance
```

## 11. Command reference

Run these from `vintedge/` unless stated otherwise.

| Command | Purpose | When to use it |
| --- | --- | --- |
| `npm run install:ci` | Install locked dependencies with the project wrapper | First setup or changed dependencies |
| `npm run demo:prepare` | Generate missing local setup files and account passwords | Before first server startup |
| `npm run build` | Compile Worker and frontend; generate runtime configuration | Initial setup, release checks, or built preview |
| `npm run dev` | Start the development server, normally on port 5173 | Everyday local use and development |
| `npm run demo:seed` | Seed an empty local database through the running server | After schema setup or local reset |
| `npm run typecheck` | Check TypeScript without emitting a build | After code changes |
| `npm run test:acceptance` | Exercise server workflows against a running local app | Before release; creates local test data |
| `npm start -- --port 5174` | Run a previously compiled Worker locally | Production-build verification |
| `npm run db:generate` | Generate SQL migrations after editing the schema | Database development; does not apply migrations |
| `npm run demo:reset -- --confirm-local-demo-reset` | Back up local state and recreate the database schema | Intentional reset with all local servers stopped |
| Control + C | Stop the server in the active terminal | End a local session |

## 12. Project map and implementation limits

| Path | What it contains |
| --- | --- |
| `app/page.tsx` | Discover, Vault, Inspire, stories, submissions, review, and account UI |
| `app/globals.css` | Desktop and mobile styling |
| `lib/catalogue.ts` | Fictional seed items, collections, cultural sources, and alternatives |
| `lib/server/core.ts` | Sessions, password hashing, permissions, revision checks, and audit helpers |
| `lib/server/api.ts` | API commands, sample recognition, review, publication, reports, and interest |
| `lib/server/media.ts` | Image type/dimension validation, decoding, and public derivative generation |
| `db/schema.ts` and `drizzle/` | Data model and versioned schema migrations |
| `scripts/demo-setup.mjs` | Local preparation, seeding, and reset commands |
| `tests/acceptance.mjs` | Server acceptance checks |
| `.openai/hosting.json` | Existing Site identity and the `DB`/`BUCKET` resource bindings |
| `.wrangler/state/` | Local persistent database and uploaded files; ignored by Git |
| `.dev.vars` and `.demo-accounts.json` | Local secrets and credentials; ignored by Git |
| `dist/` | Generated build output; ignored by Git |
| `public/images/` and `public/fonts/` | Sample imagery and self-hosted fonts |
| `docs/asset-provenance.md` | Image-generation prompt, asset locations, and font license information |

The app uses React and TypeScript on Vinext with a Cloudflare Worker. D1 stores records and R2 stores files. This implements the specification’s server-enforced boundaries using Cloudflare services rather than its suggested Supabase stack. The browser cannot directly access the database or private bucket; API commands check account identity, role, ownership, and state transitions.

Money is recorded in integer EUR cents. Model identification, cultural association, physical authenticity, and exact-object provenance remain independent. The catalogue uses fictional garment records and generated imagery; source-linked stories describe general historical context rather than inventing an item’s provenance.

Initial delivery passed TypeScript, production build, and 21 API acceptance groups, including against the locally executed production Worker. The live catalogue and all three hosted logins were also checked. Browser control was unavailable during delivery, so visual desktop/mobile review, a keyboard walkthrough, and measured mobile performance still need verification.

Real authentication of garments, consignment intake, payments, shipping, returns, live AI recognition, and production account operations are outside this prototype. Before a public launch, the team must review real item records, image permissions, factual associations, and external alternatives.
