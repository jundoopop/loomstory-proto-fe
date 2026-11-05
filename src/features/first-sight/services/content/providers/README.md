# Future context-content adapters

This directory records the connection points for future providers. Only the local
`prototypeContextContentProvider` is implemented. No API account, credential, SDK,
embed script or external request is needed for the current demonstration.

## Current boundary and ownership

`ContextContentProvider.getReferences({ itemId, referenceIds }, signal)` resolves
the study's requested IDs into a fresh, ordered `OutfitLook[]`. The gateway owns
the scan delay and complete study assembly. The provider owns lookup, attribution
and its own underlying work; it does not modify dossiers or commerce membership.

- Resolve every requested ID in order. An empty request returns an empty array.
- Reject missing or repeated requested IDs; never silently omit a reference.
- Keep record IDs stable. Preserve source URL/label, credit, licence/link, natural
  image dimensions, description and the authored `relationship`.
- Treat resolved records as immutable. The current provider shares records while
  returning a fresh result array, and the gateway copies its presentation arrays.
- Honour the supplied `AbortSignal`, including an already-cancelled request.
  Normalise cancellation to `AbortError` and remove listeners on every outcome.
- The gateway stops waiting promptly on cancellation and consumes late failures.
  It cannot stop a provider's work unless that provider honours its signal.

An adapter failure currently rejects the entire analysis; FirstSight shows its
existing error/retry state. There is no silent partial-success policy. Before a
live connection, agree whether unavailable context should preserve recognition
and how the UI should label incomplete results, then introduce a typed result.

## Provider-specific connection points

| Candidate | Adapter responsibilities before connection |
| --- | --- |
| Instagram | Resolve approved post references through the supported official integration; preserve author/permalink metadata; define an accessible unavailable/deleted-post state |
| YouTube | Resolve approved video references and titles; preserve channel/permalink metadata; use a dedicated official player renderer with a poster and explicit user activation |
| Wikimedia Commons | Normalise file metadata, original dimensions, attribution and licence links; preserve the source file page alongside the selected image rendition |
| Licensed curator content | Resolve stable internal reference IDs and asset renditions; carry the recorded attribution and permission metadata rather than deriving permission from a local file path |

These are architectural placeholders, not assertions about current API pricing,
account eligibility or service rules. Recheck official documentation when a live
integration is explicitly requested. Do not place service secrets in Vite/client
environment variables: credentials and privileged requests belong on a server.

## Validation, performance and failures

Validate untrusted responses at the adapter boundary before mapping them to the
typed UI contract: required fields, stable IDs, allowed relationships, safe source
URLs and positive image dimensions. TypeScript alone does not validate network
data. Do not convert a provider's popularity or similarity score into a stronger
design-identity claim.

Define request timeouts, retry limits and rate-limit behaviour for the selected
service. Cache normalised references by provider and stable ID with an explicit
expiry/invalidation policy; cancellation of one caller must not corrupt another
caller's cached result. Forward the signal to fetch/client work, release event
listeners and cancel retries when the caller aborts. Do not add speculative caches
or retry infrastructure to the current fixture provider.

## Future image/embed rendering

The present `OutfitLook` contract describes images. Add an explicit image/embed
discriminated union together with its actual renderer when embeds are connected.
Use provider-specific URL validation and rendering components; never pass arbitrary
embed HTML into existing cards. Preserve aspect ratios, accessible titles, source
links, loading/error states and keyboard interaction. Keep page state and commerce
rules independent of which renderer presents a reference.

`relationship` currently belongs to a reference record. If the same photograph has
different relationships to multiple studies, move it to the study/reference
association at that integration boundary. `same-design` means a manually
established design-family connection, not the same physical object or edition.
