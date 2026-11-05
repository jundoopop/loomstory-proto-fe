# FirstSight verification record

Recorded: 5 November 2026. Baseline: `0b4328086e8b44a85ddf3085a44ada69c4ff0c88`.
Current work: approved P13–P16 on `new-analysis`, uncommitted. P17 Git delivery requires approval.

This record distinguishes executed checks from pending work. Use it with the
[workflow and ledger](plans/first-sight-p13-p16-plan.md) and [checklist](verification-checklist.md).

## P13 — executed

| Check | Result |
| --- | --- |
| Node tests | 35 passed; existing meaningful contracts retained |
| Application TypeScript | Passed |
| Browser-test TypeScript | Passed with `tsconfig.browser.json` |
| Durable browser suite | 49 passed, 0 skipped, 0 unexpected/flaky cases, 0 runner errors |
| Projects | Chromium at 1440/1024/768/390/320; Firefox and WebKit at 1440/390 |
| Scenarios | Seven real-route cases and fourteen isolated-host resilience cases, selected by project tags |
| Source corrections | Explicit pointer-opener focus for WebKit; controlled bag close-event ownership |

The queued bag-close defect has a deterministic regression delivering an old native close between
the new controlled prop commit and its opening effect. The previous DOM-open-only guard failed;
native close is now non-notifying, while Escape and visible controls explicitly request host closure.

WebKit pointer activation did not focus the trigger before the drawer captured its opener. Both real
entry buttons now focus themselves before opening Inspire. This preserves focus return across engines.

## Reproduction

```sh
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npm run typecheck:browser
npm test
npm run test:browser:all
npm run build
npm run test:browser:preview
git diff --check
```

The runner owns dedicated, configurable loopback servers. Reports/traces/screenshots are ignored.
The consumer suite uses the real App route. The isolated host uses the real FirstSight components,
StrictMode and an injected gateway; no test controls are imported by the production entry point.

## Media and environment

Portable runs replace only ignored Chloé media URLs with original generated artwork. All tracked
assets retain normal loading and diagnostics. This verifies interface behaviour independently of
private images; it does not verify exact supplied-photo rendering. That requires a labelled local run.

Tooling: Node 22.16.0, npm 11.6.2, Playwright 1.64.1 and axe integration 4.14.0 on macOS 27.2/Apple Silicon.
The installed engines are Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2.

Firefox 157 consulted protected personal app data on this macOS machine and initially failed before
tests could start. The worker fixture uses disposable `CFFIXED_USER_HOME` app data, preserving the
user's personal profile. macOS can deny removal of its temporary Library/Downloads subfolders;
only EACCES/EPERM cleanup failures are reported as warnings, while other cleanup errors still fail.
This is consistent with the upstream [Playwright Firefox issue](https://github.com/microsoft/playwright/issues/42768).

## P15 — measured corrections and verification

A fresh Chromium scan reproduced all 45 recorded workwear contrast nodes. The same state now has
zero violations. Broader study/viewport checks additionally found a faint sold-out label and a
recognition topline at narrow widths; those are also corrected.

| Area | Recorded before | Measured corrected ratio |
| --- | --- | --- |
| Earlier chapter labels | 3.88 / 4.04 | 5.06 / 5.27 |
| Trend numbers | 2.73–3.18 | 5.51 normal, 6.68 selected, 7.56 hover |
| Workspace filename/remove/status | 4.27–4.46 | 5.28 |
| Recognition metadata | 3.32–4.47 | 5.39–5.92; topline also darkened |
| Dossier brown and heading | 4.49 on the light paper | 5.42 on paper; heading light text 5.76 |
| Feature indices | 3.34 | 6.32 normal, 5.20 active |
| Valuation small text | 3.58 | 5.22 |
| Hero metadata/credits | Image-dependent | 13.34 on a known burgundy surface |
| Sold-out size text | 2.91 | Darkened to the measured body-metadata tone; final scans pass |

Manual review also found enlarged white hero text over light photograph regions. The caption now
uses a known dark backing without changing its box geometry. Its frame grows with enlarged content
instead of clipping it; long headings, collection rows and purchase titles can reflow.

At the narrowest dossier sizes, image hit areas overlapped. The image retains decorative markers at
unchanged authored coordinates; all four large labelled feature buttons retain the actions. Tests
exercise every feature by keyboard for every study and viewport. Keyboard focus owns the explanation
even when scrolling places another label under the mouse; deliberate pointer input restores pointer
ownership. Connectors and canonical annotation data remain unchanged.

The final accessibility subset contains nineteen project executions and fifty-five axe state scans:
five studies at five widths, plus open Inspire/bag/context dialogs and expanded explanations/notes/
trend boards. All scans report zero automatically detectable violations with WCAG A/AA tags through
2.2; no contrast rule or target was excluded. Additional checks cover keyboard focus, Escape/backdrop,
reduced motion, 44 px drawer controls, touch-boundary containment and doubled text at 320/390 px.
Text enlargement doubles computed text sizes; it is not a browser-zoom or screen-reader session.

The final independent review checked the exact tag set: `wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22a` and `wcag22aa`. After adding the missing later A tags, the dedicated
accessibility rerun again passed all nineteen executions and fifty-five scans with zero violations.

Some image-backed contrast checks remain incomplete in axe and are retained in the scan attachments.
Visual checks and known text backings supplement the scans; no complete WCAG conformance claim is made.

Separately reviewed the actual supplied local photos in dossier, journal and PDP views at 1440,
390 and 320 px: twenty loaded images in each visited edit, no broken images, page/HTTP failures,
application fetch/POST or document overflow. Screenshots stay outside Git. Gallery verification is
image retention; the fixtures provide one authored gallery image, not fabricated multi-angle views.

## P16 — final executed gates

| Check | Final result |
| --- | --- |
| Clean installation | `npm ci` passed after regenerating inconsistent optional lock entries |
| Application/browser TypeScript | Both passed |
| Node tests | 35 passed, 0 failed, 0 skipped |
| Complete development browser matrix | 74 passed, 0 failed/skipped/flaky, no runner errors |
| Production preview | 3 passed; preview-only Chromium project on its own server |
| Accessibility subset | 19 executions / 55 state scans; zero reported violations |
| Build | Vite production build passed; 59 modules; JS 387.35 kB / 115.34 kB gzip |
| Data preservation | Deep comparison passed: five studies, eighteen offers, forty-four references and their source/commerce content unchanged |
| Runtime dependencies | React, React DOM and router versions unchanged; test tooling is development-only |
| Production dependency audit | Zero reported vulnerabilities with `npm audit --omit=dev` |
| Production exclusion | No harness file or `__firstSightTestHost`/controlled-host code in built assets |
| Git hygiene | Diff check passed; supplied photos/reports remain ignored and untracked by Git; no staging/commit/push |

Project distribution: Chromium desktop 29, Chromium 1024/768/320 four each, Chromium 390 nine,
Firefox desktop/390 six each, WebKit desktop/390 six each. These are project executions of twenty-nine
authored browser scenarios, not seventy-four unique scenarios. Three additional production executions
cover all five edits, both Inspire entries/PDP retention and explicit local upload/cancellation.

The final gate caught two tooling issues before handoff: npm's optional dependency graph was not
clean-installable, and `defineConfig(shared, overrides)` concatenated the preview servers/projects.
Regenerating optional lock entries repaired `npm ci`; a single spread config now isolates preview.
The preview checks were rerun against the current production build and passed.

## Reports and review

Run `npm run test:browser:all` for the complete matrix, `npm run test:browser:a11y` for the accessibility
subset, and build before `npm run test:browser:preview`. The default HTML report is
`playwright-report/index.html`; preview writes its report under `playwright-report/preview/` so it does
not overwrite the development report. Reports, traces and screenshots are generated and ignored.

This workspace's final JSON/log evidence is under `/tmp/loomstory-first-sight-qa/p13-p16/`:
`final-browser.json`, `final-accessibility.json`, `final-node-tests.log`, `preview.json`, `contrast-before.json`, corrected ratio/
caption measurements, `preservation.json` and `local-media-visual.json`. Those files are disposable;
the commands and measured results here are the durable record. Supplied-photo screenshots are not
embedded in the repository.

P13–P16 are complete. The A–G assessment and review-only commit message are linked from the plan.
P17 staging, committing, pushing and merging remain subject to the user's explicit authorisation.

## Known limitations

- Actual Safari, physical-device touch and a named screen-reader session have not been verified.
- Existing Vite 8.0.13 reports one aggregated high-severity audit entry involving development-server
  dependencies. Test dependencies add no reported advisory. A separate Vite update is recommended;
  no forced or unrelated framework upgrade is included in this slice.
- Authentication, live recognition/content, real inventory and checkout remain outside the prototype.


## Superseding P17 delivery note — 5 November 2026

After the review recorded above, the user explicitly authorised the P17 commit and push. The
reviewed P13–P16 implementation was committed as `d32ef3c3f700f936b409c06a5dfa7cde4f6b9252`
and pushed to `origin/new-analysis`. No merge to `new-home-page` or `main` was performed.
The pending-approval wording above describes the earlier checkpoint; its recorded test counts
remain historical evidence. The approved [P18 Discover renewal](plans/discover-p18-plan.md) now begins from that
delivered commit and remains uncommitted. See the [P18 verification record](discover-verification.md) for new
results; historical P16 passes do not verify the changed P18 source.
