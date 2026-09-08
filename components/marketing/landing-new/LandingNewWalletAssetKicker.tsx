"use client"

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import {
  LandingNewWalletAssetMark,
  type WalletAssetName,
} from "@/components/marketing/landing-new/LandingNewWalletAssetMark"
import { LANDING_FEATURE_INTERVAL_MS } from "@/lib/landingSnapMotion"
import { useLandingSnapLoop } from "@/lib/useLandingSnapLoop"

/** Assets a branded wallet holds, shown one at a time after the kicker. */
const ASSET_NAMES: readonly WalletAssetName[] = [
  "USD",
  "Bitcoin",
  "Ether",
  "USDC",
  "Euros",
  "EURC",
  "Your own Real World Asset",
  "Your token",
]

const ASSET_COUNT = ASSET_NAMES.length
const LAST_ASSET = ASSET_NAMES[ASSET_COUNT - 1]
/** Leading clone so the first current item has a neighbor above. */
const TRACK_ASSETS: readonly WalletAssetName[] = [
  LAST_ASSET,
  ...ASSET_NAMES,
  ...ASSET_NAMES,
]

const ROW_PX = 24
const VIEWPORT_PX = ROW_PX * 3
const NEIGHBOR_OPACITY = 0.5
const NEIGHBOR_SCALE = 0.82
/** Soft rim fade only — no surface overlays, so the grid stays visible. */
const VIEWPORT_MASK =
  "linear-gradient(to bottom, transparent 0%, rgb(0 0 0 / 0.2) 10%, black 26%, black 74%, rgb(0 0 0 / 0.2) 90%, transparent 100%)"

const assetRowClassName =
  "inline-flex h-6 shrink-0 origin-left items-center gap-1.5 whitespace-nowrap"

type LandingNewWalletAssetKickerProps = {
  className?: string
}

/**
 * Wallet section asset picker — previous and next sit above and below,
 * faded, with a soft mask dissolve at each edge. Snaps on the same cadence
 * as the feature-card strips.
 */
export function LandingNewWalletAssetKicker({
  className = "",
}: LandingNewWalletAssetKickerProps) {
  const reduceMotion = useReducedMotion() ?? false
  const [index, setIndex] = useState(0)
  const name = ASSET_NAMES[index]
  const trackRef = useRef<HTMLSpanElement>(null)

  const apply = useCallback((offsetPx: number) => {
    const track = trackRef.current
    if (!track) return
    track.style.transform = `translate3d(0, ${-offsetPx}px, 0)`
    const viewportCenter = offsetPx + VIEWPORT_PX / 2
    for (let i = 0; i < track.children.length; i++) {
      const row = track.children[i] as HTMLElement
      const rowCenter = i * ROW_PX + ROW_PX / 2
      const dist = Math.min(1, Math.abs(rowCenter - viewportCenter) / ROW_PX)
      row.style.opacity = String(1 - (1 - NEIGHBOR_OPACITY) * dist)
      row.style.transform = `scale(${1 - (1 - NEIGHBOR_SCALE) * dist})`
    }
  }, [])

  useLayoutEffect(() => {
    apply(0)
  }, [apply])

  const getStepPx = useCallback(() => ROW_PX, [])
  const getWrapPx = useCallback(() => ROW_PX * ASSET_COUNT, [])

  useLandingSnapLoop({
    enabled: !reduceMotion,
    getStepPx,
    getWrapPx,
    apply,
    holdMs: 0,
    snapMs: LANDING_FEATURE_INTERVAL_MS,
    startDelayMs: LANDING_FEATURE_INTERVAL_MS,
    onIndexChange: setIndex,
  })

  if (reduceMotion) {
    return (
      <p className={className} aria-live="polite">
        <span className={assetRowClassName}>
          <LandingNewWalletAssetMark name={name} />
          <span>{name}</span>
        </span>
      </p>
    )
  }

  return (
    <p className={className}>
      <span className="sr-only">{name}</span>
      <span aria-hidden>
        <span
          className="block w-max overflow-hidden"
          style={{
            height: VIEWPORT_PX,
            WebkitMaskImage: VIEWPORT_MASK,
            maskImage: VIEWPORT_MASK,
          }}
        >
          <span
            ref={trackRef}
            className="flex w-max flex-col will-change-transform"
          >
            {TRACK_ASSETS.map((assetName, i) => (
              <span key={`${assetName}-${i}`} className={assetRowClassName}>
                <LandingNewWalletAssetMark name={assetName} />
                {assetName}
              </span>
            ))}
          </span>
        </span>
      </span>
    </p>
  )
}
