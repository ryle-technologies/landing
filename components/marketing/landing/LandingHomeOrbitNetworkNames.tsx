"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import {
  LANDING_FEATURE_INTERVAL_MS,
  LANDING_SNAP_EASE_BEZIER,
} from "@/lib/landingSnapMotion"

/**
 * Supported chain / network labels, shown **one at a time** (same roster as the
 * former three-name row, flattened row-wise through each group).
 */
const ORBIT_NAMES = [
  "Tempo",
  "Arc",
  "Plasma",
  "Ethereum",
  "Polygon",
  "Base",
  "Optimism",
  "Arbitrum",
  "Avalanche",
] as const

const NAME_COUNT = ORBIT_NAMES.length

const IDLE_MS = 4500

/** Opacity only: slow symmetric ease so fades feel soft. */
const nameFadeTransition = {
  duration: 1.35,
  ease: [0.42, 0, 0.58, 1] as const,
}

const nameSnapTransition = {
  duration: LANDING_FEATURE_INTERVAL_MS / 1000,
  ease: LANDING_SNAP_EASE_BEZIER,
}

function OrbitNameSlot({
  name,
  durationS,
  ease,
}: {
  name: string
  durationS: number
  ease: readonly [number, number, number, number]
}) {
  return (
    <span className="relative inline-flex min-h-[1.35em] min-w-0 items-baseline">
      <span className="relative flex min-h-[1.35em] min-w-0 items-end overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={name}
            className="inline-block whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durationS, ease }}
          >
            {name}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

function OrbitNameSnapSlot({ name }: { name: string }) {
  return (
    <span className="relative block h-[1.35em] w-full min-w-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={name}
          className="absolute inset-x-0 top-0 whitespace-nowrap"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={nameSnapTransition}
        >
          {name}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function LandingHomeOrbitNetworkNames({
  className = "",
  snap = false,
}: {
  className?: string
  /** Match the landing use-case carousel hold + ease-in-out snap. */
  snap?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const [nameIndex, setNameIndex] = useState(0)
  const holdMs = snap ? LANDING_FEATURE_INTERVAL_MS : IDLE_MS
  const visibleName = ORBIT_NAMES[nameIndex]

  useEffect(() => {
    if (reduceMotion) return

    const id = setTimeout(() => {
      setNameIndex((i) => (i + 1) % NAME_COUNT)
    }, holdMs)

    return () => clearTimeout(id)
  }, [holdMs, nameIndex, reduceMotion])

  useEffect(() => {
    if (!reduceMotion) return

    const id = setInterval(() => {
      setNameIndex((i) => (i + 1) % NAME_COUNT)
    }, holdMs)

    return () => clearInterval(id)
  }, [holdMs, reduceMotion])

  if (reduceMotion) {
    return (
      <p className={`min-w-0 max-w-full ${className}`} aria-live="polite">
        {visibleName}
      </p>
    )
  }

  if (snap) {
    return (
      <p className={`min-w-0 max-w-full overflow-hidden ${className}`}>
        <span className="sr-only">{visibleName}</span>
        <span aria-hidden className="block min-w-0">
          <OrbitNameSnapSlot name={visibleName} />
        </span>
      </p>
    )
  }

  return (
    <p
      className={`min-w-0 max-w-full ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">{visibleName}</span>
      <span aria-hidden className="inline-flex items-baseline">
        <OrbitNameSlot
          name={visibleName}
          durationS={nameFadeTransition.duration}
          ease={nameFadeTransition.ease}
        />
      </span>
    </p>
  )
}
