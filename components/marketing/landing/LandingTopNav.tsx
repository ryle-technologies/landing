"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DOCS_BASE_HREF,
  LANDING_DOCS_CTA_LABEL,
  LANDING_DOCS_CTA_LABEL_MOBILE,
  isAlphaShellNavActive,
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CONTACT_HREF,
  LANDING_MARKETING_CTA_LABEL,
} from "@/lib/siteNav"
import { LandingNavWordmark } from "@/components/marketing/landing/LandingNavWordmark"
import { landingHeroPrimaryCtaClassName } from "@/lib/landingHeroTypography"

function isAbsoluteHttpUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://")
}

interface LandingTopNavProps {
  /** CTA label (primary pill, or single nav link for in-app `ctaHref`). */
  ctaLabel?: string
  /**
   * CTA target. Defaults to {@link LANDING_MARKETING_CONTACT_HREF} (Calendly).
   * External URLs and `mailto:` use the primary pill; in-app paths use a text link.
   */
  ctaHref?: string
  className?: string
}

/** Horizontal site nav for the public landing pages. */
export function LandingTopNav({
  ctaLabel = LANDING_MARKETING_CTA_LABEL,
  ctaHref: ctaHrefProp,
  className,
}: LandingTopNavProps) {
  const pathname = usePathname()
  const ctaHref = ctaHrefProp ?? LANDING_MARKETING_CONTACT_HREF
  const ctaIsMailto = ctaHref.startsWith("mailto:")
  const ctaIsExternal = isAbsoluteHttpUrl(ctaHref)
  const ctaUsesPrimaryPill = ctaIsMailto || ctaIsExternal
  const ctaAnchorProps = landingMarketingCtaAnchorProps(ctaHref)
  const alphaActive = isAlphaShellNavActive(pathname)

  return (
    <nav
      aria-label="Site"
      className={[
        "flex w-full min-w-0 max-w-full flex-wrap items-center justify-between gap-x-6 gap-y-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-6 gap-y-2">
        <div className="flex min-w-0 items-baseline gap-2 sm:gap-2.5">
          <Link
            href="/"
            aria-label="Ryle — go to home"
            className={[
              "relative z-10 inline-flex shrink-0 items-baseline gap-1.5 self-baseline sm:gap-2",
              "no-underline transition-opacity duration-500 ease-out hover:opacity-80 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
            ].join(" ")}
          >
            <LandingNavWordmark />
          </Link>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-x-5 sm:gap-x-6">
        {/* Full navigation — `/docs` is a Mintlify rewrite, not an app route. */}
        <a href={DOCS_BASE_HREF} className={topNavDocsLinkClassName}>
          <span className="sm:hidden">{LANDING_DOCS_CTA_LABEL_MOBILE}</span>
          <span className="hidden sm:inline">{LANDING_DOCS_CTA_LABEL}</span>
        </a>
        {ctaUsesPrimaryPill ? (
          <a
            href={ctaHref}
            className={landingHeroPrimaryCtaClassName}
            {...ctaAnchorProps}
          >
            {ctaLabel}
          </a>
        ) : (
          <Link
            href={ctaHref}
            aria-current={
              ctaIsExternal
                ? undefined
                : pathname === ctaHref
                  ? "page"
                  : alphaActive
                    ? "location"
                    : undefined
            }
            className={[
              topNavTextLinkClassName,
              !ctaIsExternal && alphaActive
                ? "text-foreground underline"
                : "no-underline",
            ].join(" ")}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </nav>
  )
}

const topNavDocsLinkClassName = [
  "inline-flex shrink-0 items-center self-center",
  "font-sans text-[13px] font-semibold leading-none tracking-[-0.01em] text-muted",
  "underline-offset-2 transition-colors duration-500 ease-out hover:text-foreground hover:underline",
  "focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
].join(" ")

const topNavTextLinkClassName = [
  "inline-flex shrink-0 items-center self-center",
  "cursor-pointer border-0 bg-transparent p-0",
  "font-serif text-[17px] font-normal italic leading-none tracking-[-0.02em] text-foreground/90",
  "underline-offset-[0.2em] transition-opacity duration-500 ease-out hover:opacity-90 hover:underline",
  "focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
].join(" ")
