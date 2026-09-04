/** Hold before a programmatic snap — use-case carousel. */
export const LANDING_SNAP_HOLD_MS = 5000

/** Console product strip: hold between card snaps. */
export const LANDING_CONSOLE_HOLD_MS = 3500

/** Duration of the ease-in-out snap itself. */
export const LANDING_SNAP_MS = 420

/**
 * Feature-card strips: one ease-in-out step every this many ms
 * (logos and console rows). The next snap starts when this ends.
 */
export const LANDING_FEATURE_INTERVAL_MS = 1000

/** Monitoring card starts this many ms after the EVM chain strip. */
export const LANDING_FEATURE_SNAP_STAGGER_MS = 400

export function landingSnapEaseInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Motion/react cubic-bezier that matches {@link landingSnapEaseInOutCubic}. */
export const LANDING_SNAP_EASE_BEZIER = [0.65, 0, 0.35, 1] as const
