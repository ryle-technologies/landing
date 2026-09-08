"use client"

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_MAX_COLS,
  ceilCells,
  floorCells,
  latticeCellStrokeClassName,
} from "@/lib/landingLattice"

/**
 * CSS grid whose tracks *are* the lattice: `auto-fill` 64px columns across a
 * cell-multiple column, 64px implicit rows. Cells declare their size in
 * cells; a cell with `rows="auto"` measures its copy once and rounds up.
 *
 * Add a card: `<LatticeCell cols={5} rows="auto">…</LatticeCell>`. Nothing
 * else to align.
 */

type LatticeGridContextValue = {
  /** Cells available across the grid right now. */
  cols: number
  /** Below `minCols` every cell spans the full width and explicit starts are ignored. */
  stacked: boolean
  /** Whether first-row indent is in effect (see `LatticeGrid.indent`). */
  indentCols: number
  stroke: boolean
  paper: boolean
  equalRows: boolean
  equalSpan: number
  report: (id: string, span: number | null) => void
}

const LatticeGridContext = createContext<LatticeGridContextValue | null>(null)

/** Read the live column count (e.g. to size a cell as "everything but the phone"). */
export function useLatticeGrid() {
  const ctx = useContext(LatticeGridContext)
  if (!ctx) throw new Error("useLatticeGrid must be used inside <LatticeGrid>")
  return ctx
}

type LatticeGridProps = {
  children: ReactNode
  className?: string
  /**
   * Columns this layout needs. With fewer available, cells stack full-width.
   * Defaults to the full 16-cell column.
   */
  minCols?: number
  /** Push the first cell right by this many cells when there is room (`minCols + indent`). */
  indent?: number
  /** Draw the 1px lattice stroke around every cell. */
  stroke?: boolean
  /** Paint the surface under every cell so tromino holes never punch a frame. Defaults to `stroke`. */
  paper?: boolean
  /** All auto-height cells share the tallest span (one bottom line for the row). */
  equalRows?: boolean
  /** Pack later cells into holes left by shorter neighbors (`grid-auto-flow: dense`). */
  dense?: boolean
  style?: CSSProperties
}

export function LatticeGrid({
  children,
  className = "",
  minCols = LATTICE_COLUMN_MAX_COLS,
  indent = 0,
  stroke = false,
  paper = stroke,
  equalRows = false,
  dense = false,
  style,
}: LatticeGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(LATTICE_COLUMN_MAX_COLS)
  const [spans, setSpans] = useState<Record<string, number>>({})

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const next = Math.max(1, floorCells(el.getBoundingClientRect().width))
      setCols((prev) => (prev === next ? prev : next))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const report = useCallback((id: string, span: number | null) => {
    setSpans((prev) => {
      if (span == null) {
        if (!(id in prev)) return prev
        const rest = { ...prev }
        delete rest[id]
        return rest
      }
      if (prev[id] === span) return prev
      return { ...prev, [id]: span }
    })
  }, [])

  const stacked = cols < minCols
  const indentCols = !stacked && cols >= minCols + indent ? indent : 0
  const equalSpan = Object.values(spans).reduce((max, s) => Math.max(max, s), 1)

  const value = useMemo<LatticeGridContextValue>(
    () => ({ cols, stacked, indentCols, stroke, paper, equalRows, equalSpan, report }),
    [cols, stacked, indentCols, stroke, paper, equalRows, equalSpan, report],
  )

  return (
    <LatticeGridContext.Provider value={value}>
      <div
        ref={ref}
        className={`grid w-full min-w-0 ${className}`}
        style={{
          gridTemplateColumns: `repeat(auto-fill, ${LATTICE_CELL_PX}px)`,
          gridAutoRows: `${LATTICE_CELL_PX}px`,
          gridAutoFlow: dense ? "row dense" : "row",
          ...style,
        }}
      >
        {children}
      </div>
    </LatticeGridContext.Provider>
  )
}

type LatticeCellProps = {
  children: ReactNode
  className?: string
  /** Width in cells; `"full"` spans the whole grid. Clamped to what is available. */
  cols?: number | "full"
  /** 1-based start column (desktop only). */
  colStart?: number
  /** Height in cells, or `"auto"` to measure the content and round up. */
  rows?: number | "auto"
  /** 1-based start row (desktop only). */
  rowStart?: number
  /** Floor for `rows="auto"`. */
  minRows?: number
  /** Apply this grid's first-row indent to this cell. */
  indent?: boolean
  /** Override the grid's stroke for this cell. */
  stroke?: boolean
  /** Override the grid's paper fill for this cell. */
  paper?: boolean
  /** Extra classes on the content body (a `flex flex-col` that fills the cell). */
  bodyClassName?: string
  /** Marks this cell for Cloud masonry FLIP when neighbors reflow. */
  shiftIndex?: number
  style?: CSSProperties
}

export function LatticeCell({
  children,
  className = "",
  cols = "full",
  colStart,
  rows = "auto",
  rowStart,
  minRows = 1,
  indent = false,
  stroke,
  paper,
  bodyClassName = "",
  shiftIndex,
  style,
}: LatticeCellProps) {
  const grid = useLatticeGrid()
  const id = useId()
  const bodyRef = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState<number | null>(null)
  const auto = rows === "auto"

  useLayoutEffect(() => {
    if (!auto) {
      grid.report(id, null)
      return
    }
    const body = bodyRef.current
    if (!body) return

    const apply = () => {
      // Measure the copy at its natural height, not stretched to the cell.
      const prev = body.style.height
      body.style.height = "auto"
      const h = body.getBoundingClientRect().height
      body.style.height = prev
      if (h < 1) return
      const span = ceilCells(h, minRows)
      setNatural((p) => (p === span ? p : span))
      grid.report(id, span)
    }

    apply()
    // The body fills the cell (`h-full`), so its own box never reports copy
    // growth — watch the children too.
    const ro = new ResizeObserver(apply)
    ro.observe(body)
    for (const child of Array.from(body.children)) ro.observe(child)
    window.addEventListener("resize", apply)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", apply)
      grid.report(id, null)
      void fonts
    }
    // `grid.report` is stable; re-run when the column count flips layouts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, minRows, id, grid.cols, grid.stacked])

  const avail = grid.cols
  const requested = cols === "full" ? avail : cols
  const span = grid.stacked ? avail : Math.min(requested, avail)
  const start = grid.stacked
    ? undefined
    : colStart ?? (indent && grid.indentCols ? grid.indentCols + 1 : undefined)
  const gridColumn =
    start != null && start + span - 1 <= avail ? `${start} / span ${span}` : `span ${span}`

  const rowSpan = auto
    ? grid.equalRows && !grid.stacked
      ? Math.max(grid.equalSpan, natural ?? minRows)
      : natural ?? minRows
    : rows
  const gridRow =
    rowStart != null && !grid.stacked ? `${rowStart} / span ${rowSpan}` : `span ${rowSpan}`

  const stroked = stroke ?? grid.stroke
  const painted = paper ?? grid.paper

  return (
    <div
      className={[
        "relative min-h-0 min-w-0",
        painted ? "bg-[var(--marketing-surface)]" : "",
        className,
      ].join(" ")}
      data-cloud-shift={shiftIndex}
      style={{ gridColumn, gridRow, ...style }}
    >
      <div ref={bodyRef} className={`flex h-full min-h-0 min-w-0 flex-col ${bodyClassName}`}>
        {children}
      </div>
      {stroked ? (
        // Above the content, so a child with its own background (phone, image)
        // cannot paint over the lattice line.
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-20 ${latticeCellStrokeClassName}`}
        />
      ) : null}
    </div>
  )
}
