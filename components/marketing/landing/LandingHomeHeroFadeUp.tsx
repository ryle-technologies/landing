"use client"

import {
  cubicBezier,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { useRef, type ReactNode, type RefObject } from "react"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"

const fadeUpInitial = { opacity: 0, y: 12 }
/** Slide from above: enters moving top → down with fade. */
const fadeSlideDownInitial = { opacity: 0, y: -12 }
const fadeUpAnimate = { opacity: 1, y: 0 }

/**
 * JS easing (not a bezier tuple) keeps opacity on the main thread with transform.
 * Tuple eases can hand opacity to WAAPI and flash for a frame when the run ends.
 */
const fadeUpEase = cubicBezier(0.16, 1, 0.3, 1)
const fadeUpTransition = { duration: 0.6, ease: fadeUpEase }

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
  const { ref, isVisible } = useMarketingInView(
    whenVisible ? viewportProp : undefined,
  )
  const initial = direction === "down" ? fadeSlideDownInitial : fadeUpInitial
  const transition = { ...fadeUpTransition, delay }

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  if (whenVisible) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={initial}
        animate={isVisible ? fadeUpAnimate : initial}
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

function useMarketingInView(viewportProp: InViewViewport | undefined): {
  ref: RefObject<HTMLDivElement | null>
  isVisible: boolean
} {
  const ref = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const viewport = { ...defaultInViewViewport, ...viewportProp }
  const hasLatchedRef = useRef(false)

  const isInView = useInView(ref, {
    once: viewport.once,
    amount: viewport.amount,
    root: scrollContainerRef ?? undefined,
  })

  if (viewport.once && isInView) {
    hasLatchedRef.current = true
  }

  const isVisible = viewport.once ? hasLatchedRef.current || isInView : isInView

  return { ref, isVisible }
}

/**
 * Staggered in-view reveal for the whole group; use with `motion` children and
 * {@link landingHomeHeroStaggerInViewItem}. Uses the marketing scroll container
 * as the intersection root and latches `once` reveals so IO edge flicker cannot
 * replay the fade.
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
  const { ref, isVisible } = useMarketingInView(viewportProp)

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? "show" : "hidden"}
      variants={landingHomeHeroStaggerInViewContainer}
    >
      {children}
    </motion.div>
  )
}
