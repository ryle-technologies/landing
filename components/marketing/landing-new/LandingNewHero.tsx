import dynamic from "next/dynamic"
import { LandingHomeHeroPinContent } from "@/components/marketing/landing/LandingHomeHeroPinContent"
import { LandingNewHeroGrid } from "@/components/marketing/landing-new/LandingNewHeroGrid"
import { LandingNewHeroStat } from "@/components/marketing/landing-new/LandingNewHeroStat"
import {
  LandingHomeNavScrollScope,
  LandingHomeStickyNav,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import {
  landingHeroPrimaryCtaClassName,
  landingNewHeroDisplayClassName,
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
        <div className="relative">
          <div
            aria-hidden
            data-hero-grid-origin
            className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_10%,black_30%,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_10%,black_30%,black_80%,transparent_100%)]"
          >
            <LandingNewHeroGrid />
          </div>
          <div className={`${landingViewportBleedClassName} relative z-10 pb-0`}>
            <div className={landingColumnPadClass}>
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
              />
            </div>
          </div>
          <div className="relative z-10">
            <LandingNewHeroStat />
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
