import { LandingHomeBuildingNewBlock } from "@/components/marketing/landing/LandingHomeBuildingNewBlock"
import {
  LandingHomeNavFadeOutMarker,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingFooterMarquee } from "@/components/marketing/landing/LandingFooterMarquee"
import { LandingNewConsoleSection } from "@/components/marketing/landing-new/LandingNewConsoleSection"
import { LandingNewFeatureCards } from "@/components/marketing/landing-new/LandingNewFeatureCards"
import { LandingNewHeroGrid } from "@/components/marketing/landing-new/LandingNewHeroGrid"
import { LandingNewHeroGridPlate } from "@/components/marketing/landing-new/LandingNewHeroGridPlate"
import { LandingNewProductsCarousel } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { LandingSuiteProductsReveal } from "@/components/marketing/landing/LandingSuiteProductsReveal"
import { LandingHomeIssuerPromptRotator } from "@/components/marketing/landing/LandingHomeIssuerPromptRotator"
import { LandingNewPillarsHeading } from "@/components/marketing/landing-new/LandingNewPillarsHeading"
import { LandingNewSimpleTiles } from "@/components/marketing/landing-new/LandingNewSimpleTiles"
import {
  landingHeroPrimaryCtaClassName,
  landingHeroTitleClassName,
  landingMarketingOutlineCtaClassName,
} from "@/lib/landingHeroTypography"
import {
  landingColumnHorizontalPadClass,
  landingViewportBleedClassName,
} from "@/lib/landingLayout"
import { PILLARS_GRID_ORIGIN_ATTR } from "@/lib/landingNewHeroGrid"
import {
  DOCS_BASE_HREF,
  LANDING_DOCS_CTA_LABEL,
  landingMarketingCtaAnchorProps,
} from "@/lib/siteNav"

const NEW_LANDING_ROTATOR_SENTENCES = [
  "Issuing your own stablecoin",
  "Tokenizing real assets",
  "Paying suppliers onchain",
  "Running remittance corridors",
  "Launching a card program",
  "Embedding a wallet in your app",
  "Settling with distributors privately",
] as const

const LANDING_PILLARS_SECTION_TITLE_LEAD =
  "Digital assets are ready for the enterprise."

const LANDING_PILLARS_SECTION_TITLE_PREFIX =
  "Ryle gives teams the infrastructure to build, launch, and operate digital assets"

const LANDING_PILLARS_SECTION_TITLE_ACCENT = "within your products"

const LANDING_PRE_SECTION_SUBTITLE =
  "One stack. Four modules and two surfaces. Start with the one that unblocks you."

const LANDING_USE_CASES = [
  {
    label: "Tokenized assets",
    shape: "cube" as const,
    body: "Issue and operate tokens for property, funds, inventory or produce — mint, redeem, pause, reconcile.",
  },
  {
    label: "Your own stablecoin",
    shape: "sphere" as const,
    body: "Launch a unit of value for your product or network, with reserves and controls you keep.",
  },
  {
    label: "Investor payouts",
    shape: "tetrahedron" as const,
    body: "Pay rents, yields and redemptions to holders without a manual back office.",
  },
  {
    label: "Cross-border payments",
    shape: "torus" as const,
    body: "Move money between countries in seconds, inside your own product.",
  },
  {
    label: "Supplier and distributor settlement",
    shape: "hexPrism" as const,
    body: "Pay partners onchain — fast, programmable, without publishing terms.",
  },
  {
    label: "Wallets in your app",
    shape: "octahedron" as const,
    body: "Let users hold and move value inside the product they already use. No separate app.",
  },
  {
    label: "Loyalty and rewards",
    shape: "icosahedron" as const,
    body: "Points, community or brand units on the same ledger as the rest of the money.",
  },
  {
    label: "Cards",
    badge: "In design with partners",
    shape: "slab" as const,
    body: "Let users spend from the asset, under your brand.",
  },
] as const

const MARKETING_CLOSING_HEADLINE = "Own the rails your business runs on."

const MARKETING_CLOSING_SUBTITLE =
  "Issue, move, spend. Modular. Private by design. Yours."

const CLOSING_CTA_LABEL = "Talk to us"

const FOOTER_MARQUEE_WORDS = ["Modular", "Private", "Yours"] as const

const buildingNewTitleClassName = `relative text-left text-muted transition-colors duration-500 ease-out ${landingHeroTitleClassName}`

const buildingNewSublineClassName =
  "max-w-none text-left font-serif text-[28px] font-normal italic leading-snug tracking-[-0.03em] text-foreground transition-colors duration-500 ease-out sm:text-[32px]"

/**
 * Pillars, suite grid, new sections, closing CTA, and footer — below the hero pin.
 * Loaded via `next/dynamic` from {@link LandingNewHero} to defer client JS.
 */
export function LandingNewLowerSections() {
  return (
    <>
      <section
        aria-labelledby="landing-new-pillars-heading"
        className="relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
      >
        <div
          aria-hidden
          data-pillars-grid-origin
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)]"
        >
          <LandingNewHeroGrid />
        </div>
        <div className={`${landingViewportBleedClassName} z-10`}>
          <div
            className={`landing-new-feature-column ${landingColumnHorizontalPadClass}`}
          >
            <LandingNewHeroGridPlate originAttr={PILLARS_GRID_ORIGIN_ATTR}>
              <LandingNewPillarsHeading
                headingId="landing-new-pillars-heading"
                lead={LANDING_PILLARS_SECTION_TITLE_LEAD}
                prefix={LANDING_PILLARS_SECTION_TITLE_PREFIX}
                accent={LANDING_PILLARS_SECTION_TITLE_ACCENT}
              />
            </LandingNewHeroGridPlate>
          </div>
        </div>
        <div className={`${landingViewportBleedClassName} z-10 mt-14 sm:mt-20`}>
          <LandingNewProductsCarousel
            ariaLabel="Use cases"
            className="w-full"
            items={LANDING_USE_CASES}
            gridOriginAttr={PILLARS_GRID_ORIGIN_ATTR}
          />
        </div>
      </section>
      <div className={landingViewportBleedClassName}>
        <div className={`landing-new-feature-column ${landingColumnHorizontalPadClass}`}>
          <LandingNewConsoleSection
            headingId="landing-new-wallet-heading"
            variant="wallet"
          />
          <LandingNewFeatureCards />
          <LandingNewConsoleSection headingId="landing-new-console-heading-top" />
        </div>
      </div>
        <LandingNewSimpleTiles
          headingId="landing-new-suite-heading"
          className="relative z-10 pt-10 pb-16 sm:pt-12 sm:pb-24 md:pb-32 min-[1080px]:pt-14 min-[1080px]:pb-36"
          heading={
            <LandingSuiteProductsReveal>
              <LandingHomeIssuerPromptRotator
                titleClassName={buildingNewTitleClassName}
                sentences={NEW_LANDING_ROTATOR_SENTENCES}
              />
              <p
                id="landing-new-suite-heading"
                className={`mt-3 max-w-none ${buildingNewSublineClassName}`}
              >
                {LANDING_PRE_SECTION_SUBTITLE}
              </p>
              <div className="mt-6 sm:mt-8">
                <a
                  href={DOCS_BASE_HREF}
                  className={landingMarketingOutlineCtaClassName}
                  {...landingMarketingCtaAnchorProps(DOCS_BASE_HREF)}
                >
                  {LANDING_DOCS_CTA_LABEL}
                </a>
              </div>
            </LandingSuiteProductsReveal>
          }
          tiles={[
            {
              label: "Ryle Cloud",
              title: "Live in days.",
              body: "Sandbox and production hosted by Ryle. Guaranteed data export and a documented exit path.",
            },
            {
              label: "Your Cloud",
              title: "Your account, your perimeter.",
              body: "Deployed into your AWS, GCP or Azure. You hold admin, data and compliance scope; we operate it with you.",
            },
            {
              label: "Owned",
              title: "Your repositories, your CI/CD.",
              body: "Source-licensed modules in your own repos, with upstream updates and engineering capacity from Ryle.",
            },
          ]}
          footerLine="Non-custodial by design: Ryle never holds your assets, reserves or keys — on any model."
        />
        <LandingNewSimpleTiles
          headingId="landing-new-audience-heading"
          headingLead="Built for companies that already decided to go digital."
          tiles={[
            {
              title: "Tokenization platforms",
              body: "Replace forty repositories and a manual back office with modules that fit the contracts you already issued.",
            },
            {
              title: "Fintechs and orchestrators",
              body: "Offer wallets, remittances and cards to your institutional clients, inside their own apps.",
            },
            {
              title: "Brands and corporates",
              body: "Extend an in-house Web3 program into tokenized inventory and confidential settlement without replacing it.",
            },
            {
              title: "Real-asset operators",
              body: "Tokenize land, energy or produce, distribute yields, and give investors a wallet under your brand.",
            },
          ]}
        />
        <LandingHomeNavFadeOutMarker />
        <section
          aria-labelledby="landing-new-building-new-heading"
          className="pt-48 pb-0 sm:pt-60 min-[1080px]:pt-60"
        >
          <LandingHomeBuildingNewBlock
            headingId="landing-new-building-new-heading"
            title={MARKETING_CLOSING_HEADLINE}
            subtitle={MARKETING_CLOSING_SUBTITLE}
            titleClassName={buildingNewTitleClassName}
            sublineClassName={buildingNewSublineClassName}
            contactCtaClassName={landingHeroPrimaryCtaClassName}
            contactCtaLabel={CLOSING_CTA_LABEL}
          />
        </section>
        <LandingFooterMarquee
          words={FOOTER_MARQUEE_WORDS}
          className="-mx-6 -mt-8 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] sm:-mt-10 min-[1080px]:-mt-12"
        />
    </>
  )
}
