"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import {
  LANDING_SNAP_HOLD_MS,
  LANDING_SNAP_MS,
  landingSnapEaseInOutCubic,
} from "@/lib/landingSnapMotion"

export type LandingSnapLoopControl = {
  /** Animate to a 0-based item. Restarts the hold / snap cycle. */
  seekToIndex: (index: number) => void
}

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
  onIndexChange,
  controlRef,
}: {
  enabled: boolean
  getStepPx: () => number
  getWrapPx: () => number
  apply: (offsetPx: number, snapProgress?: number) => void
  holdMs?: number
  snapMs?: number
  /** Extra delay before the first snap, so sibling strips don't fire together. */
  startDelayMs?: number
  onIndexChange?: (index: number) => void
  controlRef?: MutableRefObject<LandingSnapLoopControl | null>
}) {
  const offsetRef = useRef(0)
  const getStepRef = useRef(getStepPx)
  const getWrapRef = useRef(getWrapPx)
  const applyRef = useRef(apply)
  const holdMsRef = useRef(holdMs)
  const snapMsRef = useRef(snapMs)
  const onIndexChangeRef = useRef(onIndexChange)

  useEffect(() => {
    getStepRef.current = getStepPx
    getWrapRef.current = getWrapPx
    applyRef.current = apply
    holdMsRef.current = holdMs
    snapMsRef.current = snapMs
    onIndexChangeRef.current = onIndexChange
  }, [apply, getStepPx, getWrapPx, holdMs, onIndexChange, snapMs])

  useEffect(() => {
    if (!enabled) {
      offsetRef.current = 0
      applyRef.current(0)
      if (controlRef) controlRef.current = null
      return
    }

    let timeoutId = 0
    let rafId = 0

    const itemCount = () => {
      const step = getStepRef.current()
      const wrap = getWrapRef.current()
      if (step < 1 || wrap < 2) return 0
      return Math.round(wrap / step)
    }

    const indexFromOffset = (offset: number) => {
      const step = getStepRef.current()
      const count = itemCount()
      if (step < 1 || count < 1) return 0
      const raw = Math.round(offset / step)
      return ((raw % count) + count) % count
    }

    const reportIndex = (offset: number) => {
      onIndexChangeRef.current?.(indexFromOffset(offset))
    }

    const animateFromTo = (start: number, target: number, onDone: () => void) => {
      const t0 = performance.now()
      const duration = snapMsRef.current
      const wrap = getWrapRef.current()

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration)
        let next = start + (target - start) * landingSnapEaseInOutCubic(t)
        if (t >= 1) {
          next = target
          if (wrap >= 2) {
            while (next >= wrap) next -= wrap
            while (next < 0) next += wrap
          }
          offsetRef.current = next
          applyRef.current(next, 0)
          reportIndex(next)
          onDone()
          return
        }
        offsetRef.current = next
        applyRef.current(next, t)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    const snap = () => {
      const step = getStepRef.current()
      if (step < 1) {
        arm(Math.max(holdMsRef.current, 50))
        return
      }
      const start = offsetRef.current
      const target = start + step
      reportIndex(target)
      animateFromTo(start, target, () => arm(holdMsRef.current))
    }

    const arm = (delay: number) => {
      timeoutId = window.setTimeout(snap, delay)
    }

    const seekToIndex = (index: number) => {
      window.clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)

      const step = getStepRef.current()
      const wrap = getWrapRef.current()
      const count = itemCount()
      if (step < 1 || count < 1) return

      const targetIndex = ((index % count) + count) % count
      const current = offsetRef.current
      const currentNorm = indexFromOffset(current)
      let delta = targetIndex - currentNorm
      if (delta > count / 2) delta -= count
      else if (delta < -count / 2) delta += count

      if (delta === 0) {
        reportIndex(current)
        arm(holdMsRef.current)
        return
      }

      let start = current
      let dest = current + delta * step
      if (dest < 0 && wrap >= 2) {
        start += wrap
        dest += wrap
        offsetRef.current = start
        applyRef.current(start, 0)
      }

      reportIndex(dest)
      animateFromTo(start, dest, () => arm(holdMsRef.current))
    }

    if (controlRef) controlRef.current = { seekToIndex }
    reportIndex(offsetRef.current)
    arm(holdMs + startDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
      if (controlRef) controlRef.current = null
    }
  }, [controlRef, enabled, holdMs, startDelayMs])
}
