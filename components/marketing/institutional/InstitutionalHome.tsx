import dynamic from "next/dynamic"
import { InstitutionalHero } from "@/components/marketing/institutional/InstitutionalHero"
import { InstitutionalPageShell } from "@/components/marketing/institutional/InstitutionalPageShell"

const InstitutionalLowerSections = dynamic(
  () =>
    import(
      "@/components/marketing/institutional/InstitutionalLowerSections"
    ).then((m) => ({ default: m.InstitutionalLowerSections })),
)

/**
 * Institutional home (`/`): Ryle the firm. The product landing lives at
 * `/client-services` (`LandingNewHero`) and the firm's story at `/about`
 * (`InstitutionalAboutPage`).
 */
export function InstitutionalHome() {
  return (
    <InstitutionalPageShell id="home" label="Ryle" hero={<InstitutionalHero />}>
      <InstitutionalLowerSections />
    </InstitutionalPageShell>
  )
}
