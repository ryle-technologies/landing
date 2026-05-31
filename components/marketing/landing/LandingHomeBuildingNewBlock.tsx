"use client"

import { cubicBezier, motion, type Variants } from "motion/react"
import { LandingHomeHeroFadeStaggerInView } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
import { LandingNavWordmark } from "@/components/marketing/landing/LandingNavWordmark"
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
      <motion.div
        variants={closingStaggerItem}
        role="separator"
        aria-hidden
        className="mt-10 h-px w-full max-w-none sm:mt-11"
        style={{
          background:
            "linear-gradient(90deg, var(--border) 0%, var(--border) 38%, transparent 100%)",
        }}
      />
      <motion.div
        className="mt-9 flex min-w-0 flex-nowrap items-baseline justify-end gap-3 text-left sm:mt-11"
        variants={closingStaggerItem}
      >
        {/* X social — re-enable when ready
        <a
          href={LANDING_MARKETING_X_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 shrink text-[15px] font-normal leading-none tracking-[-0.01em] text-muted underline-offset-2 transition-colors duration-500 ease-out hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          follow us on x.com
        </a>
        */}
        <span className="shrink-0 text-right text-[15px] font-normal leading-none tracking-[-0.01em] text-muted">
          2026 / All rights reserved.
        </span>
      </motion.div>
    </LandingHomeHeroFadeStaggerInView>
  )
}
