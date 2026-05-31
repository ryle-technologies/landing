"use client"

import { useRef } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import type { ReactNode } from "react"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"

type LandingSuiteProductsRevealProps = {
  children: ReactNode
  className?: string
}

/** First 20% of entry scroll progress → full opacity / scale 1 / y settled. */
const REVEAL_COMPLETE_AT = 0.2

/** Opacity at the start of the entry range (scrubs to 1 by {@link REVEAL_COMPLETE_AT}). */
const SUITE_REVEAL_OPACITY_START = 0.7

/**
 * Scroll-scrubbed reveal for the “Suite of products” block (same scroll root as
 * the hero pin / sticky nav): opacity, scale, and `y` track {@link useScroll}
 * while the block **enters** the marketing viewport. Opacity runs **0.7 → 1**
 * in the first **20%** of that entry range; the rest of the scroll through the
 * section stays at scale 1 / opacity 1.
 */
export function LandingSuiteProductsReveal({
  children,
  className = "min-w-0",
}: LandingSuiteProductsRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef ?? undefined,
    target: ref,
    /** Top at container bottom → top at top: entry only (not full section traverse). */
    offset: ["start end", "start start"],
  })

  const opacity = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, p / REVEAL_COMPLETE_AT))
    return SUITE_REVEAL_OPACITY_START + (1 - SUITE_REVEAL_OPACITY_START) * t
  })
  const scale = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, p / REVEAL_COMPLETE_AT))
    return 0.9 + 0.1 * t
  })
  const y = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, p / REVEAL_COMPLETE_AT))
    return 12 * (1 - t)
  })

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        opacity,
        scale,
        y,
        transformOrigin: "50% 50%",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </motion.div>
  )
}
