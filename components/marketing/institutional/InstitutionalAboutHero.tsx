import { ABOUT } from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import { InstitutionalOffices } from "@/components/marketing/institutional/InstitutionalOffices"
import {
  displayClassName,
  kickerClassName,
} from "@/components/marketing/institutional/styles"
import { LandingHomeHeroFadeUp } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const HEADING_ID = "institutional-about-heading"

/** Seconds after the headline starts: mission paragraph, then the offices. */
const MISSION_DELAY_S = 0.5
const OFFICES_DELAY_S = 0.8

/**
 * About hero: what the firm is and what it is for, then where it is. Type on
 * the lattice, same scale and rhythm as the home hero.
 */
export function InstitutionalAboutHero() {
  const { hero } = ABOUT

  return (
    <LatticeSection
      aria-labelledby={HEADING_ID}
      grid
      gridMask="hero"
      gridMaskMobile="fadeTopBottom"
      pad={false}
      className="pb-16 md:pb-32"
    >
      <LatticePlate fill className="mt-32">
        <p className={kickerClassName}>{hero.kicker}</p>
        <InstitutionalHeading
          as="h1"
          id={HEADING_ID}
          immediate
          className={`${displayClassName} mt-5 md:mt-6`}
          lines={hero.titleLines}
          accent={hero.titleAccent}
        />
        <LandingHomeHeroFadeUp
          delay={MISSION_DELAY_S}
          className="mt-6 max-w-[46rem] md:mt-8"
        >
          <p className="text-pretty text-left text-[clamp(18px,2.1vw,22px)] font-normal leading-[1.35] tracking-[-0.02em] text-muted">
            <span className="text-foreground">{hero.mission.lead}</span>{" "}
            {hero.mission.body}
          </p>
        </LandingHomeHeroFadeUp>
      </LatticePlate>
      <LandingHomeHeroFadeUp delay={OFFICES_DELAY_S}>
        <InstitutionalOffices className={LATTICE_SPACE.blockTight} />
      </LandingHomeHeroFadeUp>
    </LatticeSection>
  )
}
