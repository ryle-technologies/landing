"use client"

import Link from "next/link"
import { LandingHomeClosingScrollReveal } from "@/components/marketing/landing/LandingHomeClosingScrollReveal"
import { LandingFooterSitemap } from "@/components/marketing/landing/LandingFooterSitemap"
import { LandingNavWordmark } from "@/components/marketing/landing/LandingNavWordmark"
import { landingMarketingOutlineCtaClassName } from "@/lib/landingHeroTypography"
import { landingFooterWordmarkTypeClassName } from "@/lib/landingNavWordmark"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import {
  DOCS_BASE_HREF,
  LANDING_DOCS_CTA_LABEL,
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
  /** Contact CTA label (defaults to {@link LANDING_MARKETING_CTA_LABEL}). */
  contactCtaLabel?: string
  /**
   * Keep the docs sitemap inside the enclosing column instead of breaking
   * out to the viewport with its own max-width (new landing: the column is
   * the lattice).
   */
  sitemapInColumn?: boolean
  /**
   * Render the sitemap and rights row. Turn off when the page places its
   * footer elsewhere (new landing: after the possibilities carousel).
   */
  footer?: boolean
}

/**
 * Closing block: optional headline (omit when the hero already states it), technology subline,
 * Get in touch (Calendly), then social + rights.
 */
export function LandingHomeBuildingNewBlock({
  title,
  subtitle,
  titleClassName,
  sublineClassName,
  contactCtaClassName,
  headingId,
  contactCtaLabel = LANDING_MARKETING_CTA_LABEL,
  sitemapInColumn = false,
  footer = true,
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
          {contactCtaLabel}
        </a>
        <a
          href={DOCS_BASE_HREF}
          className={landingMarketingOutlineCtaClassName}
          {...landingMarketingCtaAnchorProps(DOCS_BASE_HREF)}
        >
          {LANDING_DOCS_CTA_LABEL}
        </a>
      </div>
      {footer ? (
        <>
          {sitemapInColumn ? (
            <div className="mt-10 sm:mt-11">
              <LandingFooterSitemap contentClassName="w-full min-w-0" innerClassName="" />
            </div>
          ) : (
            <div className={`${landingViewportBleedClassName} mt-10 sm:mt-11`}>
              <LandingFooterSitemap />
            </div>
          )}
          <LandingFooterRights className="mt-9 sm:mt-11" />
        </>
      ) : null}
    </LandingHomeClosingScrollReveal>
  )
}

/** Wordmark + rights line that closes the footer. */
export function LandingFooterRights({
  className = "",
  orientation = "row",
}: {
  className?: string
  /** `stack` is for a lattice cell; `row` is the original full-width bar. */
  orientation?: "row" | "stack"
}) {
  const stacked = orientation === "stack"
  return (
    <div
      className={
        stacked
          ? `flex h-full min-w-0 flex-col items-start justify-start gap-4 text-left ${className}`
          : `flex min-w-0 flex-nowrap items-center justify-between gap-3 text-left ${className}`
      }
    >
      <Link
        href="/"
        aria-label="Ryle — go to home"
        className="inline-flex shrink-0 items-baseline no-underline transition-opacity duration-500 ease-out hover:opacity-80 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <LandingNavWordmark typeClassName={landingFooterWordmarkTypeClassName} />
      </Link>
      <span
        className={
          stacked
            ? "text-left text-[11px] font-normal leading-none tracking-[-0.01em] text-muted/60 md:text-xs"
            : "shrink-0 text-right text-xs font-normal leading-none tracking-[-0.01em] text-muted/60"
        }
      >
        2026 / All rights reserved.
      </span>
    </div>
  )
}
