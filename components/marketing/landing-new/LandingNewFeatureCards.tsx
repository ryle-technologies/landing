"use client"

import type { ReactNode } from "react"
import { LandingHomeOrbitNetworkNames } from "@/components/marketing/landing/LandingHomeOrbitNetworkNames"
import { LandingNewFeatureChainSnap } from "@/components/marketing/landing-new/LandingNewFeatureChainSnap"
import { LandingNewFeatureAgentConsole } from "@/components/marketing/landing-new/LandingNewFeatureAgentConsole"
import { LandingNewFeatureCloudConsole } from "@/components/marketing/landing-new/LandingNewFeatureCloudConsole"
import { LandingNewFeatureEventConsole } from "@/components/marketing/landing-new/LandingNewFeatureEventConsole"
import {
  LandingNewFeatureCardsCarousel,
  useIsMobileFeatureCarousel,
} from "@/components/marketing/landing-new/LandingNewFeatureCardsCarousel"
import { LandingNewPillarsHeading } from "@/components/marketing/landing-new/LandingNewPillarsHeading"
import { LandingNewPrivacyCard } from "@/components/marketing/landing-new/LandingNewPrivacyCard"
import { LatticeCell, LatticeGrid } from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"
import { LANDING_FEATURE_SNAP_STAGGER_MS } from "@/lib/landingSnapMotion"

const CARD_MASK = "bg-[var(--marketing-surface)]"

const CELL_PAD = LATTICE_SPACE.inset

/** Three equal cards across 15 cells; the 16th cell is the first-row indent. */
const FEATURE_CARD_COLS = 5
const FEATURE_ROW_MIN_COLS = 3 * FEATURE_CARD_COLS
/** Cards are never shorter than this many cells (also the SSR height). */
const FEATURE_CARD_MIN_ROWS = 5

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const cardTitleClassName =
  "text-left font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]"

const cardBodyClassName =
  "mt-2 text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

const cardVisualConsoleClassName =
  "relative h-[8rem] w-full min-w-0 overflow-hidden sm:h-[8.5rem]"

const cardVisualMonitorClassName =
  "relative h-32 w-full min-w-0 overflow-hidden"

const FEATURE_KICKER = "Ryle Platform"

const FEATURE_TITLE_PREFIX = "A modular platform that plugs"
const FEATURE_TITLE_PREFIX_LINES = [
  "A modular platform",
  "that plugs into your",
] as const
const FEATURE_TITLE_ACCENT_LEAD = "into your"
const FEATURE_TITLE_ACCENT = "existing products"

const EVM_TITLE = "We settle in any EVM."

const EVM_BODY =
  "Ethereum, Base, Arbitrum, Polygon and more. One API, every network you already use."

const DEVELOPERS_TITLE = "Seamless integration."

const DEVELOPERS_BODY =
  "Integrate in days. Works from your codebase and from the AI tools your team already uses."

const MONITORING_TITLE = "Built-in monitoring."

const MONITORING_BODY =
  "Every mint, transfer, disclosure and policy change, as it happens. Attributed. Exportable."

const CLOUD_TITLE = "Runs in your cloud."

const CLOUD_BODY =
  "The stack runs in your AWS, GCP or Azure. You keep the control."

function FeatureCard({
  title,
  body,
  visual,
  extra,
  visualClassName,
  className = "",
}: {
  title: string
  body?: string
  extra?: ReactNode
  visual: ReactNode
  visualClassName?: string
  className?: string
}) {
  return (
    <article
      className={`flex h-full min-w-0 flex-col items-start justify-start gap-6 text-left ${CELL_PAD} ${className}`}
    >
      <div className="w-full min-w-0">
        <h3 className={cardTitleClassName}>{title}</h3>
        {body ? <p className={cardBodyClassName}>{body}</p> : null}
      </div>
      <div className={`w-full min-w-0 ${visualClassName ?? ""}`}>{visual}</div>
      {extra ? <div className="w-full min-w-0">{extra}</div> : null}
    </article>
  )
}

function ChainMarqueeField() {
  return (
    <div className="min-w-0 overflow-hidden">
      <LandingNewFeatureChainSnap maskClassName={CARD_MASK} />
    </div>
  )
}

function DevelopersCard() {
  return (
    <FeatureCard
      title={DEVELOPERS_TITLE}
      body={DEVELOPERS_BODY}
      visual={<LandingNewFeatureAgentConsole />}
      visualClassName={cardVisualConsoleClassName}
    />
  )
}

function MonitoringCard() {
  return (
    <FeatureCard
      title={MONITORING_TITLE}
      body={MONITORING_BODY}
      visual={
        <LandingNewFeatureEventConsole
          snapDelayMs={LANDING_FEATURE_SNAP_STAGGER_MS}
        />
      }
      visualClassName={cardVisualMonitorClassName}
    />
  )
}

function EvmCard() {
  return (
    <FeatureCard
      title={EVM_TITLE}
      body={EVM_BODY}
      extra={
        <LandingHomeOrbitNetworkNames
          snap
          className="min-w-0 font-mono text-xs uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"
        />
      }
      visual={<ChainMarqueeField />}
    />
  )
}

function CloudCard() {
  return (
    <FeatureCard
      title={CLOUD_TITLE}
      body={CLOUD_BODY}
      visual={<LandingNewFeatureCloudConsole />}
      visualClassName="relative min-h-[8rem] w-full min-w-0 flex-1 overflow-hidden"
    />
  )
}

function FeatureCardsDesktop() {
  return (
    <>
      <LatticeGrid
        className={LATTICE_SPACE.blockTight}
        minCols={FEATURE_ROW_MIN_COLS}
        indent={1}
        stroke
        equalRows
      >
        <LatticeCell cols={FEATURE_CARD_COLS} minRows={FEATURE_CARD_MIN_ROWS} indent>
          <DevelopersCard />
        </LatticeCell>
        <LatticeCell cols={FEATURE_CARD_COLS} minRows={FEATURE_CARD_MIN_ROWS}>
          <MonitoringCard />
        </LatticeCell>
        <LatticeCell cols={FEATURE_CARD_COLS} minRows={FEATURE_CARD_MIN_ROWS}>
          <EvmCard />
        </LatticeCell>
      </LatticeGrid>
      <LatticeGrid minCols={FEATURE_ROW_MIN_COLS} stroke equalRows>
        <LatticeCell cols={2 * FEATURE_CARD_COLS} minRows={FEATURE_CARD_MIN_ROWS}>
          <LandingNewPrivacyCard className={CELL_PAD} />
        </LatticeCell>
        <LatticeCell cols={FEATURE_CARD_COLS} minRows={FEATURE_CARD_MIN_ROWS}>
          <CloudCard />
        </LatticeCell>
      </LatticeGrid>
    </>
  )
}

function FeatureCardsMobile() {
  return (
    <LandingNewFeatureCardsCarousel
      cardCols={FEATURE_CARD_COLS}
      minRows={FEATURE_CARD_MIN_ROWS}
      items={[
        <DevelopersCard key="devs" />,
        <MonitoringCard key="monitor" />,
        <EvmCard key="evm" />,
        <LandingNewPrivacyCard key="privacy" className={CELL_PAD} />,
        <CloudCard key="cloud" />,
      ]}
    />
  )
}

/**
 * Three equal cards (first row indented one cell), then a 2/3 privacy cell
 * and a 1/3 cloud cell. Separate `LatticeGrid`s so each row shares one bottom
 * line; the cells carry the stroke and the paper.
 *
 * Below `md`, the five cards become a single horizontal carousel.
 */
export function LandingNewFeatureCards() {
  const isMobile = useIsMobileFeatureCarousel()

  return (
    <LatticeSection
      aria-labelledby="landing-new-features-heading"
      grid
      gridMask="fadeTopBottom"
    >
      <LatticePlate fill>
        <p className={kickerClassName}>{FEATURE_KICKER}</p>
        <div className="mt-3 min-w-0 md:mt-4">
          <LandingNewPillarsHeading
            headingId="landing-new-features-heading"
            prefix={FEATURE_TITLE_PREFIX}
            prefixLines={FEATURE_TITLE_PREFIX_LINES}
            accentLead={FEATURE_TITLE_ACCENT_LEAD}
            accentLeadFrom="md"
            accent={FEATURE_TITLE_ACCENT}
            accentOnOwnLine
            accentUnderline={false}
          />
        </div>
      </LatticePlate>
      {isMobile ? <FeatureCardsMobile /> : <FeatureCardsDesktop />}
    </LatticeSection>
  )
}
