"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { LatticeCanvas } from "@/components/marketing/landing-new/lattice/LatticeCanvas"
import {
  LATTICE_COLUMN_ATTR,
  LATTICE_SPACE,
  ceilToLattice,
  cellsPx,
  latticeColumnClassName,
} from "@/lib/landingLattice"

/**
 * Vertical masks for the section's lattice canvas. Keys are the shapes the
 * page uses; pass any `linear-gradient(...)` string for a one-off.
 */
export const LATTICE_GRID_MASKS = {
  solid: undefined,
  /**
   * Cell-based, not a % of section height — a tall section would otherwise
   * still show a hard lattice at the top. First two cells empty, then in
   * over three more so the heading sits on paper and the cards get the grid.
   */
  fadeTop:
    "linear-gradient(to bottom, transparent 0%, transparent 128px, black 320px, black 100%)",
  fadeBottom: "linear-gradient(to bottom, black 0%, black 84%, transparent 100%)",
  /** Same top fade as fadeTop, plus the cards dissolve at the section end. */
  fadeTopBottom:
    "linear-gradient(to bottom, transparent 0%, transparent 128px, black 320px, black 84%, transparent 100%)",
  fadeBoth: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
  /**
   * Like fadeBoth, but the first two cells stay empty so a section-top
   * lattice line doesn't read as a hard edge.
   */
  fadeIn: "linear-gradient(to bottom, transparent 0%, transparent 128px, black 256px, black 88%, transparent 100%)",
  hero: "linear-gradient(to bottom, transparent 0%, transparent 6%, black 22%, black 84%, transparent 100%)",
  /**
   * Last section: fade in from the seam, hold through the sitemap, then
   * dissolve through the closing type so the last cell is empty paper.
   */
  pageEnd: "linear-gradient(to bottom, transparent 0%, black 8%, black 64%, transparent 88%)",
} as const

/** Mobile: one cell above the section pad — a seam, not a wash over the preview. */
const CONTENT_FADE_MOBILE_PX = cellsPx(1)
/** Desktop: eight cells from the section bottom so a full card row dissolves. */
const CONTENT_FADE_DESKTOP_PX = cellsPx(8)

type LatticeGridMask = keyof typeof LATTICE_GRID_MASKS | `linear-gradient(${string}`

type LatticeSectionProps = {
  children: ReactNode
  as?: "section" | "div" | "header" | "footer"
  id?: string
  className?: string
  /** Extra classes on the content column. */
  columnClassName?: string
  /** Paint the lattice canvas behind the section. `false` for plain sections. */
  grid?: boolean
  gridMask?: LatticeGridMask
  /**
   * Wash the bottom of the section so cards and lattice dissolve into the page.
   * One cell on small screens; a full card row from `md`.
   */
  contentFade?: "bottom"
  /** Apply {@link LATTICE_SPACE.sectionY}. Turn off to set your own cell-multiple padding. */
  pad?: boolean
  /** Round the section's height up to whole cells so the next section starts on a line. */
  snap?: boolean
  "aria-label"?: string
  "aria-labelledby"?: string
}

/**
 * The unit of the page. Full width, paints the lattice behind itself, hosts
 * one content column, and pads its own height out to the next lattice line.
 * Stack these and every section top is a grid line.
 */
export function LatticeSection({
  children,
  as = "section",
  id,
  className = "",
  columnClassName = "",
  grid = true,
  gridMask = "solid",
  contentFade,
  pad = true,
  snap = true,
  ...aria
}: LatticeSectionProps) {
  // All allowed tags are plain block elements; type the ref as one.
  const Tag = as as "section"
  const sectionRef = useRef<HTMLElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef(0)
  const [fill, setFill] = useState(0)

  useLayoutEffect(() => {
    if (!snap) return
    const section = sectionRef.current
    if (!section) return

    const apply = () => {
      const total = section.getBoundingClientRect().height
      if (total < 1) return
      const natural = total - fillRef.current
      const next = Math.round((ceilToLattice(natural) - natural) * 100) / 100
      if (Math.abs(next - fillRef.current) < 0.05) return
      fillRef.current = next
      setFill(next)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(section)
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      void fonts
    }
  }, [snap])

  const mask =
    gridMask in LATTICE_GRID_MASKS
      ? LATTICE_GRID_MASKS[gridMask as keyof typeof LATTICE_GRID_MASKS]
      : gridMask
  const maskStyle: CSSProperties | undefined = mask
    ? {
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }
    : undefined

  return (
    <Tag
      ref={sectionRef}
      id={id}
      className={`relative w-full min-w-0 ${pad ? LATTICE_SPACE.sectionY : ""} ${className}`}
      {...aria}
    >
      {grid ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={maskStyle}
        >
          <LatticeCanvas columnRef={columnRef} />
        </div>
      ) : null}
      <div
        ref={columnRef}
        {...{ [LATTICE_COLUMN_ATTR]: "" }}
        // `flow-root` keeps a first child's top margin (e.g. a plate's `mt-16`)
        // inside the column instead of collapsing through and shifting the
        // section down.
        className={`${latticeColumnClassName} relative z-10 flow-root min-w-0 ${columnClassName}`}
      >
        {children}
      </div>
      {contentFade === "bottom" ? (
        <>
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 z-40 md:hidden ${pad ? "bottom-16" : "bottom-0"}`}
            style={{
              height: CONTENT_FADE_MOBILE_PX,
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 35%, var(--marketing-surface) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 hidden md:block"
            style={{
              height: CONTENT_FADE_DESKTOP_PX,
              background:
                "linear-gradient(to bottom, transparent, var(--marketing-surface))",
            }}
          />
        </>
      ) : null}
      {snap && fill > 0 ? <div aria-hidden style={{ height: fill }} /> : null}
    </Tag>
  )
}
