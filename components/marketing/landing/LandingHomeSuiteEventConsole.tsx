"use client"

import { useLayoutEffect, useRef, useState } from "react"
import {
  ALPHA_WEB_HERO_ASCII_MAX_CH,
  alphaWebHeroAsciiHalf,
} from "@/components/beta/alphaWebHeroAscii"
import { EventConsole } from "@/components/console/EventConsole"
import { useMockEventStream } from "@/components/console/mockEventSource"
import { useLandingScrollItemEntered } from "@/components/marketing/landing/LandingHomeScrollFadeItem"

/** Match pillar `asciiHalf="top"` line count from {@link alphaWebHeroAsciiHalf} for strip height. */
const MONO_EM_RATIO = 0.58
const MIN_PX = 3.5
const MAX_PX = 8.5

/** Leading column: HTTP-style method labels (API-ish) instead of wall-clock. */
const HTTP_METHOD_LABELS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "UPDATE",
] as const

const TOP_HALF_LINE_COUNT = alphaWebHeroAsciiHalf("top").ascii.split("\n").length
const heightPlaceholder = Array(TOP_HALF_LINE_COUNT).fill("\u00a0").join("\n")

/**
 * Duplicate of {@link LandingHomeBanksConsole} for the developers/API bridge on the home
 * landing (after the supported-networks block) — edit here without changing the banks pillar console.
 */
export function LandingHomeSuiteEventConsole() {
  const feed = useMockEventStream({ append: false })
  const blockRef = useRef<HTMLDivElement>(null)
  const [fontPx, setFontPx] = useState(MIN_PX)
  const maxChForScale = ALPHA_WEB_HERO_ASCII_MAX_CH
  const sequenceItemEntered = useLandingScrollItemEntered()

  useLayoutEffect(() => {
    const el = blockRef.current
    if (!el) return

    const apply = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width < 8) return
      const next = Math.max(
        MIN_PX,
        Math.min(MAX_PX, rect.width / (maxChForScale * MONO_EM_RATIO))
      )
      setFontPx(next)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxChForScale])

  return (
    <div
      className="relative w-full min-w-0 max-w-none"
      ref={blockRef}
    >
      <pre
        aria-hidden
        className="m-0 w-full min-w-0 max-w-full p-0 overflow-hidden whitespace-pre font-mono leading-[1.03] text-transparent [letter-spacing:0] [tab-size:1] select-none pointer-events-none"
        style={{ fontSize: `${fontPx}px` }}
      >
        {heightPlaceholder}
      </pre>
      <div
        className="absolute inset-0 flex min-h-0 min-w-0 items-center py-1"
        aria-label="Example event log between suite and networks"
      >
        <div className="relative h-full w-full min-h-0 min-w-0">
          <div className="h-full min-h-0 overflow-hidden overflow-x-hidden">
            <div className="h-full min-w-0 pr-0.5">
              <EventConsole
                active={sequenceItemEntered ?? true}
                feed={feed}
                embedded
                variant="carousel"
                carouselStartAlignBelowMd
                timeTone="slightlyDarker"
                swatchTone="slightlyDarker"
                getTimeColumn={(_, i) =>
                  HTTP_METHOD_LABELS[Math.min(i, HTTP_METHOD_LABELS.length - 1)]
                }
              />
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-[var(--marketing-surface)] transition-colors duration-500 ease-out"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
              maskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-[var(--marketing-surface)] transition-colors duration-500 ease-out"
            style={{
              WebkitMaskImage: "linear-gradient(to top, black, transparent)",
              maskImage: "linear-gradient(to top, black, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
