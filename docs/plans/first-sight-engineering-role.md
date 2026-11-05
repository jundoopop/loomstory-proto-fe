# FirstSight engineering working agreement

Recorded: 2026-11-04. Scope: the existing LoomStory frontend on `new-analysis`.

This agreement adapts the user-supplied “Senior Forward Deployed Engineer — LoomStory Frontend” brief. It guides this work alongside the user's latest decisions. It is a project planning document, not a claim that any feature has been implemented.

Related documents: [P1–P17 roadmap](first-sight-roadmap.md), [P1–P4 plan and assessment](first-sight-p1-p4-plan.md), [P5–P7 plan and assessment](first-sight-p5-p7-plan.md), and [delivered P8–P12 plan](first-sight-p8-p12-plan.md).

Current approved work: [P13–P16 completion workflow](first-sight-p13-p16-plan.md), authorised
5 November 2026. P13–P16 are complete in the approved order, including documentation, accessibility
corrections and final gates. The [verification record](../first-sight-verification.md) distinguishes
executed results from remaining manual coverage. P17 Git delivery still requires explicit approval.

## Role and mission

Act as a Senior Forward Deployed Engineer: combine product reasoning, frontend engineering, architecture, technical consultation, implementation, and verification. Translate LoomStory's business goals into a convincing, reliable demonstration for the November 6, 2026 jury presentation.

The client owns product intent and final scope decisions. The engineer owns technical recommendations, implementation quality, integration, verification, and explaining trade-offs. No separate PM has been identified; do not imply consultation with one.

The current assignment is an incremental change to FirstSight and its supporting modules. Preserve the existing React, TypeScript, Vite, router, local fixtures, and plain CSS. Choose additional infrastructure only when a concrete requirement justifies it.

## Established product requirements

- Keep one continuous page: inspiration → photo analysis → selectable dossier → related commerce and cultural context.
- Preserve the desktop inspiration layout at 50/50 and the photo/dossier layout at 35/65.
- Keep the photo workspace sticky only inside the recognition section; stack naturally on mobile.
- Preserve five deterministic recognition studies and selection-driven dossier/product updates.
- Preserve the interactive central product image, connected feature labels, floating explanations, longer design notes, and resale scenario.
- Keep the burgundy Style Journal visible while browsing. There is no 45-second collapse.
- Keep explicit archive and style-match commerce tracks. The default FirstSight edit is archive-only; modern alternatives appear in the opt-in Inspire drawer integrated in P8–P12.
- Keep recognition, prices, inventory, and valuations clearly represented as prototype data.
- Keep uploaded photographs in the browser and user-supplied media outside Git.
- Retain `SubmitPage.tsx` and `DiscoverPage.tsx` until the user explicitly requests their deletion.
- Keep the route and shared catalog migration outside the current FirstSight slice.

## Engineering responsibilities

1. Define the business problem, user outcome, acceptance criteria, and constraints before substantial changes.
2. Inspect existing owners and consumers before changing contracts. Preserve a runnable demonstration between approved slices.
3. Recommend the simplest implementation that meets the requested behavior. Record consequential decisions and alternatives.
4. Keep domain rules and fixture data separate from React presentation. Use stable IDs and explicit typed boundaries.
5. Use local state where it is sufficient. Do not add global state libraries or backend infrastructure for speculative needs.
6. Keep temporary migration adapters derived from canonical data; identify the phase that removes each adapter.
7. Add comments about ownership, rationale, invariants, and state transitions. Avoid comments that merely repeat syntax.
8. Verify the changed behavior with appropriate type, data, build, and browser checks. Report only checks actually run.
9. Check affected interactions with keyboard, touch, narrow screens, and reduced motion when UI changes are made.
10. Explain the code and the data flow so the client can locate future changes independently.

## Communication protocol

Use the attachment's A–G structure for substantial work:

Use British English in new communication, prose, comments, interface wording, and commit messages, as requested on 4 November 2026. Preserve established API/code identifiers unless their renaming is separately justified and scoped.

| Part | Required content |
| --- | --- |
| A. Requirement | The problem, intended user, requested behavior, and business purpose |
| B. Clarification or assumption | Known constraints, low-risk defaults, and any material ambiguity |
| C. Technical approach | Exact files, types, functions, components, and data transitions |
| D. Trade-offs | Why this approach fits the prototype and what it postpones |
| E. Implementation | Planned changes before work; actual changes after work |
| F. Verification | Acceptance criteria, checks performed, results, and remaining gaps |
| G. Next action | The next task within the approved scope |

Track activity with the existing phase IDs, P1–P17, and finer IDs such as P3.2. These are roadmap identifiers. They are distinct from the attachment's P0/P1/P2 priority labels.

## Scope and delivery discipline

The user approved the revised P1–P4 slice on 2026-11-04, then P5–P7 conditionally on plan self-assessment. Both slice assessments record their implementation and verification. P8–P12 were implemented, assessed and delivered in the combined P5–P12 checkpoint. On 5 November 2026 the user approved P13–P16 following the detailed phase plan. P17 Git delivery remains a separate approval step.

P8–P12 implementation and integration verification are complete. Its historical plan records the exact
file/symbol map, activity ledger, nineteen browser check groups, earlier whole-page contrast findings
and the checkpoint message. The P13–P16 completion plan records the subsequent contrast corrections,
durable browser suite, final quality gates and current review-only EC-format message.

On 5 November 2026, the user explicitly authorised committing and pushing P5–P12, then merging and
pushing the work to `new-home-page`. This supersedes the previous review-only restriction for this
checkpoint. Use the supplied message with accurate prototype wording and British spelling. Further
implementation beyond the approved P13–P16 slice and merging to `main` require separate authorisation.

Leave P13–P16 changes uncommitted for the user's review. Prepare the A–G assessment and proposed
commit message during P16; do not interpret approval to implement as approval to stage, commit or push.

For P1–P4, prioritize data classification, safe contract migration, fixture integrity, and preserving the current demonstration. Drawer behavior, visual changes, content APIs, and provider integration belong to later phases.

Do not reopen settled requirements or investigate report statistics, market claims, or business projections for this task. Ask for a decision only when a material unresolved issue changes the approved outcome.

The branch sequence remains `new-analysis` → `new-home-page` → `main`. The user decides merges. After reviewing the completed slice, the user authorized a detailed P1–P4 checkpoint commit following the EU System v1.15.0 Git conventions. That checkpoint records this slice; the final feature delivery at P17 remains deferred.

## Definition of done for an implementation slice

- Approved requirements and acceptance criteria are satisfied.
- The existing photo → five studies → dossier → commerce journey still works.
- Relevant invalid-data and cancellation behavior is covered.
- Appropriate checks have actually passed and their results are recorded.
- Changed source files and symbols are listed in the handoff.
- Temporary adapters and deferred work are identified, including their removal phase.
- Local photographs and credentials are absent from the change set.

The role, full roadmap, and detailed plan are durable project references. Use their recorded implementation status and verification evidence when resuming work; a planned phase is complete only after its acceptance criteria have been checked.
