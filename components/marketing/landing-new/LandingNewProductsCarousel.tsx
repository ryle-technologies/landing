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
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"
import {
  LandingNewUseCaseShape,
  USE_CASE_SHAPE_REVERT_MS,
} from "@/components/marketing/landing-new/LandingNewUseCaseShape"
import type { LandingNewUseCaseShapeKind } from "@/lib/landingNewUseCaseSolids"
import {
  HERO_GRID_CELL_PX,
  HERO_GRID_LINE_DARK,
  HERO_GRID_LINE_LIGHT,
} from "@/lib/landingNewHeroGrid"
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
  /**
   * Attribute on the section's 60px lattice origin (see `LandingNewHeroGrid`).
   * The cluster is nudged so every tile edge sits on a lattice line.
   */
  gridOriginAttr: string
}

/**
 * The first lattice cell is the stage. A tile grows there, showcases, settles
 * back to 2D, collapses, then the whole row slides one cell left so the next
 * tile lands on the stage. The row repeats past the unique list so tiles reach
 * the right edge of the page; the last five fade out. Viewport height is
 * reserved to the tallest expanded tile so grow/collapse never moves the page.
 */
const CELL = HERO_GRID_CELL_PX
const CONTRACTED_COLS = 1
const CONTRACTED_ROWS = 1
const MIN_EXPANDED_COLS = 4
const MAX_COLS = 8
const MIN_EXPANDED_ROWS = 4
const DEFAULT_EXPANDED_ROWS = 5
const CARD_PAD_X = 24
const SHAPE_SLOT_PX = CELL

const CONTENT_COLUMN_PX = 1088
const CONTENT_COLUMN_PAD_PX = 24
const PLATE_PAD_PX = 8
const GRID_OFFSET_EPSILON = 0.5

const HOLD_MS = LANDING_SNAP_HOLD_MS
const EXPAND_MS = LANDING_SNAP_MS
const SLIDE_MS = LANDING_SNAP_MS
const TEXT_FADE_MS = 320
const TEXT_HIDE_MS = 150
const FADE_TAIL_ITEMS = 5
const FADE_TAIL_PX = FADE_TAIL_ITEMS * CELL
const SNAP_EASE = `cubic-bezier(${LANDING_SNAP_EASE_BEZIER.join(", ")})`

/** Survives Strict Mode remounts so the cycle does not stack. */
let autoplayTimerId = 0
let chainTimerId = 0

function clusterInset(viewSize: number) {
  if (viewSize < CONTENT_COLUMN_PX + 2 * CONTENT_COLUMN_PAD_PX) return CELL
  return (viewSize - CONTENT_COLUMN_PX) / 2 + CONTENT_COLUMN_PAD_PX - PLATE_PAD_PX
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function estimateCols(label: string) {
  return clamp(
    Math.ceil((label.length * 13 + 2 * CARD_PAD_X) / CELL),
    MIN_EXPANDED_COLS,
    MAX_COLS,
  )
}

function sizePx(cells: number) {
  return cells * CELL + 1
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

type TileMetrics = {
  cols: number
  rows: number
}

const cardTitleClassName =
  "text-left font-sans text-[26px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-500 ease-out sm:text-[28px]"

const cardBadgeClassName =
  "mt-2 block text-left font-mono text-[11px] uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"

const cardBodyClassName =
  "text-left font-sans text-[14px] font-normal leading-[1.5] text-foreground transition-colors duration-500 ease-out sm:text-[15px]"

const cardCtaClassName =
  "inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-[-0.01em] text-foreground transition-[border-color,opacity,color] duration-500 ease-out hover:border-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

const cardCopyClassName =
  "flex w-full flex-col items-start px-6 pb-8 pt-10"

function UseCaseCardCopy({
  item,
  cta,
}: {
  item: LandingNewProductsCarouselItem
  cta?: ReactNode
}) {
  return (
    <>
      <h3 className={`${cardTitleClassName} pb-2`}>
        {item.label}
        {item.badge ? (
          <span className={cardBadgeClassName}>{item.badge}</span>
        ) : null}
      </h3>
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
    </>
  )
}

export function LandingNewProductsCarousel({
  items,
  ariaLabel,
  className,
  autoplayDelayMs = HOLD_MS,
  gridOriginAttr,
}: LandingNewProductsCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false
  const autoplayEnabled = autoplayDelayMs > 0 && !reduceMotion
  const isDark = useMarketingTheme()?.isDark ?? false
  const count = items.length

  const viewportRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const copyRefs = useRef<(HTMLDivElement | null)[]>([])
  const headRef = useRef(0)
  const expandedRef = useRef(false)
  const liveRef = useRef(false)
  const gridOffsetRef = useRef({ x: 0, y: 0 })

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
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 })

  headRef.current = head
  expandedRef.current = expanded
  liveRef.current = live

  const clearChain = () => {
    if (chainTimerId) {
      window.clearTimeout(chainTimerId)
      chainTimerId = 0
    }
  }

  const after = (ms: number, fn: () => void) => {
    clearChain()
    if (ms <= 0) {
      fn()
      return
    }
    chainTimerId = window.setTimeout(() => {
      chainTimerId = 0
      fn()
    }, ms)
  }

  const openStage = useCallback(() => {
    window.clearTimeout(autoplayTimerId)
    setLive(false)
    setExpanded(true)
    if (reduceMotion) {
      setLive(true)
      return
    }
    after(EXPAND_MS, () => setLive(true))
  }, [reduceMotion])

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
      window.clearTimeout(autoplayTimerId)
      const advance = () => rotateTo(wrapIndex(nextHead, count))

      if (liveRef.current) {
        setLive(false)
        after(reduceMotion ? 0 : USE_CASE_SHAPE_REVERT_MS, () => {
          setExpanded(false)
          after(reduceMotion ? 0 : EXPAND_MS, advance)
        })
        return
      }
      if (expandedRef.current) {
        setExpanded(false)
        after(reduceMotion ? 0 : EXPAND_MS, advance)
        return
      }
      advance()
    },
    [count, reduceMotion, rotateTo],
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
      window.clearTimeout(autoplayTimerId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  useEffect(() => {
    if (!autoplayEnabled || count < 2) return
    if (!live) return

    window.clearTimeout(autoplayTimerId)
    autoplayTimerId = window.setTimeout(() => {
      goToRef.current(headRef.current + 1)
    }, autoplayDelayMs)

    return () => window.clearTimeout(autoplayTimerId)
  }, [autoplayEnabled, autoplayDelayMs, live, count])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const measure = () => {
      const nextViewWidth = viewport.getBoundingClientRect().width
      if (nextViewWidth < 2) return
      const nextInset = clusterInset(nextViewWidth)
      setInset((prev) => (Math.abs(prev - nextInset) < 0.5 ? prev : nextInset))
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
    const fonts = document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      void fonts
    }
  }, [items])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const apply = () => {
      const originEl = document.querySelector(`[${gridOriginAttr}]`)
      if (!originEl) return
      const origin = originEl.getBoundingClientRect()
      const rect = viewport.getBoundingClientRect()
      if (rect.width < 2) return
      const applied = gridOffsetRef.current
      const padLeft = clusterInset(rect.width)
      const naturalLeft = rect.left + padLeft - origin.left - applied.x
      const naturalTop = rect.top - origin.top - applied.y
      const x = Math.floor(naturalLeft / CELL) * CELL - naturalLeft
      const y = (Math.ceil(naturalTop / CELL) - 1) * CELL - naturalTop
      if (
        Math.abs(x - applied.x) < GRID_OFFSET_EPSILON &&
        Math.abs(y - applied.y) < GRID_OFFSET_EPSILON
      ) {
        return
      }
      const next = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }
      gridOffsetRef.current = next
      setGridOffset(next)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(viewport)
    const originEl = document.querySelector(`[${gridOriginAttr}]`)
    if (originEl) ro.observe(originEl)
    window.addEventListener("resize", apply)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", apply)
      void fonts
    }
  }, [gridOriginAttr, metrics])

  if (count === 0) return null

  const lineColor = isDark ? HERO_GRID_LINE_DARK : HERO_GRID_LINE_LIGHT
  const stageRows = metrics.reduce(
    (max, item) => Math.max(max, item.rows),
    DEFAULT_EXPANDED_ROWS,
  )
  const stageHeight = sizePx(stageRows)
  const slotCount = fillSlots + slideSteps
  const slots = Array.from({ length: slotCount }, (_, slot) => ({
    slot,
    itemIndex: wrapIndex(head + slot, count),
    repeat: slot >= count,
  }))

  return (
    <div
      ref={viewportRef}
      className={["relative w-full min-w-0", className ?? ""].join(" ")}
      role="region"
      aria-label={ariaLabel}
      style={{
        height: stageHeight,
        minHeight: stageHeight,
        ...(gridOffset.x || gridOffset.y
          ? { transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)` }
          : {}),
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0"
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
        className="overflow-x-clip overflow-y-hidden [mask-image:linear-gradient(to_right,black_0,black_calc(100%-var(--use-case-fade)),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0,black_calc(100%-var(--use-case-fade)),transparent_100%)]"
        style={{
          paddingLeft: inset,
          height: stageHeight,
          ["--use-case-fade" as string]: `${FADE_TAIL_PX}px`,
        }}
      >
        <div
          role="list"
          className="landing-new-use-case-track flex flex-nowrap items-start content-start"
          style={{
            transform: `translate3d(${slidePx}px, 0, 0)`,
            transition: sliding && !reduceMotion
              ? `transform ${SLIDE_MS}ms ${SNAP_EASE}`
              : "none",
          }}
        >
          {slots.map(({ slot, itemIndex, repeat }) => {
            const item = items[itemIndex]!
            const isStage = slot === 0
            const isExpanded = isStage && expanded
            const isLive = isStage && live && !repeat
            const { cols, rows } = metrics[itemIndex] ?? {
              cols: estimateCols(item.label),
              rows: DEFAULT_EXPANDED_ROWS,
            }
            const cardStyle: CSSProperties = {
              width: sizePx(isExpanded ? cols : CONTRACTED_COLS),
              height: sizePx(isExpanded ? rows : CONTRACTED_ROWS),
              marginRight: -1,
              marginBottom: -1,
              border: `1px solid ${lineColor}`,
              transition:
                reduceMotion || sliding
                  ? "none"
                  : `width ${EXPAND_MS}ms ${SNAP_EASE}, height ${EXPAND_MS}ms ${SNAP_EASE}`,
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
                  className="absolute inset-0 overflow-hidden bg-[var(--marketing-surface)] text-left"
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
                    className="pointer-events-none absolute top-0 left-0 overflow-visible"
                    style={{ width: SHAPE_SLOT_PX, height: SHAPE_SLOT_PX }}
                  >
                    <LandingNewUseCaseShape
                      kind={item.shape}
                      active={isLive}
                    />
                  </div>

                  <div className={cardCopyClassName} style={textStyle}>
                    <UseCaseCardCopy
                      item={item}
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
