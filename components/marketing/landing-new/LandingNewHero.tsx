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
import {
  landingHeroPrimaryCtaClassName,
  landingNewHeroDisplayClassName,
} from "@/lib/landingHeroTypography"
import { landingNewColumnHorizontalPadClass } from "@/lib/landingLayout"
import { LATTICE_ROOT_ATTR } from "@/lib/landingLattice"
import { landingHeroIntroDelays } from "@/lib/landingHeroIntro"
import { LANDING_MARKETING_CONTACT_HREF } from "@/lib/siteNav"

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

const HERO_SUBLINE =
  "Ryle builds and runs digital assets & financial infrastructure with companies that want to own it."

const { subline: HERO_SUBLINE_DELAY_S, cta: HERO_CTA_DELAY_S } =
  landingHeroIntroDelays(HERO_TITLE, HERO_ROTATING_WORDS[0])

/**
 * Home landing. `<main>` is the lattice root (row 0); every child is a
 * `LatticeSection`, so section tops stay on 64px lines all the way down.
 */
export function LandingNewHero() {
  return (
    <main
      id="landing-home"
      aria-label="Home"
      className="w-full min-w-0 scroll-mt-6"
      {...{ [LATTICE_ROOT_ATTR]: "" }}
    >
      {/* One lattice row: the top bar is full-width like the sticky nav it hands off to. */}
      <LandingHomeHeroTopBar
        className="relative z-10 h-16"
        padClassName={landingNewColumnHorizontalPadClass}
      />
      <LatticeSection as="div" grid gridMask="hero" pad={false} className="pb-16 md:pb-32">
        <LandingHomeHeroPinContent
          contactHref={LANDING_MARKETING_CONTACT_HREF}
          homeHeroCtaClassName={landingHeroPrimaryCtaClassName}
          heroTitle={HERO_TITLE}
          heroTitleTwoLine={HERO_TITLE_TWO_LINE}
          heroTitleClassName={landingNewHeroDisplayClassName}
          rotatingWords={HERO_ROTATING_WORDS}
          subline={HERO_SUBLINE}
          sublineDelay={HERO_SUBLINE_DELAY_S}
          ctaLabel={HERO_CTA_LABEL}
          heroVisual={null}
          topBar={false}
          headlinePlate
          plateClassName="mt-16"
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
          />
          <LandingNewLowerSections />
        </div>
      </LandingHomeNavScrollScope>
    </main>
  )
}
