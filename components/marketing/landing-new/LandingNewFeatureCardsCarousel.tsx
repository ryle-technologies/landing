"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_ATTR,
  LATTICE_SPACE,
  ceilCells,
  cellsPx,
  floorCells,
  latticeCellStrokeClassName,
} from "@/lib/landingLattice"
import {
  LANDING_CONSOLE_HOLD_MS,
  LANDING_SNAP_MS,
  landingSnapEaseInOutCubic,
} from "@/lib/landingSnapMotion"

/** Matches Tailwind `md` — this carousel is phone-only. */
const MOBILE_MQ = "(max-width: 767px)"
const FADE_TAIL_PX = cellsPx(1)

const viewportClassName =
  "touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_0,black_calc(100%-var(--feature-fade-tail)),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0,black_calc(100%-var(--feature-fade-tail)),transparent_100%)]"

const masonryChromeClassName =
  "rounded-2xl bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--border)]"

const chevronButtonClassName =
  `flex items-center justify-center text-muted transition-colors duration-200 ease-out enabled:hover:text-foreground disabled:text-muted/40 ${masonryChromeClassName}`

export function useIsMobileFeatureCarousel() {
  const [isMobile, setIsMobile] = useState(false)

  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  return isMobile
}

function columnInset(viewport: HTMLElement) {
  const column = viewport.closest(`[${LATTICE_COLUMN_ATTR}]`)
  if (!column) return LATTICE_CELL_PX
  const inset =
    column.getBoundingClientRect().left - viewport.getBoundingClientRect().left
  return inset > 0 ? inset : LATTICE_CELL_PX
}

function columnCols(viewport: HTMLElement) {
  const column = viewport.closest(`[${LATTICE_COLUMN_ATTR}]`)
  const width = column?.getBoundingClientRect().width ?? viewport.getBoundingClientRect().width
  return Math.max(1, floorCells(width))
}

function indexFromOffset(offset: number, step: number, count: number) {
  if (step < 1 || count < 1) return 0
  return Math.max(0, Math.min(count - 1, Math.round(offset / step)))
}

function clampOffset(offset: number, max: number) {
  return Math.min(max, Math.max(0, offset))
}

/**
 * Native overflow for finger-drag / wheel. Autoplay eases one card at a time
 * and pauses for as long as the row is being scrolled by the user.
 */
function useAutoSnapScroll({
  enabled,
  itemCount,
  holdMs,
  snapMs,
}: {
  enabled: boolean
  itemCount: number
  holdMs: number
  snapMs: number
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const seekRef = useRef<(index: number) => void>(() => {})
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || itemCount < 1) return

    let timeoutId = 0
    let rafId = 0
    let scrollEndId = 0
    let offset = viewport.scrollLeft
    let paused = false
    let programmatic = false

    const stepPx = () => {
      const slide = viewport.querySelector("[data-feature-slide]") as HTMLElement | null
      return slide?.getBoundingClientRect().width ?? 0
    }
    const maxPx = () => Math.max(0, stepPx() * Math.max(0, itemCount - 1))

    const report = (next: number) => {
      setIndex(indexFromOffset(next, stepPx(), itemCount))
    }

    const apply = (next: number) => {
      programmatic = true
      offset = next
      viewport.scrollLeft = next
      report(next)
      requestAnimationFrame(() => {
        programmatic = false
      })
    }

    const arm = (delay: number) => {
      window.clearTimeout(timeoutId)
      if (!enabled || itemCount < 2) return
      timeoutId = window.setTimeout(snap, delay)
    }

    const animateFromTo = (start: number, target: number, onDone: () => void) => {
      const t0 = performance.now()
      const tick = (now: number) => {
        if (paused) {
          offset = viewport.scrollLeft
          report(offset)
          onDone()
          return
        }
        const t = Math.min(1, (now - t0) / snapMs)
        apply(start + (target - start) * landingSnapEaseInOutCubic(t))
        if (t >= 1) {
          apply(target)
          onDone()
          return
        }
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    const snap = () => {
      if (paused || !enabled) {
        arm(holdMs)
        return
      }
      const step = stepPx()
      const max = maxPx()
      if (step < 1) {
        arm(50)
        return
      }
      offset = clampOffset(viewport.scrollLeft, max)
      let target = offset + step
      if (target > max + 1) target = 0
      animateFromTo(offset, target, () => arm(holdMs))
    }

    const pause = () => {
      if (programmatic) return
      paused = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
      offset = viewport.scrollLeft
    }

    const resume = () => {
      window.clearTimeout(scrollEndId)
      scrollEndId = window.setTimeout(() => {
        paused = false
        offset = viewport.scrollLeft
        report(offset)
        arm(holdMs)
      }, 140)
    }

    const onScroll = () => {
      if (programmatic) return
      paused = true
      window.clearTimeout(timeoutId)
      offset = viewport.scrollLeft
      report(offset)
      resume()
    }

    seekRef.current = (targetIndex) => {
      const step = stepPx()
      const max = maxPx()
      if (step < 1 || itemCount < 1) return
      paused = false
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
      window.clearTimeout(scrollEndId)

      const dest = clampOffset(targetIndex * step, max)
      offset = clampOffset(viewport.scrollLeft, max)
      if (Math.abs(dest - offset) < 1) {
        apply(dest)
        arm(holdMs)
        return
      }
      animateFromTo(offset, dest, () => arm(holdMs))
    }

    report(offset)
    arm(holdMs)

    viewport.addEventListener("pointerdown", pause)
    viewport.addEventListener("touchstart", pause, { passive: true })
    viewport.addEventListener("wheel", pause, { passive: true })
    viewport.addEventListener("scroll", onScroll, { passive: true })
    viewport.addEventListener("pointerup", resume)
    viewport.addEventListener("pointercancel", resume)
    viewport.addEventListener("touchend", resume)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearTimeout(scrollEndId)
      cancelAnimationFrame(rafId)
      seekRef.current = () => {}
      viewport.removeEventListener("pointerdown", pause)
      viewport.removeEventListener("touchstart", pause)
      viewport.removeEventListener("wheel", pause)
      viewport.removeEventListener("scroll", onScroll)
      viewport.removeEventListener("pointerup", resume)
      viewport.removeEventListener("pointercancel", resume)
      viewport.removeEventListener("touchend", resume)
    }
  }, [enabled, holdMs, itemCount, snapMs])

  const seekToIndex = useCallback((next: number) => {
    seekRef.current(next)
  }, [])

  return { viewportRef, index, seekToIndex }
}

function FeatureCarouselChevrons({
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}) {
  const size = LATTICE_CELL_PX
  return (
    <div className="flex shrink-0" style={{ width: cellsPx(2), height: size }}>
      <button
        type="button"
        aria-label="Previous feature"
        disabled={!canPrev}
        className={chevronButtonClassName}
        style={{ width: size, height: size }}
        onClick={onPrev}
      >
        <ChevronLeft className="size-6" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Next feature"
        disabled={!canNext}
        className={chevronButtonClassName}
        style={{ width: size, height: size }}
        onClick={onNext}
      >
        <ChevronRight className="size-6" strokeWidth={1.75} />
      </button>
    </div>
  )
}

function FeatureCarouselSlide({
  children,
  width,
  height,
}: {
  children: ReactNode
  width: number
  height: number
}) {
  return (
    <div
      data-feature-slide
      role="listitem"
      className="relative shrink-0 bg-[var(--marketing-surface)]"
      style={{ width, height }}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col">{children}</div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 ${latticeCellStrokeClassName}`}
      />
    </div>
  )
}

type LandingNewFeatureCardsCarouselProps = {
  items: readonly ReactNode[]
  cardCols: number
  minRows: number
  className?: string
}

/**
 * Phone-only horizontal carousel of the five feature cards. Chevrons sit as
 * two 1×1 masonry plates on the column, between the heading and the track.
 */
export function LandingNewFeatureCardsCarousel({
  items,
  cardCols,
  minRows,
  className = "",
}: LandingNewFeatureCardsCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const [inset, setInset] = useState(LATTICE_CELL_PX)
  const [cols, setCols] = useState(cardCols)
  const [inView, setInView] = useState(false)
  const [rows, setRows] = useState(minRows)
  const { viewportRef, index, seekToIndex } = useAutoSnapScroll({
    enabled: inView && !reduceMotion && items.length > 1,
    itemCount: items.length,
    holdMs: LANDING_CONSOLE_HOLD_MS,
    snapMs: LANDING_SNAP_MS,
  })

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const apply = () => {
      setInset(columnInset(root))
      setCols(Math.min(cardCols, Math.max(3, columnCols(root) - 1)))
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(root)
    const column = root.closest(`[${LATTICE_COLUMN_ATTR}]`)
    if (column) observer.observe(column)
    return () => observer.disconnect()
  }, [cardCols])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting === true),
      { threshold: 0.35 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const list = measureRef.current
    if (!list) return

    const apply = () => {
      let tallest = 0
      for (const slide of Array.from(list.children)) {
        const body = slide.firstElementChild as HTMLElement | null
        if (!body) continue
        const prev = body.style.height
        body.style.height = "auto"
        tallest = Math.max(tallest, body.getBoundingClientRect().height)
        body.style.height = prev
      }
      if (tallest < 1) return
      const next = ceilCells(tallest, minRows)
      setRows((prev) => (prev === next ? prev : next))
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(list)
    for (const slide of Array.from(list.children)) {
      if (slide.firstElementChild) observer.observe(slide.firstElementChild)
    }
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      observer.disconnect()
      void fonts
    }
  }, [items, minRows])

  const width = cellsPx(cols)
  const height = cellsPx(rows)
  const canPrev = index > 0
  const canNext = index < items.length - 1
  const goPrev = () => seekToIndex(index - 1)
  const goNext = () => seekToIndex(index + 1)

  return (
    <div
      ref={rootRef}
      className={`${landingViewportBleedClassName} ${LATTICE_SPACE.blockTight} ${className}`}
    >
      <div
        className="flex items-center justify-end"
        style={{
          height: cellsPx(1),
          paddingLeft: inset,
          paddingRight: inset,
        }}
      >
        <FeatureCarouselChevrons
          onPrev={goPrev}
          onNext={goNext}
          canPrev={canPrev}
          canNext={canNext}
        />
      </div>
      <div
        ref={viewportRef}
        className={viewportClassName}
        role="region"
        aria-label="Platform features"
        tabIndex={0}
        style={{
          height,
          paddingLeft: inset,
          paddingRight: inset,
          WebkitOverflowScrolling: "touch",
          ["--feature-fade-tail" as string]: `${FADE_TAIL_PX}px`,
        }}
      >
        <div ref={measureRef} role="list" className="flex h-full w-max flex-nowrap">
          {items.map((item, slideIndex) => (
            <FeatureCarouselSlide
              key={slideIndex}
              width={width}
              height={height}
            >
              {item}
            </FeatureCarouselSlide>
          ))}
        </div>
      </div>
    </div>
  )
}
