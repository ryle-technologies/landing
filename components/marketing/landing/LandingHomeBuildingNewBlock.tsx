"use client"

import Link from "next/link"
import { cubicBezier, motion, type Variants } from "motion/react"
import { LandingHomeHeroFadeStaggerInView } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
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

/**
 * Same fade-up as the shared hero item, but the easing is a JS **function**
 * (not a bezier array). That forces Motion to animate opacity on the main
 * thread alongside the transform, instead of splitting opacity onto WAAPI.
 * The split path handed off opacity at the end of the run, which flashed the
 * title and description for one frame on real GPUs after they settled.
 */
const closingItemEase = cubicBezier(0.16, 1, 0.3, 1)
const closingStaggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: closingItemEase } },
}

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
    <LandingHomeHeroFadeStaggerInView
      className="w-full max-w-none"
      viewport={{ once: true, amount: 0.22 }}
    >
      {hasHeading ? (
        <>
          <motion.div
            className="mb-5 sm:mb-6"
            variants={closingStaggerItem}
          >
            <LandingNavWordmark />
          </motion.div>
          <motion.h2
            id={headingId}
            className={titleClassName}
            variants={closingStaggerItem}
          >
            {title}
          </motion.h2>
        </>
      ) : (
        <span id={headingId} className="sr-only">
          Contact and social
        </span>
      )}
      <motion.p
        className={`${hasHeading ? "mt-3" : ""} ${sublineClassName}`}
        variants={closingStaggerItem}
      >
        {subtitle}
      </motion.p>
      <motion.div
        className="mt-6 flex flex-wrap items-center gap-3 text-left sm:mt-7"
        variants={closingStaggerItem}
      >
        <a
          href={LANDING_MARKETING_CONTACT_HREF}
          className={contactCtaClassName}
          {...landingMarketingCtaAnchorProps()}
        >
          {LANDING_MARKETING_CTA_LABEL}
        </a>
      </motion.div>
      <div className={`${landingViewportBleedClassName} mt-10 sm:mt-11`}>
        <LandingFooterSitemap />
        <motion.div
          variants={closingStaggerItem}
          role="separator"
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--border) 0%, var(--border) 38%, transparent 100%)",
          }}
        />
      </div>
      <motion.div
        className="mt-9 flex min-w-0 flex-nowrap items-center justify-between gap-3 text-left sm:mt-11"
        variants={closingStaggerItem}
      >
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
      </motion.div>
    </LandingHomeHeroFadeStaggerInView>
  )
}
