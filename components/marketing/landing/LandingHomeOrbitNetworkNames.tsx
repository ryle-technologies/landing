"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

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

function OrbitNameSlot({ name }: { name: string }) {
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
            transition={nameFadeTransition}
          >
            {name}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

export function LandingHomeOrbitNetworkNames({
  className = "",
}: {
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const [nameIndex, setNameIndex] = useState(0)

  const visibleName = ORBIT_NAMES[nameIndex]

  useEffect(() => {
    if (reduceMotion) return

    const id = setTimeout(() => {
      setNameIndex((i) => (i + 1) % NAME_COUNT)
    }, IDLE_MS)

    return () => clearTimeout(id)
  }, [nameIndex, reduceMotion])

  useEffect(() => {
    if (!reduceMotion) return

    const id = setInterval(() => {
      setNameIndex((i) => (i + 1) % NAME_COUNT)
    }, IDLE_MS)

    return () => clearInterval(id)
  }, [reduceMotion])

  if (reduceMotion) {
    return (
      <p className={`min-w-0 max-w-full ${className}`} aria-live="polite">
        {visibleName}
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
        <OrbitNameSlot name={visibleName} />
      </span>
    </p>
  )
}
