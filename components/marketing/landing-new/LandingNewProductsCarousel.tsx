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
  LandingNewUseCaseIdlePlate,
  LandingNewUseCaseShape,
  USE_CASE_SHAPE_REVERT_MS,
} from "@/components/marketing/landing-new/LandingNewUseCaseShape"
import {
  LandingNewUseCaseTitleReveal,
  useCaseTitleRevealMs,
} from "@/components/marketing/landing-new/LandingNewUseCaseTitleReveal"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import type { LandingNewUseCaseShapeKind } from "@/lib/landingNewUseCaseSolids"
import { LATTICE_CELL_PX, latticeCellStrokeClassName } from "@/lib/landingLattice"
import {
  LANDING_SNAP_HOLD_MS,
  LANDING_SNAP_MS,
} from "@/lib/landingSnapMotion"

export type LandingNewProductsCarouselItem = {
  /** Card title. */
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
 * Dense lattice masonry: one use-case tile is the open Cloud-style plate,
 * the rest stay 64×64 cells. Autoplay walks them one at a time; a click
 * opens that tile and shows its copy.
 */
const CELL = LATTICE_CELL_PX
const EXPANDED_COLS = 5
const EXPANDED_ROWS = 5
const HOLD_MS = LANDING_SNAP_HOLD_MS
const EXPAND_MS = LANDING_SNAP_MS
const TEXT_FADE_MS = 320
const TEXT_HIDE_MS = 150

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length
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
  "landing-new-use-case-card-copy flex w-full flex-col items-start gap-2"

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

function UseCaseMasonryCard({
  item,
  expanded,
  grown,
  live,
  reduceMotion,
  flatShapes,
  openWidth,
  openHeight,
  openLeft,
  onOpen,
}: {
  item: LandingNewProductsCarouselItem
  expanded: boolean
  grown: boolean
  live: boolean
  reduceMotion: boolean
  flatShapes: boolean
  openWidth: number
  openHeight: number
  openLeft: number
  onOpen: () => void
}) {
  const open = expanded && grown
  const textStyle: CSSProperties = {
    opacity: live ? 1 : 0,
    transition: reduceMotion
      ? "none"
      : live
        ? `opacity ${TEXT_FADE_MS}ms ease-out`
        : `opacity ${TEXT_HIDE_MS}ms ease-out`,
  }

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-visible">
      {!open ? (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 ${latticeCellStrokeClassName}`}
        />
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-label={item.label}
        onClick={() => {
          if (expanded && grown) return
          onOpen()
        }}
        className={[
          "landing-new-use-case-card landing-new-use-case-card-face absolute top-0 overflow-hidden text-left",
          open
            ? "rounded-2xl bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--border)]"
            : "landing-new-use-case-card-idle bg-[var(--marketing-surface)] hover:bg-[color-mix(in_srgb,var(--foreground)_6%,var(--marketing-surface))]",
        ].join(" ")}
        style={{
          left: open ? openLeft : 0,
          width: open ? openWidth : CELL,
          height: open ? openHeight : CELL,
        }}
      >
        <div
          className={[
            cardCopyClassName,
            open ? "p-8" : "p-0",
          ].join(" ")}
        >
          <div className="landing-new-use-case-shape-slot pointer-events-none size-16 shrink-0 overflow-visible">
            <div
              className="landing-new-use-case-shape-scale"
              style={{ transform: open ? "scale(2)" : "scale(1)" }}
            >
              {expanded ? (
                <LandingNewUseCaseShape
                  kind={item.shape}
                  active={live && !flatShapes}
                />
              ) : (
                <LandingNewUseCaseIdlePlate kind={item.shape} />
              )}
            </div>
          </div>
          {expanded ? (
            <UseCaseCardCopy
              item={item}
              title={
                <LandingNewUseCaseTitleReveal
                  label={item.label}
                  active={live}
                />
              }
              restStyle={textStyle}
              cta={
                item.cta ? (
                  <a
                    href={item.cta.href}
                    className={`${cardCtaClassName} mt-5`}
                    tabIndex={live ? 0 : -1}
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
          ) : null}
        </div>
      </button>
    </div>
  )
}

function UseCaseMasonry({
  items,
  autoplayDelayMs,
  flatShapes,
}: {
  items: readonly LandingNewProductsCarouselItem[]
  autoplayDelayMs: number
  flatShapes: boolean
}) {
  const { cols: gridCols } = useLatticeGrid()
  const reduceMotionPref = useReducedMotion()
  const [hasMounted, setHasMounted] = useState(false)
  const reduceMotion = hasMounted && reduceMotionPref === true
  const autoplayEnabled = autoplayDelayMs > 0 && !reduceMotion
  const count = items.length

  const headRef = useRef(0)
  const grownRef = useRef(false)
  const liveRef = useRef(false)
  const busyRef = useRef(false)
  const autoplayTimerId = useRef(0)
  const chainTimerId = useRef(0)

  const [head, setHead] = useState(0)
  const [grown, setGrown] = useState(false)
  const [live, setLive] = useState(false)
  const [growNonce, setGrowNonce] = useState(0)

  headRef.current = head
  grownRef.current = grown
  liveRef.current = live

  const expandedCols = Math.min(EXPANDED_COLS, Math.max(1, gridCols))
  const openWidth = expandedCols * CELL
  const openHeight = EXPANDED_ROWS * CELL

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
      setGrown(true)
      setLive(true)
      busyRef.current = false
      return
    }
    setGrown(false)
    setGrowNonce((nonce) => nonce + 1)
  }, [reduceMotion])

  useLayoutEffect(() => {
    if (growNonce === 0 || reduceMotion) return
    const frame = window.requestAnimationFrame(() => {
      setGrown(true)
      after(EXPAND_MS, () => {
        setLive(true)
        busyRef.current = false
      })
    })
    return () => window.cancelAnimationFrame(frame)
    // `after` is stable enough for this grow tick; nonce is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [growNonce, reduceMotion])

  const goTo = useCallback(
    (nextHead: number) => {
      window.clearTimeout(autoplayTimerId.current)
      const target = wrapIndex(nextHead, count)
      if (target === headRef.current && (grownRef.current || liveRef.current)) {
        return
      }
      if (busyRef.current) return
      busyRef.current = true

      const advance = () => {
        if (target !== headRef.current) setHead(target)
        openStage()
      }

      if (liveRef.current) {
        setLive(false)
        const titleExitMs = useCaseTitleRevealMs(
          items[headRef.current]?.label ?? "",
        )
        const revertMs = flatShapes
          ? titleExitMs
          : Math.max(USE_CASE_SHAPE_REVERT_MS, titleExitMs)
        after(reduceMotion ? 0 : revertMs, () => {
          setGrown(false)
          after(reduceMotion ? 0 : EXPAND_MS, advance)
        })
        return
      }
      if (grownRef.current) {
        setGrown(false)
        after(reduceMotion ? 0 : EXPAND_MS, advance)
        return
      }
      advance()
    },
    [count, flatShapes, items, openStage, reduceMotion],
  )

  const goToRef = useRef(goTo)
  useEffect(() => {
    goToRef.current = goTo
  }, [goTo])

  useEffect(() => {
    setHasMounted(true)
  }, [])

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

  if (count === 0) return null

  return (
    <>
      {items.map((item, index) => {
        const isHead = index === head
        const col = gridCols > 0 ? index % gridCols : 0
        const hang = col + expandedCols - gridCols
        const openLeft = hang > 0 ? -hang * CELL : 0
        return (
          <LatticeCell
            key={item.label}
            className={isHead ? "z-[2]" : "z-[1]"}
            cols={1}
            rows={1}
            paper={false}
          >
            <UseCaseMasonryCard
              item={item}
              expanded={isHead}
              grown={isHead && grown}
              live={isHead && live}
              reduceMotion={reduceMotion}
              flatShapes={flatShapes}
              openWidth={openWidth}
              openHeight={openHeight}
              openLeft={openLeft}
              onOpen={() => goTo(index)}
            />
          </LatticeCell>
        )
      })}
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
  if (items.length === 0) return null

  return (
    <div role="region" aria-label={ariaLabel} className={className}>
      <LatticeGrid
        className="overflow-visible"
        dense
        minCols={1}
        style={{ minHeight: (EXPANDED_ROWS + 2) * CELL }}
      >
        <UseCaseMasonry
          items={items}
          autoplayDelayMs={autoplayDelayMs}
          flatShapes={flatShapes}
        />
      </LatticeGrid>
    </div>
  )
}
