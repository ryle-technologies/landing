import dynamic from "next/dynamic"
import { LandingHomeHeroPinContent } from "@/components/marketing/landing/LandingHomeHeroPinContent"
import { LandingNewHeroWalletStage } from "@/components/marketing/landing-new/LandingNewHeroWalletStage"
import {
  LandingHomeNavScrollScope,
  LandingHomeStickyNav,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import {
  landingHeroPrimaryCtaClassName,
} from "@/lib/landingHeroTypography"
import {
  landingColumnPadClass,
  landingNewColumnPadClass,
  landingViewportBleedClassName,
} from "@/lib/landingLayout"
import {
  LANDING_MARKETING_CONTACT_HREF,
} from "@/lib/siteNav"

const LandingNewLowerSections = dynamic(
  () =>
    import("@/components/marketing/landing-new/LandingNewLowerSections").then(
      (m) => ({ default: m.LandingNewLowerSections }),
    ),
)

const HERO_TITLE = "The financial stack your company"

const HERO_TITLE_TWO_LINE = "The financial stack\nyour company"

const HERO_ROTATING_WORDS = ["owns", "creates"] as const

const HERO_CTA_LABEL = "Talk to us"

const HERO_SUBLINE =
  "Issue your own assets, move money instantly, and put payments and cards inside your product — on modular infrastructure that runs in your cloud and stays yours."

export function LandingNewHero() {
  return (
    <div className={landingNewColumnPadClass}>
      <p
        aria-hidden
        className="pointer-events-none fixed top-4 left-[max(1.5rem,env(safe-area-inset-left))] z-50 font-mono text-[11px] uppercase tracking-wide text-muted/50 sm:text-xs"
      >
        Preview · not indexed
      </p>
      <main
        id="new-landing"
        aria-label="New landing preview"
        className="w-full min-w-0 scroll-mt-6"
      >
        <div className={`${landingViewportBleedClassName} pb-0`}>
          <div className={landingColumnPadClass}>
            <LandingHomeHeroPinContent
              contactHref={LANDING_MARKETING_CONTACT_HREF}
              homeHeroCtaClassName={landingHeroPrimaryCtaClassName}
              heroTitle={HERO_TITLE}
              heroTitleTwoLine={HERO_TITLE_TWO_LINE}
              rotatingWords={HERO_ROTATING_WORDS}
              subline={HERO_SUBLINE}
              ctaLabel={HERO_CTA_LABEL}
              heroVisual={<LandingNewHeroWalletStage />}
            />
          </div>
        </div>
        <LandingHomeNavScrollScope>
          <div className="relative z-20">
            <LandingHomeStickyNav />
            <LandingNewLowerSections />
          </div>
        </LandingHomeNavScrollScope>
      </main>
    </div>
  )
}
