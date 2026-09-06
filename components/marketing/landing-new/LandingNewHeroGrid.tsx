"use client"

import { useEffect, useRef } from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"
import {
  buildHeroGrid,
  HERO_GRID_CELL_PX,
  HERO_GRID_LINE_DARK,
  HERO_GRID_LINE_LIGHT,
} from "@/lib/landingNewHeroGrid"

/**
 * Full-bleed line grid behind the new-landing hero and feature band. Same
 * 60px x/y lattice as the 2,000,000 band: 1px rules, with tromino-shaped
 * holes. Lines only. Copy sits on `LandingNewHeroGridPlate` cards snapped
 * to this lattice.
 */

type GridHandle = {
  destroy: () => void
  redraw: () => void
}

function startHeroGrid(
  canvas: HTMLCanvasElement,
  themeRef: { current: { isDark: boolean } },
): GridHandle {
  const host = canvas.parentElement
  const ctx = canvas.getContext("2d")
  if (!host || !ctx) return { destroy: () => {}, redraw: () => {} }

  const seed = (Math.random() * 0xffffffff) >>> 0
  let present: boolean[][] = []
  let W = 0
  let H = 0
  let DPR = 1
  let cols = 0
  let rows = 0
  let destroyed = false

  function hasCell(col: number, row: number) {
    if (col < 0 || row < 0 || col >= cols || row >= rows) return false
    return present[row][col]
  }

  function layout() {
    const r = host.getBoundingClientRect()
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = r.width
    H = r.height
    if (!W || !H) return
    canvas.width = Math.round(W * DPR)
    canvas.height = Math.round(H * DPR)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const nextCols = Math.ceil(W / HERO_GRID_CELL_PX) + 1
    const nextRows = Math.ceil(H / HERO_GRID_CELL_PX) + 1
    if (nextCols !== cols || nextRows !== rows) {
      cols = nextCols
      rows = nextRows
      present = buildHeroGrid(cols, rows, seed)
    }
  }

  function draw() {
    if (destroyed || !W || !H) return
    const cell = HERO_GRID_CELL_PX
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = themeRef.current.isDark ? HERO_GRID_LINE_DARK : HERO_GRID_LINE_LIGHT
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let r = 0; r <= rows; r++) {
      const y = r * cell + 0.5
      for (let c = 0; c < cols; c++) {
        if (!hasCell(c, r) && !hasCell(c, r - 1)) continue
        const x0 = c * cell
        ctx.moveTo(x0, y)
        ctx.lineTo(x0 + cell, y)
      }
    }
    for (let c = 0; c <= cols; c++) {
      const x = c * cell + 0.5
      for (let r = 0; r < rows; r++) {
        if (!hasCell(c, r) && !hasCell(c - 1, r)) continue
        const y0 = r * cell
        ctx.moveTo(x, y0)
        ctx.lineTo(x, y0 + cell)
      }
    }
    ctx.stroke()
  }

  function relayout() {
    layout()
    draw()
  }

  relayout()

  const ro = new ResizeObserver(relayout)
  ro.observe(host)

  return {
    destroy() {
      destroyed = true
      ro.disconnect()
    },
    redraw: draw,
  }
}

export function LandingNewHeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<GridHandle | null>(null)
  const isDark = useMarketingTheme()?.isDark ?? false
  const themeRef = useRef({ isDark })
  themeRef.current = { isDark }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handle = startHeroGrid(canvas, themeRef)
    handleRef.current = handle
    return () => {
      handle.destroy()
      handleRef.current = null
    }
  }, [])

  useEffect(() => {
    handleRef.current?.redraw()
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 block h-full w-full"
    />
  )
}
