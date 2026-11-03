# Manual verification checklist

Run these checks from the `loomstory-web` folder. Empty boxes are for the person verifying the app; they do not imply that an automated browser suite has run.

## Verification performed on 2026-11-03

- TypeScript check, four saved-item unit tests, and the production build passed.
- Development server and production preview both served locally.
- Browser checks passed for combined filters and price sorting, no-results state, item-to-story navigation, saving across reload, and the complete sample-photo walkthrough including the AI placeholder and finish/reset.
- Home, catalogue, item detail, and upload screens had no horizontal overflow at 320 px. The desktop layout was checked at 1440 px. No browser console warnings or errors were captured.
- Real file selection was not verified: the browser upload permission gate declined access. Valid-file, invalid-file, and image-decoding checks below remain manual checks; source validation and object-URL cleanup were reviewed.
- Netlify deployment and live Supabase/AI behavior were intentionally not tested because those services are not connected.

Preview captures: [desktop](previews/desktop.jpg) and [mobile](previews/mobile.jpg).

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
