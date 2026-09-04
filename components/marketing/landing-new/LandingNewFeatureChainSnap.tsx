"use client"

import Image from "next/image"
import { useCallback, useLayoutEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import {
  HERO_CHAIN_LOGO_COUNT,
  HERO_CHAIN_LOGOS,
} from "@/lib/heroChainLogos"
import { LANDING_FEATURE_INTERVAL_MS } from "@/lib/landingSnapMotion"
import { useLandingSnapLoop } from "@/lib/useLandingSnapLoop"

type LandingNewFeatureChainSnapProps = {
  maskClassName: string
}

const LOGOS = [...HERO_CHAIN_LOGOS, ...HERO_CHAIN_LOGOS]

/**
 * One-row chain strip: ease-in-out snap, one logo every
 * {@link LANDING_FEATURE_INTERVAL_MS}.
 */
export function LandingNewFeatureChainSnap({
  maskClassName,
}: LandingNewFeatureChainSnapProps) {
  const reduceMotion = useReducedMotion() ?? false
  const trackRef = useRef<HTMLSpanElement>(null)
  const slotPxRef = useRef(0)

  const measure = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return
    const styles = getComputedStyle(track)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    slotPxRef.current = first.getBoundingClientRect().width + gap
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    if (track.firstElementChild) observer.observe(track.firstElementChild)
    return () => observer.disconnect()
  }, [measure])

  const apply = useCallback((offsetPx: number) => {
    const track = trackRef.current
    if (track) track.style.transform = `translate3d(${-offsetPx}px, 0, 0)`
  }, [])

  const getStepPx = useCallback(() => slotPxRef.current, [])
  const getWrapPx = useCallback(
    () => slotPxRef.current * HERO_CHAIN_LOGO_COUNT,
    [],
  )

  useLandingSnapLoop({
    enabled: !reduceMotion,
    getStepPx,
    getWrapPx,
    apply,
    holdMs: 0,
    snapMs: LANDING_FEATURE_INTERVAL_MS,
  })

  return (
    <span
      role="img"
      aria-label="Supported blockchain networks"
      className="relative block h-12 w-full min-w-0 overflow-hidden sm:h-14"
    >
      <span
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-16 ${maskClassName} transition-colors duration-500 ease-out`}
        style={{
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          maskImage: "linear-gradient(to left, black, transparent)",
        }}
      />
      <span
        ref={trackRef}
        className="flex h-full w-max items-center gap-5 will-change-transform sm:gap-6"
      >
        {LOGOS.map((logo, index) => (
          <span
            key={`${logo.label}-${index}`}
            aria-hidden
            className="relative size-9 shrink-0 sm:size-10"
            style={{ opacity: 0.55 }}
          >
            <Image
              src={logo.src}
              alt=""
              fill
              sizes="(max-width: 640px) 40px, 48px"
              className="object-contain"
            />
          </span>
        ))}
      </span>
    </span>
  )
}
