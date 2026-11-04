/** Discovery boundary: page/components depend on this contract rather than a data provider. */
import type { DiscoveryResult, PhotoInput } from '../types';

/** Implement this port with a server-backed adapter when live services are added.
 * The UI never calls an AI provider, catalog endpoint, or storage client directly.
 * Aborting must prevent an older photograph from replacing a newer result.
 */
export interface FirstSightGateway {
  /** Return selectable studies with their own dossier, shopping edit, and context; honor cancellation. */
  discover(photo: PhotoInput, signal: AbortSignal): Promise<DiscoveryResult>;
}
