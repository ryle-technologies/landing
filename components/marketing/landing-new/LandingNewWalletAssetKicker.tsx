"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import {
  LANDING_FEATURE_INTERVAL_MS,
  LANDING_SNAP_EASE_BEZIER,
} from "@/lib/landingSnapMotion"

/** Assets a branded wallet holds, shown one at a time after the kicker. */
const ASSET_NAMES = [
  "USD",
  "Bitcoin",
  "Ether",
  "USDC",
  "Euros",
  "EURC",
] as const

const snapTransition = {
  duration: LANDING_FEATURE_INTERVAL_MS / 1000,
  ease: LANDING_SNAP_EASE_BEZIER,
}

type LandingNewWalletAssetKickerProps = {
  /** Static copy the rotating asset name follows. */
  prefix: string
  className?: string
}

/**
 * Wallet section kicker: "Ryle Wallet supports USD", where the asset name
 * snaps vertically on the same cadence as the chain names on the feature
 * cards. The slot is held at the width of the widest name so neither the
 * incoming nor the outgoing name is clipped mid-snap.
 */
export function LandingNewWalletAssetKicker({
  prefix,
  className = "",
}: LandingNewWalletAssetKickerProps) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const name = ASSET_NAMES[index]

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ASSET_NAMES.length)
    }, LANDING_FEATURE_INTERVAL_MS)

    return () => clearInterval(id)
  }, [])

  if (reduceMotion) {
    return (
      <p className={className} aria-live="polite">
        {`${prefix} ${name}`}
      </p>
    )
  }

  return (
    <p className={className}>
      <span className="sr-only">{`${prefix} ${name}`}</span>
      <span aria-hidden className="inline-flex items-end gap-[0.35em]">
        <span>{prefix}</span>
        <span className="relative block h-[1.35em] overflow-hidden">
          {/* Sizes the slot to the widest name; the extra rows are clipped. */}
          <span className="invisible flex flex-col whitespace-nowrap">
            {ASSET_NAMES.map((assetName) => (
              <span key={assetName}>{assetName}</span>
            ))}
          </span>
          <AnimatePresence initial={false}>
            <motion.span
              key={name}
              className="absolute inset-x-0 top-0 whitespace-nowrap"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={snapTransition}
            >
              {name}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </p>
  )
}
