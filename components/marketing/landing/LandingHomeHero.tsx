import dynamic from "next/dynamic"
import { LandingHomeHeroPinContent } from "@/components/marketing/landing/LandingHomeHeroPinContent"
import { LandingHomeHeroPinLayout } from "@/components/marketing/landing/LandingHomeHeroPinLayout"
import {
  LandingHomeNavScrollScope,
  LandingHomeStickyNav,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import {
  landingHeroPrimaryCtaClassName,
} from "@/lib/landingHeroTypography"
import {
  landingColumnPadClass,
} from "@/lib/landingLayout"
import {
  LANDING_MARKETING_CONTACT_HREF,
} from "@/lib/siteNav"

const LandingHomeLowerSections = dynamic(
  () =>
    import("@/components/marketing/landing/LandingHomeLowerSections").then(
      (m) => ({ default: m.LandingHomeLowerSections }),
    ),
)

/** Hero subline (muted). */
const homeHeroLeadClassName =
  "max-w-none text-left font-serif text-[23px] font-normal italic leading-snug tracking-[-0.03em] text-muted transition-colors duration-500 ease-out sm:text-[32px]"

/** Hero subline (word blur). */
const HOME_LEAD =
  "Launch digital assets, move value, and manage private operations with infrastructure built for enterprises, companies, and AI."

const MARKETING_BUILDING_HEADLINE_LINE_1 = "Bring assets onchain without"
const MARKETING_BUILDING_HEADLINE_LINE_2 = "exposing sensitive activity."

const MARKETING_BUILDING_HEADLINE = `${MARKETING_BUILDING_HEADLINE_LINE_1} ${MARKETING_BUILDING_HEADLINE_LINE_2}`

/** Hero `h1` below `sm` — fixed two lines. */
const MARKETING_BUILDING_HEADLINE_TWO_LINE = `${MARKETING_BUILDING_HEADLINE_LINE_1}\n${MARKETING_BUILDING_HEADLINE_LINE_2}`

/**
 * Extra document height after the hero / sticky-nav handoff so users scroll
 * further before the next landing block appears.
 */
const landingPostHeroScrollBufferClass =
  "h-[36dvh] min-h-[14rem] w-full shrink-0"

export function LandingHomeHero() {
  return (
    <div className={landingColumnPadClass}>
      <main
        id="landing-home"
        aria-label="Home"
        className="w-full min-w-0 scroll-mt-6"
      >
        <LandingHomeHeroPinLayout className="w-full max-w-none pb-0">
          <LandingHomeHeroPinContent
            contactHref={LANDING_MARKETING_CONTACT_HREF}
            homeHeroCtaClassName={landingHeroPrimaryCtaClassName}
            heroTitle={MARKETING_BUILDING_HEADLINE}
            heroTitleTwoLine={MARKETING_BUILDING_HEADLINE_TWO_LINE}
            homeHeroLeadClassName={homeHeroLeadClassName}
            homeLead={HOME_LEAD}
          />
        </LandingHomeHeroPinLayout>
        <LandingHomeNavScrollScope>
          <div className="relative z-20 -mt-[100dvh]">
            <LandingHomeStickyNav />
            <div aria-hidden className={landingPostHeroScrollBufferClass} />
            <LandingHomeLowerSections />
          </div>
        </LandingHomeNavScrollScope>
      </main>
    </div>
  )
}
