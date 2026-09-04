"use client"

import { useEffect, useRef } from "react"
import {
  LANDING_SNAP_HOLD_MS,
  LANDING_SNAP_MS,
  landingSnapEaseInOutCubic,
} from "@/lib/landingSnapMotion"

/**
 * Hold, then advance `step` pixels with the same ease-in-out snap as the
 * use-case carousel. `wrap` is the loop length (duplicate-set width/height).
 */
export function useLandingSnapLoop({
  enabled,
  getStepPx,
  getWrapPx,
  apply,
  holdMs = LANDING_SNAP_HOLD_MS,
  snapMs = LANDING_SNAP_MS,
  startDelayMs = 0,
}: {
  enabled: boolean
  getStepPx: () => number
  getWrapPx: () => number
  apply: (offsetPx: number, snapProgress?: number) => void
  holdMs?: number
  snapMs?: number
  /** Extra delay before the first snap, so sibling strips don't fire together. */
  startDelayMs?: number
}) {
  const offsetRef = useRef(0)
  const getStepRef = useRef(getStepPx)
  const getWrapRef = useRef(getWrapPx)
  const applyRef = useRef(apply)
  const holdMsRef = useRef(holdMs)
  const snapMsRef = useRef(snapMs)

  useEffect(() => {
    getStepRef.current = getStepPx
    getWrapRef.current = getWrapPx
    applyRef.current = apply
    holdMsRef.current = holdMs
    snapMsRef.current = snapMs
  }, [apply, getStepPx, getWrapPx, holdMs, snapMs])

  useEffect(() => {
    if (!enabled) {
      offsetRef.current = 0
      applyRef.current(0)
      return
    }

    let timeoutId = 0
    let rafId = 0

    const arm = (delay: number) => {
      timeoutId = window.setTimeout(snap, delay)
    }

    const snap = () => {
      const step = getStepRef.current()
      const wrap = getWrapRef.current()
      if (step < 1) {
        arm(Math.max(holdMsRef.current, 50))
        return
      }
      const start = offsetRef.current
      const target = start + step
      const t0 = performance.now()
      const duration = snapMsRef.current

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration)
        let next = start + (target - start) * landingSnapEaseInOutCubic(t)
        if (t >= 1) {
          next = target
          if (wrap >= 2) {
            while (next >= wrap) next -= wrap
          }
          offsetRef.current = next
          applyRef.current(next, 0)
          arm(holdMsRef.current)
          return
        }
        offsetRef.current = next
        applyRef.current(next, t)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    arm(holdMs + startDelayMs)
    return () => {
      window.clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
    }
  }, [enabled, holdMs, startDelayMs])
}
