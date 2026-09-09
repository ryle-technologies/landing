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
import { LandingNewPrivacyCard } from "@/components/marketing/landing-new/LandingNewPrivacyCard"
import { LatticeCell, LatticeGrid } from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { landingNewLargeDisplayClassName } from "@/lib/landingHeroTypography"
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

const featureTitleClassName = `relative text-left transition-colors duration-500 ease-out ${landingNewLargeDisplayClassName}`

const cardTitleClassName =
  "text-left font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]"

const cardBodyClassName =
  "mt-2 text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

const cardVisualConsoleClassName =
  "relative h-[8rem] w-full min-w-0 overflow-hidden sm:h-[8.5rem]"

const cardVisualMonitorClassName =
  "relative h-32 w-full min-w-0 overflow-hidden"

const FEATURE_KICKER = "Platform"

const FEATURE_TITLE = "One backend."
const FEATURE_TITLE_LINE_TWO = "Plugs into everything you already run."

const EVM_TITLE = "Any EVM network."

const EVM_BODY =
  "Ethereum, Base, Arbitrum, Polygon and more. One API, every network you already use."

const DEVELOPERS_TITLE = "Built for devs & AI."

const DEVELOPERS_BODY =
  "Integrate in days. Works from your codebase and from the AI tools your team already uses."

const MONITORING_TITLE = "Live monitoring."

const MONITORING_BODY =
  "Every mint, transfer, disclosure and policy change, as it happens. Attributed. Exportable."

const CLOUD_TITLE = "Deployed in your cloud."

const CLOUD_BODY =
  "The stack runs in your AWS, GCP or Azure. You keep admin, data and the compliance perimeter. We operate it with you."

function FeatureCard({
  title,
  body,
  visual,
  extra,
  visualClassName,
  visualFirst = false,
  className = "",
}: {
  title: string
  body?: string
  extra?: ReactNode
  visual: ReactNode
  visualClassName?: string
  visualFirst?: boolean
  className?: string
}) {
  const copy = (
    <div className="w-full min-w-0">
      <h3 className={cardTitleClassName}>{title}</h3>
      {body ? <p className={cardBodyClassName}>{body}</p> : null}
    </div>
  )
  return (
    <article
      className={`flex h-full min-w-0 flex-col items-start justify-start gap-6 text-left ${CELL_PAD} ${className}`}
    >
      {visualFirst ? (
        <>
          <div className={`w-full min-w-0 ${visualClassName ?? ""}`}>{visual}</div>
          <div className="mt-auto flex w-full min-w-0 flex-col gap-6">
            {extra ? <div className="w-full min-w-0">{extra}</div> : null}
            {copy}
          </div>
        </>
      ) : (
        <>
          {copy}
          <div className={`w-full min-w-0 ${visualClassName ?? ""}`}>{visual}</div>
          {extra ? <div className="w-full min-w-0">{extra}</div> : null}
        </>
      )}
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
          fadeClassName={CARD_MASK}
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
      visualFirst
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
 * and a 1/3 cloud cell. Two `LatticeGrid`s so each row shares one bottom
 * line; the cells carry the stroke and the paper.
 *
 * Below `md`, those five cards become a single horizontal carousel.
 */
export function LandingNewFeatureCards() {
  const isMobile = useIsMobileFeatureCarousel()

  return (
    <LatticeSection
      aria-labelledby="landing-new-features-heading"
      grid
      gridMask="fadeBottom"
    >
      <LatticePlate>
        <p className={kickerClassName}>{FEATURE_KICKER}</p>
        <h2
          id="landing-new-features-heading"
          className={`${featureTitleClassName} mt-3 min-w-0 md:mt-4 md:max-w-[56rem]`}
        >
          <span>{FEATURE_TITLE}</span>
          <br />
          {FEATURE_TITLE_LINE_TWO}
        </h2>
      </LatticePlate>
      {isMobile ? <FeatureCardsMobile /> : <FeatureCardsDesktop />}
    </LatticeSection>
  )
}
