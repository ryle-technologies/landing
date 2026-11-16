import {
  CLIENT_SERVICES,
  SECTION_IDS,
} from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import {
  displayClassName,
  kickerClassName,
  sectionLeadClassName,
} from "@/components/marketing/institutional/styles"
import { clientServicesUseCasesByLabel } from "@/components/marketing/landing-new/clientServicesUseCases"
import { LandingNewLatticeCtaCell } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import { LandingNewProductsCarousel } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const HEADING_ID = "institutional-client-services-heading"

const PREVIEW_USE_CASES = clientServicesUseCasesByLabel(
  CLIENT_SERVICES.previewLabels,
)

/**
 * Ryle Client Services on the home: what the vertical is, a preview of its
 * use cases (the same tiles as `/client-services`), and the way in.
 */
export function InstitutionalClientServices() {
  return (
    <LatticeSection
      id={SECTION_IDS.clientServices}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTopBottom"
    >
      <LatticePlate fill>
        <p className={kickerClassName}>{CLIENT_SERVICES.kicker}</p>
        <InstitutionalHeading
          id={HEADING_ID}
          className={`${displayClassName} mt-3 md:mt-4`}
          lines={CLIENT_SERVICES.titleLines}
          accent={CLIENT_SERVICES.titleAccent}
        />
        <p className={`${sectionLeadClassName} mt-5 max-w-[42rem] md:mt-6`}>
          {CLIENT_SERVICES.body}
        </p>
      </LatticePlate>
      <LandingNewProductsCarousel
        ariaLabel="Client Services use cases"
        className={`w-full ${LATTICE_SPACE.blockTight}`}
        items={PREVIEW_USE_CASES}
      />
      <LandingNewLatticeCtaCell
        label={CLIENT_SERVICES.cta.label}
        href={CLIENT_SERVICES.cta.href}
        className={LATTICE_SPACE.blockTight}
      />
    </LatticeSection>
  )
}
