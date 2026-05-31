"use client"

import { type ReactNode, useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"

/** At full scroll progress, scale is 90%. Never shrinks below this. */
const HERO_SCALE_END = 0.9
const HERO_NODE_REVEAL_SCROLL_DISTANCE_VH = 0.48
const HERO_SECTION_SCROLL_DISTANCE_VH = 1
const HERO_TOTAL_SCROLL_DISTANCE_VH =
  HERO_NODE_REVEAL_SCROLL_DISTANCE_VH + HERO_SECTION_SCROLL_DISTANCE_VH
const HERO_NODE_REVEAL_PROGRESS =
  HERO_NODE_REVEAL_SCROLL_DISTANCE_VH / HERO_TOTAL_SCROLL_DISTANCE_VH

function heroTransitionProgress(progress: number) {
  return Math.max(
    0,
    Math.min(1, (progress - HERO_NODE_REVEAL_PROGRESS) / (1 - HERO_NODE_REVEAL_PROGRESS))
  )
}

type LandingHomeHeroPinLayoutProps = {
  children: ReactNode
  className?: string
}

/**
 * Pinned hero layout.
 *
 * Structure:
 *  - outer `min-h-[248dvh]` track (`trackRef`) — creates the scroll distance.
 *  - inner `sticky top-0 h-[100dvh]` — hero stays in the viewport for the
 *    first scroll phase while the image nodes draw, then the next section
 *    (positioned with `-mt-[100dvh]`) slides over it.
 *
 * Animation:
 *  `useScroll({ container, target: trackRef, offset: ["start start","end end"] })`
 *  gives `scrollYProgress` 0→1 over the extra track scroll. The first
 *  ~48dvh is reserved for drawing the hero nodes before the hero fade/scale
 *  and next-section transition begin.
 *
 *  - scale   1 → 0.9  (capped at 90%)
 *  - opacity 1 → 0
 */
export function LandingHomeHeroPinLayout({
  children,
  className,
}: LandingHomeHeroPinLayoutProps) {
  const scrollRef = useMarketingScrollContainer()
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    container: scrollRef ?? undefined,
    target: trackRef,
    offset: ["start start", "end end"],
  })

  const scale = useTransform(scrollYProgress, (p) => {
    const transitionProgress = heroTransitionProgress(p)
    return reduce ? 1 : 1 + (HERO_SCALE_END - 1) * transitionProgress
  })

  const opacity = useTransform(scrollYProgress, (p) =>
    reduce ? 1 : 1 - heroTransitionProgress(p)
  )

  return (
    <div ref={trackRef} className="w-full min-h-[248dvh]">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <motion.div
          className={className}
          style={{
            scale,
            opacity,
            transformOrigin: "50% 0%",
            ...(reduce ? {} : { willChange: "transform, opacity" as const }),
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
