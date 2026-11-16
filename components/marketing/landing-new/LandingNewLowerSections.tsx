import {
  LandingHomeNavFadeOutMarker,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingNewConsoleSection } from "@/components/marketing/landing-new/LandingNewConsoleSection"
import { LandingNewFooter } from "@/components/marketing/landing-new/LandingNewFooter"
import { LandingNewFeatureCards } from "@/components/marketing/landing-new/LandingNewFeatureCards"
import { LandingNewRemittancesSection } from "@/components/marketing/landing-new/LandingNewRemittancesSection"
import { CLIENT_SERVICES_USE_CASES } from "@/components/marketing/landing-new/clientServicesUseCases"
import { LandingNewProductsCarousel } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { LandingNewPillarsHeading } from "@/components/marketing/landing-new/LandingNewPillarsHeading"
import { LandingNewLatticeCtaCell } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"
import { FOOTER_SITE_COLUMNS, HOME_SECTION_HREFS } from "@/lib/siteNav"

const LANDING_PILLARS_SECTION_TITLE_PREFIX =
  "Launch and run digital assets in"

const LANDING_PILLARS_SECTION_TITLE_PREFIX_LINES = [
  "Launch and run",
  "digital assets in",
] as const

const LANDING_PILLARS_SECTION_TITLE_ACCENT_LEAD = "your"

const LANDING_PILLARS_SECTION_TITLE_ACCENT = "next product"

/** Slightly under the locked-line fill so the three mobile lines sit inside the plate. */
const LANDING_PILLARS_TITLE_CLASS =
  "font-sans text-[clamp(36px,9.6vw,46px)] leading-[0.95] tracking-tighter text-foreground md:text-[clamp(36px,7.4vw,76px)] md:leading-none"

/** Tiles on the grid at once; the rest of the pool rotates in Cloud-style. */
const LANDING_PILLARS_SLOTS = 15

/** What the vertical is, under its first headline. Ends on the Issuance link. */
const LANDING_PILLARS_DEFINITION =
  "Client Services is the Ryle team that builds and runs digital-asset products for companies, on the same platform that runs"

const LANDING_PILLARS_DEFINITION_LINK = "Ryle Issuance"

const pillarsDefinitionClassName =
  "mt-5 max-w-[40rem] text-left text-[16px] font-normal leading-[1.5] tracking-[-0.01em] text-muted transition-colors duration-500 ease-out sm:text-[17px] md:mt-6"

const pillarsDefinitionLinkClassName =
  "font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

const LANDING_POSSIBILITIES_TITLE_PREFIX = "Your product, at the speed of"

const LANDING_POSSIBILITIES_TITLE_PREFIX_LINES = [
  "Your product,",
  "at the speed of",
] as const

const LANDING_POSSIBILITIES_TITLE_ACCENT = "the internet"

/** Locked to three lines on mobile; 104px max so it still fills the 16-cell column. */
const LANDING_POSSIBILITIES_TITLE_CLASS =
  "font-sans text-[clamp(44px,12vw,104px)] leading-none tracking-tighter text-foreground"

const LANDING_POSSIBILITIES_CTA_LABEL = "Talk to us"

/**
 * Everything below the hero. Each block is a `LatticeSection`, so every
 * section top is a lattice line and the canvases join seamlessly.
 * Loaded via `next/dynamic` from {@link LandingNewHero} to defer client JS.
 */
export function LandingNewLowerSections() {
  return (
    <>
      <LatticeSection
        id="use-cases"
        aria-labelledby="landing-new-pillars-heading"
        grid
        gridMask="fadeTop"
      >
        <LatticePlate fill>
          <LandingNewPillarsHeading
            headingId="landing-new-pillars-heading"
            prefix={LANDING_PILLARS_SECTION_TITLE_PREFIX}
            prefixLines={LANDING_PILLARS_SECTION_TITLE_PREFIX_LINES}
            accentLead={LANDING_PILLARS_SECTION_TITLE_ACCENT_LEAD}
            accent={LANDING_PILLARS_SECTION_TITLE_ACCENT}
            accentOnOwnLine="mobile"
            displayClassName={LANDING_PILLARS_TITLE_CLASS}
          />
          <p className={pillarsDefinitionClassName}>
            {LANDING_PILLARS_DEFINITION}{" "}
            <a
              href={HOME_SECTION_HREFS.issuance}
              className={pillarsDefinitionLinkClassName}
            >
              {LANDING_PILLARS_DEFINITION_LINK}
            </a>
            .
          </p>
        </LatticePlate>
        <LandingNewProductsCarousel
          ariaLabel="Use cases"
          className={`w-full ${LATTICE_SPACE.blockTight}`}
          items={CLIENT_SERVICES_USE_CASES}
          slots={LANDING_PILLARS_SLOTS}
        />
      </LatticeSection>
      <LandingNewConsoleSection headingId="landing-new-wallet-heading" />
      <LandingNewFeatureCards />
      <LandingNewRemittancesSection />
      <LandingHomeNavFadeOutMarker />
      <LatticeSection
        aria-labelledby="landing-new-possibilities-heading"
        grid
        gridMask="fadeIn"
        pad={false}
        className={LATTICE_SPACE.sectionBottom}
      >
        <LatticePlate inset={false}>
          <LandingNewPillarsHeading
            headingId="landing-new-possibilities-heading"
            prefix={LANDING_POSSIBILITIES_TITLE_PREFIX}
            prefixLines={LANDING_POSSIBILITIES_TITLE_PREFIX_LINES}
            accent={LANDING_POSSIBILITIES_TITLE_ACCENT}
            accentOnOwnLine="mobile"
            displayClassName={LANDING_POSSIBILITIES_TITLE_CLASS}
          />
        </LatticePlate>
        <LandingNewLatticeCtaCell label={LANDING_POSSIBILITIES_CTA_LABEL} />
      </LatticeSection>
      <LandingNewFooter columns={FOOTER_SITE_COLUMNS} />
    </>
  )
}
