"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { landingFooterAsciiBackgroundMaskClassName } from "@/lib/landingLayout"

/** Deterministic mix of letters, digits, and symbols for the footer texture. */
const CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~"

const CELL_PX = 9
const FONT_PX = 8

function charAt(row: number, col: number) {
  return CHARSET[(row * 7919 + col * 6151) % CHARSET.length]!
}

/**
 * Full-bleed footer menu backdrop: grid of small monospace letters.
 */
export function LandingFooterAsciiBackground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize({ width, height })
    }

    update()
    const frame = requestAnimationFrame(update)
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const cells = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) return []

    const cols = Math.ceil(size.width / CELL_PX)
    const rows = Math.ceil(size.height / CELL_PX)
    const out: string[] = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        out.push(charAt(row, col))
      }
    }

    return out
  }, [size.width, size.height])

  const cols =
    size.width > 0 ? Math.ceil(size.width / CELL_PX) : 0

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${landingFooterAsciiBackgroundMaskClassName}`}
    >
      {cols > 0 && cells.length > 0 ? (
        <div
          className="grid h-full w-full font-mono"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`,
            fontSize: `${FONT_PX}px`,
            lineHeight: `${CELL_PX}px`,
            color: "color-mix(in oklab, #f5f2ee 12%, transparent)",
          }}
        >
          {cells.map((char, index) => (
            <span
              key={index}
              className="flex items-center justify-center tabular-nums"
            >
              {char}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
