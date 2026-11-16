"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "motion/react"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"
import { usePageVisible } from "@/lib/usePageVisible"

/*
 * Mono panels for the Ryle Platform modules. Same grammar as the monitoring
 * feed on Client Services (`LandingNewFeatureEventConsole`): small caps mono
 * in ink tints, one fixed row height, no chrome. Sample data is illustrative.
 * Only opacity moves: colour transitions are disabled under the marketing
 * viewport.
 */

const ROW_PX = 24
const rowClassName =
  "flex min-w-0 items-center gap-3 font-mono text-[10px] uppercase leading-none tracking-wide"
const keyClassName = "w-[5.5rem] shrink-0 text-foreground/40"
const leaderClassName = "h-px min-w-0 flex-1 bg-foreground/10"
const fadeClassName = "transition-opacity duration-500 ease-out"

/** True while the panel is on screen, the tab is visible and motion is allowed. */
function usePanelPlaying<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const reduceMotion = useReducedMotion() ?? false
  const pageVisible = usePageVisible()
  const inView = useInView(ref, {
    root: scrollContainerRef ?? undefined,
    amount: 0.5,
  })
  return { ref, playing: inView && pageVisible && !reduceMotion }
}

/* ─── Issuance: the rules an instrument operates under ──────────────────── */

const INSTRUMENT_KEYS = [
  "Asset",
  "Supply cap",
  "Transfers",
  "Redemption",
  "Status",
] as const

const INSTRUMENTS: readonly (readonly string[])[] = [
  ["Fund share · A", "10,000,000", "Allowlist only", "Monthly · at NAV", "Active"],
  ["Stablecoin · USDx", "Uncapped", "Open", "On demand", "Active"],
  ["Commodity · 1 ton", "250,000", "Verified holders", "Physical or cash", "Active"],
]

const INSTRUMENT_HOLD_MS = 4200
/** Rows swap top to bottom, this far apart. */
const INSTRUMENT_ROW_STAGGER_MS = 90

/**
 * One instrument's operating rules, cycling through three kinds of asset.
 * The keys stay; the values cross-fade row by row.
 */
export function InstitutionalInstrumentRules() {
  const { ref, playing } = usePanelPlaying<HTMLDivElement>()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setActive((index) => (index + 1) % INSTRUMENTS.length)
    }, INSTRUMENT_HOLD_MS)
    return () => window.clearInterval(id)
  }, [playing])

  return (
    <div ref={ref} aria-hidden className="w-full min-w-0">
      {INSTRUMENT_KEYS.map((key, rowIndex) => {
        const isStatus = rowIndex === INSTRUMENT_KEYS.length - 1
        return (
          <div key={key} className={rowClassName} style={{ height: ROW_PX }}>
            <span className={keyClassName}>{key}</span>
            <span className={leaderClassName} />
            <span className="relative grid shrink-0 justify-items-end">
              {INSTRUMENTS.map((values, instrumentIndex) => (
                <span
                  key={instrumentIndex}
                  className={`col-start-1 row-start-1 flex items-center gap-1.5 whitespace-nowrap text-foreground/70 ${fadeClassName}`}
                  style={{
                    opacity: instrumentIndex === active ? 1 : 0,
                    transitionDelay: `${rowIndex * INSTRUMENT_ROW_STAGGER_MS}ms`,
                  }}
                >
                  {isStatus ? (
                    <span className="size-1.5 shrink-0 bg-foreground/70" />
                  ) : null}
                  {values[rowIndex]}
                </span>
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Privacy: the same record, seen by two viewers ─────────────────────── */

const DISCLOSURE_VIEWS = ["Public", "Auditor"] as const

type DisclosureRow = {
  key: string
  value: string
  /** Hidden from the public view; `barPx` is the redaction width. */
  barPx?: number
}

const DISCLOSURE_ROWS: readonly DisclosureRow[] = [
  { key: "Holder", value: "Verified · NL", barPx: 76 },
  { key: "Amount", value: "250,000.00", barPx: 58 },
  { key: "Counterparty", value: "Fund admin", barPx: 68 },
  { key: "Proof", value: "Valid" },
]

/** Public holds a little shorter than the auditor view. */
const DISCLOSURE_HOLD_MS = [2600, 3400] as const

/**
 * Selective disclosure: private fields are redacted for the public and
 * readable for an authorized auditor. The proof is valid for both.
 */
export function InstitutionalDisclosureDemo() {
  const { ref, playing } = usePanelPlaying<HTMLDivElement>()
  const [view, setView] = useState(0)

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      setView((current) => (current + 1) % DISCLOSURE_VIEWS.length)
    }, DISCLOSURE_HOLD_MS[view] ?? DISCLOSURE_HOLD_MS[0])
    return () => window.clearTimeout(id)
  }, [playing, view])

  const disclosed = view === 1

  return (
    <div ref={ref} aria-hidden className="w-full min-w-0">
      <div className={rowClassName} style={{ height: ROW_PX }}>
        <span className={keyClassName}>View</span>
        <span className="flex min-w-0 items-center gap-3">
          {DISCLOSURE_VIEWS.map((label, index) => (
            <span key={label} className="relative flex h-4 items-center">
              <span
                className={`text-foreground ${fadeClassName}`}
                style={{ opacity: index === view ? 1 : 0.35 }}
              >
                {label}
              </span>
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-foreground ${fadeClassName}`}
                style={{ opacity: index === view ? 0.7 : 0 }}
              />
            </span>
          ))}
        </span>
      </div>
      {DISCLOSURE_ROWS.map((row, rowIndex) => (
        <div key={row.key} className={rowClassName} style={{ height: ROW_PX }}>
          <span className={keyClassName}>{row.key}</span>
          <span className={leaderClassName} />
          <span className="relative grid shrink-0 items-center justify-items-end">
            <span
              className={`col-start-1 row-start-1 whitespace-nowrap text-foreground/70 ${fadeClassName}`}
              style={{
                opacity: row.barPx == null || disclosed ? 1 : 0,
                transitionDelay: `${rowIndex * 70}ms`,
              }}
            >
              {row.value}
            </span>
            {row.barPx != null ? (
              <span
                className={`col-start-1 row-start-1 block h-[7px] rounded-[1px] bg-foreground/15 ${fadeClassName}`}
                style={{
                  width: row.barPx,
                  opacity: disclosed ? 0 : 1,
                  transitionDelay: `${rowIndex * 70}ms`,
                }}
              />
            ) : null}
          </span>
        </div>
      ))}
    </div>
  )
}
