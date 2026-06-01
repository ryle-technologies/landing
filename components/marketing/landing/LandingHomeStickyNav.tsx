"use client"

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import { LandingTopNav } from "@/components/marketing/landing/LandingTopNav"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"
import {
  landingColumnHorizontalPadClass,
  landingContentMaxWidthClass,
} from "@/lib/landingLayout"

/** Ref to the closing-section scroll marker (see {@link LandingHomeNavFadeOutMarker}). */
const LandingNavFadeOutContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null)

/**
 * Wraps post-hero landing content so {@link LandingHomeStickyNav} can fade out
 * when the user reaches the closing block.
 */
export function LandingHomeNavScrollScope({ children }: { children: ReactNode }) {
  const fadeOutRef = useRef<HTMLDivElement | null>(null)
  return (
    <LandingNavFadeOutContext.Provider value={fadeOutRef}>
      {children}
    </LandingNavFadeOutContext.Provider>
  )
}

/** Place immediately before the closing section; drives nav fade-out on scroll. */
export function LandingHomeNavFadeOutMarker() {
  const fadeOutRef = useContext(LandingNavFadeOutContext)
  if (!fadeOutRef) return null
  return (
    <div
      ref={fadeOutRef}
      aria-hidden
      className="pointer-events-none h-0 w-full shrink-0"
    />
  )
}

/** Top scroll fade — same pattern as {@link LandingHomeBanksConsole} (vertical: solid top → transparent bottom). */
const landingNavTopScrollFadeStyle = {
  WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
  maskImage: "linear-gradient(to bottom, black, transparent)",
} as const

/**
 * Fixed post-hero nav. The sentinel keeps the reveal threshold in the document
 * flow, while the nav itself stays anchored at the top and fades in place.
 */
export function LandingHomeStickyNav() {
  const scrollContainerRef = useMarketingScrollContainer()
  const fadeOutRef = useContext(LandingNavFadeOutContext)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isInteractive, setIsInteractive] = useState(false)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef ?? undefined,
    target: sentinelRef,
    offset: ["start start", "end start"],
  })

  const { scrollYProgress: fadeOutScrollYProgress } = useScroll({
    container: scrollContainerRef ?? undefined,
    target: fadeOutRef ?? undefined,
    offset: ["start 92%", "start 38%"],
  })

  const fadeInOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const fadeOutOpacity = useTransform(fadeOutScrollYProgress, [0, 1], [1, 0])
  const opacity = useTransform(
    [fadeInOpacity, fadeOutOpacity],
    ([fadeIn, fadeOut]: number[]) => fadeIn * fadeOut,
  )
  const y = useTransform(scrollYProgress, [0, 1], [50, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1])

  useMotionValueEvent(opacity, "change", (value) => {
    setIsInteractive(value >= 0.05)
  })

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-[25dvh]" />
      <motion.div
        initial={false}
        style={{
          opacity,
          scale: reduceMotion ? 1 : scale,
          x: "-50%",
          y: reduceMotion ? 0 : y,
        }}
        className={[
          `fixed top-0 left-1/2 z-50 w-full ${landingContentMaxWidthClass}`,
          `${landingColumnHorizontalPadClass} py-4 sm:py-5`,
          "origin-top",
          isInteractive ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-[var(--marketing-surface)] sm:h-32"
          style={landingNavTopScrollFadeStyle}
        />
        <div className="relative z-10">
          <LandingTopNav />
        </div>
      </motion.div>
    </>
  )
}
