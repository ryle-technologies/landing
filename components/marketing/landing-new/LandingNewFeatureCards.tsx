import type { ReactNode } from "react"
import { LandingHomeOrbitNetworkNames } from "@/components/marketing/landing/LandingHomeOrbitNetworkNames"
import { LandingNewFeatureChainSnap } from "@/components/marketing/landing-new/LandingNewFeatureChainSnap"
import { LandingNewFeatureAgentConsole } from "@/components/marketing/landing-new/LandingNewFeatureAgentConsole"
import { LandingNewFeatureEventConsole } from "@/components/marketing/landing-new/LandingNewFeatureEventConsole"
import { LandingNewFeatureGridFrame } from "@/components/marketing/landing-new/LandingNewFeatureGridFrame"
import { LandingNewHeroGrid } from "@/components/marketing/landing-new/LandingNewHeroGrid"
import { LandingNewHeroGridPlate } from "@/components/marketing/landing-new/LandingNewHeroGridPlate"
import { LandingNewPrivacyCard } from "@/components/marketing/landing-new/LandingNewPrivacyCard"
import { landingNewLargeDisplayClassName } from "@/lib/landingHeroTypography"
import { FEATURE_GRID_ORIGIN_ATTR } from "@/lib/landingNewHeroGrid"
import { LANDING_FEATURE_SNAP_STAGGER_MS } from "@/lib/landingSnapMotion"

const CARD_MASK = "bg-[var(--marketing-surface)]"

const CELL_PAD = "p-6 sm:p-8"

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const featureTitleClassName = `relative text-left transition-colors duration-500 ease-out ${landingNewLargeDisplayClassName}`

const sectionSubtitleClassName =
  "max-w-[28rem] text-left text-[15px] font-normal leading-relaxed text-muted transition-colors duration-500 ease-out sm:text-[16px] md:self-end"

const cardTitleClassName =
  "text-left font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]"

const cardBodyClassName =
  "mt-2 text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

const cardVisualConsoleClassName =
  "relative h-[8rem] w-full min-w-0 overflow-hidden sm:h-[8.5rem]"

const cardVisualMonitorClassName =
  "relative h-32 w-full min-w-0 overflow-hidden"

const FEATURE_KICKER = "Platform"

const FEATURE_TITLE = "Ready for enterprises."
const FEATURE_TITLE_LINE_TWO = "Right inside your current products."

const FEATURE_SUBTITLE =
  "On the networks you already use, through APIs, SDKs and MCP — with a live view of every event."

const EVM_TITLE = "EVM-ready."

const EVM_BODY =
  "Build on top of our platform with assets across the networks your products already use."

const DEVELOPERS_TITLE = "Built for devs & AI."

const DEVELOPERS_BODY =
  "APIs, SDKs and MCP interfaces for integrating confidential assets into your product."

const MONITORING_TITLE = "Live monitoring."

const MONITORING_BODY =
  "A real-time feed of mints, transfers, disclosures and policy changes — attributed and exportable."

const CLOUD_TITLE = "Deployed directly in your cloud."

const CLOUD_BODY =
  "The stack runs in your AWS, GCP or Azure. You keep admin, data and the compliance perimeter — we operate it with you."

const CLOUD_PLACEHOLDER_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" fill="none">
      <rect width="640" height="400" fill="#e8e4df"/>
      <rect x="48" y="56" width="544" height="288" stroke="#c9c3bb" stroke-width="1"/>
      <text x="320" y="196" text-anchor="middle" fill="#8a847c" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="0.12em">PLACEHOLDER</text>
      <text x="320" y="220" text-anchor="middle" fill="#8a847c" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">Image</text>
    </svg>`,
  )

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

function CloudPlaceholder() {
  return (
    <figure className="relative h-full w-full min-w-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CLOUD_PLACEHOLDER_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <figcaption className="sr-only">Placeholder image</figcaption>
    </figure>
  )
}

/**
 * Three equal blocks, then a 2/3 privacy cell and a 1/3 cloud cell.
 * Frames snap to the 60px hero lattice — same stroke as the hero plates.
 */
export function LandingNewFeatureCards() {
  return (
    <section
      aria-labelledby="landing-new-features-heading"
      className="relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
    >
      <div
        aria-hidden
        data-feature-grid-origin
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)]"
      >
        <LandingNewHeroGrid />
      </div>
      <div className="relative z-10">
        <p className={kickerClassName}>{FEATURE_KICKER}</p>
        <LandingNewHeroGridPlate
          className="mt-3 md:mt-4"
          originAttr={FEATURE_GRID_ORIGIN_ATTR}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:justify-between md:gap-10">
            <h2
              id="landing-new-features-heading"
              className={`${featureTitleClassName} min-w-0 md:max-w-[56rem] md:shrink-0`}
            >
              <span className="whitespace-nowrap">{FEATURE_TITLE}</span>
              <br />
              {FEATURE_TITLE_LINE_TWO}
            </h2>
            <p className={sectionSubtitleClassName}>{FEATURE_SUBTITLE}</p>
          </div>
        </LandingNewHeroGridPlate>
        <LandingNewFeatureGridFrame className="mt-10 sm:mt-14">
          <FeatureCard
            title={DEVELOPERS_TITLE}
            body={DEVELOPERS_BODY}
            visual={<LandingNewFeatureAgentConsole />}
            visualClassName={cardVisualConsoleClassName}
          />
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
          <LandingNewPrivacyCard className={`md:col-span-2 ${CELL_PAD}`} />
          <FeatureCard
            title={CLOUD_TITLE}
            body={CLOUD_BODY}
            visual={<CloudPlaceholder />}
            visualClassName="relative aspect-[16/10] w-full min-w-0 overflow-hidden"
          />
        </LandingNewFeatureGridFrame>
      </div>
    </section>
  )
}
