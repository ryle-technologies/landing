import dynamic from "next/dynamic"
import {
  LandingHomeHeroPinContent,
  LandingHomeHeroTopBar,
} from "@/components/marketing/landing/LandingHomeHeroPinContent"
import { LandingNewHeroStat } from "@/components/marketing/landing-new/LandingNewHeroStat"
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
import { LATTICE_ROOT_ATTR, LATTICE_SPACE } from "@/lib/landingLattice"
import { LANDING_MARKETING_CONTACT_HREF } from "@/lib/siteNav"

const LandingNewLowerSections = dynamic(
  () =>
    import("@/components/marketing/landing-new/LandingNewLowerSections").then(
      (m) => ({ default: m.LandingNewLowerSections }),
    ),
)

const HERO_TITLE = "The fintech stack that lets your company"

const HERO_TITLE_TWO_LINE = "The fintech stack that lets\nyour company"

const HERO_ROTATING_WORDS = [
  "own",
  "issue",
  "lend",
  "finance",
  "move",
  "create",
] as const

const HERO_CTA_LABEL = "Talk to us"

const HERO_SUBLINE =
  "Issue your own assets, move money instantly, and put payments and cards inside your product, on modular infrastructure that runs in your cloud and stays yours."

/**
 * New landing. `<main>` is the lattice root (row 0); every child is a
 * `LatticeSection`, so section tops stay on 64px lines all the way down.
 */
export function LandingNewHero() {
  return (
    <main
      id="new-landing"
      aria-label="New landing preview"
      className="w-full min-w-0 scroll-mt-6"
      {...{ [LATTICE_ROOT_ATTR]: "" }}
    >
      <p
        aria-hidden
        className="pointer-events-none fixed top-4 left-[max(2rem,env(safe-area-inset-left))] z-50 font-mono text-[11px] uppercase tracking-wide text-muted/50 sm:text-xs"
      >
        Preview · not indexed
      </p>
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
          ctaLabel={HERO_CTA_LABEL}
          heroVisual={null}
          topBar={false}
          headlinePlate
          plateClassName="mt-16"
          ctaRowClassName="mt-8 flex w-full min-w-0 items-start justify-start text-left sm:mt-16"
        />
        <LandingNewHeroStat className={LATTICE_SPACE.block} />
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
