"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { ceilToLattice, LATTICE_SPACE } from "@/lib/landingLattice"

/**
 * Paper plate for copy that sits directly on the lattice (headings, stats).
 * Shrink-wraps its content, then rounds its own width and height **up** to
 * whole cells so its edges are grid lines and the next sibling starts on
 * one. The surface is inset 1px top/left so the lattice stroke stays the
 * frame — no second border.
 */
export function LatticePlate({
  children,
  className = "",
  inset = true,
  fill = false,
}: {
  children: ReactNode
  className?: string
  /** Copy inset ({@link LATTICE_SPACE.plateInset}). Off for content that carries its own padding. */
  inset?: boolean
  /** Span the parent cell instead of shrink-wrapping width. Height still ceils to a line. */
  fill?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return

    const apply = () => {
      const parent = wrap.parentElement
      const maxWidth = parent ? parent.getBoundingClientRect().width : Infinity
      // Release the snapped width so the copy can re-flow to its natural size
      // (otherwise a plate measured on a narrow viewport could never grow).
      wrap.style.width = ""
      wrap.style.minHeight = ""
      const r = inner.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return
      const width = fill
        ? ceilToLattice(maxWidth)
        : Math.min(ceilToLattice(r.width), ceilToLattice(maxWidth))
      const height = ceilToLattice(r.height)
      wrap.style.width = fill ? "100%" : `${width}px`
      wrap.style.minHeight = `${height}px`
      setSize((prev) =>
        prev && prev.width === width && prev.height === height ? prev : { width, height },
      )
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(inner)
    if (wrap.parentElement) ro.observe(wrap.parentElement)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      void fonts
    }
  }, [fill])

  return (
    <div
      ref={wrapRef}
      className={`relative max-w-full ${className}`}
      style={
        size
          ? { width: fill ? "100%" : size.width, minHeight: size.height }
          : undefined
      }
    >
      {size ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 top-px left-px bg-[var(--marketing-surface)]"
        />
      ) : null}
      <div
        ref={innerRef}
        className={`relative z-10 max-w-full ${fill ? "w-full" : "w-fit"} ${inset ? LATTICE_SPACE.plateInset : ""}`}
      >
        {children}
      </div>
    </div>
  )
}
