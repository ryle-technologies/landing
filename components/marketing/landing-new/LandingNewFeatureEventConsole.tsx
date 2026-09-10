"use client"

import { useCallback, useLayoutEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import {
  LANDING_FEATURE_INTERVAL_MS,
} from "@/lib/landingSnapMotion"
import { useLandingSnapLoop } from "@/lib/useLandingSnapLoop"

type MonitorEvent = {
  id: string
  type: "ISSUE" | "TRANSFER" | "DISCLOSE" | "POLICY" | "LIMIT"
  detail: string
  actor: string
  barPx: number
  barAlpha: number
}

function barWidth(seed: string, min: number, max: number) {
  let h = 2_166_136_261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16_777_619)
  }
  return min + (Math.abs(h) % (max - min + 1))
}

const EVENT_SEEDS = [
  { type: "ISSUE", detail: "50,000 USDx", actor: "treasury" },
  { type: "TRANSFER", detail: "1,200 REST", actor: "supplier" },
  { type: "DISCLOSE", detail: "opening", actor: "auditor" },
  { type: "POLICY", detail: "transfer", actor: "issuer" },
  { type: "LIMIT", detail: "10,000", actor: "issuer" },
  { type: "ISSUE", detail: "25,000 USDx", actor: "issuer" },
  { type: "TRANSFER", detail: "840 USDx", actor: "treasury" },
  { type: "DISCLOSE", detail: "balance", actor: "auditor" },
  { type: "POLICY", detail: "mint", actor: "issuer" },
  { type: "LIMIT", detail: "5,000", actor: "treasury" },
  { type: "TRANSFER", detail: "3,400 REST", actor: "supplier" },
  { type: "DISCLOSE", detail: "holder", actor: "auditor" },
] as const

const EVENTS: readonly MonitorEvent[] = EVENT_SEEDS.map((event, index) => {
  const id = `${event.type}-${event.detail}-${event.actor}-${index}`
  return {
    ...event,
    id,
    barPx: barWidth(`${id}-b`, 14, 26),
    barAlpha: 8 + (index % 4) * 2,
  }
})

const LOOPS = [...EVENTS, ...EVENTS]

const VISIBLE_ROWS = 8
const ROW_PX = 16
const FEED_H = VISIBLE_ROWS * ROW_PX

type LandingNewFeatureEventConsoleProps = {
  snapDelayMs?: number
}

function MonitorBar({
  width,
  alpha,
}: {
  width: number
  alpha: number
}) {
  return (
    <span
      aria-hidden
      className="shrink-0 rounded-[1px]"
      style={{
        display: "block",
        width,
        height: 7,
        flexShrink: 0,
        backgroundColor: `color-mix(in srgb, var(--foreground) ${alpha}%, transparent)`,
      }}
    />
  )
}

function MonitorRow({ event }: { event: MonitorEvent }) {
  return (
    <div
      className="flex min-w-0 flex-nowrap items-center font-mono text-[9px] leading-none tracking-wide"
      style={{
        height: ROW_PX,
        gap: 7,
        opacity: 0,
      }}
    >
      <span className="shrink-0 text-foreground/40">{event.type}</span>
      <span className="min-w-0 shrink truncate text-foreground/30">
        {event.detail}
      </span>
      <MonitorBar width={event.barPx} alpha={event.barAlpha} />
      <span className="shrink-0 text-foreground/25">{event.actor}</span>
    </div>
  )
}

/**
 * Attributed event feed for the monitoring card: issue, transfer, disclose,
 * policy, limit — type, amount, bar, actor.
 */
export function LandingNewFeatureEventConsole({
  snapDelayMs = 0,
}: LandingNewFeatureEventConsoleProps) {
  const reduceMotion = useReducedMotion() ?? false
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const rowPxRef = useRef(0)
  const wrapPxRef = useRef(0)
  const offsetRef = useRef(0)

  const snapTRef = useRef(0)

  const fadeIncoming = useCallback((offsetPx: number, snapT = 0) => {
    const track = trackRef.current
    const rowH = rowPxRef.current
    if (!track || rowH < 1) return
    snapTRef.current = snapT
    const startIndex = Math.floor(offsetPx / rowH + 1e-6)
    const incomingIndex = startIndex + VISIBLE_ROWS
    for (let index = 0; index < track.children.length; index += 1) {
      const el = track.children[index] as HTMLElement
      if (index < incomingIndex) {
        el.style.opacity = "1"
      } else if (index === incomingIndex) {
        el.style.opacity = String(snapT)
      } else {
        el.style.opacity = "0"
      }
    }
  }, [])

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track || track.children.length < EVENTS.length + 1) return
    const first = track.children[0] as HTMLElement
    const seam = track.children[EVENTS.length] as HTMLElement
    rowPxRef.current = first.getBoundingClientRect().height
    wrapPxRef.current = seam.offsetTop - first.offsetTop
    fadeIncoming(offsetRef.current, snapTRef.current)
  }, [fadeIncoming])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    if (track.firstElementChild) observer.observe(track.firstElementChild)
    const viewport = viewportRef.current
    if (viewport) observer.observe(viewport)
    return () => observer.disconnect()
  }, [measure])

  const apply = useCallback(
    (offsetPx: number, snapT = 0) => {
      offsetRef.current = offsetPx
      const track = trackRef.current
      if (track) track.style.transform = `translate3d(0, ${-offsetPx}px, 0)`
      fadeIncoming(offsetPx, snapT)
    },
    [fadeIncoming],
  )

  useLandingSnapLoop({
    enabled: !reduceMotion,
    getStepPx: () => rowPxRef.current,
    getWrapPx: () => wrapPxRef.current,
    apply,
    holdMs: 0,
    snapMs: LANDING_FEATURE_INTERVAL_MS,
    startDelayMs: snapDelayMs,
  })

  return (
    <div
      ref={viewportRef}
      className="relative w-full min-w-0 overflow-hidden"
      style={{ height: FEED_H }}
    >
        <div
          ref={trackRef}
          className="flex min-w-0 flex-col will-change-transform [transform:translate3d(0,0,0)]"
        >
          {LOOPS.map((event, index) => (
            <MonitorRow key={`${event.id}-${index}`} event={event} />
          ))}
        </div>
    </div>
  )
}
