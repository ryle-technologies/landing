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
const MAX_PX = 10

/** Leading column: settlement-time style labels instead of wall-clock (matches pillar narrative). */
const SETTLEMENT_TIME_LABELS = [
  "T+0",
  "T+0",
  "T+0",
  "T+1",
  "T+1",
  "T+2",
  "T+2",
] as const

const TOP_HALF_LINE_COUNT = alphaWebHeroAsciiHalf("top").ascii.split("\n").length
const heightPlaceholder = Array(TOP_HALF_LINE_COUNT).fill("\u00a0").join("\n")

/**
 * Same horizontal width and vertical extent as a pillar `asciiHalf="top"` block,
 * with the in-app event console log sample instead of ASCII art.
 */
export function LandingHomeBanksConsole() {
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
      if (rect.width < 8 || rect.height < 8) return
      const fromWidth = rect.width / (maxChForScale * MONO_EM_RATIO)
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
  }, [maxChForScale])

  return (
    <div
      className="relative h-full min-h-0 w-full min-w-0 max-w-none"
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
        aria-label="Example event log"
      >
        <div className="relative h-full w-full min-h-0 min-w-0">
          <div className="h-full min-h-0 overflow-hidden overflow-x-hidden">
            <div className="h-full min-w-0 pr-0.5">
              <EventConsole
                active={sequenceItemEntered ?? true}
                feed={feed}
                embedded
                variant="carousel"
                timeTone="slightlyDarker"
                swatchTone="slightlyDarker"
                getTimeColumn={(_, i) =>
                  SETTLEMENT_TIME_LABELS[Math.min(i, SETTLEMENT_TIME_LABELS.length - 1)]
                }
              />
            </div>
          </div>
          {/* Top / bottom scroll fade — same surface as the pillar so it doesn’t read as a white card cut */}
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
