"use client"

import React, { useMemo } from "react"
import QRCode from "qrcode"

type ErrorLevel = "L" | "M" | "Q" | "H"

/** Dot-matrix QR (circles per module) with an optional centered cutout. */
export function QRCodeDotMatrix({
  value,
  size = 200,
  fgColor = "#000000",
  bgColor = "transparent",
  level = "M",
  title,
  centerExcavation,
}: {
  value: string
  size?: number
  fgColor?: string
  bgColor?: string
  level?: ErrorLevel
  title?: string
  /** Clear a centered px area (forces level "H") to overlay an avatar. */
  centerExcavation?: { width: number; height: number }
}) {
  const circles = useMemo(() => {
    const hasCutout = centerExcavation != null
    const qr = QRCode.create(value, { errorCorrectionLevel: hasCutout ? "H" : level })
    const matrix = qr.modules
    const n = matrix.size
    const cell = size / n
    const r = cell * 0.45
    const cr = Math.floor(n / 2)
    const cc = Math.floor(n / 2)

    let halfCw = 0
    let halfCh = 0
    if (centerExcavation) {
      const bleed = cell * 0.55
      halfCw = Math.ceil((centerExcavation.width / 2 + bleed) / cell)
      halfCh = Math.ceil((centerExcavation.height / 2 + bleed) / cell)
    }
    const inExcavation = (row: number, col: number) =>
      hasCutout && Math.abs(row - cr) <= halfCh && Math.abs(col - cc) <= halfCw

    const nodes: React.ReactNode[] = []
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (!matrix.get(row, col) || inExcavation(row, col)) continue
        nodes.push(
          <circle
            key={`${row}-${col}`}
            cx={col * cell + cell / 2}
            cy={row * cell + cell / 2}
            r={r}
            fill={fgColor}
          />,
        )
      }
    }
    return nodes
  }, [value, size, fgColor, level, centerExcavation])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={title ?? "QR code"}
    >
      {title ? <title>{title}</title> : null}
      {bgColor !== "transparent" ? <rect width={size} height={size} fill={bgColor} /> : null}
      {circles}
    </svg>
  )
}
