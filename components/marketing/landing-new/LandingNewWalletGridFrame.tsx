"use client"

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"
import {
  HERO_GRID_CELL_PX,
  HERO_GRID_LINE_DARK,
  HERO_GRID_LINE_LIGHT,
  largestPhoneOnLattice,
  snapBoxToHeroGrid,
  snapHeroGridLine,
  WALLET_GRID_ORIGIN_ATTR,
  type HeroGridBox,
} from "@/lib/landingNewHeroGrid"

/**
 * Two-cell wallet cluster snapped onto the 60px hero lattice: copy | phone.
 * The phone cell is an exact N×M lattice rectangle so its edges sit on the
 * same 1px rules as the feature frame.
 */

type Seg = { x1: number; y1: number; x2: number; y2: number }

function frameSegments(cells: HeroGridBox[]): Seg[] {
  if (cells.length === 0) return []
  if (cells.length === 1) {
    const box = cells[0]
    const right = box.left + box.width
    const bottom = box.top + box.height
    return [
      { x1: box.left, y1: box.top, x2: right, y2: box.top },
      { x1: right, y1: box.top, x2: right, y2: bottom },
      { x1: right, y1: bottom, x2: box.left, y2: bottom },
      { x1: box.left, y1: bottom, x2: box.left, y2: box.top },
    ]
  }

  const [copy, phone] = cells
  const left = copy.left
  const top = Math.min(copy.top, phone.top)
  const right = phone.left + phone.width
  const bottom = Math.max(copy.top + copy.height, phone.top + phone.height)
  const split = phone.left
  const segs: Seg[] = [
    { x1: left, y1: top, x2: right, y2: top },
    { x1: right, y1: top, x2: right, y2: bottom },
    { x1: right, y1: bottom, x2: left, y2: bottom },
    { x1: left, y1: bottom, x2: left, y2: top },
  ]
  if (copy.top === phone.top && copy.height === phone.height) {
    segs.push({ x1: split, y1: top, x2: split, y2: bottom })
  } else {
    segs.push({
      x1: copy.left,
      y1: copy.top + copy.height,
      x2: copy.left + copy.width,
      y2: copy.top + copy.height,
    })
  }
  return segs
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
/** Leave at least this many cells for the copy column on desktop. */
const MIN_COPY_COLS = 6

type ClusterLayout = {
  width: number
  height: number
  left: number
  top: number
  rowTemplate: string
  colTemplate: string
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
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.left === b.left &&
    a.top === b.top &&
    a.rowTemplate === b.rowTemplate &&
    a.colTemplate === b.colTemplate &&
    a.desktop === b.desktop
  )
}

function desktopCells(outer: HeroGridBox): { box: HeroGridBox; cells: HeroGridBox[] } {
  const cell = HERO_GRID_CELL_PX
  const minCopy = MIN_COPY_COLS * cell
  const phone = largestPhoneOnLattice(Math.max(cell * 4, outer.width - minCopy))
  const copyW = outer.width - phone.width
  const height = phone.height
  const box = { ...outer, height }
  return {
    box,
    cells: [
      { left: box.left, top: box.top, width: copyW, height },
      { left: box.left + copyW, top: box.top, width: phone.width, height },
    ],
  }
}

function stackedCells(
  outer: HeroGridBox,
  copyItem: HTMLElement,
  origin: DOMRect,
): { box: HeroGridBox; cells: HeroGridBox[] } {
  const cell = HERO_GRID_CELL_PX
  const phone = largestPhoneOnLattice(outer.width)
  const left =
    outer.left + Math.floor((outer.width - phone.width) / 2 / cell) * cell
  const copyBottom = copyItem.getBoundingClientRect().bottom - origin.top
  let splitY = snapHeroGridLine(copyBottom)
  if (splitY < outer.top + cell) splitY = outer.top + cell
  return {
    box: {
      left,
      top: outer.top,
      width: phone.width,
      height: splitY - outer.top + phone.height,
    },
    cells: [
      {
        left,
        top: outer.top,
        width: phone.width,
        height: splitY - outer.top,
      },
      { left, top: splitY, width: phone.width, height: phone.height },
    ],
  }
}

export function LandingNewWalletGridFrame({
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
      const originEl = document.querySelector(`[${WALLET_GRID_ORIGIN_ATTR}]`)
      if (!originEl) {
        setLayout(null)
        return
      }
      const origin = originEl.getBoundingClientRect()
      const wrapRect = wrap.getBoundingClientRect()
      if (wrapRect.width < 2) return

      const items = Array.from(grid.children) as HTMLElement[]
      if (items.length < 2) return

      const measureRect = {
        left: wrapRect.left,
        top: wrapRect.top,
        right: wrapRect.right,
        bottom: wrapRect.bottom,
      }

      const outer = snapBoxToHeroGrid(measureRect, origin, 0)
      const desktop = window.matchMedia(MD_QUERY).matches
      const built = desktop
        ? desktopCells(outer)
        : stackedCells(outer, items[0], origin)
      const wrapBox = toWrap(built.box, wrapRect, origin)
      const cells = built.cells.map((box) => toWrap(box, wrapRect, origin))
      const next: ClusterLayout = {
        width: built.box.width,
        height: built.box.height,
        left: wrapBox.left,
        top: wrapBox.top,
        rowTemplate: desktop
          ? `${cells[0].height}px`
          : `${cells[0].height}px ${cells[1].height}px`,
        colTemplate: desktop
          ? `${cells[0].width}px ${cells[1].width}px`
          : `${cells[0].width}px`,
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

  const gridStyle: CSSProperties | undefined = layout
    ? {
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        gridTemplateColumns: layout.colTemplate,
        gridTemplateRows: layout.rowTemplate,
      }
    : undefined

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
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
            d={segsToPath(frameSegments(layout.cells), layout.left, layout.top)}
            fill="none"
            stroke={isDark ? HERO_GRID_LINE_DARK : HERO_GRID_LINE_LIGHT}
            strokeWidth={1}
            strokeLinecap="square"
          />
        </svg>
      ) : null}
      <div
        ref={gridRef}
        className={`relative z-10 grid min-w-0 grid-cols-1 md:grid-cols-2 ${
          layout ? "absolute" : ""
        }`}
        style={gridStyle}
      >
        {children}
      </div>
    </div>
  )
}
