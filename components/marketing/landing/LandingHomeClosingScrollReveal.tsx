"use client"

import { useRef } from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import type { ReactNode } from "react"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"

type LandingHomeClosingScrollRevealProps = {
  children: ReactNode
  className?: string
}

/** First quarter of entry scroll progress → full opacity / y settled. */
const REVEAL_COMPLETE_AT = 0.25

/**
 * Scroll-scrubbed reveal for the closing footer block. Uses the marketing scroll
 * container (not window IO) and latches the highest progress reached so the copy
 * never blinks off after it has appeared.
 */
export function LandingHomeClosingScrollReveal({
  children,
  className = "",
}: LandingHomeClosingScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const reduceMotion = useReducedMotion()
  const latchedProgress = useMotionValue(0)

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef ?? undefined,
    target: ref,
    offset: ["start end", "start 0.62"],
  })

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value > latchedProgress.get()) {
      latchedProgress.set(value)
    }
  })

  const opacity = useTransform(latchedProgress, (progress) => {
    const t = Math.min(1, Math.max(0, progress / REVEAL_COMPLETE_AT))
    return t
  })
  const y = useTransform(latchedProgress, (progress) => {
    const t = Math.min(1, Math.max(0, progress / REVEAL_COMPLETE_AT))
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
    <motion.div ref={ref} className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  )
}
