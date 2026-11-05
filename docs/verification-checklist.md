# Verification checklist

Run these checks from the `loomstory-web` folder. Empty boxes are for the person verifying the app; they do not imply that an automated browser suite has run.

## Verification performed on 2026-11-03

- TypeScript check, four saved-item unit tests, and the production build passed.
- Development server and production preview both served locally.
- Browser checks passed for combined filters and price sorting, no-results state, item-to-story navigation, saving across reload, and the complete sample-photo walkthrough including the AI placeholder and finish/reset.
- Home, catalogue, item detail, and upload screens had no horizontal overflow at 320 px. The desktop layout was checked at 1440 px. No browser console warnings or errors were captured.
- Real file selection was not verified: the browser upload permission gate declined access. Valid-file, invalid-file, and image-decoding checks below remain manual checks; source validation and object-URL cleanup were reviewed.
- Netlify deployment and live Supabase/AI behavior were intentionally not tested because those services are not connected.

Preview captures: [desktop](previews/desktop.jpg) and [mobile](previews/mobile.jpg).

## Historical P16 checkpoint and current P18 verification — 5 November 2026

The record above is historical and describes the original application. The original upload
walkthrough below belongs to `/submit`; FirstSight has a separate continuous journey.

The delivered P16 checkpoint passed thirty-five Node tests, seventy-four development browser executions across nine
projects and three production-preview checks. Both TypeScript checks and clean installation passed.
The nineteen accessibility executions include fifty-five scans with no reported violations; recorded
contrast findings are corrected. See the [verification record](first-sight-verification.md) for measured
results and the manual checks that remain unperformed. P17 delivered that state as `d32ef3c` on
`origin/new-analysis`. P18 is now complete and verified but uncommitted: 40 Node tests, both
TypeScript checks, clean installation, 128 development browser executions of 42 unique scenarios
and six production-preview checks pass. Its 38 accessibility executions contain 85 scans with zero
reported violations. Incomplete contrast and label/name checks remain manual-review items;
see the [Discover verification record](discover-verification.md). Historical P16 counts are
preserved separately and were not used to certify changed P18 source.

### Install and run the durable browser checks

```sh
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npm run typecheck:browser
npm test
npm run test:browser
npm run test:browser:all
npm run test:browser:a11y
npm run build
npm run test:browser:preview
```

`test:browser` selects the five Chromium projects; `test:browser:all` runs the configured engine
matrix. Narrow projects run tagged responsive/core scenarios rather than repeating every edge case.
The runner owns a Vite server on port 5183; preview uses 4183 and requires a prior build. Set
`FIRST_SIGHT_TEST_PORT` / `FIRST_SIGHT_PREVIEW_PORT` to change them. An occupied port fails clearly;
the runner does not reuse or terminate an unrelated server.

Each test gets isolated browser state. Automatic diagnostics reject unexpected application fetch/POST,
page/console errors, HTTP errors and transport failures. Intentional negative cases must declare their
specific expectation. Normal navigation can cancel lazy image requests without indicating a defect.

Browser tests substitute original test artwork only for ignored `/local-media/chloe/*` images.
They still load tracked assets normally. The substitution makes a fresh checkout reproducible;
exact supplied photographs require a separately labelled local-media-present inspection. Generated
reports, screenshots and traces stay in ignored `playwright-report/` and `test-results/`.

The Firefox fixture uses disposable app data on macOS to avoid the protected personal-profile lookup
in Firefox 157. macOS can retain protected subfolders during cleanup; the runner reports access-only
cleanup warnings. It does not change OS permissions or the user's personal Firefox profile.

### Discover and reference hand-off acceptance checks

- [ ] Discover loads directly as the homepage, with its own editorial cover and visible six-photo board.
- [ ] All four collections update the cover and independently expected six-look order together.
- [ ] `?collection=<id>` restores the edit; an unknown collection uses the first authored edit.
- [ ] Discover has no photo-search field, regional filters or saved-only mode; Vault search still
  navigates to `/vault?q=...` and featured product/Stories/submission links work.
- [ ] Cover and photo-detail actions carry the correct authored ID to `/first-sight?look=<id>`.
- [ ] FirstSight shows that exact photograph, celebrity/title and accessible credit/source/licence.
- [ ] Analysis stays explicit and the adjacent disclosure explains that results are prepared studies.
- [ ] Unknown, empty and URL-like reference IDs produce the normal workspace and a useful notice.
- [ ] Valid reload restores the reference without analysing; browser Back restores the collection.
- [ ] Query-only reference changes initialise a fresh workspace and cancel obsolete analysis.
- [ ] Remove/Replace remain effective after saved-heart rerenders; only upload object URLs are revoked.
- [ ] Shared inspiration saves survive route changes, include Chloé references, reset on full reload
  and do not change product wardrobe or Inspire saves.
- [ ] FirstSight has two chapters and a Discover link, with no duplicate inspiration cover/board.
- [ ] Direct homepage and open photo dialog pass keyboard, focus return, Escape/backdrop and axe checks.
- [ ] The board has three columns above 1000 px, two at 600–1000 px and one below 600 px; images retain
  their source proportions and 44 px controls work at 1440/1024/768/390/320 px.
- [ ] Enlarged text, touch emulation, image failures, console/network diagnostics and production preview
  are verified and results are recorded without implying physical-device or screen-reader coverage.

### FirstSight acceptance checks

- [ ] Selecting a sample or upload leaves Analyze explicit; cancellation retains the photograph.
- [ ] Valid JPG/PNG/WebP previews locally; unsupported, empty, oversized and corrupt files fail locally.
- [ ] All five studies retain their dossier and context; archive counts are 3/3/3/3/2 and Inspire counts
  are 1/1/1/1/2, with no partner card in the default archive grid/PDP.
- [ ] Both Inspire triggers open the current edit and restore focus to the actual opener.
- [ ] Drawer sizes/saves survive reopening and study changes, then reset on a fresh page visit.
- [ ] Style save/preview changes neither archive bag nor persistent wardrobe.
- [ ] Archive saves survive navigation/reload; stock-one/stock-two limits and sold-out states work.
- [ ] PDP gallery/size survives Inspire; cultural notes and source links remain visible.
- [ ] Escape, close/backdrop, removed opener, unmount and delayed native close keep modal state coherent.
- [ ] Empty/mixed streams, missing context, stale SKU, failed provider/retry and late cancellation work.
- [ ] Discover geographic card labels remain distinct from authored relationship labels in contextual views.
- [ ] The burgundy journal remains visible; no inactivity timer collapses it.
- [ ] Whole-page and open-state accessibility scans cover all five studies and the configured widths.
- [ ] Keyboard focus, dossier explanations, reduced motion, long text and 200% text enlargement work.
- [ ] Touch emulation scrolls the drawer without scrolling its background at the boundary.
- [ ] Real App smoke checks pass against the production bundle; the test host is absent from `dist`.
- [ ] Final documentation, preserved fixture/source data and media exclusions match the implementation.

Checkboxes remain available for a reviewer; actual automated outcomes belong in the dated verification
record. WebKit engine checks are not actual Safari testing, touch emulation is not physical-device
testing, and automated scans do not replace a named screen-reader session or establish full conformance.

## Start and build

- [ ] `npm ci` finishes using the included lockfile.
- [ ] `npm run dev` serves the application at the printed Local URL.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes the domain-rule tests.
- [ ] `npm run build` creates `dist/` successfully.
- [ ] `npm run preview` displays the production bundle at the printed preview URL.

## Browse and save

- [ ] The home page has the LoomStory paper, ink, and oxblood editorial design, with no missing images.
- [ ] The Vault shows twelve fictional examples before filtering.
- [ ] Search, era/category filters, and sorting change the visible results as expected.
- [ ] A search with no matches shows an empty state rather than a blank or broken page.
- [ ] Clicking a card opens the matching item, image, details, and story.
- [ ] Story links open readable articles and return to discovery.
- [ ] Saving a piece updates its heart and adds it to My wardrobe.
- [ ] Reloading retains saved pieces when browser storage is available; unsaving removes them.
- [ ] Browser Back/Forward works, and refreshing a direct route such as `/vault` keeps the route usable.

## Upload demonstration

- [ ] The sample photograph allows the full Photos → Details → Preview journey.
- [ ] A valid JPG, PNG, or WebP file up to 5 MB previews locally.
- [ ] An unsupported, empty, oversized, or unreadable image displays a useful error.
- [ ] Required details are validated and Back preserves the current draft.
- [ ] The sample AI result is visibly marked as a demonstration with no live AI connection.
- [ ] Finishing the walkthrough confirms a local preview, not a server upload or publication.
- [ ] Starting again clears the previous walkthrough; no account or payment is requested.

## Layout and scope

- [ ] At desktop and narrow mobile widths, navigation and form controls remain usable without horizontal overflow.
- [ ] Keyboard Tab reaches links and buttons, focus is visible, and form fields have labels.
- [ ] Developer Tools → Network shows local frontend assets only during the demo, with no Supabase, AI, or photo-upload request.
- [ ] `.env.example` has only blank placeholders and contains no credentials.
- [ ] `netlify.toml` builds `dist` and includes a rewrite for history routes.
- [ ] The app is understood to be local-only: no Netlify project, Supabase resource, or AI service has been created.

Future backend integration and public Netlify deployment are separate milestones, not acceptance criteria for this frontend task.
