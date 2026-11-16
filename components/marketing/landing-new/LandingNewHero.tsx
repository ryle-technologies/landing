import dynamic from "next/dynamic"
import {
  LandingHomeHeroPinContent,
  LandingHomeHeroTopBar,
} from "@/components/marketing/landing/LandingHomeHeroPinContent"
import { LandingNewHeroCtaRow } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import {
  LandingHomeNavScrollScope,
  LandingHomeStickyNav,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingSiteNav } from "@/components/marketing/landing/LandingSiteNav"
import { heroLeadClassName } from "@/components/marketing/institutional/styles"

import {
  landingHeroPrimaryCtaClassName,
  landingNewHeroDisplayClassName,
} from "@/lib/landingHeroTypography"
import { landingNewColumnHorizontalPadClass } from "@/lib/landingLayout"
import { LATTICE_ROOT_ATTR } from "@/lib/landingLattice"
import { landingHeroIntroDelays } from "@/lib/landingHeroIntro"
import {
  LANDING_MARKETING_CONTACT_HREF,
  SITE_NAV_CTA_LABEL,
  SITE_NAV_LINKS,
} from "@/lib/siteNav"

const LandingNewLowerSections = dynamic(
  () =>
    import("@/components/marketing/landing-new/LandingNewLowerSections").then(
      (m) => ({ default: m.LandingNewLowerSections }),
    ),
)

const HERO_TITLE = "Ship your own"

/** Mobile: line 1 is the prefix; the rotating word sits on line 2. */
const HERO_TITLE_TWO_LINE = HERO_TITLE

const HERO_ROTATING_WORDS = [
  "stablecoin",
  "wallet",
  "cross-border",
  "cards",
  "digital asset",
  "payments",
  "cashback",
] as const

const HERO_CTA_LABEL = "Talk to us"

/**
 * Opens the subtitle in the foreground color, the same lead treatment as
 * the homepage paragraph under the h1.
 */
const HERO_SUBLINE_LEAD =
  "Ryle Client Services. Digital-asset products for companies."

const HERO_SUBLINE =
  "Issue assets, move money in seconds, and put payments and cards inside your product."

const { subline: HERO_SUBLINE_DELAY_S, cta: HERO_CTA_DELAY_S } =
  landingHeroIntroDelays(HERO_TITLE, HERO_ROTATING_WORDS[0])

/**
 * Ryle Client Services (`/client-services`), the product landing that used to
 * be the home. `<main>` is the lattice root (row 0); every child is a
 * `LatticeSection`, so section tops stay on 64px lines all the way down.
 */
export function LandingNewHero() {
  return (
    <main
      id="client-services"
      aria-label="Ryle Client Services"
      className="w-full min-w-0 scroll-mt-6"
      {...{ [LATTICE_ROOT_ATTR]: "" }}
    >
      {/*
        One lattice row: the top bar is full-width like the sticky nav it hands
        off to. Above the hero so the mobile menu can open over it.
      */}
      <LandingHomeHeroTopBar
        className="relative z-30 h-16"
        padClassName={landingNewColumnHorizontalPadClass}
        trailing={<LandingSiteNav links={SITE_NAV_LINKS} />}
      />
      <LatticeSection
        as="div"
        grid
        gridMask="hero"
        gridMaskMobile="fadeTopBottom"
        pad={false}
        className="pb-16 md:pb-32"
      >
        <LandingHomeHeroPinContent
          contactHref={LANDING_MARKETING_CONTACT_HREF}
          homeHeroCtaClassName={landingHeroPrimaryCtaClassName}
          heroTitle={HERO_TITLE}
          heroTitleTwoLine={HERO_TITLE_TWO_LINE}
          heroTitleClassName={landingNewHeroDisplayClassName}
          rotatingWords={HERO_ROTATING_WORDS}
          subline={HERO_SUBLINE}
          sublineLead={HERO_SUBLINE_LEAD}
          sublineClassName={heroLeadClassName}
          sublineDelay={HERO_SUBLINE_DELAY_S}
          ctaLabel={HERO_CTA_LABEL}
          heroVisual={null}
          topBar={false}
          headlinePlate
          plateClassName="mt-32"
          showCta={false}
          showNetworks={false}
          afterPlate={
            <LandingNewHeroCtaRow
              label={HERO_CTA_LABEL}
              href={LANDING_MARKETING_CONTACT_HREF}
              delay={HERO_CTA_DELAY_S}
            />
          }
        />
      </LatticeSection>
      <LandingHomeNavScrollScope>
        <div className="relative z-20">
          <LandingHomeStickyNav
            padClassName={landingNewColumnHorizontalPadClass}
            sentinelInFlow={false}
            links={SITE_NAV_LINKS}
            ctaLabel={SITE_NAV_CTA_LABEL}
          />
          <LandingNewLowerSections />
        </div>
      </LandingHomeNavScrollScope>
    </main>
  )
}
