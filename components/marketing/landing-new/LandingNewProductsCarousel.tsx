"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useReducedMotion } from "motion/react"
import {
  LandingNewUseCaseShape,
  USE_CASE_SHAPE_REVERT_MS,
} from "@/components/marketing/landing-new/LandingNewUseCaseShape"
import {
  LandingNewUseCaseTitleReveal,
  useCaseTitleRevealMs,
} from "@/components/marketing/landing-new/LandingNewUseCaseTitleReveal"
import type { LandingNewUseCaseShapeKind } from "@/lib/landingNewUseCaseSolids"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_ATTR,
  latticeCellStrokeClassName,
} from "@/lib/landingLattice"
import {
  LANDING_SNAP_EASE_BEZIER,
  LANDING_SNAP_HOLD_MS,
  LANDING_SNAP_MS,
} from "@/lib/landingSnapMotion"

export type LandingNewProductsCarouselItem = {
  /** Card title. Sets the expanded card's width. */
  label: string
  /** Optional mono badge under the title (e.g. "In design with partners"). */
  badge?: string
  /** Description, revealed once the tile has expanded. */
  body: string
  /** 2D idle plate / 3D solid for this use case. */
  shape: LandingNewUseCaseShapeKind
  /** Optional decorative visual rendered above the description. */
  visual?: ReactNode
  /** Optional CTA rendered under the description on the expanded card. */
  cta?: { label: string; href: string; external?: boolean }
}

type LandingNewProductsCarouselProps = {
  items: readonly LandingNewProductsCarouselItem[]
  /** Accessible name for the use-case region. */
  ariaLabel: string
  className?: string
  /** Milliseconds to hold an expanded tile before the next. 0 disables autoplay. */
  autoplayDelayMs?: number
  /** Keep idle 2D plates — skip the 3D sketch when a tile is live. */
  flatShapes?: boolean
}

/**
 * The first lattice cell is the stage. A tile grows there, showcases, settles
 * back to 2D, collapses, then the whole row slides one cell left so the next
 * tile lands on the stage. The row repeats both ways so tiles reach the page
 * edges; the right five fade out, and a shorter fade covers the left. Viewport
 * height is reserved to the tallest expanded tile so grow/collapse never moves
 * the page.
 *
 * Render it full-bleed inside a `LatticeSection` column: the stage's left
 * edge is the column's left edge, so every tile edge is a lattice line.
 */
const CELL = LATTICE_CELL_PX
const CONTRACTED_COLS = 1
const CONTRACTED_ROWS = 1
const MIN_EXPANDED_COLS = 4
const MAX_COLS = 8
const MIN_EXPANDED_ROWS = 4
const DEFAULT_EXPANDED_ROWS = 5
const CARD_PAD_X = 32
const SHAPE_SLOT_PX = CELL

const HOLD_MS = LANDING_SNAP_HOLD_MS
const EXPAND_MS = LANDING_SNAP_MS
const SLIDE_MS = LANDING_SNAP_MS
const TEXT_FADE_MS = 320
const TEXT_HIDE_MS = 150
const FADE_TAIL_ITEMS = 5
const FADE_TAIL_PX = FADE_TAIL_ITEMS * CELL
const FADE_LEAD_ITEMS = 2
const FADE_LEAD_PX = FADE_LEAD_ITEMS * CELL
const SNAP_EASE = `cubic-bezier(${LANDING_SNAP_EASE_BEZIER.join(", ")})`

/** Left padding that puts the stage on the enclosing lattice column's left edge. */
function columnInset(viewport: HTMLElement) {
  const column = viewport.closest(`[${LATTICE_COLUMN_ATTR}]`)
  if (!column) return CELL
  const inset = column.getBoundingClientRect().left - viewport.getBoundingClientRect().left
  return inset > 0 ? inset : CELL
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function estimateCols(label: string) {
  return clamp(
    Math.ceil((label.length * 12 + 2 * CARD_PAD_X) / CELL),
    MIN_EXPANDED_COLS,
    MAX_COLS,
  )
}

function sizePx(cells: number) {
  return cells * CELL
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

type TileMetrics = {
  cols: number
  rows: number
}

const cardTitleClassName =
  "text-left font-sans text-[20px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-500 ease-out sm:text-[22px]"

const cardBadgeClassName =
  "mt-2 block text-left font-mono text-[11px] uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"

const cardBodyClassName =
  "text-left font-sans text-[14px] font-normal leading-[1.5] text-foreground transition-colors duration-500 ease-out sm:text-[15px]"

const cardCtaClassName =
  "inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-[-0.01em] text-foreground transition-[border-color,opacity,color] duration-500 ease-out hover:border-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

const cardCopyClassName =
  "flex w-full flex-col items-start px-8 pb-8 pt-16"

function UseCaseCardCopy({
  item,
  cta,
  title,
  restStyle,
}: {
  item: LandingNewProductsCarouselItem
  cta?: ReactNode
  title?: ReactNode
  restStyle?: CSSProperties
}) {
  return (
    <>
      <h3 aria-hidden className={`${cardTitleClassName} pb-2`}>
        {title ?? item.label}
        {item.badge ? (
          <span className={cardBadgeClassName} style={restStyle}>
            {item.badge}
          </span>
        ) : null}
      </h3>
      <div style={restStyle}>
        {item.visual ? (
          <div
            aria-hidden
            className="relative mb-5 w-full min-w-0 shrink-0 overflow-hidden"
          >
            {item.visual}
          </div>
        ) : null}
        <p className={cardBodyClassName}>{item.body}</p>
        {cta}
      </div>
    </>
  )
}

export function LandingNewProductsCarousel({
  items,
  ariaLabel,
  className,
  autoplayDelayMs = HOLD_MS,
  flatShapes = false,
}: LandingNewProductsCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false
  const autoplayEnabled = autoplayDelayMs > 0 && !reduceMotion
  const count = items.length

  const viewportRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const copyRefs = useRef<(HTMLDivElement | null)[]>([])
  const headRef = useRef(0)
  const expandedRef = useRef(false)
  const liveRef = useRef(false)
  const pendingGrowRef = useRef(false)
  const autoplayTimerId = useRef(0)
  const chainTimerId = useRef(0)

  const [head, setHead] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [live, setLive] = useState(false)
  const [slidePx, setSlidePx] = useState(0)
  const [slideSteps, setSlideSteps] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [metrics, setMetrics] = useState<TileMetrics[]>(() =>
    items.map((item) => ({
      cols: estimateCols(item.label),
      rows: DEFAULT_EXPANDED_ROWS,
    })),
  )
  const [inset, setInset] = useState(CELL)
  const [fillSlots, setFillSlots] = useState(count)
  const [leadSlots, setLeadSlots] = useState(2)

  headRef.current = head
  expandedRef.current = expanded
  liveRef.current = live

  const clearChain = () => {
    if (chainTimerId.current) {
      window.clearTimeout(chainTimerId.current)
      chainTimerId.current = 0
    }
  }

  const after = (ms: number, fn: () => void) => {
    clearChain()
    if (ms <= 0) {
      fn()
      return
    }
    chainTimerId.current = window.setTimeout(() => {
      chainTimerId.current = 0
      fn()
    }, ms)
  }

  const openStage = useCallback(() => {
    window.clearTimeout(autoplayTimerId.current)
    setLive(false)
    if (reduceMotion) {
      pendingGrowRef.current = false
      setExpanded(true)
      setLive(true)
      return
    }
    pendingGrowRef.current = true
    setExpanded(false)
  }, [reduceMotion])

  useLayoutEffect(() => {
    if (!pendingGrowRef.current || reduceMotion) return
    const frame = window.requestAnimationFrame(() => {
      if (!pendingGrowRef.current) return
      pendingGrowRef.current = false
      setExpanded(true)
      after(EXPAND_MS, () => setLive(true))
    })
    return () => window.cancelAnimationFrame(frame)
  })

  const rotateTo = useCallback(
    (nextHead: number) => {
      const steps = wrapIndex(nextHead - headRef.current, count)
      if (steps === 0) {
        openStage()
        return
      }
      if (reduceMotion) {
        setHead(nextHead)
        setSlidePx(0)
        setSlideSteps(0)
        setSliding(false)
        openStage()
        return
      }
      setSliding(true)
      setSlideSteps(steps)
      setSlidePx(-steps * CELL)
      after(SLIDE_MS, () => {
        setHead(nextHead)
        setSlideSteps(0)
        setSlidePx(0)
        setSliding(false)
        openStage()
      })
    },
    [count, openStage, reduceMotion],
  )

  const goTo = useCallback(
    (nextHead: number) => {
      window.clearTimeout(autoplayTimerId.current)
      const advance = () => rotateTo(wrapIndex(nextHead, count))

      if (liveRef.current) {
        setLive(false)
        const titleExitMs = useCaseTitleRevealMs(
          items[headRef.current]?.label ?? "",
        )
        const revertMs = flatShapes ? titleExitMs : Math.max(USE_CASE_SHAPE_REVERT_MS, titleExitMs)
        after(
          reduceMotion
            ? 0
            : revertMs,
          () => {
            setExpanded(false)
            after(reduceMotion ? 0 : EXPAND_MS, advance)
          },
        )
        return
      }
      if (expandedRef.current) {
        setExpanded(false)
        after(reduceMotion ? 0 : EXPAND_MS, advance)
        return
      }
      advance()
    },
    [count, flatShapes, items, reduceMotion, rotateTo],
  )

  const goToRef = useRef(goTo)
  useEffect(() => {
    goToRef.current = goTo
  }, [goTo])

  useEffect(() => {
    if (count === 0) return
    openStage()
    return () => {
      clearChain()
      window.clearTimeout(autoplayTimerId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  useEffect(() => {
    if (!autoplayEnabled || count < 2) return
    if (!live) return

    window.clearTimeout(autoplayTimerId.current)
    autoplayTimerId.current = window.setTimeout(() => {
      goToRef.current(headRef.current + 1)
    }, autoplayDelayMs)

    return () => window.clearTimeout(autoplayTimerId.current)
  }, [autoplayEnabled, autoplayDelayMs, live, count])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const measure = () => {
      const nextViewWidth = viewport.getBoundingClientRect().width
      if (nextViewWidth < 2) return
      const nextInset = columnInset(viewport)
      setInset((prev) => (Math.abs(prev - nextInset) < 0.5 ? prev : nextInset))
      const nextLead = Math.max(1, Math.floor(nextInset / CELL))
      setLeadSlots((prev) => (prev === nextLead ? prev : nextLead))
      const cellsToEdge = Math.ceil((nextViewWidth - nextInset) / CELL) + 1
      setFillSlots((prev) => {
        const next = Math.max(count, cellsToEdge)
        return prev === next ? prev : next
      })
      const maxCols = clamp(
        Math.floor((nextViewWidth - nextInset - CELL) / CELL),
        MIN_EXPANDED_COLS,
        MAX_COLS,
      )
      const nextCols = items.map((item, i) => {
        const titleW = titleRefs.current[i]?.getBoundingClientRect().width ?? 0
        return titleW < 1
          ? clamp(estimateCols(item.label), MIN_EXPANDED_COLS, maxCols)
          : clamp(
              Math.ceil((titleW + 2 * CARD_PAD_X) / CELL),
              MIN_EXPANDED_COLS,
              maxCols,
            )
      })
      nextCols.forEach((cols, i) => {
        const sizer = copyRefs.current[i]
        if (sizer) sizer.style.width = `${sizePx(cols)}px`
      })
      const next = items.map((_, i) => {
        const copyH = copyRefs.current[i]?.offsetHeight ?? 0
        const rows = Math.max(
          MIN_EXPANDED_ROWS,
          copyH > 0 ? Math.ceil(copyH / CELL) : DEFAULT_EXPANDED_ROWS,
        )
        return { cols: nextCols[i]!, rows }
      })
      setMetrics((prev) =>
        prev.length === next.length &&
        prev.every((m, i) => m.cols === next[i].cols && m.rows === next[i].rows)
          ? prev
          : next,
      )
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    const column = viewport.closest(`[${LATTICE_COLUMN_ATTR}]`)
    if (column) ro.observe(column)
    window.addEventListener("resize", measure)
    const fonts = document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
      void fonts
    }
  }, [items, count])

  if (count === 0) return null

  const stageRows = metrics.reduce(
    (max, item) => Math.max(max, item.rows),
    DEFAULT_EXPANDED_ROWS,
  )
  const stageHeight = sizePx(stageRows)
  const slotCount = leadSlots + fillSlots + slideSteps
  const slots = Array.from({ length: slotCount }, (_, slot) => ({
    slot,
    itemIndex: wrapIndex(head + (slot - leadSlots), count),
    repeat: slot < leadSlots || slot >= leadSlots + count,
  }))
  const fadeLeadPx = Math.min(FADE_LEAD_PX, Math.max(0, inset - CELL))

  return (
    <div
      ref={viewportRef}
      className={["relative w-full min-w-0", className ?? ""].join(" ")}
      role="region"
      aria-label={ariaLabel}
      style={{ height: stageHeight, minHeight: stageHeight }}
    >
      {/*
       * Copy-height probe. `h-0 overflow-hidden` keeps the stacked copies from
       * adding thousands of pixels of scrollable overflow below the page.
       */}
      <div
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 h-0 overflow-hidden"
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            ref={(node) => {
              copyRefs.current[i] = node
            }}
            className={cardCopyClassName}
            style={{ width: sizePx(metrics[i]?.cols ?? estimateCols(item.label)) }}
          >
            <UseCaseCardCopy
              item={item}
              cta={
                item.cta ? (
                  <span className={`${cardCtaClassName} mt-5`}>
                    {item.cta.label}
                  </span>
                ) : null
              }
            />
          </div>
        ))}
      </div>
      <div
        className="overflow-x-clip overflow-y-hidden [mask-image:linear-gradient(to_right,transparent_0,transparent_32px,black_var(--use-case-fade-lead),black_calc(100%-var(--use-case-fade)),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,transparent_32px,black_var(--use-case-fade-lead),black_calc(100%-var(--use-case-fade)),transparent_100%)]"
        style={{
          paddingLeft: inset,
          height: stageHeight,
          ["--use-case-fade" as string]: `${FADE_TAIL_PX}px`,
          ["--use-case-fade-lead" as string]: `${fadeLeadPx}px`,
        }}
      >
        <div
          role="list"
          className="landing-new-use-case-track flex flex-nowrap items-start content-start"
          style={{
            transform: `translate3d(${slidePx - leadSlots * CELL}px, 0, 0)`,
            transition: sliding && !reduceMotion
              ? `transform ${SLIDE_MS}ms ${SNAP_EASE}`
              : "none",
          }}
        >
          {slots.map(({ slot, itemIndex, repeat }) => {
            const item = items[itemIndex]!
            const isStage = slot === leadSlots
            const isExpanded = isStage && expanded
            const isLive = isStage && live
            const { cols, rows } = metrics[itemIndex] ?? {
              cols: estimateCols(item.label),
              rows: DEFAULT_EXPANDED_ROWS,
            }
            const cardStyle: CSSProperties = {
              width: sizePx(isExpanded ? cols : CONTRACTED_COLS),
              height: sizePx(isExpanded ? rows : CONTRACTED_ROWS),
              transition: reduceMotion
                ? "none"
                : `height ${EXPAND_MS}ms ${SNAP_EASE}`,
            }
            const textStyle: CSSProperties = {
              opacity: isLive ? 1 : 0,
              transition: reduceMotion
                ? "none"
                : isLive
                  ? `opacity ${TEXT_FADE_MS}ms ease-out`
                  : `opacity ${TEXT_HIDE_MS}ms ease-out`,
            }

            return (
              <article
                key={`${item.label}::${slot}`}
                role="listitem"
                aria-hidden={repeat || undefined}
                className={[
                  "landing-new-use-case-card relative shrink-0",
                  isExpanded ? "z-[2]" : "z-[1]",
                ].join(" ")}
                style={cardStyle}
              >
                {/* Stroke above the paper button so tiles read as lattice cells. */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 z-10 ${latticeCellStrokeClassName}`}
                />
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={item.label}
                  aria-hidden={repeat || undefined}
                  tabIndex={repeat ? -1 : undefined}
                  onClick={() => {
                    if (itemIndex === headRef.current && expandedRef.current) return
                    goTo(itemIndex)
                  }}
                  className={[
                    "absolute inset-0 overflow-hidden bg-[var(--marketing-surface)] text-left",
                    isExpanded
                      ? ""
                      : "landing-new-use-case-card-idle hover:bg-[color-mix(in_srgb,var(--foreground)_6%,var(--marketing-surface))]",
                  ].join(" ")}
                >
                  {!repeat ? (
                    <span
                      ref={(node) => {
                        titleRefs.current[itemIndex] = node
                      }}
                      aria-hidden
                      className={`${cardTitleClassName} pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap`}
                    >
                      {item.label}
                    </span>
                  ) : null}

                  <div
                    className="landing-new-use-case-shape-slot pointer-events-none absolute overflow-visible"
                    style={{
                      top: 0,
                      left: 0,
                      width: SHAPE_SLOT_PX,
                      height: SHAPE_SLOT_PX,
                    }}
                  >
                    <LandingNewUseCaseShape
                      kind={item.shape}
                      active={isLive && !flatShapes}
                    />
                  </div>

                  <div className={cardCopyClassName}>
                    <UseCaseCardCopy
                      item={item}
                      title={
                        <LandingNewUseCaseTitleReveal
                          label={item.label}
                          active={isLive}
                        />
                      }
                      restStyle={textStyle}
                      cta={
                        item.cta ? (
                          <a
                            href={item.cta.href}
                            className={`${cardCtaClassName} mt-5`}
                            tabIndex={isLive ? 0 : -1}
                            onClick={(event) => event.stopPropagation()}
                            {...(item.cta.external
                              ? { target: "_blank", rel: "noreferrer noopener" }
                              : {})}
                          >
                            {item.cta.label}
                          </a>
                        ) : null
                      }
                    />
                  </div>
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
