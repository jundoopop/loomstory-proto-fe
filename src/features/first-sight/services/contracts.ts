/** Discovery boundary: page/components depend on this contract rather than a data provider. */
import type { DiscoveryResult, PhotoInput } from '../types';

/** Implement this port with a server-backed adapter when live services are added.
 * The UI never calls an AI provider, catalog endpoint, or storage client directly.
 * Aborting must prevent an older photograph from replacing a newer result.
 */
export interface FirstSightGateway {
  /** Resolve identity, purchase options, and styling context; honor cancellation by the page. */
  discover(photo: PhotoInput, signal: AbortSignal): Promise<DiscoveryResult>;
}
