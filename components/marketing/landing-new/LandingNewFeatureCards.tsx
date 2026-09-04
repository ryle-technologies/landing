import type { ReactNode } from "react"
import { LandingHomeOrbitNetworkNames } from "@/components/marketing/landing/LandingHomeOrbitNetworkNames"
import { LandingNewFeatureChainSnap } from "@/components/marketing/landing-new/LandingNewFeatureChainSnap"
import { LandingNewFeatureAgentConsole } from "@/components/marketing/landing-new/LandingNewFeatureAgentConsole"
import { LandingNewFeatureEventConsole } from "@/components/marketing/landing-new/LandingNewFeatureEventConsole"
import { landingHeroTitleClassName } from "@/lib/landingHeroTypography"
import { LANDING_FEATURE_SNAP_STAGGER_MS } from "@/lib/landingSnapMotion"

const CARD_SURFACE = "bg-[var(--surface)]"

const CARD_MASK = "bg-[var(--surface)]"

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const sectionTitleClassName = `relative text-left text-foreground transition-colors duration-500 ease-out ${landingHeroTitleClassName}`

const sectionSubtitleClassName =
  "max-w-[28rem] text-left text-[15px] font-normal leading-relaxed text-muted transition-colors duration-500 ease-out sm:text-[16px] md:pt-1"

const cardTitleClassName =
  "text-left font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]"

const cardBodyClassName =
  "mt-2 text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

/** Default well — chain strip, after copy. */
const cardVisualDefaultClassName =
  "relative mt-6 min-w-0 overflow-hidden"

/** EVM well — logos sit at the top of the card. */
const cardVisualEvmClassName = "relative min-w-0 overflow-hidden"

/** Image well: chrome + a fixed 8-line log, inset like the other cards. */
const cardVisualConsoleClassName =
  "relative mt-4 h-[8rem] w-full min-w-0 overflow-hidden sm:h-[8.5rem]"

/** Monitoring feed — height matches the 8 visible rows. */
const cardVisualMonitorClassName =
  "relative mt-6 h-32 w-full min-w-0 overflow-hidden"

const FEATURE_KICKER = "Platform"

const FEATURE_TITLE = "Built to live inside your product."

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

function FeatureCard({
  title,
  body,
  visual,
  extra,
  visualClassName = cardVisualDefaultClassName,
  visualFirst = false,
}: {
  title: string
  body?: string
  extra?: ReactNode
  visual: ReactNode
  visualClassName?: string
  visualFirst?: boolean
}) {
  const copy = (
    <div className={visualFirst ? "mt-auto pt-6" : undefined}>
      <h3 className={cardTitleClassName}>{title}</h3>
      {body ? <p className={cardBodyClassName}>{body}</p> : null}
    </div>
  )
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl ${CARD_SURFACE} px-5 pt-7 pb-6 sm:px-6 sm:pt-8 sm:pb-7`}
    >
      {visualFirst ? (
        <>
          <div className={visualClassName}>{visual}</div>
          {extra}
          {copy}
        </>
      ) : (
        <>
          {copy}
          <div className={visualClassName}>{visual}</div>
          {extra}
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

/**
 * Three feature cards above the suite block — developer interfaces,
 * live monitoring, and EVM networks. Layout matches the screenshot reference
 * (kicker, title + subtitle row, then equal rounded cards).
 */
export function LandingNewFeatureCards() {
  return (
    <section
      aria-labelledby="landing-new-features-heading"
      className="relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
    >
      <p className={kickerClassName}>{FEATURE_KICKER}</p>
      <div className="mt-3 flex flex-col gap-5 md:mt-4 md:flex-row md:items-start md:justify-between md:gap-16">
        <h2
          id="landing-new-features-heading"
          className={`${sectionTitleClassName} md:max-w-[32rem]`}
        >
          {FEATURE_TITLE}
        </h2>
        <p className={sectionSubtitleClassName}>{FEATURE_SUBTITLE}</p>
      </div>
      <div className="mt-10 grid min-w-0 grid-cols-1 gap-4 sm:mt-14 md:grid-cols-3 md:gap-5">
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
              className="mt-3 min-w-0 font-mono text-xs uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"
            />
          }
          visual={<ChainMarqueeField />}
          visualClassName={cardVisualEvmClassName}
          visualFirst
        />
      </div>
    </section>
  )
}
