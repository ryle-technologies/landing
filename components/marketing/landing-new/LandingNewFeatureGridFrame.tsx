"use client"

import {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"
import {
  FEATURE_GRID_ORIGIN_ATTR,
  HERO_GRID_CELL_PX,
  HERO_GRID_LINE_DARK,
  HERO_GRID_LINE_LIGHT,
  snapBoxToHeroGrid,
  snapHeroGridLine,
  widthOnThreeLatticeColumns,
  type HeroGridBox,
} from "@/lib/landingNewHeroGrid"

/**
 * 3 + (2/3 + 1/3) feature cluster snapped onto the 60px hero lattice.
 * The first row is inset one cell to the right so it steps off the
 * second-row left edge. Paper covers the canvas under each cell so
 * tromino holes cannot punch the frame; the outline is drawn once in
 * the same 1px stroke as the hero grid.
 */

type Seg = { x1: number; y1: number; x2: number; y2: number }

function frameSegments(cells: HeroGridBox[], desktop: boolean): Seg[] {
  if (cells.length === 0) return []
  if (!desktop || cells.length < 5) {
    const first = cells[0]
    const last = cells[cells.length - 1]
    const left = first.left
    const top = first.top
    const right = first.left + first.width
    const bottom = last.top + last.height
    const segs: Seg[] = [
      { x1: left, y1: top, x2: right, y2: top },
      { x1: right, y1: top, x2: right, y2: bottom },
      { x1: right, y1: bottom, x2: left, y2: bottom },
      { x1: left, y1: bottom, x2: left, y2: top },
    ]
    for (let i = 1; i < cells.length; i += 1) {
      const y = cells[i].top
      segs.push({ x1: left, y1: y, x2: right, y2: y })
    }
    return segs
  }

  const [first, mid, last, privacy, cloud] = cells
  const r1l = first.left
  const r1r = last.left + last.width
  const r2l = privacy.left
  const r2r = cloud.left + cloud.width
  const top = first.top
  const split = privacy.top
  const bottom = privacy.top + privacy.height
  return [
    { x1: r1l, y1: top, x2: r1r, y2: top },
    { x1: r1r, y1: top, x2: r1r, y2: split },
    { x1: r1r, y1: split, x2: r2r, y2: split },
    { x1: r2r, y1: split, x2: r2r, y2: bottom },
    { x1: r2r, y1: bottom, x2: r2l, y2: bottom },
    { x1: r2l, y1: bottom, x2: r2l, y2: split },
    { x1: r2l, y1: split, x2: r1l, y2: split },
    { x1: r1l, y1: split, x2: r1l, y2: top },
    { x1: mid.left, y1: top, x2: mid.left, y2: split },
    { x1: last.left, y1: top, x2: last.left, y2: split },
    { x1: cloud.left, y1: split, x2: cloud.left, y2: bottom },
    { x1: r1l, y1: split, x2: r2r, y2: split },
  ]
}

function segsToPath(segs: Seg[], originLeft: number, originTop: number) {
  return segs
    .map((seg) => {
      const x1 = seg.x1 - originLeft + 0.5
      const y1 = seg.y1 - originTop + 0.5
      const x2 = seg.x2 - originLeft + 0.5
      const y2 = seg.y2 - originTop + 0.5
      return `M${x1} ${y1} L${x2} ${y2}`
    })
    .join(" ")
}

const MD_QUERY = "(min-width: 768px)"
const DESKTOP_MIN_ITEMS = 5

type ClusterLayout = {
  width: number
  height: number
  left: number
  top: number
  rowTemplate: string
  cells: HeroGridBox[]
  desktop: boolean
}

function toWrap(box: HeroGridBox, wrap: DOMRect, origin: DOMRect): HeroGridBox {
  return {
    left: box.left - (wrap.left - origin.left),
    top: box.top - (wrap.top - origin.top),
    width: box.width,
    height: box.height,
  }
}

function sameLayout(a: ClusterLayout | null, b: ClusterLayout) {
  if (!a) return false
  if (
    a.width !== b.width ||
    a.height !== b.height ||
    a.left !== b.left ||
    a.top !== b.top ||
    a.rowTemplate !== b.rowTemplate ||
    a.desktop !== b.desktop ||
    a.cells.length !== b.cells.length
  ) {
    return false
  }
  return a.cells.every(
    (cell, index) =>
      cell.left === b.cells[index].left &&
      cell.top === b.cells[index].top &&
      cell.width === b.cells[index].width &&
      cell.height === b.cells[index].height,
  )
}

function desktopCells(
  outer: HeroGridBox,
  items: HTMLElement[],
  origin: DOMRect,
): { box: HeroGridBox; cells: HeroGridBox[] } {
  const cell = HERO_GRID_CELL_PX
  const width = widthOnThreeLatticeColumns(outer.width)
  const box = { ...outer, width }
  const col = width / 3

  const firstRowBottom =
    Math.max(
      items[0].getBoundingClientRect().bottom,
      items[1].getBoundingClientRect().bottom,
      items[2].getBoundingClientRect().bottom,
    ) - origin.top
  const minSplit = box.top + cell
  const splitY = Math.max(minSplit, snapHeroGridLine(firstRowBottom))

  const secondRowBottom =
    Math.max(
      items[3].getBoundingClientRect().bottom,
      items[4].getBoundingClientRect().bottom,
    ) - origin.top
  const bottom = Math.max(snapHeroGridLine(secondRowBottom), splitY + cell)
  box.height = bottom - box.top

  const d1 = box.left + col
  const d2 = box.left + col * 2
  const rowTwo = bottom - splitY
  const rowOne = splitY - box.top
  const shift = cell
  return {
    box: { ...box, width: box.width + shift },
    cells: [
      { left: box.left + shift, top: box.top, width: col, height: rowOne },
      { left: d1 + shift, top: box.top, width: col, height: rowOne },
      { left: d2 + shift, top: box.top, width: col, height: rowOne },
      { left: box.left, top: splitY, width: col * 2, height: rowTwo },
      { left: d2, top: splitY, width: col, height: rowTwo },
    ],
  }
}

function stackedCells(
  outer: HeroGridBox,
  items: HTMLElement[],
  origin: DOMRect,
): { box: HeroGridBox; cells: HeroGridBox[] } {
  const cell = HERO_GRID_CELL_PX
  const cells: HeroGridBox[] = []
  let y = outer.top
  items.forEach((item, index) => {
    const bottom = item.getBoundingClientRect().bottom - origin.top
    const isLast = index === items.length - 1
    let nextY = snapHeroGridLine(bottom)
    if (nextY < y + cell) nextY = y + cell
    if (isLast && nextY < bottom) nextY = snapHeroGridLine(bottom + cell - 1)
    cells.push({
      left: outer.left,
      top: y,
      width: outer.width,
      height: nextY - y,
    })
    y = nextY
  })
  return { box: { ...outer, height: y - outer.top }, cells }
}

export function LandingNewFeatureGridFrame({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<ClusterLayout | null>(null)
  const isDark = useMarketingTheme()?.isDark ?? false

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const grid = gridRef.current
    if (!wrap || !grid) return

    const apply = () => {
      const originEl = document.querySelector(`[${FEATURE_GRID_ORIGIN_ATTR}]`)
      if (!originEl) {
        setLayout(null)
        return
      }
      const origin = originEl.getBoundingClientRect()
      const wrapRect = wrap.getBoundingClientRect()
      if (wrapRect.width < 2) return

      const items = Array.from(grid.children) as HTMLElement[]
      if (items.length === 0) return

      const measureRect = {
        left: wrapRect.left,
        top: wrapRect.top,
        right: wrapRect.right,
        bottom: Math.max(
          wrapRect.bottom,
          ...items.map((item) => item.getBoundingClientRect().bottom),
        ),
      }

      const outer = snapBoxToHeroGrid(measureRect, origin, 0)
      const desktop =
        window.matchMedia(MD_QUERY).matches && items.length >= DESKTOP_MIN_ITEMS
      const built = desktop
        ? desktopCells(outer, items, origin)
        : stackedCells(outer, items, origin)
      const wrapBox = toWrap(built.box, wrapRect, origin)
      const cells = built.cells.map((box) => toWrap(box, wrapRect, origin))
      const next: ClusterLayout = {
        width: built.box.width,
        height: built.box.height,
        left: wrapBox.left,
        top: wrapBox.top,
        rowTemplate: desktop
          ? `${cells[0].height}px ${cells[3].height}px`
          : cells.map((box) => `${box.height}px`).join(" "),
        cells,
        desktop,
      }
      setLayout((prev) => (sameLayout(prev, next) ? prev : next))
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(wrap)
    ro.observe(grid)
    window.addEventListener("resize", apply)
    const mq = window.matchMedia(MD_QUERY)
    mq.addEventListener("change", apply)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", apply)
      mq.removeEventListener("change", apply)
      void fonts
    }
  }, [])

  const flowHeight = layout
    ? Math.max(layout.height + layout.top, layout.height)
    : undefined

  const desktop = layout?.desktop ?? false

  const gridStyle: CSSProperties | undefined = layout
    ? desktop
      ? {
          left: 0,
          top: 0,
          width: Math.max(layout.left + layout.width, layout.width),
          height: flowHeight,
        }
      : {
          left: layout.left,
          top: layout.top,
          width: layout.width,
          height: layout.height,
          gridTemplateRows: layout.rowTemplate,
        }
    : undefined

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-visible ${className}`}
      style={flowHeight != null ? { height: flowHeight } : undefined}
    >
      {layout
        ? layout.cells.map((box, index) => (
            <div
              key={`plate-${index}`}
              aria-hidden
              className="pointer-events-none absolute bg-[var(--marketing-surface)]"
              style={{
                left: box.left,
                top: box.top,
                width: box.width + 1,
                height: box.height + 1,
              }}
            />
          ))
        : null}
      {layout ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute z-20 overflow-visible"
          width={layout.width + 1}
          height={layout.height + 1}
          style={{ left: layout.left, top: layout.top }}
        >
          <path
            d={segsToPath(frameSegments(layout.cells, layout.desktop), layout.left, layout.top)}
            fill="none"
            stroke={isDark ? HERO_GRID_LINE_DARK : HERO_GRID_LINE_LIGHT}
            strokeWidth={1}
            strokeLinecap="square"
          />
        </svg>
      ) : null}
      <div
        ref={gridRef}
        className={`z-10 min-w-0 ${
          desktop
            ? "absolute"
            : `relative grid grid-cols-1 md:grid-cols-3 ${layout ? "absolute" : ""}`
        }`}
        style={gridStyle}
      >
        {desktop && layout
          ? Children.map(children, (child, index) => {
              const box = layout.cells[index]
              if (!box) return child
              return (
                <div
                  key={index}
                  className="absolute min-h-0 min-w-0"
                  style={{
                    left: box.left,
                    top: box.top,
                    width: box.width,
                    height: box.height,
                  }}
                >
                  {child}
                </div>
              )
            })
          : children}
      </div>
    </div>
  )
}
