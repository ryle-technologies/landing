"use client"

import Link from "next/link"
import { LandingHomeClosingScrollReveal } from "@/components/marketing/landing/LandingHomeClosingScrollReveal"
import { LandingFooterSitemap } from "@/components/marketing/landing/LandingFooterSitemap"
import { LandingNavWordmark } from "@/components/marketing/landing/LandingNavWordmark"
import { landingFooterWordmarkTypeClassName } from "@/lib/landingNavWordmark"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import {
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CONTACT_HREF,
  LANDING_MARKETING_CTA_LABEL,
  // LANDING_MARKETING_X_HREF,
} from "@/lib/siteNav"

type LandingHomeBuildingNewBlockProps = {
  title: string
  subtitle: string
  titleClassName: string
  sublineClassName: string
  contactCtaClassName: string
  headingId: string
}

/**
 * Closing block: optional headline (omit when the hero already states it), technology subline,
 * Request demo (Calendly), then social + rights.
 */
export function LandingHomeBuildingNewBlock({
  title,
  subtitle,
  titleClassName,
  sublineClassName,
  contactCtaClassName,
  headingId,
}: LandingHomeBuildingNewBlockProps) {
  const hasHeading = Boolean(title.trim())

  return (
    <LandingHomeClosingScrollReveal className="w-full max-w-none">
      {hasHeading ? (
        <>
          <div className="mb-5 sm:mb-6">
            <LandingNavWordmark />
          </div>
          <h2 id={headingId} className={titleClassName}>
            {title}
          </h2>
        </>
      ) : (
        <span id={headingId} className="sr-only">
          Contact and social
        </span>
      )}
      <p className={`${hasHeading ? "mt-3" : ""} ${sublineClassName}`}>
        {subtitle}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-left sm:mt-7">
        <a
          href={LANDING_MARKETING_CONTACT_HREF}
          className={contactCtaClassName}
          {...landingMarketingCtaAnchorProps()}
        >
          {LANDING_MARKETING_CTA_LABEL}
        </a>
      </div>
      <div className={`${landingViewportBleedClassName} mt-10 sm:mt-11`}>
        <LandingFooterSitemap />
        <div
          role="separator"
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--border) 0%, var(--border) 38%, transparent 100%)",
          }}
        />
      </div>
      <div className="mt-9 flex min-w-0 flex-nowrap items-center justify-between gap-3 text-left sm:mt-11">
        <Link
          href="/"
          aria-label="Ryle — go to home"
          className="inline-flex shrink-0 items-baseline no-underline transition-opacity duration-500 ease-out hover:opacity-80 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <LandingNavWordmark typeClassName={landingFooterWordmarkTypeClassName} />
        </Link>
        <span className="shrink-0 text-right text-xs font-normal leading-none tracking-[-0.01em] text-muted/60">
          2026 / All rights reserved.
        </span>
      </div>
    </LandingHomeClosingScrollReveal>
  )
}
