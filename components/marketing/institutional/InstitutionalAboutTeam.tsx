"use client"

import {
  ABOUT,
  ABOUT_SECTION_IDS,
} from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import {
  cardBodyClassName,
  displayLongClassName,
  kickerClassName,
  monoLabelBaseClassName,
  monoLabelClassName,
  sectionLeadClassName,
} from "@/components/marketing/institutional/styles"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const HEADING_ID = "institutional-about-team-heading"

type Founder = (typeof ABOUT.team.founders)[number]

/** Two founders side by side down to this many cells. */
const PAIR_MIN_COLS = 12
const FOUNDER_MIN_ROWS = 6

function FounderCard({ founder, index }: { founder: Founder; index: number }) {
  const { cols } = useLatticeGrid()

  return (
    <LatticeCell
      // Odd column counts (15 at 1024px) give the first card the extra cell.
      cols={index % 2 === 0 ? Math.ceil(cols / 2) : Math.floor(cols / 2)}
      minRows={FOUNDER_MIN_ROWS}
    >
      <article className={`flex h-full min-w-0 flex-col ${LATTICE_SPACE.inset}`}>
        <header className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center bg-foreground/[0.06] font-serif text-[17px] font-medium leading-none tracking-[-0.02em] text-foreground"
          >
            {founder.initials}
          </span>
          <div className="min-w-0">
            <h3 className="text-left font-serif text-[24px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[26px]">
              {founder.name}
            </h3>
            <p className={`${monoLabelClassName} mt-1.5`}>{founder.role}</p>
          </div>
        </header>
        <p className="mt-6 max-w-[26rem] text-left text-[15px] font-normal leading-[1.5] text-foreground sm:text-[16px]">
          {founder.summary}
        </p>
        <dl className="mt-auto flex flex-col gap-3 pt-8">
          {founder.career.map((entry) => (
            <div
              key={entry.org}
              className="grid grid-cols-1 items-baseline gap-x-4 gap-y-1 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
            >
              <dt className={`${monoLabelBaseClassName} text-foreground`}>
                {entry.org}
              </dt>
              <dd className={cardBodyClassName}>{entry.detail}</dd>
            </div>
          ))}
        </dl>
      </article>
    </LatticeCell>
  )
}

/** Team: who founded Ryle and what they did before. */
export function InstitutionalAboutTeam() {
  const { team } = ABOUT

  return (
    <LatticeSection
      id={ABOUT_SECTION_IDS.team}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTopBottom"
    >
      <LatticePlate fill>
        <p className={kickerClassName}>{team.kicker}</p>
        <InstitutionalHeading
          id={HEADING_ID}
          className={`${displayLongClassName} mt-3 md:mt-4`}
          lines={team.titleLines}
          accent={team.titleAccent}
        />
        <p className={`${sectionLeadClassName} mt-5 max-w-[42rem] md:mt-6`}>
          {team.sub}
        </p>
      </LatticePlate>
      <LatticeGrid
        className={LATTICE_SPACE.blockTight}
        minCols={PAIR_MIN_COLS}
        stroke
        equalRows
      >
        {team.founders.map((founder, index) => (
          <FounderCard key={founder.name} founder={founder} index={index} />
        ))}
      </LatticeGrid>
    </LatticeSection>
  )
}
