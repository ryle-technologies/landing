"use client"

import { useEffect, useState } from "react"
import { ABOUT } from "@/components/marketing/institutional/content"
import {
  monoLabelBaseClassName,
  monoLabelClassName,
} from "@/components/marketing/institutional/styles"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"

type Office = (typeof ABOUT.offices.locations)[number]

/** Two offices side by side down to this many cells. */
const PAIR_MIN_COLS = 12
const OFFICE_ROWS = 2

const CLOCK_TICK_MS = 15_000

/** `HH:MM` and the zone's short name, or `null` until the client has mounted. */
function useLocalTime(timeZone: string) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
      timeZoneName: "short",
    })
    const tick = () => setTime(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, CLOCK_TICK_MS)
    return () => window.clearInterval(id)
  }, [timeZone])

  return time
}

function OfficeCell({ office, index }: { office: Office; index: number }) {
  const { cols, stacked } = useLatticeGrid()
  const time = useLocalTime(office.timeZone)

  return (
    <LatticeCell
      // Odd column counts (15 at 1024px) give the first office the extra cell.
      cols={index % 2 === 0 ? Math.ceil(cols / 2) : Math.floor(cols / 2)}
      rows={stacked ? "auto" : OFFICE_ROWS}
      minRows={OFFICE_ROWS}
      bodyClassName="justify-center"
    >
      <div className="flex min-w-0 items-end justify-between gap-4 px-6 md:px-8">
        <div className="min-w-0">
          <p className={monoLabelClassName}>{ABOUT.offices.entity}</p>
          <p className="mt-2 text-left font-serif text-[22px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[24px]">
            {office.city}
            <span className="whitespace-nowrap font-sans text-[15px] font-normal not-italic tracking-[-0.01em] text-muted max-sm:block max-sm:pt-1">
              <span className="max-sm:hidden">{" · "}</span>
              {office.country}
            </span>
          </p>
        </div>
        <p
          className={`${monoLabelBaseClassName} shrink-0 whitespace-nowrap text-right text-muted`}
        >
          <span className="sr-only">Local time: </span>
          {/* Placeholder keeps the width until the client clock mounts. */}
          <span className={time ? "" : "opacity-0"}>{time ?? "00:00 CET"}</span>
        </p>
      </div>
    </LatticeCell>
  )
}

/** Where the firm is: one cell per office, with its local time. */
export function InstitutionalOffices({ className = "" }: { className?: string }) {
  return (
    <LatticeGrid className={className} minCols={PAIR_MIN_COLS} stroke>
      {ABOUT.offices.locations.map((office, index) => (
        <OfficeCell key={office.city} office={office} index={index} />
      ))}
    </LatticeGrid>
  )
}
