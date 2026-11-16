import { InstitutionalIssuance } from "@/components/marketing/institutional/InstitutionalIssuance"
import { InstitutionalPageEnd } from "@/components/marketing/institutional/InstitutionalPageEnd"
import { InstitutionalSolutions } from "@/components/marketing/institutional/InstitutionalSolutions"
import { InstitutionalVerticals } from "@/components/marketing/institutional/InstitutionalVerticals"
import { InstitutionalWhy } from "@/components/marketing/institutional/InstitutionalWhy"

/**
 * Everything below the firm hero, in reading order: what Ryle does, what
 * can be built, Ryle Issuance, why Ryle, and the way to start. Client
 * Services has its own page.
 *
 * Each block is a `LatticeSection`, so every section top is a lattice line.
 * Loaded via `next/dynamic` from {@link InstitutionalHome} to defer client JS.
 */
export function InstitutionalLowerSections() {
  return (
    <>
      <InstitutionalVerticals />
      <InstitutionalSolutions />
      <InstitutionalIssuance />
      <InstitutionalWhy />
      <InstitutionalPageEnd />
    </>
  )
}
