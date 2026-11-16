import { LandingHomeHeroFadeUp } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
import { HERO } from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import {
  displayClassName,
  heroLeadClassName,
} from "@/components/marketing/institutional/styles"
import { LandingNewHeroCtaRow } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"

/** Seconds after the headline starts: lead paragraph, then the CTA row. */
const LEAD_DELAY_S = 0.5
const CTA_DELAY_S = 0.8

/**
 * Firm hero: what Ryle is, in one statement, then talk to us beside the
 * supported networks. Type-only on the lattice, like the Client Services
 * hero it hands off to.
 */
export function InstitutionalHero() {
  return (
    <LatticeSection
      as="div"
      grid
      gridMask="hero"
      gridMaskMobile="fadeTopBottom"
      pad={false}
      className="pb-16 md:pb-32"
    >
      <LatticePlate className="mt-32" flushTopLeft extraCols={2}>
        <InstitutionalHeading
          as="h1"
          immediate
          className={`${displayClassName} mt-5 md:mt-6`}
          lines={HERO.titleLines}
          accent={HERO.titleAccent}
        />
        <LandingHomeHeroFadeUp
          delay={LEAD_DELAY_S}
          className="mt-6 max-w-[46rem] md:mt-8"
        >
          <p className={heroLeadClassName}>
            <span className="text-foreground">{HERO.lead}</span> {HERO.body}
          </p>
        </LandingHomeHeroFadeUp>
      </LatticePlate>
      <LandingNewHeroCtaRow
        label={HERO.primaryCta.label}
        href={HERO.primaryCta.href}
        delay={CTA_DELAY_S}
      />
    </LatticeSection>
  )
}
