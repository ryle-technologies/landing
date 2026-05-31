"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { ReactNode } from "react"

const fadeUpInitial = { opacity: 0, y: 12 }
/** Slide from above: enters moving top → down with fade. */
const fadeSlideDownInitial = { opacity: 0, y: -12 }
const fadeUpAnimate = { opacity: 1, y: 0 }
const fadeUpTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }

const defaultInViewViewport = { once: false, amount: 0.28 } as const

const STAGGER_CHILD_S = 0.3

/** For `motion.*` children of `LandingHomeHeroFadeStaggerInView` (names: `hidden` / `show`). */
export const landingHomeHeroStaggerInViewItem: Variants = {
  hidden: fadeUpInitial,
  show: { ...fadeUpAnimate, transition: fadeUpTransition },
}

const landingHomeHeroStaggerInViewContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER_CHILD_S, delayChildren: 0 } },
}

/**
 * Client wrapper that fades its children in (opacity 0 → 1) and slides them:
 * **`direction: 'up'`** (default): **bottom → top** (`y: 12 → 0`).
 * **`direction: 'down'`**: **top → down** (`y: -12 → 0`) with fade.
 * Runs on mount or when scrolled into view if `whenVisible` is set.
 */
export function LandingHomeHeroFadeUp({
  children,
  delay = 0,
  className,
  direction = "up",
  whenVisible = false,
  viewport: viewportProp,
}: {
  children: ReactNode
  delay?: number
  className?: string
  /** Slide from below (default) or from above (top-to-down). */
  direction?: "up" | "down"
  /** If true, runs the same fade/slide when the block enters the viewport. */
  whenVisible?: boolean
  /** Merged with defaults when `whenVisible` is true. */
  viewport?: { once?: boolean; amount?: number | "some" | "all" }
}) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const initial = direction === "down" ? fadeSlideDownInitial : fadeUpInitial
  const transition = { ...fadeUpTransition, delay }
  const viewport = { ...defaultInViewViewport, ...viewportProp }

  if (whenVisible) {
    return (
      <motion.div
        className={className}
        initial={initial}
        whileInView={fadeUpAnimate}
        viewport={viewport}
        transition={transition}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={fadeUpAnimate}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}

type InViewViewport = { once?: boolean; amount?: number | "some" | "all" }

/**
 * One `whileInView` for the whole group; use with `motion` children and
 * {@link landingHomeHeroStaggerInViewItem} so the stagger runs when the block
 * first scrolls into view.
 */
export function LandingHomeHeroFadeStaggerInView({
  className,
  children,
  viewport: viewportProp,
}: {
  className?: string
  children: ReactNode
  viewport?: InViewViewport
}) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }
  const viewport = { ...defaultInViewViewport, ...viewportProp }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={landingHomeHeroStaggerInViewContainer}
    >
      {children}
    </motion.div>
  )
}
