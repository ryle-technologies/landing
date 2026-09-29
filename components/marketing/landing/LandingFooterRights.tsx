"use client"

import Link from "next/link"
import { LandingNavWordmark } from "@/components/marketing/landing/LandingNavWordmark"
import { landingFooterWordmarkTypeClassName } from "@/lib/landingNavWordmark"

/** Wordmark + rights line that closes the footer. */
export function LandingFooterRights({
  className = "",
  orientation = "row",
}: {
  className?: string
  /** `stack` is for a lattice cell; `row` is the full-width bar. */
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
