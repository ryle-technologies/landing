import { InstitutionalAboutHero } from "@/components/marketing/institutional/InstitutionalAboutHero"
import { InstitutionalAboutTeam } from "@/components/marketing/institutional/InstitutionalAboutTeam"
import { InstitutionalPageEnd } from "@/components/marketing/institutional/InstitutionalPageEnd"
import { InstitutionalPageShell } from "@/components/marketing/institutional/InstitutionalPageShell"

/**
 * About Ryle (`/about`): what the firm is for and where it is, who founded
 * it, and the way to start.
 */
export function InstitutionalAboutPage() {
  return (
    <InstitutionalPageShell
      id="about"
      label="About Ryle"
      hero={<InstitutionalAboutHero />}
    >
      <InstitutionalAboutTeam />
      {/* One section below the hero: keep the nav through the closing block. */}
      <InstitutionalPageEnd navFadesAt="footer" />
    </InstitutionalPageShell>
  )
}
