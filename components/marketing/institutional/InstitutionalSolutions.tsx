"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useInView, useReducedMotion } from "motion/react"
import {
  SECTION_IDS,
  SOLUTIONS,
  type SolutionFamily,
} from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import {
  cardBodyClassName,
  displayClassName,
  monoLabelClassName,
  heroLeadClassName,
} from "@/components/marketing/institutional/styles"
import { LandingNewUseCaseShape } from "@/components/marketing/landing-new/LandingNewUseCaseShape"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"
import { LATTICE_CELL_PX, LATTICE_SPACE } from "@/lib/landingLattice"
import { usePageVisible } from "@/lib/usePageVisible"

const HEADING_ID = "institutional-solutions-heading"

/** Shape | title | description. Below this each family is one cell. */
const TABLE_MIN_COLS = 11
/** Room for the index column at the end of each row. */
const INDEX_MIN_COLS = 14
/** Title column: wide enough for the longest family name on one line. */
const TITLE_COLS = 6
const TITLE_COLS_NARROW = 5
/** How long a row stays lit before the next one takes over. */
const ROW_HOLD_MS = 3600

const rowTitleClassName =
  "text-left font-serif text-[21px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[23px]"

function ShapeSlot({ family, live }: { family: SolutionFamily; live: boolean }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center"
      style={{ width: LATTICE_CELL_PX, height: LATTICE_CELL_PX }}
    >
      <LandingNewUseCaseShape className="size-8" kind={family.shape} active={live} />
    </span>
  )
}

/** Fills the cell so the whole row answers to the pointer, not just the text. */
function RowHit({
  onEnter,
  onLeave,
  className = "",
  children,
}: {
  onEnter: () => void
  onLeave: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 ${className}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  )
}

function FamilyRow({
  family,
  live,
  onEnter,
  onLeave,
}: {
  family: SolutionFamily
  live: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const { cols, stacked } = useLatticeGrid()
  const bodyToneClassName = live ? "text-foreground" : ""

  if (stacked) {
    return (
      <LatticeCell cols="full" minRows={2}>
        <RowHit onEnter={onEnter} onLeave={onLeave} className="items-start">
          <ShapeSlot family={family} live={live} />
          <div className="min-w-0 flex-1 py-4 pr-5">
            <h3 className={rowTitleClassName}>{family.title}</h3>
            <p className={`${cardBodyClassName} mt-1 ${bodyToneClassName}`}>
              {family.body}
            </p>
          </div>
        </RowHit>
      </LatticeCell>
    )
  }

  const showIndex = cols >= INDEX_MIN_COLS
  const titleCols = showIndex ? TITLE_COLS : TITLE_COLS_NARROW
  const bodyCols = Math.max(1, cols - titleCols - (showIndex ? 2 : 1))

  return (
    <>
      <LatticeCell cols={1} rows={1}>
        <RowHit onEnter={onEnter} onLeave={onLeave}>
          <ShapeSlot family={family} live={live} />
        </RowHit>
      </LatticeCell>
      <LatticeCell cols={titleCols} rows={1}>
        <RowHit onEnter={onEnter} onLeave={onLeave} className="items-center px-5">
          <h3
            className={
              showIndex ? rowTitleClassName : `${rowTitleClassName} !text-[20px]`
            }
          >
            {family.title}
          </h3>
        </RowHit>
      </LatticeCell>
      <LatticeCell cols={bodyCols} rows={1}>
        <RowHit onEnter={onEnter} onLeave={onLeave} className="items-center px-5">
          <p className={`${cardBodyClassName} leading-[1.35] ${bodyToneClassName}`}>
            {family.body}
          </p>
        </RowHit>
      </LatticeCell>
      {showIndex ? (
        <LatticeCell cols={1} rows={1}>
          <RowHit
            onEnter={onEnter}
            onLeave={onLeave}
            className="items-center justify-center"
          >
            <span className={monoLabelClassName}>{family.index}</span>
          </RowHit>
        </LatticeCell>
      ) : null}
    </>
  )
}

/**
 * The five product families as an index: one lattice row each. Rows take
 * turns sketching their solid; the pointer overrides the rotation.
 */
export function InstitutionalSolutions() {
  const tableRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const reduceMotion = useReducedMotion() ?? false
  const pageVisible = usePageVisible()
  const inView = useInView(tableRef, {
    root: scrollContainerRef ?? undefined,
    amount: 0.4,
  })
  const [autoIndex, setAutoIndex] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const count = SOLUTIONS.families.length
  const cycling = inView && pageVisible && !reduceMotion && hovered == null

  useEffect(() => {
    if (!cycling) return
    const id = window.setInterval(() => {
      setAutoIndex((index) => (index + 1) % count)
    }, ROW_HOLD_MS)
    return () => window.clearInterval(id)
  }, [count, cycling])

  const liveIndex = hovered ?? (inView && !reduceMotion ? autoIndex : null)

  return (
    <LatticeSection
      id={SECTION_IDS.solutions}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTopBottom"
    >
      <LatticePlate fill flushLeft>
        <p className={`${heroLeadClassName} md:whitespace-nowrap`}>
          {SOLUTIONS.sub}
        </p>
        <InstitutionalHeading
          id={HEADING_ID}
          className={`${displayClassName} mt-5 md:mt-6`}
          lines={SOLUTIONS.titleLines}
          accent={SOLUTIONS.titleAccent}
          accentUnderline={false}
        />
      </LatticePlate>
      <div ref={tableRef} className={LATTICE_SPACE.blockTight}>
        <LatticeGrid minCols={TABLE_MIN_COLS} stroke>
          {SOLUTIONS.families.map((family, index) => (
            <FamilyRow
              key={family.index}
              family={family}
              live={liveIndex === index}
              onEnter={() => setHovered(index)}
              onLeave={() =>
                setHovered((current) => (current === index ? null : current))
              }
            />
          ))}
        </LatticeGrid>
      </div>
    </LatticeSection>
  )
}
