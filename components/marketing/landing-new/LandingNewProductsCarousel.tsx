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
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { packDenseRows } from "@/components/marketing/landing-new/lattice/latticePack"
import { useLatticeNeighborShift } from "@/components/marketing/landing-new/lattice/latticeShift"
import { useLatticeHeightLock } from "@/components/marketing/landing-new/lattice/useLatticeHeightLock"
import type { LandingNewUseCaseShapeKind } from "@/lib/landingNewUseCaseSolids"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_MAX_COLS,
  ceilCells,
  floorCells,
} from "@/lib/landingLattice"
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
  /**
   * Visible tiles. When fewer than `items.length`, the rest wait in a pool and
   * idle tiles rotate Cloud-style: collapse to a 64×64 block, swap, grow back.
   */
  slots?: number
  /** Base gap between ambient swaps. 0 disables rotation. */
  rotateDelayMs?: number
}

/**
 * Lattice masonry of white plates. Each idle tile is a 1×1 shape with the
 * title beside it; one plate at a time grows to show the card body.
 */
const CELL = LATTICE_CELL_PX
const EXPANDED_COLS = 5
const MIN_OPEN_ROWS = 2
const HOLD_MS = LANDING_SNAP_HOLD_MS
const EXPAND_MS = LANDING_SNAP_MS
const TEXT_FADE_MS = 320
const TEXT_HIDE_MS = 150
const TITLE_CHAR_PX = 8.2
/** Equal chrome on every side of the plate (16 + 32px shape + 16 = 1 cell). */
const CARD_INSET_PX = 16
const TITLE_PAD_PX = CARD_INSET_PX
const COPY_PAD_PX = CARD_INSET_PX
const BODY_LINE_PX = 19.5
const BODY_CHAR_PX = 6.6
const SHAPE_PX = 32
const SNAP_EASE = "cubic-bezier(0.65, 0, 0.35, 1)"
const COPY_CLASS_NAME = "min-w-0 shrink-0 -mt-2 -ml-1.5 pr-4 pb-4 pl-16"

/* Ambient rotation — same rhythm as the Cloud masonry. */
const ROTATE_FIRST_MS = 2600
/** Multiplied against `rotateDelayMs / 3000` so the prop scales the whole rhythm. */
const ROTATE_GAPS_MS = [2800, 3600, 2400, 4200, 3000] as const
const ROTATE_HOLD_MS = 180
/** Let the neighbor FLIP settle before the block grows into its new cell. */
const ROTATE_SHIFT_MS = 420
const ROTATE_DEFAULT_MS = 3000

/**
 * On a narrow column every idle plate is full width, so 15 slots become a
 * 16-row stack. Keep the visible set close to the desktop pack height.
 */
function slotCountForCols(requested: number, cols: number) {
  if (cols <= 5) return Math.min(requested, 6)
  if (cols <= 8) return Math.min(requested, 9)
  return requested
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

/** Shape (1 cell) + title + right pad, snapped up to the next lattice line. */
function idleColsForLabel(label: string, avail: number) {
  if (avail <= 5) return avail
  const cols = 1 + ceilCells(label.length * TITLE_CHAR_PX + TITLE_PAD_PX)
  return Math.min(Math.max(2, cols), avail)
}

function idleColsForTitleWidth(titleWidth: number, avail: number) {
  if (avail <= 5) return avail
  return Math.min(Math.max(2, 1 + ceilCells(titleWidth + TITLE_PAD_PX)), avail)
}

/**
 * A collapsed plate is always one cell tall. The title is single-line
 * (`truncate`), and its measured width sets the idle column count, so it
 * never needs a second row.
 */
const IDLE_ROWS = 1

function openColsForLabel(label: string, avail: number, idleCols?: number) {
  return Math.min(
    avail,
    Math.max(EXPANDED_COLS, idleCols ?? idleColsForLabel(label, avail)),
  )
}

function estimateOpenRows(
  item: Pick<LandingNewProductsCarouselItem, "label" | "body" | "badge"> & {
    visual?: ReactNode
    cta?: unknown
  },
  avail: number,
) {
  const cols = openColsForLabel(item.label, avail)
  const textWidth = Math.max(1, cols * CELL - CELL - CARD_INSET_PX)
  const lines = Math.max(1, Math.ceil((item.body.length * BODY_CHAR_PX) / textWidth))
  let px = IDLE_ROWS * CELL + COPY_PAD_PX + lines * BODY_LINE_PX
  if (item.badge) px += 28
  if (item.cta) px += 44
  if (item.visual) px += 80
  return ceilCells(px, MIN_OPEN_ROWS)
}

function tileSpan(
  label: string,
  avail: number,
  expanded: boolean,
  openRows: number,
  measuredIdleCols?: number,
) {
  const idleCols = measuredIdleCols ?? idleColsForLabel(label, avail)
  const idleRows = IDLE_ROWS
  if (!expanded) return { cols: idleCols, rows: idleRows, idleCols, idleRows }
  return {
    cols: openColsForLabel(label, avail, idleCols),
    rows: Math.max(idleRows, openRows),
    idleCols,
    idleRows,
  }
}

function carouselMinRows(
  items: readonly { label: string }[],
  avail: number,
  openRows: readonly number[],
  idleCols?: readonly number[],
) {
  if (items.length === 0) return MIN_OPEN_ROWS
  let max = MIN_OPEN_ROWS
  for (let head = 0; head < items.length; head++) {
    const pieces = items.map((item, index) =>
      tileSpan(
        item.label,
        avail,
        index === head,
        openRows[index] ?? MIN_OPEN_ROWS,
        idleCols?.[index],
      ),
    )
    max = Math.max(max, packDenseRows(pieces, avail))
  }
  return max
}

const cardChromeClassName =
  "rounded-2xl bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--border)]"

/** Single line: the plate is one cell tall, so the title may ellipsize but never wrap. */
const cardTitleClassName =
  "min-w-0 flex-1 truncate text-left font-sans text-[16px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-500 ease-out sm:text-[17px]"

const cardBadgeClassName =
  "mb-2.5 block text-left font-mono text-[10px] uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"

const cardBodyClassName =
  "text-left font-sans text-[13px] font-normal leading-[1.5] text-foreground transition-colors duration-500 ease-out sm:text-[14px]"

const cardCtaClassName =
  "inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-[-0.01em] text-foreground transition-[border-color,opacity,color] duration-500 ease-out hover:border-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

function UseCaseCardCopy({
  item,
  live = true,
  style,
}: {
  item: LandingNewProductsCarouselItem
  live?: boolean
  style?: CSSProperties
}) {
  return (
    <div className={COPY_CLASS_NAME} style={style} aria-hidden={!live}>
      {item.badge ? <span className={cardBadgeClassName}>{item.badge}</span> : null}
      {item.visual ? (
        <div
          aria-hidden
          className="relative mb-5 w-full min-w-0 shrink-0 overflow-hidden"
        >
          {item.visual}
        </div>
      ) : null}
      <p className={cardBodyClassName}>{item.body}</p>
      {item.cta ? (
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
      ) : null}
    </div>
  )
}

function UseCaseCardHeader({
  item,
  height,
  shape,
  style,
}: {
  item: LandingNewProductsCarouselItem
  height: number
  shape?: ReactNode
  style?: CSSProperties
}) {
  return (
    <div className="flex shrink-0 items-center pr-4" style={{ height, ...style }}>
      <div
        className="landing-new-use-case-shape-slot pointer-events-none flex shrink-0 items-center justify-center overflow-visible"
        style={{ width: CELL, minWidth: CELL, height: CELL }}
      >
        {shape ?? <div style={{ width: SHAPE_PX, height: SHAPE_PX }} />}
      </div>
      <h3 className={`${cardTitleClassName} -ml-1.5`}>{item.label}</h3>
    </div>
  )
}

function UseCaseOpenProbe({
  item,
  width,
  idleHeight,
}: {
  item: LandingNewProductsCarouselItem
  width: number
  idleHeight: number
}) {
  return (
    <div className="flex flex-col items-stretch" style={{ width }}>
      <UseCaseCardHeader item={item} height={idleHeight} />
      <UseCaseCardCopy item={item} live={false} />
    </div>
  )
}

function measureTitleBox(title: HTMLElement | null) {
  if (!title) return null
  const range = document.createRange()
  range.selectNodeContents(title)
  const rect = range.getBoundingClientRect()
  range.detach()
  if (rect.width < 1) return null
  return rect
}

function useOpenRowSpans(
  items: readonly LandingNewProductsCarouselItem[],
  avail: number,
) {
  const probeRef = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState(() =>
    items.map((item) => estimateOpenRows(item, avail)),
  )
  const [idleCols, setIdleCols] = useState(() =>
    items.map((item) => idleColsForLabel(item.label, avail)),
  )

  useLayoutEffect(() => {
    const root = probeRef.current
    if (!root) return

    const apply = () => {
      const nextRows: number[] = []
      const nextIdle: number[] = []
      items.forEach((item, index) => {
        const node = root.children[index] as HTMLElement | undefined
        const fallbackIdle = idleColsForLabel(item.label, avail)
        const titleBox = measureTitleBox(node?.querySelector("h3") ?? null)
        const measuredIdle = titleBox
          ? idleColsForTitleWidth(titleBox.width, avail)
          : fallbackIdle
        nextIdle.push(measuredIdle)
        if (!node) {
          nextRows.push(estimateOpenRows(item, avail))
          return
        }
        const height = node.getBoundingClientRect().height
        nextRows.push(
          height < 1 ? estimateOpenRows(item, avail) : ceilCells(height, MIN_OPEN_ROWS),
        )
      })
      setRows((prev) =>
        prev.length === nextRows.length && prev.every((row, i) => row === nextRows[i])
          ? prev
          : nextRows,
      )
      setIdleCols((prev) =>
        prev.length === nextIdle.length && prev.every((col, i) => col === nextIdle[i])
          ? prev
          : nextIdle,
      )
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(root)
    for (const child of Array.from(root.children)) observer.observe(child)
    window.addEventListener("resize", apply)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", apply)
      void fonts
    }
  }, [items, avail])

  const probes = (
    <div
      ref={probeRef}
      aria-hidden
      className="pointer-events-none invisible absolute top-0 left-0 -z-10 flex flex-col"
    >
      {items.map((item, index) => {
        return (
          <UseCaseOpenProbe
            key={`${index}-${item.label}`}
            item={item}
            width={openColsForLabel(item.label, avail) * CELL}
            idleHeight={IDLE_ROWS * CELL}
          />
        )
      })}
    </div>
  )

  return { rows, idleCols, probes }
}

function UseCaseMasonryCard({
  item,
  expanded,
  grown,
  live,
  mini,
  muted,
  reduceMotion,
  flatShapes,
  idleWidth,
  idleHeight,
  openWidth,
  openHeight,
  onOpen,
}: {
  item: LandingNewProductsCarouselItem
  expanded: boolean
  grown: boolean
  live: boolean
  /** Rotation: parked as a 64×64 block while its content is swapped. */
  mini: boolean
  /** Rotation: shape + title hidden (fades before the shrink, after the grow). */
  muted: boolean
  reduceMotion: boolean
  flatShapes: boolean
  idleWidth: number
  idleHeight: number
  openWidth: number
  openHeight: number
  onOpen: () => void
}) {
  const open = expanded && grown && !mini
  const textStyle: CSSProperties = {
    opacity: live ? 1 : 0,
    transition: reduceMotion
      ? "none"
      : live
        ? `opacity ${TEXT_FADE_MS}ms ease-out`
        : `opacity ${TEXT_HIDE_MS}ms ease-out`,
  }
  const headerStyle: CSSProperties = {
    opacity: muted ? 0 : 1,
    transition: reduceMotion
      ? "none"
      : muted
        ? `opacity ${TEXT_HIDE_MS}ms ease-out`
        : `opacity ${TEXT_FADE_MS}ms ease-out, height ${EXPAND_MS}ms ${SNAP_EASE}`,
  }
  const headerHeight = mini ? CELL : idleHeight

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-visible">
      <button
        type="button"
        aria-expanded={open}
        aria-busy={mini || muted || undefined}
        onClick={() => {
          if (mini || muted) return
          if (expanded && grown) return
          onOpen()
        }}
        className={[
          "landing-new-use-case-card landing-new-use-case-card-face absolute top-0 left-0 cursor-pointer overflow-hidden text-left",
          cardChromeClassName,
        ].join(" ")}
        style={{
          width: mini ? CELL : open ? openWidth : idleWidth,
          height: mini ? CELL : open ? openHeight : idleHeight,
          transition: reduceMotion
            ? "none"
            : `width ${EXPAND_MS}ms ${SNAP_EASE}, height ${EXPAND_MS}ms ${SNAP_EASE}`,
        }}
      >
        <div className="flex h-full min-h-0 w-full flex-col items-stretch">
          <UseCaseCardHeader
            item={item}
            height={headerHeight}
            style={headerStyle}
            shape={
              expanded ? (
                <LandingNewUseCaseShape
                  className="size-8"
                  kind={item.shape}
                  active={live && !flatShapes}
                />
              ) : (
                <LandingNewUseCaseIdlePlate
                  className="size-8"
                  kind={item.shape}
                />
              )
            }
          />
          {expanded ? (
            <UseCaseCardCopy item={item} live={live} style={textStyle} />
          ) : null}
        </div>
      </button>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

const EMPTY_SLOTS: ReadonlySet<number> = new Set()

function withSlots(prev: ReadonlySet<number>, add: readonly number[]) {
  const next = new Set(prev)
  for (const slot of add) next.add(slot)
  return next
}

function withoutSlots(prev: ReadonlySet<number>, remove: readonly number[]) {
  const next = new Set(prev)
  for (const slot of remove) next.delete(slot)
  return next.size === 0 ? EMPTY_SLOTS : next
}

function UseCaseMasonry({
  items,
  slotItems,
  onSlotItemsChange,
  openRows,
  idleCols,
  autoplayDelayMs,
  rotateDelayMs,
  flatShapes,
  captureShift,
  playShift,
  inView,
}: {
  /** Full pool; `slotItems` picks which ones are on the grid. */
  items: readonly LandingNewProductsCarouselItem[]
  /** Pool index shown in each slot. */
  slotItems: readonly number[]
  onSlotItemsChange: (next: number[]) => void
  /** Pool-indexed. */
  openRows: readonly number[]
  /** Pool-indexed. */
  idleCols: readonly number[]
  autoplayDelayMs: number
  rotateDelayMs: number
  flatShapes: boolean
  captureShift: (skip?: Iterable<number>) => void
  playShift: () => void
  inView: () => boolean
}) {
  const { cols: gridCols } = useLatticeGrid()
  const reduceMotionPref = useReducedMotion()
  const [hasMounted, setHasMounted] = useState(false)
  const reduceMotion = hasMounted && reduceMotionPref === true
  const autoplayEnabled = autoplayDelayMs > 0 && !reduceMotion
  const count = slotItems.length
  const poolSize = items.length
  const rotateEnabled = rotateDelayMs > 0 && poolSize > count && count > 1
  const avail = Math.max(1, gridCols)

  const headRef = useRef(0)
  const grownRef = useRef(false)
  const liveRef = useRef(false)
  const busyRef = useRef(false)
  const pendingRef = useRef<number | null>(null)
  /** Slot a head transition is heading to while `busyRef` is set. */
  const targetRef = useRef<number | null>(null)
  const autoplayTimerId = useRef(0)
  const chainTimerId = useRef(0)
  const goToRef = useRef<(nextHead: number) => void>(() => {})

  const [head, setHead] = useState(0)
  const [grown, setGrown] = useState(false)
  const [live, setLive] = useState(false)
  const [growNonce, setGrowNonce] = useState(0)

  /* Rotation state: slots parked as a block / with hidden content. */
  const [miniSlots, setMiniSlots] = useState<ReadonlySet<number>>(EMPTY_SLOTS)
  const [mutedSlots, setMutedSlots] = useState<ReadonlySet<number>>(EMPTY_SLOTS)
  const [swapEpoch, setSwapEpoch] = useState(0)
  const morphRef = useRef<ReadonlySet<number>>(EMPTY_SLOTS)
  const slotItemsRef = useRef(slotItems)
  const reduceMotionRef = useRef(reduceMotion)
  const onSlotItemsChangeRef = useRef(onSlotItemsChange)
  /** Next pool index to bring onto the grid. */
  const cursorRef = useRef(count)

  useEffect(() => {
    slotItemsRef.current = slotItems
    reduceMotionRef.current = reduceMotion
    onSlotItemsChangeRef.current = onSlotItemsChange
  }, [slotItems, reduceMotion, onSlotItemsChange])

  headRef.current = head
  grownRef.current = grown
  liveRef.current = live

  const isMorphing = (slot: number) => morphRef.current.has(slot)

  /** Next slot after `from` that is not mid-swap. */
  const nextHeadFrom = (from: number) => {
    for (let step = 1; step <= count; step++) {
      const candidate = wrapIndex(from + step, count)
      if (!isMorphing(candidate)) return candidate
    }
    return wrapIndex(from + 1, count)
  }

  const finishBusy = () => {
    busyRef.current = false
    targetRef.current = null
    const pending = pendingRef.current
    if (pending == null) return
    pendingRef.current = null
    goToRef.current(pending)
  }

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
      finishBusy()
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
        finishBusy()
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
        pendingRef.current = null
        return
      }
      if (busyRef.current) {
        pendingRef.current = target
        return
      }
      busyRef.current = true
      targetRef.current = target
      pendingRef.current = null

      const advance = () => {
        captureShift()
        if (target !== headRef.current) setHead(target)
        openStage()
      }

      if (liveRef.current) {
        setLive(false)
        const revertMs = flatShapes ? TEXT_HIDE_MS : USE_CASE_SHAPE_REVERT_MS
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
    [count, captureShift, flatShapes, openStage, reduceMotion],
  )

  useEffect(() => {
    goToRef.current = goTo
  }, [goTo])

  const skipFirstShift = useRef(true)
  useLayoutEffect(() => {
    if (skipFirstShift.current) {
      skipFirstShift.current = false
      return
    }
    playShift()
  }, [head, playShift])

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
      goToRef.current(nextHeadFrom(headRef.current))
    }, autoplayDelayMs)

    return () => window.clearTimeout(autoplayTimerId.current)
    // `nextHeadFrom` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayEnabled, autoplayDelayMs, live, count])

  /* Neighbors FLIP onto their new cells after a swap reflows the grid. */
  useLayoutEffect(() => {
    if (swapEpoch === 0) return
    playShift()
  }, [swapEpoch, playShift])

  /*
   * Ambient rotation, Cloud-style: one or two idle tiles fade, shrink to the
   * 64×64 block, take the next pool item, and grow back into their new cell.
   */
  useEffect(() => {
    if (!rotateEnabled) return
    let cancelled = false
    const tempo = rotateDelayMs / ROTATE_DEFAULT_MS

    const setMorph = (next: ReadonlySet<number>) => {
      morphRef.current = next
    }

    const blockedSlots = () => {
      const blocked = new Set<number>(morphRef.current)
      blocked.add(headRef.current)
      if (pendingRef.current != null) blocked.add(pendingRef.current)
      if (targetRef.current != null) blocked.add(targetRef.current)
      return blocked
    }

    const pickGroup = (step: number) => {
      const blocked = blockedSlots()
      const first = wrapIndex(step * 7 + 3, count)
      const second = wrapIndex(step * 3 + 1, count)
      const wanted = step % 3 === 2 ? [first] : [first, second]
      const group: number[] = []
      for (const slot of wanted) {
        if (blocked.has(slot) || group.includes(slot)) continue
        group.push(slot)
      }
      return group
    }

    /** Next pool index that is not on the grid right now. */
    const drawNext = (visible: ReadonlySet<number>) => {
      for (let tries = 0; tries < poolSize; tries++) {
        const index = cursorRef.current % poolSize
        cursorRef.current = index + 1
        if (!visible.has(index)) return index
      }
      return null
    }

    const nextSlotItems = (group: readonly number[]) => {
      const next = [...slotItemsRef.current]
      const visible = new Set(next)
      let changed = false
      for (const slot of group) {
        const index = drawNext(visible)
        if (index == null) continue
        visible.add(index)
        next[slot] = index
        changed = true
      }
      return changed ? next : null
    }

    const swap = (group: readonly number[]) => {
      const next = nextSlotItems(group)
      if (!next) return false
      captureShift()
      onSlotItemsChangeRef.current(next)
      setSwapEpoch((epoch) => epoch + 1)
      return true
    }

    const playSwap = async (group: readonly number[]) => {
      if (reduceMotionRef.current) {
        swap(group)
        return
      }
      setMorph(withSlots(morphRef.current, group))
      setMutedSlots((prev) => withSlots(prev, group))
      await sleep(TEXT_HIDE_MS)
      if (cancelled) return
      setMiniSlots((prev) => withSlots(prev, group))
      await sleep(EXPAND_MS + ROTATE_HOLD_MS)
      if (cancelled) return
      const swapped = swap(group)
      if (swapped) await sleep(ROTATE_SHIFT_MS)
      if (cancelled) return
      setMiniSlots((prev) => withoutSlots(prev, group))
      await sleep(EXPAND_MS)
      if (cancelled) return
      setMutedSlots((prev) => withoutSlots(prev, group))
      setMorph(withoutSlots(morphRef.current, group))
    }

    const loop = async () => {
      await sleep(ROTATE_FIRST_MS * tempo)
      let step = 0
      while (!cancelled) {
        if (!inView()) {
          await sleep(800)
          continue
        }
        // Let a head transition finish so two reflows never race.
        if (busyRef.current) {
          await sleep(300)
          continue
        }
        const group = pickGroup(step)
        step += 1
        if (group.length > 0) {
          await playSwap(group)
          if (cancelled) return
        }
        await sleep(ROTATE_GAPS_MS[step % ROTATE_GAPS_MS.length] * tempo)
      }
    }

    void loop()
    return () => {
      cancelled = true
      setMorph(EMPTY_SLOTS)
      setMiniSlots(EMPTY_SLOTS)
      setMutedSlots(EMPTY_SLOTS)
    }
    // Everything else is read through refs so the loop survives re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotateEnabled, rotateDelayMs, count, poolSize])

  if (count === 0) return null

  return (
    <>
      {slotItems.map((poolIndex, slot) => {
        const item = items[poolIndex]
        if (!item) return null
        const isHead = slot === head
        const span = tileSpan(
          item.label,
          avail,
          isHead,
          openRows[poolIndex] ?? MIN_OPEN_ROWS,
          idleCols[poolIndex],
        )
        return (
          <LatticeCell
            key={slot}
            className={isHead ? "z-[2]" : "z-[1]"}
            cols={span.cols}
            rows={span.rows}
            paper={false}
            shiftIndex={slot}
          >
            <UseCaseMasonryCard
              item={item}
              expanded={isHead}
              grown={isHead && grown}
              live={isHead && live}
              mini={miniSlots.has(slot)}
              muted={mutedSlots.has(slot)}
              reduceMotion={reduceMotion}
              flatShapes={flatShapes}
              idleWidth={span.idleCols * CELL}
              idleHeight={span.idleRows * CELL}
              openWidth={span.cols * CELL}
              openHeight={span.rows * CELL}
              onOpen={() => goTo(slot)}
            />
          </LatticeCell>
        )
      })}
    </>
  )
}

function initialSlots(count: number) {
  return Array.from({ length: count }, (_, index) => index)
}

export function LandingNewProductsCarousel({
  items,
  ariaLabel,
  className,
  autoplayDelayMs = HOLD_MS,
  flatShapes = false,
  slots,
  rotateDelayMs = ROTATE_DEFAULT_MS,
}: LandingNewProductsCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(LATTICE_COLUMN_MAX_COLS)
  const { capture, play } = useLatticeNeighborShift(ref)
  const { rows: openRows, idleCols, probes } = useOpenRowSpans(items, cols)
  const slotCount = slotCountForCols(
    Math.max(1, Math.min(items.length, slots ?? items.length)),
    cols,
  )
  const [slotState, setSlotItems] = useState<number[]>(() => initialSlots(slotCount))
  const slotItems = slotState.length === slotCount ? slotState : initialSlots(slotCount)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const next = Math.max(1, floorCells(el.getBoundingClientRect().width))
      setCols((prev) => (prev === next ? prev : next))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const inView = useCallback(() => {
    const el = ref.current
    if (!el || document.hidden) return false
    const rect = el.getBoundingClientRect()
    return rect.bottom > 96 && rect.top < window.innerHeight - 64
  }, [])

  const handleSlotItemsChange = useCallback((next: number[]) => {
    setSlotItems(next)
  }, [])

  const visible = slotItems.map((index) => items[index]).filter(Boolean)
  const slotOpenRows = slotItems.map((index) => openRows[index] ?? MIN_OPEN_ROWS)
  const slotIdleCols = slotItems.map(
    (index) =>
      idleCols[index] ?? idleColsForLabel(items[index]?.label ?? "", cols),
  )
  const rowsNow =
    items.length === 0
      ? 0
      : carouselMinRows(visible, cols, slotOpenRows, slotIdleCols)
  const minHeight = useLatticeHeightLock(cols, rowsNow)

  if (items.length === 0) return null

  return (
    <div
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      className={["relative", className].filter(Boolean).join(" ")}
      style={{ minHeight }}
    >
      {probes}
      <LatticeGrid className="overflow-visible" dense minCols={1}>
        <UseCaseMasonry
          items={items}
          slotItems={slotItems}
          onSlotItemsChange={handleSlotItemsChange}
          openRows={openRows}
          idleCols={idleCols}
          autoplayDelayMs={autoplayDelayMs}
          rotateDelayMs={rotateDelayMs}
          flatShapes={flatShapes}
          captureShift={capture}
          playShift={play}
          inView={inView}
        />
      </LatticeGrid>
    </div>
  )
}
