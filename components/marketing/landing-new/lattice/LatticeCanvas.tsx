"use client"

import { useEffect, useRef, type RefObject } from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_ATTR,
  LATTICE_LINE_DARK,
  LATTICE_LINE_LIGHT,
  LATTICE_ROOT_ATTR,
  LATTICE_WORLD_COL_OFFSET,
  latticeMod,
  latticeWorldCell,
} from "@/lib/landingLattice"

/**
 * Full-bleed 1px line lattice with tromino holes. Lines are phased to the
 * content column's left edge (x) and the lattice root's top (y), and the
 * holes come from one shared world field, so every canvas on the page is a
 * window onto the same grid.
 */

type CanvasHandle = { destroy: () => void; redraw: () => void }

function startLattice(
  canvas: HTMLCanvasElement,
  themeRef: { current: { isDark: boolean } },
  columnRef?: RefObject<HTMLElement | null>,
): CanvasHandle {
  const host = canvas.parentElement
  const ctx = canvas.getContext("2d")
  if (!host || !ctx) return { destroy: () => {}, redraw: () => {} }

  let W = 0
  let H = 0
  let DPR = 1
  let cols = 0
  let rows = 0
  let ox = 0
  let oy = 0
  let worldCol0 = 0
  let worldRow0 = 0
  let destroyed = false

  const cell = LATTICE_CELL_PX

  function anchors() {
    const hostRect = host!.getBoundingClientRect()
    const column =
      columnRef?.current ??
      (document.querySelector(`[${LATTICE_COLUMN_ATTR}]`) as HTMLElement | null)
    const root = document.querySelector(`[${LATTICE_ROOT_ATTR}]`)
    const colLeft = column ? column.getBoundingClientRect().left : hostRect.left
    const rootTop = root ? root.getBoundingClientRect().top : hostRect.top
    const dx = hostRect.left - colLeft
    const dy = hostRect.top - rootTop
    ox = -latticeMod(dx)
    oy = -latticeMod(dy)
    worldCol0 = LATTICE_WORLD_COL_OFFSET + Math.round((dx + ox) / cell)
    worldRow0 = Math.round((dy + oy) / cell)
  }

  function hasCell(col: number, row: number) {
    return latticeWorldCell(worldCol0 + col, worldRow0 + row)
  }

  function layout() {
    const r = host!.getBoundingClientRect()
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = r.width
    H = r.height
    if (!W || !H) return
    canvas.width = Math.round(W * DPR)
    canvas.height = Math.round(H * DPR)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    cols = Math.ceil(W / cell) + 2
    rows = Math.ceil(H / cell) + 2
  }

  function draw() {
    if (destroyed || !W || !H) return
    anchors()
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx!.clearRect(0, 0, W, H)
    ctx!.strokeStyle = themeRef.current.isDark ? LATTICE_LINE_DARK : LATTICE_LINE_LIGHT
    ctx!.lineWidth = 1
    ctx!.beginPath()
    for (let r = 0; r <= rows; r++) {
      const y = r * cell + oy + 0.5
      for (let c = 0; c < cols; c++) {
        if (!hasCell(c, r) && !hasCell(c, r - 1)) continue
        const x0 = c * cell + ox
        ctx!.moveTo(x0, y)
        ctx!.lineTo(x0 + cell, y)
      }
    }
    for (let c = 0; c <= cols; c++) {
      const x = c * cell + ox + 0.5
      for (let r = 0; r < rows; r++) {
        if (!hasCell(c, r) && !hasCell(c - 1, r)) continue
        const y0 = r * cell + oy
        ctx!.moveTo(x, y0)
        ctx!.lineTo(x, y0 + cell)
      }
    }
    ctx!.stroke()
  }

  function relayout() {
    layout()
    draw()
  }

  relayout()

  const ro = new ResizeObserver(relayout)
  ro.observe(host)
  // Sections above may change height (fonts, snapping); the root grows with them.
  const root = document.querySelector(`[${LATTICE_ROOT_ATTR}]`)
  if (root) ro.observe(root)
  window.addEventListener("resize", relayout)
  const fonts = document.fonts?.ready.then(relayout)

  return {
    destroy() {
      destroyed = true
      ro.disconnect()
      window.removeEventListener("resize", relayout)
      void fonts
    },
    redraw: draw,
  }
}

export function LatticeCanvas({
  columnRef,
}: {
  /** The section's own column; falls back to the first column in the document. */
  columnRef?: RefObject<HTMLElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<CanvasHandle | null>(null)
  const isDark = useMarketingTheme()?.isDark ?? false
  const themeRef = useRef({ isDark })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handle = startLattice(canvas, themeRef, columnRef)
    handleRef.current = handle
    return () => {
      handle.destroy()
      handleRef.current = null
    }
  }, [columnRef])

  useEffect(() => {
    themeRef.current = { isDark }
    handleRef.current?.redraw()
  }, [isDark])

  return (
    <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />
  )
}
