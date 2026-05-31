"use client"

import Image from "next/image"
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react"

import {
  HERO_CHAIN_LOGO_COUNT,
  HERO_CHAIN_LOGOS,
} from "@/lib/heroChainLogos"

const maskBgClass = "bg-[var(--marketing-surface)]"

/**
 * Slots per half of the strip (total = 2 × this). Must be a multiple of
 * {@link HERO_CHAIN_LOGO_COUNT} so the duplicated half matches pixel-for-pixel.
 */
const LOGO_SLOTS_PER_HALF = 20

const ChainLogoMark = forwardRef<
  HTMLSpanElement,
  { slotIndex: number; markClassName: string; imageSizes: string }
>(function ChainLogoMark({ slotIndex, markClassName, imageSizes }, ref) {
    const logo = HERO_CHAIN_LOGOS[slotIndex % HERO_CHAIN_LOGO_COUNT]

    return (
      <span
        ref={ref}
        aria-hidden
        className={`relative shrink-0 ${markClassName}`}
        style={{ opacity: 0.5 }}
      >
        <Image
          src={logo.src}
          alt=""
          fill
          sizes={imageSizes}
          className="object-contain"
        />
      </span>
    )
  },
)

type LandingHomeChainsMarqueeProps = {
  className?: string
  /**
   * `hero`: narrow clip beside the CTA (default).
   * `section`: full-width of parent, taller strip, larger logos (supported-networks block).
   */
  variant?: "hero" | "section"
}

const VARIANT_SHELL: Record<NonNullable<LandingHomeChainsMarqueeProps["variant"]>, string> = {
  hero: "h-8 w-[min(10.5rem,40vw)] max-w-[11.5rem] shrink-0 sm:h-9 sm:max-w-[12rem]",
  /** Full width of parent; height only (display + width come from {@link VARIANT_OUTER}). */
  section: "h-12 sm:h-14",
}

/** Layout + overflow: section spans the full content width like the footer marquee. */
const VARIANT_OUTER: Record<NonNullable<LandingHomeChainsMarqueeProps["variant"]>, string> = {
  hero: "relative inline-block overflow-hidden",
  section: "relative block w-full min-w-0 overflow-hidden",
}

const VARIANT_MARK: Record<NonNullable<LandingHomeChainsMarqueeProps["variant"]>, string> = {
  hero: "size-6 sm:size-7",
  section: "size-9 sm:size-10",
}

const VARIANT_IMAGE_SIZES: Record<NonNullable<LandingHomeChainsMarqueeProps["variant"]>, string> = {
  hero: "(max-width: 640px) 24px, 28px",
  section: "(max-width: 640px) 40px, 48px",
}

const VARIANT_MASK_W: Record<NonNullable<LandingHomeChainsMarqueeProps["variant"]>, string> = {
  hero: "w-6 sm:w-8",
  section: "w-12 sm:w-16",
}

/**
 * Maps horizontal distance from the viewport center to opacity: 0.75 at
 * center, 0.5 toward the left/right edges of the clip.
 */
function opacityFromCenterNorm(distanceFromCenter: number, halfWidth: number) {
  const safeHalf = Math.max(halfWidth, 1)
  const t = Math.min(1, distanceFromCenter / safeHalf)
  return 0.75 - t * 0.25
}

/**
 * Infinite horizontal marquee for hero “major chains” marks — same motion pattern
 * and edge fades as the footer marquee, scaled for the subtitle row.
 */
export function LandingHomeChainsMarquee({
  className = "",
  variant = "hero",
}: LandingHomeChainsMarqueeProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const markRefs = useRef<(HTMLSpanElement | null)[]>([])

  const setMarkRef = useCallback((index: number) => (el: HTMLSpanElement | null) => {
    markRefs.current[index] = el
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const applyReduced = () => {
      for (const el of markRefs.current) {
        if (el) el.style.opacity = "0.5"
      }
    }

    if (media.matches) {
      applyReduced()
      return
    }

    let frame = 0

    const tick = () => {
      const container = containerRef.current
      if (!container) {
        frame = window.requestAnimationFrame(tick)
        return
      }

      const cr = container.getBoundingClientRect()
      const midX = cr.left + cr.width / 2
      const halfW = cr.width / 2

      for (const el of markRefs.current) {
        if (!el) continue
        const lr = el.getBoundingClientRect()
        const logoMidX = lr.left + lr.width / 2
        const distance = Math.abs(logoMidX - midX)
        el.style.opacity = String(opacityFromCenterNorm(distance, halfW))
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const slotIndices = Array.from(
    { length: LOGO_SLOTS_PER_HALF * 2 },
    (_, index) => index,
  )

  const shellClass = VARIANT_SHELL[variant]
  const outerClass = VARIANT_OUTER[variant]
  const markClass = VARIANT_MARK[variant]
  const imageSizes = VARIANT_IMAGE_SIZES[variant]
  const maskW = VARIANT_MASK_W[variant]
  const stripGapClass = variant === "section" ? "gap-5 sm:gap-6" : "gap-3"
  /** Section strip: slower loop than the hero row (full literals for Tailwind JIT). */
  const marqueeAnimateClass =
    variant === "section"
      ? "animate-[landing-footer-marquee_60s_linear_infinite]"
      : "animate-[landing-footer-marquee_24s_linear_infinite]"

  return (
    <span
      ref={containerRef}
      role="img"
      aria-label="Supported blockchain networks"
      className={`${outerClass} ${shellClass} ${className}`.trim()}
    >
      <span
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 ${maskW} ${maskBgClass} transition-colors duration-500 ease-out`}
        style={{
          WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          maskImage: "linear-gradient(to right, black, transparent)",
        }}
      />
      <span
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 ${maskW} ${maskBgClass} transition-colors duration-500 ease-out`}
        style={{
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          maskImage: "linear-gradient(to left, black, transparent)",
        }}
      />
      {/*
       * Tailwind JIT: both durations appear as full literals in `marqueeAnimateClass`.
       * Hero 24s / section 60s per loop (footer statement uses 42s).
       */}
      <span
        className={`landing-chains-marquee flex h-full w-max items-center ${stripGapClass} motion-reduce:animate-none ${marqueeAnimateClass}`}
      >
        {slotIndices.map((index) => (
          <ChainLogoMark
            key={index}
            ref={setMarkRef(index)}
            slotIndex={index % LOGO_SLOTS_PER_HALF}
            markClassName={markClass}
            imageSizes={imageSizes}
          />
        ))}
      </span>
    </span>
  )
}
