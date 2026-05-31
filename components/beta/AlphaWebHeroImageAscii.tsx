"use client"

import Image from "next/image"
import { useReducedMotion } from "motion/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  ALPHA_WEB_HERO_ASCII,
  ALPHA_WEB_HERO_ASCII_MAX_CH,
  alphaWebHeroAsciiHalf,
} from "@/components/beta/alphaWebHeroAscii"
import {
  HERO_IMAGE_NODES,
  percentToPoint,
} from "@/components/beta/heroAsciiImageNodes"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"

/** Heuristic: typographic "em" width for monospace in px ≈ 0.58 × font-size. */
const MONO_EM_RATIO = 0.58
const MIN_PX = 3.5
const MAX_PX = 8.5

/** First pinned scroll phase: draw the image nodes before the next section enters. */
const HERO_REVEAL_SCROLL_DISTANCE_VH = 0.48

/** Opacity fade once layout/font size is resolved (matches hero fade easing). */
const HERO_ASCII_FADE_MS = 600
const HERO_ASCII_FADE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)"

/** Slightly larger than `object-contain` bounds so the painting fills more of the polygon. */
const HERO_IMAGE_DISPLAY_SCALE = 1.2

function clampProgress(value: number) {
  return Math.max(0, Math.min(1, value))
}

type AlphaWebHeroImageAsciiProps = {
  /** e.g. alt for the oil painting. */
  imageAlt: string
  /** Path under /public, e.g. /beta/alpha-web-hero.png */
  imageSrc: string
  /** Merged onto the outer wrapper; use e.g. `max-w-none` in wide layouts. */
  className?: string
  /**
   * When set, only the top or bottom half of the ASCII (by line count) is shown,
   * scaled like the hero using the full block width (`ALPHA_WEB_HERO_ASCII_MAX_CH`),
   * and the image / scroll overlay is omitted (marketing pillars).
   */
  asciiHalf?: "top" | "bottom"
}

/**
 * ASCII is always in the column; the hero image sits on top in the same box.
 * The main reveal is the scroll-driven polygon. During the first pinned scroll
 * phase, fixed polygon vertices fill in the painting.
 */
export function AlphaWebHeroImageAscii({
  imageAlt,
  imageSrc,
  className,
  asciiHalf,
}: AlphaWebHeroImageAsciiProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const hasFadedInRef = useRef(false)
  const scrollContainerRef = useMarketingScrollContainer()
  const reduceMotion = useReducedMotion() ?? false
  const [fontPx, setFontPx] = useState(MIN_PX)
  const [containerSize, setContainerSize] = useState({ w: 1, h: 1 })
  const [scrollRevealCount, setScrollRevealCount] = useState(0)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  const maxChForScale = ALPHA_WEB_HERO_ASCII_MAX_CH

  useEffect(() => {
    if (asciiHalf) return

    const scrollContainer = scrollContainerRef?.current
    const scrollTarget: HTMLElement | Window = scrollContainer ?? window

    const updateRevealCount = () => {
      const scrollTop =
        scrollContainer?.scrollTop ??
        window.scrollY ??
        document.documentElement.scrollTop
      const viewportHeight = Math.max(
        1,
        scrollContainer?.clientHeight ?? window.innerHeight ?? 1
      )
      const revealDistance =
        viewportHeight * HERO_REVEAL_SCROLL_DISTANCE_VH
      const progress = clampProgress(scrollTop / revealDistance)

      setScrollRevealCount(Math.round(progress * HERO_IMAGE_NODES.length))
    }

    updateRevealCount()
    scrollTarget.addEventListener("scroll", updateRevealCount, {
      passive: true,
    })
    window.addEventListener("resize", updateRevealCount)

    return () => {
      scrollTarget.removeEventListener("scroll", updateRevealCount)
      window.removeEventListener("resize", updateRevealCount)
    }
  }, [asciiHalf, scrollContainerRef])

  useLayoutEffect(() => {
    const el = blockRef.current
    const outer = outerRef.current
    if (!el || !outer) return

    const apply = () => {
      const availableWidth = outer.clientWidth
      if (availableWidth < 8) return

      const next = Math.max(
        MIN_PX,
        Math.min(MAX_PX, availableWidth / (maxChForScale * MONO_EM_RATIO))
      )
      setFontPx(next)

      const rect = el.getBoundingClientRect()
      if (rect.width >= 8 && rect.height >= 8) {
        setContainerSize({ w: rect.width, h: rect.height })
      }

      if (!hasFadedInRef.current) {
        hasFadedInRef.current = true
        if (reduceMotion) {
          setIsLayoutReady(true)
        } else {
          requestAnimationFrame(() => setIsLayoutReady(true))
        }
      }
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [maxChForScale, reduceMotion])

  const fullHero = !asciiHalf
  const visiblePoints = fullHero
    ? HERO_IMAGE_NODES.slice(0, scrollRevealCount)
    : HERO_IMAGE_NODES

  const asciiText = asciiHalf
    ? alphaWebHeroAsciiHalf(asciiHalf).ascii
    : ALPHA_WEB_HERO_ASCII

  /** CSS polygon clip path expressed as percentages so it survives resize. */
  const polygonClipPath =
    visiblePoints.length >= 3
      ? `polygon(${visiblePoints
          .map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`)
          .join(", ")})`
      : undefined

  const absolutePoints = visiblePoints.map((point) =>
    percentToPoint(point, containerSize)
  )

  /** SVG points attribute string in absolute px (for the overlay). */
  const svgPoints = absolutePoints.map((p) => `${p.x},${p.y}`).join(" ")

  const imageContent = (
    <>
      <Image
        src={imageSrc}
        alt=""
        aria-hidden
        fill
        className="object-contain object-center grayscale dark:invert dark:brightness-[0.75] dark:contrast-[1.04]"
        style={{ transform: `scale(${HERO_IMAGE_DISPLAY_SCALE})` }}
        sizes="(min-width: 1080px) min(52ch, 100vw), min(100vw - 2rem, 52ch)"
      />
      {/*
       * Light mode: grayscale + warm `mix-blend-color` tint reads as a
       * faded sepia oil painting on the cream surround.
       * Dark mode: invert the (already grayscale) image so bright sky
       * and water become deep, dark trees become luminous.
       */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-color [background:color-mix(in_srgb,var(--hero-skin-tint)_38%,#9c968e)] dark:[background:color-mix(in_srgb,var(--hero-skin-tint)_40%,#f5f2ee)]"
        aria-hidden
      />
    </>
  )

  return (
    <div
      ref={outerRef}
      className={
        className ??
        "w-full min-w-0 max-w-[52ch] min-[1080px]:max-w-none"
      }
    >
      <div
        ref={blockRef}
        className="relative w-fit max-w-full min-w-0 overflow-hidden overscroll-x-none select-none touch-pan-y"
        style={{
          opacity: isLayoutReady ? 1 : 0,
          transitionProperty: reduceMotion ? "none" : "opacity",
          transitionDuration: reduceMotion ? undefined : `${HERO_ASCII_FADE_MS}ms`,
          transitionTimingFunction: reduceMotion ? undefined : HERO_ASCII_FADE_EASE,
        }}
      >
        <span className="sr-only">{imageAlt}</span>
        <pre
          aria-hidden
          className="pointer-events-none m-0 w-fit max-w-full min-w-0 overflow-hidden p-0 whitespace-pre font-mono leading-[1.03] text-muted/90 [letter-spacing:0] [tab-size:1]"
          style={{ fontSize: `${fontPx}px` }}
        >
          {asciiText}
        </pre>

        {/* Polygon layer — permanently filled once 3+ points */}
        {fullHero && polygonClipPath ? (
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ clipPath: polygonClipPath }}
          >
            <div className="relative isolate h-full w-full min-h-px">
              {imageContent}
            </div>
          </div>
        ) : null}

        {/* SVG overlay — dots, edges, and closing line while drawing */}
        {fullHero && visiblePoints.length > 0 ? (
          <svg
            className="pointer-events-none absolute inset-0 z-30 w-full h-full"
            aria-hidden
          >
            {/* filled polygon outline once closed */}
            {visiblePoints.length >= 3 ? (
              <polygon
                points={svgPoints}
                fill="none"
                className="stroke-black"
                strokeWidth="0.65"
              />
            ) : null}

            {/* edges between placed points */}
            {visiblePoints.length >= 2 ? (
              <polyline
                points={svgPoints}
                fill="none"
                className="stroke-black"
                strokeWidth="0.65"
                strokeDasharray="3 2"
              />
            ) : null}

            {/* closing edge hint while still drawing */}
            {visiblePoints.length === 2 ? (
              <line
                x1={absolutePoints[absolutePoints.length - 1].x}
                y1={absolutePoints[absolutePoints.length - 1].y}
                x2={absolutePoints[0].x}
                y2={absolutePoints[0].y}
                className="stroke-black"
                strokeWidth="0.65"
                strokeDasharray="3 4"
              />
            ) : null}

            {/* vertex squares */}
            {absolutePoints.map((p, i) => (
              <rect
                key={i}
                x={p.x - 2.75}
                y={p.y - 2.75}
                width={5.5}
                height={5.5}
                className="fill-black"
              />
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  )
}
