/** Browser lifecycle adapter for the pure engagement rules in engagement.ts. */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { advanceEngagement, createEngagementState, recordEngagement } from './engagement';

/** Page-supplied controls; only sessionKey resets an existing photograph's opportunity. */
interface DiscoveryTimerOptions {
  // False during other phases, focused-catalog mode, or a blocking bag preview.
  enabled: boolean;
  sessionKey: number;
  feedRef: RefObject<HTMLElement | null>;
  onExpire: () => void;
}

/** Initial visibility check, also used when IntersectionObserver is unavailable. */
function isInViewport(element: HTMLElement | null) {
  if (!element) return false;
  const bounds = element.getBoundingClientRect();
  return bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0
    && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
}

/** One 45-second engagement opportunity per uploaded photograph.
 * Disabled phases, hidden tabs, inactive windows, offscreen feeds, and keyboard
 * focus within the feed pause the clock. Only explicit engage() stops it for good.
 */
export function useDiscoveryTimer({ enabled, sessionKey, feedRef, onExpire }: DiscoveryTimerOptions) {
  // Refs preserve exact elapsed time between renders; view is the coarser UI snapshot.
  const clock = useRef(createEngagementState());
  const currentSession = useRef(sessionKey);
  const didNotify = useRef(false);
  const onExpireRef = useRef(onExpire);
  const [view, setView] = useState(clock.current);

  // Refresh the callback without tearing down listeners or resetting the current clock.
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  /** Explicit feed activation, including restoration, keeps the feed open for this photo. */
  const engage = useCallback(() => {
    clock.current = recordEngagement(clock.current, performance.now());
    setView(clock.current);
  }, []);

  useEffect(() => {
    // Layout changes pause/resume the same clock; a new photo alone creates a new one.
    if (currentSession.current !== sessionKey) {
      currentSession.current = sessionKey;
      clock.current = createEngagementState();
      didNotify.current = false;
    }

    const element = feedRef.current;
    let inViewport = isInViewport(element);
    let windowFocused = document.hasFocus();

    /** Reconcile all browsing conditions, update the clock, and notify expiry only once. */
    const synchronize = () => {
      // Never remove the DOM subtree containing a keyboard user's current focus.
      const hasFeedFocus = !!element?.contains(document.activeElement);
      const active = enabled && inViewport && document.visibilityState === 'visible'
        && windowFocused && !hasFeedFocus;
      clock.current = advanceEngagement(clock.current, performance.now(), active);
      // Keep millisecond precision in the ref without rendering React four times per second.
      setView(previous => previous.engaged === clock.current.engaged
        && previous.expired === clock.current.expired
        && Math.ceil(previous.remainingMs / 1000) === Math.ceil(clock.current.remainingMs / 1000)
        ? previous : clock.current);

      if (active && clock.current.expired && !clock.current.engaged && !didNotify.current) {
        didNotify.current = true;
        onExpireRef.current();
      }
    };

    /** Resume eligibility when the browser window regains focus. */
    const focusWindow = () => { windowFocused = true; synchronize(); };
    /** Account for the last focused interval before pausing the clock. */
    const blurWindow = () => { windowFocused = false; synchronize(); };
    /** Remeasure visibility on resize or the fallback scroll-listener path. */
    const checkViewport = () => { inViewport = isInViewport(element); synchronize(); };
    // Observe the entire contextual feed; the scroll listener below is a compatibility fallback.
    const observer = typeof IntersectionObserver !== 'undefined' && element
      ? new IntersectionObserver(entries => {
        const entry = entries.find(candidate => candidate.target === element);
        if (entry) {
          inViewport = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
          synchronize();
        }
      }, { threshold: 0 }) : null;

    if (element) observer?.observe(element);
    window.addEventListener('focus', focusWindow);
    window.addEventListener('blur', blurWindow);
    window.addEventListener('resize', checkViewport);
    if (!observer) window.addEventListener('scroll', checkViewport, { passive: true });
    document.addEventListener('visibilitychange', synchronize);
    document.addEventListener('focusin', synchronize);
    document.addEventListener('focusout', synchronize);
    // Poll only in the discovery phase; event boundaries account for pauses immediately.
    const interval = enabled ? window.setInterval(synchronize, 250) : null;
    synchronize();

    return () => {
      observer?.disconnect();
      if (interval !== null) window.clearInterval(interval);
      window.removeEventListener('focus', focusWindow);
      window.removeEventListener('blur', blurWindow);
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('scroll', checkViewport);
      document.removeEventListener('visibilitychange', synchronize);
      document.removeEventListener('focusin', synchronize);
      document.removeEventListener('focusout', synchronize);
      // Preserve the last active fraction when moving to PDP or changing phase.
      clock.current = advanceEngagement(clock.current, performance.now(), false);
    };
  }, [enabled, sessionKey, feedRef]);

  return { engage, engaged: view.engaged, remainingMs: view.remainingMs };
}
