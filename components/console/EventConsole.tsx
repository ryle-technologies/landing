"use client"

import type { CSSProperties, ReactNode } from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { LuCornerDownRight } from "react-icons/lu"
import type { MockEventStreamControls } from "./mockEventSource"
import type { FeedEvent, HttpMethod } from "./types"

/**
 * Swatch fills: black/white at increasing opacity; no border; verb groups differ by fill only.
 */
const ROW_ENTER_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Filled blocks: HTTP verb, event type, summary (id) — same opacity per row; widths 1× : 2×+ : 4× (verb).
 */
const METHOD_SWATCH: Record<HttpMethod, string> = {
  GET: "bg-black/5 dark:bg-white/10",
  HEAD: "bg-black/5 dark:bg-white/10",
  OPTIONS: "bg-black/5 dark:bg-white/10",
  POST: "bg-black/10 dark:bg-white/12",
  PUT: "bg-black/15 dark:bg-white/16",
  PATCH: "bg-black/20 dark:bg-white/20",
  DELETE: "bg-black/25 dark:bg-white/24",
}

const METHOD_SWATCH_DARKER: Record<HttpMethod, string> = {
  GET: "bg-black/8 dark:bg-white/12",
  HEAD: "bg-black/8 dark:bg-white/12",
  OPTIONS: "bg-black/8 dark:bg-white/12",
  POST: "bg-black/13 dark:bg-white/14",
  PUT: "bg-black/18 dark:bg-white/18",
  PATCH: "bg-black/23 dark:bg-white/22",
  DELETE: "bg-black/28 dark:bg-white/26",
}

type EventConsoleSwatchTone = "default" | "slightlyDarker"
type EventConsoleTimeTone = "default" | "slightlyDarker"

/** Base width matches previous `w-9` (36px); each row is ±0–8px, stable for SSR/RSC. */
const METHOD_SWATCH_BASE_PX = 36

function methodSwatchWidthPx(id: string, rowIndex: number): number {
  const s = `${id}:${rowIndex}`
  let h = 2_166_136_261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16_777_619)
  }
  const delta = (Math.abs(h) % 17) - 8
  return METHOD_SWATCH_BASE_PX + delta
}

function verbSwatchColorClass(
  method: HttpMethod | undefined,
  failed: boolean,
  swatchTone: EventConsoleSwatchTone,
): string {
  if (method) {
    if (failed) {
      return swatchTone === "slightlyDarker"
        ? "bg-black/40 dark:bg-white/36"
        : "bg-black/35 dark:bg-white/32"
    }
    return swatchTone === "slightlyDarker"
      ? METHOD_SWATCH_DARKER[method]
      : METHOD_SWATCH[method]
  }
  return swatchTone === "slightlyDarker"
    ? "bg-black/8 dark:bg-white/10"
    : "bg-black/5 dark:bg-white/8"
}

/** Deterministic ~18% of non-first rows: visual “child of the line above”. */
function isChildOfPreviousRow(eventId: string, rowIndex: number): boolean {
  if (rowIndex === 0) return false
  let h = 2_166_136_261
  const s = `child:${eventId}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16_777_619)
  }
  return Math.abs(h) % 100 < 18
}

/** Mask: solid for ~first half, then alpha → 0 on the right (fade tail of summary bar). */
const SUMMARY_SWATCH_FADE: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, #fff 0%, #fff 32%, rgba(255, 255, 255, 0) 100%)",
  maskImage:
    "linear-gradient(to right, #fff 0%, #fff 32%, rgba(255, 255, 255, 0) 100%)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
}

/** Steady scroll speed; offset wraps by segment in rAF (no keyframe “snap” back to 0%). */
const CAROUSEL_MARQUEE_PX_PER_SEC = 22

/**
 * Duplicated first list + spacer, measured as one segment. `requestAnimationFrame` applies
 * `translateY(-offset)` and subtracts the segment when offset passes it — continuous motion
 * with no animation restart.
 */
function EventConsoleMarquee({
  active,
  embedded,
  listBody,
  remeasureKey,
  carouselStartAlignBelowMd = false,
}: {
  active: boolean
  embedded: boolean
  listBody: (keySuffix: string) => ReactNode
  remeasureKey: string | number
  /**
   * When true, the narrow `max-w-[52ch]` track is flush left below `md`; from `md` up
   * keeps `mx-auto` like the default carousel layout.
   */
  carouselStartAlignBelowMd?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const segmentPxRef = useRef(0)
  const offsetPxRef = useRef(0)
  const lastTsRef = useRef<number | null>(null)
  const rafIdRef = useRef(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return

    const run = () => {
      const firstOl = el.querySelector(":scope > ol")
      if (!firstOl) return
      const pad = firstOl.nextElementSibling
      if (!pad) return
      const a = (firstOl as HTMLElement).getBoundingClientRect().height
      const b = (pad as HTMLElement).getBoundingClientRect().height
      const seg = a + b
      if (seg < 2) return
      const prev = segmentPxRef.current
      segmentPxRef.current = seg
      if (prev > 0) {
        let o = offsetPxRef.current % seg
        if (Number.isNaN(o) || o < 0) o = 0
        offsetPxRef.current = o
      }
    }

    run()
    const ro = new ResizeObserver(() => {
      run()
    })
    ro.observe(el)
    for (const ch of el.children) ro.observe(ch)
    return () => ro.disconnect()
  }, [remeasureKey, embedded])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    if (reduceMotion || !active) {
      offsetPxRef.current = 0
      lastTsRef.current = null
      el.style.transform = "translate3d(0, 0, 0)"
      return
    }

    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts
      const rawDt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      const dt = Math.min(Math.max(0, rawDt), 0.05)

      const seg = segmentPxRef.current
      if (seg >= 2) {
        offsetPxRef.current += CAROUSEL_MARQUEE_PX_PER_SEC * dt
        while (offsetPxRef.current >= seg) {
          offsetPxRef.current -= seg
        }
        el.style.transform = `translate3d(0, ${-offsetPxRef.current}px, 0)`
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafIdRef.current)
      lastTsRef.current = null
    }
  }, [active, reduceMotion])

  useEffect(() => {
    if (reduceMotion && trackRef.current) {
      trackRef.current.style.transform = ""
    }
  }, [reduceMotion])

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden text-foreground">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ec-event-console-dup, .ec-event-console-dup-pad { display: none !important; }
        }
      `}</style>
      <div
        className={[
          "flex h-full min-h-0 w-full min-w-0 max-w-[52ch] min-[1080px]:max-w-none",
          carouselStartAlignBelowMd ? "mx-0 md:mx-auto" : "mx-auto",
        ].join(" ")}
      >
        <div
          ref={trackRef}
          className="ec-event-console-track flex min-h-0 w-full min-w-0 flex-col will-change-transform [transform:translate3d(0,0,0)]"
        >
          <ol className="flex min-w-0 shrink-0 flex-col font-mono text-sm leading-relaxed tracking-tight">
            {listBody("")}
          </ol>
          {embedded ? (
            <div className="h-6 w-full shrink-0" aria-hidden />
          ) : (
            <div className="h-12 w-full shrink-0" aria-hidden />
          )}
          <ol
            className="ec-event-console-dup flex min-w-0 shrink-0 flex-col font-mono text-sm leading-relaxed tracking-tight"
            aria-hidden
          >
            {listBody("-dup")}
          </ol>
          {embedded ? (
            <div className="ec-event-console-dup-pad h-6 w-full shrink-0" aria-hidden />
          ) : (
            <div className="ec-event-console-dup-pad h-12 w-full shrink-0" aria-hidden />
          )}
        </div>
      </div>
    </aside>
  )
}

/**
 * Event log — height follows rows. No internal scroll; embed in a column that scrolls
 * at the page level if needed. Pass the same `feed` from `useMockEventStream()`.
 *
 * `variant="carousel"`: two stacked list copies; vertical offset is advanced in a rAF loop and
 * wrapped by one segment height so motion never “snaps” at the loop point. Use inside
 * a fixed-height, `overflow-hidden` parent (e.g. marketing hero strip). Otherwise row motion.
 */
export function EventConsole({
  active = true,
  feed,
  embedded = true,
  getTimeColumn,
  timeTone = "default",
  swatchTone = "default",
  variant = "default",
  carouselStartAlignBelowMd = false,
}: {
  /** Pauses and resets carousel motion when false. */
  active?: boolean
  feed: MockEventStreamControls
  embedded?: boolean
  /**
   * When set, replaces the leading `HH:MM:SS` column (e.g. settlement-style `T+0` labels for marketing).
   */
  getTimeColumn?: (event: FeedEvent, index: number) => string
  /** Slightly stronger leading time labels for marketing embeds. */
  timeTone?: EventConsoleTimeTone
  /** Slightly stronger swatches for marketing embeds that need more contrast. */
  swatchTone?: EventConsoleSwatchTone
  /** `carousel` = continuous upward marquee; `default` = line-by-line presence animation. */
  variant?: "default" | "carousel"
  /**
   * `variant="carousel"` only: below `md`, align the `max-w-[52ch]` track to the start instead
   * of centering (`mx-auto`). From `md` up keeps centered track. Default `false`.
   */
  carouselStartAlignBelowMd?: boolean
}) {
  const { events } = feed
  const isCarousel = variant === "carousel" && events.length > 0

  const listBody = (keySuffix: string) =>
    events.map((e, index) => (
      <EventRow
        key={`${e.id}${keySuffix}`}
        event={e}
        rowIndex={index}
        getTimeColumn={getTimeColumn}
        timeTone={timeTone}
        swatchTone={swatchTone}
        presentation={isCarousel ? "marquee" : "default"}
      />
    ))

  if (isCarousel) {
    return (
      <EventConsoleMarquee
        active={active}
        embedded={embedded}
        listBody={listBody}
        remeasureKey={events.length}
        carouselStartAlignBelowMd={carouselStartAlignBelowMd}
      />
    )
  }

  return (
    <aside className="min-w-0 w-full overflow-visible text-foreground">
      <div className="mx-auto min-w-0 max-w-[52ch] min-[1080px]:mx-0 min-[1080px]:max-w-none">
        <ol className="flex min-w-0 flex-col font-mono text-sm leading-relaxed tracking-tight">
          {events.length === 0 ? (
            <li className="flex items-center gap-2 text-muted">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-[color:var(--muted)] animate-pulse"
              />
              listening for events…
            </li>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {events.map((e, index) => (
                <EventRow
                  key={e.id}
                  event={e}
                  rowIndex={index}
                  getTimeColumn={getTimeColumn}
                  timeTone={timeTone}
                  swatchTone={swatchTone}
                  presentation="default"
                />
              ))}
            </AnimatePresence>
          )}
        </ol>

        <div className={embedded ? "h-6" : "h-12"} aria-hidden />
      </div>
    </aside>
  )
}

function EventRow({
  event,
  rowIndex,
  getTimeColumn,
  timeTone,
  swatchTone,
  presentation = "default",
}: {
  event: FeedEvent
  rowIndex: number
  getTimeColumn?: (event: FeedEvent, index: number) => string
  timeTone: EventConsoleTimeTone
  swatchTone: EventConsoleSwatchTone
  /** `marquee` = no row motion (used inside seamless CSS vertical scroll). */
  presentation?: "default" | "marquee"
}) {
  const isMarquee = presentation === "marquee"
  const failed = event.status === "failed"
  const pending = event.status === "pending"
  const time = getTimeColumn
    ? getTimeColumn(event, rowIndex)
    : formatTime(event.ts)
  const method = event.method
  const swatchW = methodSwatchWidthPx(event.id, rowIndex)
  const typeSwatchW = Math.max(
    methodSwatchWidthPx(`${event.id}-type`, rowIndex),
    swatchW * 2,
  )
  /** Summary / id — 4× the verb block width, same as user ratio (1 : 2 : 4). */
  const summarySwatchW = swatchW * 4
  const swatchClass = verbSwatchColorClass(method, failed, swatchTone)
  const timeClass =
    timeTone === "slightlyDarker" ? "text-foreground/70" : "text-muted"
  const childRow = isChildOfPreviousRow(event.id, rowIndex)
  const liClass = childRow
    ? failed
      ? "pl-1.5 text-[#c0382b] sm:pl-2"
      : "pl-1.5 sm:pl-2"
    : failed
      ? "text-[#c0382b]"
      : undefined

  const rowInner = (
    <div
      className={`flex w-full min-w-0 flex-nowrap gap-2 text-left ${
        childRow ? "items-center" : "items-baseline"
      }`}
    >
      {childRow ? (
        <LuCornerDownRight
          aria-hidden
          className="pointer-events-none h-3.5 w-3.5 shrink-0 text-muted"
          strokeWidth={2}
        />
      ) : null}
      <span className={`shrink-0 ${timeClass}`}>{time}</span>
      <span
        className={`inline-block shrink-0 self-center h-3.5 rounded-sm ${swatchClass}`}
        style={{ width: swatchW }}
        title={method ?? undefined}
        aria-hidden
      />
      <span
        className={`inline-block shrink-0 self-center h-3.5 rounded-sm ${swatchClass}`}
        style={{ width: typeSwatchW }}
        aria-hidden
      />
      {isMarquee ? (
        <span
          className={`inline-block shrink-0 self-center h-3.5 min-w-0 max-w-full origin-right rounded-sm ${swatchClass}`}
          style={{ width: summarySwatchW, ...SUMMARY_SWATCH_FADE }}
          aria-hidden
        />
      ) : (
        <motion.span
          className={`inline-block shrink-0 self-center h-3.5 min-w-0 max-w-full origin-right rounded-sm ${swatchClass}`}
          style={{ width: summarySwatchW, ...SUMMARY_SWATCH_FADE }}
          aria-hidden
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: pending ? 0.7 : 1, x: 0 }}
          transition={{
            opacity: { duration: 0.5, delay: 0.1, ease: ROW_ENTER_EASE },
            x: { duration: 0.5, delay: 0.1, ease: ROW_ENTER_EASE },
          }}
        />
      )}
      <span className="sr-only">
        {childRow ? "Continues the event above. " : null}
        {method ? `${method} ` : ""}
        {event.type} {event.summary}
      </span>
    </div>
  )

  if (isMarquee) {
    return (
      <li className={liClass ?? ""} data-event-id={String(event.id)}>
        {rowInner}
      </li>
    )
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        layout: { duration: 0.32, ease: ROW_ENTER_EASE },
        opacity: { duration: 0.32, ease: ROW_ENTER_EASE },
        y: { duration: 0.32, ease: ROW_ENTER_EASE },
      }}
      className={liClass}
      data-event-id={String(event.id)}
    >
      {rowInner}
    </motion.li>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const ss = String(d.getSeconds()).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}
