import type { CSSProperties } from "react"
import Link from "next/link"
import { AlphaWebHeroImageAscii } from "@/components/beta/AlphaWebHeroImageAscii"
import { LandingHomeChainsMarquee } from "@/components/marketing/landing/LandingHomeChainsMarquee"
import { LandingHomeHeroFadeUp } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
import {
  LandingHomeHeroLeadTextEffect,
  LandingHomeHeroTextEffect,
} from "@/components/marketing/landing/LandingHomeHeroTextEffect"
import { RELEASE_SECTION_HERO } from "@/components/marketing/landing/data"
import { landingHeroWordmarkTypeClassName } from "@/lib/landingNavWordmark"
import {
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CTA_LABEL,
} from "@/lib/siteNav"

/** Fade-in delay for primary CTA + supported networks (after headline + lead start). */
const HERO_CTA_FADE_DELAY_S = 1.45
/** Label before chain logos marquee (hero CTAs row). */
const SUPPORTED_NETWORKS_LABEL = "Supported Networks: "
/** Start hero subline after headline per-word blur (stagger + segment duration). */
const HERO_LEAD_TEXT_EFFECT_DELAY_S = 0.95

/** Desktop (lg+): uniform scale for the hero ASCII + image block (layout + visuals). */
const LANDING_HOME_HERO_IMAGE_DESKTOP_ZOOM = 0.75

/** Decorative chevron down (below hero CTAs). */
function LandingHomeHeroScrollArrow() {
  return (
    <span
      aria-hidden
      className="mt-8 inline-flex shrink-0 text-muted [&_svg]:h-[1.125rem] [&_svg]:w-[1.125rem]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}

type LandingHomeHeroPinContentProps = {
  contactHref: string
  homeHeroCtaClassName: string
  heroTitle: string
  /** Below `sm`: two-line headline (`\\n` between lines). */
  heroTitleTwoLine: string
  homeHeroLeadClassName: string
  /** Hero subline (word blur). */
  homeLead: string
}

/**
 * Pinned-hero main column: hero image + ASCII, title effect, lead, primary CTA + chains marquee.
 */
export function LandingHomeHeroPinContent({
  contactHref,
  homeHeroCtaClassName,
  heroTitle,
  heroTitleTwoLine,
  homeHeroLeadClassName,
  homeLead,
}: LandingHomeHeroPinContentProps) {
  return (
    <>
      <div className="mb-8 w-full min-w-0 pt-5 sm:mb-10 sm:pt-6">
        <Link
          href="/"
          aria-label="Ryle — go to home"
          className={[
            "relative z-10 mb-5 inline-flex items-baseline gap-1 self-baseline py-2 sm:mb-6 sm:gap-1.5 sm:py-2.5",
            "no-underline transition-opacity duration-500 ease-out hover:opacity-80 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
          ].join(" ")}
        >
          <span
            aria-hidden
            className={[landingHeroWordmarkTypeClassName, "text-muted"].join(" ")}
          >
            δ
          </span>
          <span aria-hidden className={landingHeroWordmarkTypeClassName}>
            Ryle
          </span>
        </Link>
        <div
          className="w-full min-w-0 lg:origin-top-left lg:[zoom:var(--landing-home-hero-image-zoom)]"
          style={
            {
              "--landing-home-hero-image-zoom": LANDING_HOME_HERO_IMAGE_DESKTOP_ZOOM,
            } as CSSProperties
          }
        >
          <AlphaWebHeroImageAscii
            imageSrc={RELEASE_SECTION_HERO.alpha.src}
            imageAlt={RELEASE_SECTION_HERO.alpha.alt}
            className="w-full min-w-0 max-w-none"
          />
        </div>
      </div>
      <LandingHomeHeroTextEffect
        title={heroTitle}
        titleTwoLine={heroTitleTwoLine}
      />
      <div className="mt-3 min-w-0">
        <LandingHomeHeroLeadTextEffect
          text={homeLead}
          className={homeHeroLeadClassName}
          delay={HERO_LEAD_TEXT_EFFECT_DELAY_S}
        />
      </div>
      <div className="mt-8 flex w-full min-w-0 items-start justify-start text-left">
        <LandingHomeHeroFadeUp
          delay={HERO_CTA_FADE_DELAY_S}
          className="flex shrink-0 flex-col items-start"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
            <a
              href={contactHref}
              className={homeHeroCtaClassName}
              {...landingMarketingCtaAnchorProps(contactHref)}
            >
              {LANDING_MARKETING_CTA_LABEL}
            </a>
            <div className="flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5">
              <span className="shrink-0 whitespace-nowrap text-xs font-normal leading-none text-muted-light transition-colors duration-500 ease-out sm:text-[13px]">
                {SUPPORTED_NETWORKS_LABEL}
              </span>
              <LandingHomeChainsMarquee />
            </div>
          </div>
          <LandingHomeHeroScrollArrow />
        </LandingHomeHeroFadeUp>
      </div>
    </>
  )
}
