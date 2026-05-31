"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import {
  ALPHA_WEB_HERO_ASCII_MAX_CH,
  alphaWebHeroAsciiHalf,
} from "@/components/beta/alphaWebHeroAscii"
import { useLandingScrollItemEntered } from "@/components/marketing/landing/LandingHomeScrollFadeItem"

const MONO_EM_RATIO = 0.58
const MIN_PX = 3.5
const MAX_PX = 10

const TOP_HALF_LINE_COUNT = alphaWebHeroAsciiHalf("top").ascii.split("\n").length
const heightPlaceholder = Array(TOP_HALF_LINE_COUNT).fill("\u00a0").join("\n")

const barClassName =
  "bg-[color-mix(in_srgb,var(--foreground)_16%,var(--marketing-surface))]"

const bars = [
  { height: "100%", opacity: 0.7 },
  { height: "11%", opacity: 0.48 },
  { height: "5.5%", opacity: 0.44 },
  { height: "5%", opacity: 0.4 },
  { height: "3.5%", opacity: 0.36 },
  { height: "2.25%", opacity: 0.32 },
  { height: "1.25%", opacity: 0.28 },
] as const
const BAR_ANIMATION_MS = 520
const VISIBLE_OPACITY_THRESHOLD = 0.6

function effectiveOpacity(el: HTMLElement) {
  let opacity = 1
  let node: HTMLElement | null = el

  while (node && node !== document.body) {
    opacity *= Number.parseFloat(window.getComputedStyle(node).opacity || "1")
    node = node.parentElement
  }

  return opacity
}

/**
 * Abstract bar chart for the stablecoins pillar: one dominant bar and a few
 * residual bars.
 */
export function LandingHomeStablecoinsHeatmap() {
  const blockRef = useRef<HTMLDivElement>(null)
  const [fontPx, setFontPx] = useState(MIN_PX)
  const [fallbackHasEntered, setFallbackHasEntered] = useState(false)
  const sequenceItemEntered = useLandingScrollItemEntered()
  const shouldShow = sequenceItemEntered ?? fallbackHasEntered

  useLayoutEffect(() => {
    const el = blockRef.current
    if (!el) return

    const apply = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width < 8 || rect.height < 8) return
      const fromWidth =
        rect.width / (ALPHA_WEB_HERO_ASCII_MAX_CH * MONO_EM_RATIO)
      const fromHeight = rect.height / (TOP_HALF_LINE_COUNT * 1.03)
      const next = Math.max(
        MIN_PX,
        Math.min(MAX_PX, Math.min(fromWidth, fromHeight))
      )
      setFontPx(next)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (sequenceItemEntered !== null) return

    const el = blockRef.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setFallbackHasEntered(true))
      return () => window.cancelAnimationFrame(frame)
    }

    let frame = 0

    const checkVisibility = () => {
      frame = 0

      if (effectiveOpacity(el) < VISIBLE_OPACITY_THRESHOLD) {
        frame = window.requestAnimationFrame(checkVisibility)
        return
      }

      setFallbackHasEntered(true)
    }

    frame = window.requestAnimationFrame(checkVisibility)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sequenceItemEntered])

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 max-w-none" ref={blockRef}>
      <pre
        aria-hidden
        className="pointer-events-none m-0 w-full min-w-0 max-w-full select-none overflow-hidden whitespace-pre p-0 font-mono leading-[1.03] text-transparent [letter-spacing:0] [tab-size:1]"
        style={{ fontSize: `${fontPx}px` }}
      >
        {heightPlaceholder}
      </pre>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-[3px] flex items-end gap-2"
      >
        {bars.map((bar, index) => (
          <div
            key={`${bar.height}-${index}`}
            className={`w-[10%] shrink-0 ${barClassName}`}
            style={
              {
                height: bar.height,
                opacity: shouldShow ? bar.opacity : 0,
                transform: `scaleY(${shouldShow ? 1 : 0.02})`,
                transformOrigin: "bottom",
                transitionProperty: "transform, opacity, background-color",
                transitionDuration: `${
                  shouldShow ? BAR_ANIMATION_MS : 0
                }ms, ${shouldShow ? BAR_ANIMATION_MS : 0}ms, 500ms`,
                transitionTimingFunction:
                  "cubic-bezier(0.2, 0.8, 0.2, 1), ease-out, ease-out",
                transitionDelay: shouldShow
                  ? `${index * BAR_ANIMATION_MS}ms, ${index * BAR_ANIMATION_MS}ms, 0ms`
                  : "0ms, 0ms, 0ms",
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[var(--marketing-surface)] transition-colors duration-500 ease-out"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, rgb(0 0 0 / 0.56), black)",
          maskImage:
            "linear-gradient(to right, transparent, rgb(0 0 0 / 0.56), black)",
        }}
      />
    </div>
  )
}
