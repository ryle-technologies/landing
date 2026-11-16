import { CLOSING, SECTION_IDS } from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import { heroLeadClassName } from "@/components/marketing/institutional/styles"
import { LandingNewLatticeCta } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const HEADING_ID = "institutional-closing-heading"

/** Same scale as the Client Services closing line. */
const closingDisplayClassName =
  "font-sans text-[clamp(44px,12vw,104px)] leading-none tracking-tighter text-foreground"

/**
 * Closing call to action: the line the deck ends on, then one primary action.
 */
export function InstitutionalClosing() {
  return (
    <LatticeSection
      id={SECTION_IDS.contact}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeIn"
      pad={false}
      className={LATTICE_SPACE.sectionBottom}
    >
      <LatticePlate inset={false}>
        <InstitutionalHeading
          id={HEADING_ID}
          className={closingDisplayClassName}
          lines={CLOSING.titleLines}
          accent={CLOSING.titleAccent}
        />
        <p className={`${heroLeadClassName} mt-5 max-w-[30rem] pb-4 md:mt-6`}>
          {CLOSING.sub}
        </p>
      </LatticePlate>
      <LandingNewLatticeCta label={CLOSING.cta.label} href={CLOSING.cta.href} />
    </LatticeSection>
  )
}
