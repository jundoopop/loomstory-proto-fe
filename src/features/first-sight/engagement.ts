/** Pure engagement rules, separate from React and browser events so timing stays testable. */

/** Product setting: time before unengaged discovery gives the catalog full width. */
export const DISCOVERY_ENGAGEMENT_MS = 45_000;

/** Immutable clock snapshot for one photograph's engagement opportunity. */
export interface EngagementState {
  remainingMs: number;
  // Null means paused. Otherwise this marks the beginning of the next chargeable interval.
  activeSince: number | null;
  // Guards against delayed/out-of-order events moving the clock backward.
  lastTimestamp: number | null;
  engaged: boolean;
  expired: boolean;
}

/** Start a fresh opportunity; waiting before the feed is visible consumes no time. */
export function createEngagementState(): EngagementState {
  return {
    remainingMs: DISCOVERY_ENGAGEMENT_MS,
    activeSince: null,
    lastTimestamp: null,
    engaged: false,
    expired: false,
  };
}

/** Accumulate only intervals that began while the contextual feed was active.
 * Call with active=false at visibility/focus/viewport boundaries to pause.
 * Timestamps are monotonic milliseconds (performance.now in the browser).
 */
export function advanceEngagement(state: EngagementState, now: number, active: boolean): EngagementState {
  const timestamp = Math.max(now, state.lastTimestamp ?? now);
  // Terminal snapshots keep their remaining time until a new photograph resets the state.
  if (state.engaged || state.expired) {
    return { ...state, activeSince: null, lastTimestamp: timestamp };
  }
  // Charge the interval that just ended using its previous active/paused state.
  const elapsed = state.activeSince === null ? 0 : timestamp - state.activeSince;
  const remainingMs = Math.max(0, state.remainingMs - elapsed);
  const expired = remainingMs === 0;
  return {
    ...state,
    remainingMs,
    expired,
    activeSince: active && !expired ? timestamp : null,
    lastTimestamp: timestamp,
  };
}

/** Engagement is permanent for this photograph, including after restoring a feed. */
export function recordEngagement(state: EngagementState, now: number): EngagementState {
  return { ...advanceEngagement(state, now, false), engaged: true, activeSince: null };
}
