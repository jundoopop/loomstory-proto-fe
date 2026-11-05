/** Discovery boundary: page/components depend on this contract rather than a data provider. */
import type { DiscoveryResult, PhotoInput } from '../types';

/** Implement this port with a server-backed adapter when live services are added.
 * The gateway orchestrates recognition, commerce and context resolution behind this boundary.
 * The UI never calls an AI provider, catalogue endpoint or storage client directly.
 * Aborting must prevent an older photograph from replacing a newer result, including while
 * its content provider is still resolving references. Provider failure rejects the analysis.
 */
export interface FirstSightGateway {
  /** Return complete selectable studies with their dossier, shopping edit and context; honour cancellation. */
  discover(photo: PhotoInput, signal: AbortSignal): Promise<DiscoveryResult>;
}
