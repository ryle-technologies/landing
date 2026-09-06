"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import {
  HERO_GRID_ORIGIN_ATTR,
  snapBoxToHeroGrid,
  type HeroGridBox,
} from "@/lib/landingNewHeroGrid"

/**
 * Paper plate behind hero copy. Snaps to the 60px lattice and sits 1px
 * inside it so the existing grid strokes are the frame — no second border.
 */

const PAD = 8

type LandingNewHeroGridPlateProps = {
  children: ReactNode
  className?: string
  /** Attribute on the lattice origin. Defaults to the hero band. */
  originAttr?: string
}

export function LandingNewHeroGridPlate({
  children,
  className = "",
  originAttr = HERO_GRID_ORIGIN_ATTR,
}: LandingNewHeroGridPlateProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [plate, setPlate] = useState<HeroGridBox | null>(null)

  useLayoutEffect(() => {
    const inner = innerRef.current
    const wrap = wrapRef.current
    if (!inner || !wrap) return

    const apply = () => {
      const origin = document.querySelector(`[${originAttr}]`)
      if (!origin) {
        setPlate(null)
        return
      }
      const o = origin.getBoundingClientRect()
      const r = inner.getBoundingClientRect()
      const w = wrap.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) return
      const snapped = snapBoxToHeroGrid(r, o, PAD)
      setPlate({
        left: snapped.left - (w.left - o.left),
        top: snapped.top - (w.top - o.top),
        width: snapped.width,
        height: snapped.height,
      })
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(inner)
    window.addEventListener("resize", apply)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", apply)
      void fonts
    }
  }, [originAttr])

  return (
    <div ref={wrapRef} className={`relative w-fit max-w-full ${className}`}>
      {plate ? (
        <div
          aria-hidden
          className="pointer-events-none absolute bg-[var(--marketing-surface)]"
          style={{
            left: plate.left + 1,
            top: plate.top + 1,
            width: Math.max(0, plate.width - 1),
            height: Math.max(0, plate.height - 1),
          }}
        />
      ) : null}
      <div ref={innerRef} className="relative z-10">
        {children}
      </div>
    </div>
  )
}
