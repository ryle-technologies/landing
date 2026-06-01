import { LandingHomeSuiteEventConsole } from "@/components/marketing/landing/LandingHomeSuiteEventConsole"
import { LandingHomeChainsMarquee } from "@/components/marketing/landing/LandingHomeChainsMarquee"
import { LandingHomeOrbitNetworkNames } from "@/components/marketing/landing/LandingHomeOrbitNetworkNames"
import { LandingHomeBuildingNewBlock } from "@/components/marketing/landing/LandingHomeBuildingNewBlock"
import {
  LandingHomeNavFadeOutMarker,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingHomeThemeScrollBoundary } from "@/components/marketing/landing/LandingHomeThemeScrollBoundary"
import { LandingFooterMarquee } from "@/components/marketing/landing/LandingFooterMarquee"
import { LandingSuiteProductsThreeColGrid } from "@/components/marketing/landing/LandingSuiteProductsThreeColGrid"
import { LandingSuiteProductsReveal } from "@/components/marketing/landing/LandingSuiteProductsReveal"
import { LandingHomeIssuerPromptRotator } from "@/components/marketing/landing/LandingHomeIssuerPromptRotator"
import { LandingHomePillarRecapTabs } from "@/components/marketing/landing/LandingHomePillarRecapTabs"
import {
  landingHeroPrimaryCtaClassName,
  landingHeroTitleClassName,
  landingMarketingOutlineCtaClassName,
} from "@/lib/landingHeroTypography"
import {
  landingSuiteProductCardInnerPadClass,
} from "@/lib/landingLayout"
import {
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CONTACT_HREF,
} from "@/lib/siteNav"

/** Hero subline (word blur). */
const HOME_LEAD =
  "Launch digital assets, move value, and manage private operations with infrastructure built for enterprises, companies, and AI."

/** Closing block `h2` (separate from the hero headline). */
const MARKETING_CLOSING_HEADLINE =
  "Instant by nature. Private by choice. Verifiable by design."

const BUILDING_NEW_SUBTITLE = HOME_LEAD

/** Suite-of-products block: supporting line below the rotating prompts. */
const LANDING_PRE_SECTION_SUBTITLE =
  "Issue, move and manage confidential stablecoins, Real World Assets (RWA), tokenized assets and onchain financial products without building the technology stack from scratch"

/** Pillars recap block: section heading (above accordion). First block emphasized. */
const LANDING_PILLARS_SECTION_TITLE_LEAD =
  "Tokenization is ready for the enterprise. Exposing sensitive activity is not."

const LANDING_PILLARS_SECTION_TITLE_REST =
  "Ryle gives teams the infrastructure to build, launch, and operate confidential digital assets."

const LANDING_PRE_PANEL_ASSETS_TITLE = "Operate from our platform."

const LANDING_PRE_PANEL_ASSETS_BODY =
  "Manage assets, accounts, permissions, disclosures, and activity from one dashboard."

const LANDING_PRE_PANEL_ACCOUNTS_TITLE =
  "Ready-made confidential accounts."

const LANDING_PRE_PANEL_ACCOUNTS_BODY =
  "Secure wallet infrastructure for holding, moving, and operating private assets."

const LANDING_PRE_PANEL_DISCLOSURE_TITLE =
  "Launch asset visibility dashboards."

const LANDING_PRE_PANEL_DISCLOSURE_BODY =
  "Give auditors, regulators, and internal teams controlled access to confidential activity."

const LANDING_PRE_PANEL_POLICY_TITLE =
  "Confidentiality for any asset model."

const LANDING_PRE_PANEL_POLICY_BODY =
  "Add privacy to new issuance, existing instruments, or third-party financial products."

const LANDING_PRE_PANEL_ACCOUNTS_CTA_LABEL = "Try our white-label wallet"

const LANDING_PRE_PANEL_DISCLOSURE_CTA_LABEL = "Request a demo"

/** Primary pill under suite product cards; hidden on mobile (stacked grid). */
const suiteCardCtaRowDesktopOnlyClass =
  "mt-8 hidden shrink-0 flex-wrap md:mt-8 md:flex lg:mt-10"

const suiteProductCardCtaClassName = landingMarketingOutlineCtaClassName

/** Last section: title muted, body foreground (inverted from hero lead styling). */
const buildingNewTitleClassName = `relative text-left text-muted transition-colors duration-500 ease-out ${landingHeroTitleClassName}`

const buildingNewSublineClassName =
  "max-w-none text-left font-serif text-[28px] font-normal italic leading-snug tracking-[-0.03em] text-foreground transition-colors duration-500 ease-out sm:text-[32px]"

const BANKS_SECTION_TITLE =
  "Operate privately while remaining compliant."

const STABLECOINS_SECTION_TITLE =
  "Launch without building the technology stack from scratch."

const BLOCKCHAINS_SECTION_TITLE =
  "Bring assets onchain without making business activity public."

const BLOCKCHAINS_SECTION_SIMPLE_EXPANDED = [
  "Digital assets can be programmable, global, and interoperable, but public infrastructure exposes sensitive information by default.",
  "Ryle enables organizations to issue, manage, and operate digital assets with confidentiality built into the product experience.",
] as const

const STABLECOINS_SECTION_SIMPLE_EXPANDED = [
  "Launching confidential assets requires many systems to work together: wallets, accounts, permissions, privacy networks, settlement, monitoring, and compliance.",
  "Ryle abstracts that complexity into one platform, so partners can launch faster through a console, APIs, and optional white-label wallets.",
] as const

const BANKS_SECTION_SIMPLE_EXPANDED = [
  "Privacy cannot come at the cost of oversight. Regulated organizations need confidential activity, controlled access, and a clear audit trail.",
  "Ryle keeps sensitive information private by default, using cryptographic controls to define who can see what, when, and under which conditions.",
] as const

/** Orbit / networks suite tile: small label above the card headline. */
const ORBIT_SECTION_KICKER = "EVM-ready."

/** Orbit block: heading (marketing). */
const ORBIT_SECTION_TITLE =
  "Build on top of our platform with assets across the networks your products already use."

/** Suite → networks bridge: copy beside the event console strip. */
const SUITE_EVENT_BRIDGE_TITLE =
  "Built for developers, software, and AI agents."

const SUITE_EVENT_BRIDGE_DESCRIPTION =
  "APIs, SDKs and MCP interfaces for integrating confidential assets into any product."

/** Small muted upper line on suite product cards (short headline / label). */
const suiteCardEyebrowClass =
  "text-left text-base font-normal leading-6 text-muted transition-colors duration-500 ease-out sm:leading-7"

const suiteProductBlockShellClass =
  "relative overflow-hidden border-0 bg-[var(--marketing-surface)] md:border md:border-border"

/** Large serif statement on suite product cards (supporting copy with visual emphasis). */
const suiteCardStatementClass =
  "text-left font-serif text-xl font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out min-[640px]:text-[22px] lg:text-[24px]"

/** Suite product card outer shell (border / surface). */
const suiteProductCardShellClass =
  `${suiteProductBlockShellClass} relative flex flex-col justify-start md:min-w-0`

const suiteProductCardShellFirstOuterClass =
  "relative flex min-w-0 flex-col justify-start overflow-hidden border-0 bg-[var(--marketing-surface)] md:min-w-0 md:border-0 md:bg-[linear-gradient(to_bottom_right,transparent,var(--border))] md:p-px"

const suiteProductCardShellLastOuterClass =
  "relative flex min-w-0 flex-col justify-start overflow-hidden border-0 bg-[var(--marketing-surface)] md:min-w-0 md:border-0 md:bg-[linear-gradient(to_right,var(--border),transparent)] md:p-px"

const suiteProductCardShellNetworkOuterClass =
  "relative flex min-w-0 flex-col justify-start overflow-hidden border-0 bg-[var(--marketing-surface)] md:min-w-0 md:border-0 md:bg-[linear-gradient(to_bottom_left,transparent,var(--border))] md:p-px"

const suiteProductCardShellDevelopersOuterClass =
  "relative flex min-w-0 flex-col justify-start overflow-hidden border-0 bg-[var(--marketing-surface)] md:min-w-0 md:border-0 md:bg-[linear-gradient(to_bottom_left,var(--border)_0%,transparent_40%)] md:p-px"

const suiteProductCardShellGradientInnerClass =
  "relative flex min-h-0 min-w-0 flex-1 flex-col justify-start bg-[var(--marketing-surface)]"

const suiteProductCardInnerClass =
  `relative z-10 flex min-w-0 flex-col ${landingSuiteProductCardInnerPadClass}`

const suiteProductCardInnerDevelopersClass =
  "relative z-10 flex min-w-0 flex-col px-0 pt-0 pb-6 sm:pb-7 md:px-7 md:pt-0 md:pb-7"

const suiteProductCardInnerNetworksClass =
  "relative z-10 flex min-w-0 flex-col py-6 px-0 sm:py-7 md:min-h-0 md:pt-7 md:px-0 md:pb-0"

/**
 * Pillars, suite grid, closing CTA, and footer — below the hero pin.
 * Loaded via `next/dynamic` from {@link LandingHomeHero} to defer client JS.
 */
export function LandingHomeLowerSections() {
  return (
    <>
      <section
        aria-labelledby="landing-home-pillars-heading"
        className="relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
      >
        <h2 id="landing-home-pillars-heading" className={buildingNewTitleClassName}>
          <span className="text-foreground">
            {LANDING_PILLARS_SECTION_TITLE_LEAD}
          </span>
          <br className="sm:hidden" aria-hidden />
          <span className="hidden sm:inline"> </span>
          {LANDING_PILLARS_SECTION_TITLE_REST}
        </h2>
        <div className="mt-32 min-w-0">
          <LandingHomePillarRecapTabs
            items={[
              {
                title: BLOCKCHAINS_SECTION_TITLE,
                simpleExpandedBody: BLOCKCHAINS_SECTION_SIMPLE_EXPANDED,
              },
              {
                title: STABLECOINS_SECTION_TITLE,
                simpleExpandedBody: STABLECOINS_SECTION_SIMPLE_EXPANDED,
              },
              {
                title: BANKS_SECTION_TITLE,
                simpleExpandedBody: BANKS_SECTION_SIMPLE_EXPANDED,
              },
            ]}
          />
        </div>
      </section>
      <div
        aria-hidden
        className="mb-48 w-full shrink-0 sm:mb-64 min-[1080px]:mb-96"
      />
      <LandingHomeThemeScrollBoundary>
        <section
          aria-labelledby="landing-home-suite-heading"
          className="relative z-10 pt-10 pb-12 sm:pt-12 min-[1080px]:pt-14"
        >
          <LandingSuiteProductsReveal>
            <LandingHomeIssuerPromptRotator
              titleClassName={buildingNewTitleClassName}
            />
            <p
              id="landing-home-suite-heading"
              className={`mt-3 max-w-none ${buildingNewSublineClassName}`}
            >
              {LANDING_PRE_SECTION_SUBTITLE}
            </p>
          </LandingSuiteProductsReveal>
          <LandingSuiteProductsThreeColGrid
            assetsColumn={
              <div
                className={`${suiteProductCardShellFirstOuterClass} md:flex md:h-full md:min-h-0 md:flex-col`}
              >
                <div
                  className={`${suiteProductCardShellGradientInnerClass} md:flex md:min-h-0 md:flex-1 md:flex-col`}
                >
                  <div
                    className={`${suiteProductCardInnerClass} md:flex md:min-h-0 md:flex-1 md:flex-col`}
                  >
                    <h3
                      id="landing-home-pre-panel-assets-heading"
                      className={suiteCardEyebrowClass}
                    >
                      {LANDING_PRE_PANEL_ASSETS_TITLE}
                    </h3>
                    <p className={`mt-4 min-w-0 ${suiteCardStatementClass}`}>
                      {LANDING_PRE_PANEL_ASSETS_BODY}
                    </p>
                  </div>
                </div>
              </div>
            }
            accountsColumn={
              <div className={suiteProductCardShellClass}>
                <div className={suiteProductCardInnerClass}>
                  <h3
                    id="landing-home-pre-panel-accounts-heading"
                    className={suiteCardEyebrowClass}
                  >
                    {LANDING_PRE_PANEL_ACCOUNTS_TITLE}
                  </h3>
                  <p className={`mt-4 min-w-0 ${suiteCardStatementClass}`}>
                    {LANDING_PRE_PANEL_ACCOUNTS_BODY}
                  </p>
                  <div className={suiteCardCtaRowDesktopOnlyClass}>
                    <a
                      href={LANDING_MARKETING_CONTACT_HREF}
                      className={suiteProductCardCtaClassName}
                      {...landingMarketingCtaAnchorProps()}
                    >
                      {LANDING_PRE_PANEL_ACCOUNTS_CTA_LABEL}
                    </a>
                  </div>
                </div>
              </div>
            }
            policyColumn={
              <div
                className={`${suiteProductCardShellDevelopersOuterClass} md:flex md:h-full md:min-h-0 md:flex-col`}
              >
                <div
                  className={`${suiteProductCardShellGradientInnerClass} md:flex md:min-h-0 md:flex-1 md:flex-col`}
                >
                  <div
                    className={`${suiteProductCardInnerClass} md:flex md:min-h-0 md:flex-1 md:flex-col`}
                  >
                    <h3
                      id="landing-home-pre-panel-policy-heading"
                      className={suiteCardEyebrowClass}
                    >
                      {LANDING_PRE_PANEL_POLICY_TITLE}
                    </h3>
                    <p className={`mt-4 min-w-0 ${suiteCardStatementClass}`}>
                      {LANDING_PRE_PANEL_POLICY_BODY}
                    </p>
                  </div>
                </div>
              </div>
            }
            disclosureColumn={
              <div className={suiteProductCardShellLastOuterClass}>
                <div className={suiteProductCardShellGradientInnerClass}>
                  <div className={suiteProductCardInnerClass}>
                    <h3
                      id="landing-home-pre-panel-disclosure-heading"
                      className={suiteCardEyebrowClass}
                    >
                      {LANDING_PRE_PANEL_DISCLOSURE_TITLE}
                    </h3>
                    <p className={`mt-4 min-w-0 ${suiteCardStatementClass}`}>
                      {LANDING_PRE_PANEL_DISCLOSURE_BODY}
                    </p>
                    <div className={suiteCardCtaRowDesktopOnlyClass}>
                      <a
                        href={LANDING_MARKETING_CONTACT_HREF}
                        className={suiteProductCardCtaClassName}
                        {...landingMarketingCtaAnchorProps()}
                      >
                        {LANDING_PRE_PANEL_DISCLOSURE_CTA_LABEL}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }
            networksSuiteColumn={
              <div
                className={`${suiteProductCardShellNetworkOuterClass} md:flex md:h-full md:min-h-0 md:flex-col`}
              >
                <div
                  className={`${suiteProductCardShellGradientInnerClass} md:flex md:min-h-0 md:flex-1 md:flex-col`}
                >
                  <div
                    className={`${suiteProductCardInnerNetworksClass} md:flex md:min-h-0 md:flex-1 md:flex-col`}
                  >
                    <div
                      aria-hidden
                      className="relative z-10 mb-6 w-full min-w-0 shrink-0 sm:mb-7"
                    >
                      <LandingHomeChainsMarquee variant="section" />
                    </div>
                    <div className="mt-auto flex min-w-0 flex-col md:px-7 md:pb-7">
                      <h3
                        id="landing-home-orbit-heading"
                        className={`min-w-0 ${suiteCardStatementClass}`}
                      >
                        {ORBIT_SECTION_KICKER}
                      </h3>
                      <p className={`mt-4 min-w-0 ${suiteCardEyebrowClass}`}>
                        {ORBIT_SECTION_TITLE}
                      </p>
                      <LandingHomeOrbitNetworkNames className="mt-4 min-w-0 font-mono text-xs uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out sm:mt-5" />
                    </div>
                  </div>
                </div>
              </div>
            }
            developersColumn={
              <div className={suiteProductCardShellDevelopersOuterClass}>
                <div className={suiteProductCardShellGradientInnerClass}>
                  <div className={suiteProductCardInnerDevelopersClass}>
                    <div
                      aria-hidden
                      className="relative z-10 mb-6 w-full min-w-0 sm:mb-7"
                    >
                      <LandingHomeSuiteEventConsole />
                    </div>
                    <h3
                      id="landing-home-suite-event-bridge-heading"
                      className={suiteCardEyebrowClass}
                    >
                      {SUITE_EVENT_BRIDGE_TITLE}
                    </h3>
                    <p className={`mt-4 min-w-0 ${suiteCardStatementClass}`}>
                      {SUITE_EVENT_BRIDGE_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </div>
            }
          />
        </section>
        <LandingHomeNavFadeOutMarker />
        <section
          aria-labelledby="landing-home-building-new-heading"
          className="pt-48 pb-0 sm:pt-60 min-[1080px]:pt-60"
        >
          <LandingHomeBuildingNewBlock
            headingId="landing-home-building-new-heading"
            title={MARKETING_CLOSING_HEADLINE}
            subtitle={BUILDING_NEW_SUBTITLE}
            titleClassName={buildingNewTitleClassName}
            sublineClassName={buildingNewSublineClassName}
            contactCtaClassName={landingHeroPrimaryCtaClassName}
          />
        </section>
        <LandingFooterMarquee className="-mx-6 -mt-8 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] sm:-mt-10 min-[1080px]:-mt-12" />
      </LandingHomeThemeScrollBoundary>
    </>
  )
}
