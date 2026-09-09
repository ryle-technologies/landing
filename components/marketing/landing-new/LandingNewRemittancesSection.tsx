import { LandingNewRemittancesDashboard } from "@/components/marketing/landing-new/LandingNewRemittancesDashboard"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"

/**
 * Remittances dashboard.
 * Title plate and widgets share one lattice grid (5-cell cards beside the title).
 */
export function LandingNewRemittancesSection() {
  return (
    <LatticeSection
      aria-labelledby="landing-new-cloud-heading"
      columnClassName="landing-remittances-dashboard"
      grid
      gridMask="fadeBoth"
      contentFade="bottom"
    >
      <LandingNewRemittancesDashboard />
    </LatticeSection>
  )
}
