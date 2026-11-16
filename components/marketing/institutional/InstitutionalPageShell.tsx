import type { ReactNode } from "react"
import { LandingHomeHeroTopBar } from "@/components/marketing/landing/LandingHomeHeroPinContent"
import {
  LandingHomeNavScrollScope,
  LandingHomeStickyNav,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingSiteNav } from "@/components/marketing/landing/LandingSiteNav"
import { landingNewColumnHorizontalPadClass } from "@/lib/landingLayout"
import { LATTICE_ROOT_ATTR } from "@/lib/landingLattice"
import { SITE_NAV_CTA_LABEL, SITE_NAV_LINKS } from "@/lib/siteNav"

/**
 * Frame shared by the firm's pages (`/`, `/about`). `<main>` is the lattice
 * root (row 0): the wordmark bar, the page hero, then everything below it
 * under the sticky nav. Every child is a `LatticeSection`, so section tops
 * stay on 64px lines all the way down.
 */
export function InstitutionalPageShell({
  id,
  label,
  hero,
  children,
}: {
  id: string
  /** Accessible name of the page's `<main>`. */
  label: string
  hero: ReactNode
  /** Sections below the hero, ending in {@link InstitutionalPageEnd}. */
  children: ReactNode
}) {
  return (
    <main
      id={id}
      aria-label={label}
      className="w-full min-w-0"
      {...{ [LATTICE_ROOT_ATTR]: "" }}
    >
      {/* One lattice row; above the hero so the mobile menu can open over it. */}
      <LandingHomeHeroTopBar
        className="relative z-30 h-16"
        padClassName={landingNewColumnHorizontalPadClass}
        trailing={<LandingSiteNav links={SITE_NAV_LINKS} />}
      />
      {hero}
      <LandingHomeNavScrollScope>
        <div className="relative z-20">
          <LandingHomeStickyNav
            padClassName={landingNewColumnHorizontalPadClass}
            sentinelInFlow={false}
            links={SITE_NAV_LINKS}
            ctaLabel={SITE_NAV_CTA_LABEL}
          />
          {children}
        </div>
      </LandingHomeNavScrollScope>
    </main>
  )
}
