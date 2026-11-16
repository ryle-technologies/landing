import { CLOSING } from "@/components/marketing/institutional/content"
import { InstitutionalClosing } from "@/components/marketing/institutional/InstitutionalClosing"
import { LandingHomeNavFadeOutMarker } from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingNewFooter } from "@/components/marketing/landing-new/LandingNewFooter"
import { FOOTER_SITE_COLUMNS } from "@/lib/siteNav"

/**
 * How every firm page ends: the closing call to action, then the site footer.
 *
 * The sticky nav fades out at `navFadesAt`. On a long page it leaves before
 * the closing block, which repeats its "Talk to us". On a short page that
 * would hide it while the last section is still on screen, so it stays until
 * the footer.
 */
export function InstitutionalPageEnd({
  navFadesAt = "closing",
}: {
  navFadesAt?: "closing" | "footer"
}) {
  return (
    <>
      {navFadesAt === "closing" ? <LandingHomeNavFadeOutMarker /> : null}
      <InstitutionalClosing />
      {navFadesAt === "footer" ? <LandingHomeNavFadeOutMarker /> : null}
      <LandingNewFooter
        columns={FOOTER_SITE_COLUMNS}
        marqueeWords={CLOSING.marqueeWords}
      />
    </>
  )
}
