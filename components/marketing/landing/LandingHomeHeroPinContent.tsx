import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { LandingHomeChainsMarquee } from "@/components/marketing/landing/LandingHomeChainsMarquee"
import { LandingHomeHeroFadeUp } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
import { LandingHomeHeroTextEffect } from "@/components/marketing/landing/LandingHomeHeroTextEffect"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { RELEASE_SECTION_HERO } from "@/components/marketing/landing/data"
import {
  landingColumnHorizontalPadClass,
  landingViewportBleedClassName,
} from "@/lib/landingLayout"
import { landingHeroWordmarkTypeClassName } from "@/lib/landingNavWordmark"
import {
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CTA_LABEL,
} from "@/lib/siteNav"

/** Fade-in delay for primary CTA + supported networks (after headline start). */
const HERO_CTA_FADE_DELAY_S = 1.1
/** Label before chain logos marquee (hero CTAs row). */
const SUPPORTED_NETWORKS_LABEL = "Supported Networks: "

/** Intrinsic ratio of `RELEASE_SECTION_HERO.alpha` (1024×628). */
const HERO_IMAGE_ASPECT = "1024 / 628"

type LandingHomeHeroPinContentProps = {
  contactHref: string
  homeHeroCtaClassName: string
  heroTitle: string
  /** Below `sm`: two-line headline (`\\n` between lines). */
  heroTitleTwoLine: string
  /** Optional muted line above the headline. */
  eyebrow?: string
  /** Optional smaller line directly under the headline. */
  subline?: string
  /** Seconds before the subline fade-up. */
  sublineDelay?: number
  /** Primary CTA label (defaults to {@link LANDING_MARKETING_CTA_LABEL}). */
  ctaLabel?: string
  /** Cycles the last headline verb (x.ai-style letter morph). */
  rotatingWords?: readonly string[]
  /** Replaces the default hero image. Pass `null` to hide the visual. */
  heroVisual?: ReactNode
  /** Overrides the default serif h1 scale. */
  heroTitleClassName?: string
  /** Horizontal pad for the full-bleed top bar. */
  padClassName?: string
  /** Spacing above the headline plate. */
  plateClassName?: string
  /** Spacing above the CTA row. */
  ctaRowClassName?: string
  /** Render the wordmark bar. Off when the page draws its own. */
  topBar?: boolean
  /** Wrap the headline in a lattice-snapped paper plate (new landing). */
  headlinePlate?: boolean
  /** Default pill CTA inside the plate. Off when the new landing draws its own. */
  showCta?: boolean
  /** Supported-networks cluster beside the pill. */
  showNetworks?: boolean
  /** Rendered after the headline plate (home lattice CTA row). */
  afterPlate?: ReactNode
}

/** Wordmark row shared by the hero and the home lattice header. */
export function LandingHomeHeroTopBar({
  className = "",
  padClassName = landingColumnHorizontalPadClass,
}: {
  className?: string
  padClassName?: string
}) {
  return (
    <div
      className={[
        padClassName,
        "flex items-center justify-between gap-4",
        className,
      ].join(" ")}
    >
      <Link
        href="/"
        aria-label="Ryle — go to home"
        className={[
          "relative z-10 inline-flex items-baseline gap-1 self-baseline py-2 sm:gap-1.5 sm:py-2.5",
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
    </div>
  )
}

/**
 * Pinned-hero main column: brand, headline, CTA + chains, then hero image.
 */
export function LandingHomeHeroPinContent({
  contactHref,
  homeHeroCtaClassName,
  heroTitle,
  heroTitleTwoLine,
  eyebrow,
  subline,
  sublineDelay = 0,
  ctaLabel = LANDING_MARKETING_CTA_LABEL,
  rotatingWords,
  heroVisual,
  heroTitleClassName,
  padClassName = landingColumnHorizontalPadClass,
  plateClassName = "mt-10 sm:mt-14",
  ctaRowClassName = "mt-10 flex w-full min-w-0 items-start justify-start text-left sm:mt-12",
  topBar = true,
  headlinePlate = false,
  showCta = true,
  showNetworks = true,
  afterPlate,
}: LandingHomeHeroPinContentProps) {
  const Plate = headlinePlate ? LatticePlate : "div"
  const showCtaRow = showCta || showNetworks
  return (
    <>
      <div
        className={
          heroVisual === null
            ? "w-full min-w-0"
            : "mb-14 w-full min-w-0 sm:mb-16"
        }
      >
        {topBar ? (
          <div
            className={[
              landingViewportBleedClassName,
              "mb-5 pt-5 sm:mb-6 sm:pt-6",
            ].join(" ")}
          >
            <LandingHomeHeroTopBar padClassName={padClassName} />
          </div>
        ) : null}

        {eyebrow ? (
          <p className="mb-4 font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out sm:mb-5">
            {eyebrow}
          </p>
        ) : null}
        <Plate className={plateClassName}>
          <LandingHomeHeroTextEffect
            title={heroTitle}
            titleTwoLine={heroTitleTwoLine}
            rotatingWords={rotatingWords}
            className={heroTitleClassName}
          />
          {subline ? (
            <LandingHomeHeroFadeUp
              delay={sublineDelay}
              className="mt-4 max-w-[56rem] sm:mt-5"
            >
              <p className="text-left font-serif text-[24px] font-normal italic leading-snug tracking-[-0.02em] text-muted transition-colors duration-500 ease-out sm:text-[28px]">
                {subline}
              </p>
            </LandingHomeHeroFadeUp>
          ) : null}
          {showCtaRow ? (
            <div className={ctaRowClassName}>
              <LandingHomeHeroFadeUp
                delay={HERO_CTA_FADE_DELAY_S}
                className="flex shrink-0 flex-col items-start"
              >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
                  {showCta ? (
                    <a
                      href={contactHref}
                      className={homeHeroCtaClassName}
                      {...landingMarketingCtaAnchorProps(contactHref)}
                    >
                      {ctaLabel}
                    </a>
                  ) : null}
                  {showNetworks ? (
                    <div className="flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5">
                      <span className="shrink-0 whitespace-nowrap text-xs font-normal leading-none text-muted-light transition-colors duration-500 ease-out sm:text-[13px]">
                        {SUPPORTED_NETWORKS_LABEL}
                      </span>
                      <LandingHomeChainsMarquee />
                    </div>
                  ) : null}
                </div>
              </LandingHomeHeroFadeUp>
            </div>
          ) : null}
        </Plate>
        {afterPlate}
      </div>

      {heroVisual !== undefined ? (
        heroVisual
      ) : (
        <div
          className="relative w-full min-w-0 overflow-hidden"
          style={{ aspectRatio: HERO_IMAGE_ASPECT }}
        >
          <Image
            src={RELEASE_SECTION_HERO.alpha.src}
            alt={RELEASE_SECTION_HERO.alpha.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="(min-width: 1080px) min(72rem, 100vw), 100vw"
          />
        </div>
      )}
    </>
  )
}
