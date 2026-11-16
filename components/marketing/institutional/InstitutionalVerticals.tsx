"use client"

import {
  SECTION_IDS,
  WHAT_WE_DO,
  type Vertical,
} from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import {
  cardBodyClassName,
  displayClassName,
} from "@/components/marketing/institutional/styles"
import { LandingNewLatticeCta } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const HEADING_ID = "institutional-what-we-do-heading"

/** Two cards side by side need 6 cells each. Below that they stack. */
const VERTICALS_MIN_COLS = 12
/** Close to the measured card so the SSR height does not jump. */
const VERTICAL_MIN_ROWS = 6
/** Phone cards stack and read one cell shorter than the desktop pair. */
const VERTICAL_MIN_ROWS_STACKED = VERTICAL_MIN_ROWS - 1

/** Same plate as the Client Services use-case blocks: white, 1px border, 16px radius. */
const verticalCardClassName =
  "flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--border)]"

/** 32px on a phone keeps "Ryle Client Services" on one line inside a 5-cell column. */
const verticalNameClassName =
  "text-left font-sans text-[32px] font-normal not-italic leading-none tracking-tighter text-foreground sm:text-[40px]"

const verticalDescriptorClassName =
  "text-left text-[18px] font-normal leading-snug tracking-[-0.02em] text-foreground sm:text-[20px]"

function VerticalCard({
  vertical,
  position,
}: {
  vertical: Vertical
  position: 0 | 1
}) {
  const { cols, stacked } = useLatticeGrid()
  // Odd column counts (15 at 1024px) give the first card the extra cell.
  const span = position === 0 ? Math.ceil(cols / 2) : Math.floor(cols / 2)
  const titleId = `institutional-vertical-${vertical.index}`
  // Pin both cells. An explicit row on only the second card lets the grid
  // place it first and swap the two sides.
  const colStart = stacked ? undefined : position === 0 ? 1 : Math.ceil(cols / 2) + 1
  const rowStart = stacked ? undefined : position === 0 ? 1 : 2

  return (
    <LatticeCell
      cols={span}
      colStart={colStart}
      rowStart={rowStart}
      minRows={stacked ? VERTICAL_MIN_ROWS_STACKED : VERTICAL_MIN_ROWS}
    >
      <article
        aria-labelledby={titleId}
        className={`${verticalCardClassName} ${LATTICE_SPACE.inset}`}
      >
        <h3 id={titleId} className={verticalNameClassName}>
          {vertical.name}
        </h3>
        <p className={`${verticalDescriptorClassName} mt-2 md:mt-3`}>
          {vertical.descriptor}
        </p>
        <p className={`${cardBodyClassName} mt-2 md:mt-5 max-w-[30rem]`}>
          <span className="text-foreground">{vertical.audience}</span>{" "}
          {vertical.body}
        </p>
        <div className="mt-auto md:pt-8">
          <LandingNewLatticeCta
            label={vertical.cta.label}
            href={vertical.cta.href}
            tone="cream"
          />
        </div>
      </article>
    </LatticeCell>
  )
}

/**
 * The firm in one picture: two verticals chosen by who the client is.
 */
export function InstitutionalVerticals() {
  return (
    <LatticeSection
      id={SECTION_IDS.whatWeDo}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTop"
    >
      <LatticePlate fill flushLeft>
        <InstitutionalHeading
          id={HEADING_ID}
          className={displayClassName}
          lines={WHAT_WE_DO.titleLines}
          end=""
          breakFrom="md"
        />
      </LatticePlate>
      <LatticeGrid
        className={LATTICE_SPACE.blockTight}
        minCols={VERTICALS_MIN_COLS}
        equalRows
      >
        <VerticalCard vertical={WHAT_WE_DO.verticals[0]} position={0} />
        <VerticalCard vertical={WHAT_WE_DO.verticals[1]} position={1} />
      </LatticeGrid>
    </LatticeSection>
  )
}
