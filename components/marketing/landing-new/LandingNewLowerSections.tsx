import { LandingHomeBuildingNewBlock } from "@/components/marketing/landing/LandingHomeBuildingNewBlock"
import {
  LandingHomeNavFadeOutMarker,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingFooterMarquee } from "@/components/marketing/landing/LandingFooterMarquee"
import { LandingNewConsoleSection } from "@/components/marketing/landing-new/LandingNewConsoleSection"
import { LandingNewFeatureCards } from "@/components/marketing/landing-new/LandingNewFeatureCards"
import { LandingNewProductOverviewCards } from "@/components/marketing/landing-new/LandingNewProductOverviewCards"
import { LandingNewRemittancesSection } from "@/components/marketing/landing-new/LandingNewRemittancesSection"
import { LandingNewProductsCarousel } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { LandingNewPillarsHeading } from "@/components/marketing/landing-new/LandingNewPillarsHeading"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import {
  landingHeroPrimaryCtaClassName,
  landingHeroTitleClassName,
} from "@/lib/landingHeroTypography"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const LANDING_PILLARS_SECTION_TITLE_LEAD =
  "Digital assets are ready for the enterprise."

const LANDING_PILLARS_SECTION_TITLE_PREFIX =
  "Ryle gives teams the infrastructure to build, launch, and operate digital assets"

const LANDING_PILLARS_SECTION_TITLE_ACCENT = "within your products"

const LANDING_USE_CASES = [
  {
    label: "Tokenized assets",
    shape: "cube" as const,
    body: "Issue and operate tokens for property, funds, inventory or produce: mint, redeem, pause, reconcile.",
  },
  {
    label: "Your own stablecoin",
    shape: "sphere" as const,
    body: "Launch a unit of value for your product or network, with reserves and controls you keep.",
  },
  {
    label: "Investor payouts",
    shape: "tetrahedron" as const,
    body: "Pay rents, yields and redemptions to holders without a manual back office.",
  },
  {
    label: "Cross-border payments",
    shape: "torus" as const,
    body: "Move money between countries in seconds, inside your own product.",
  },
  {
    label: "Supplier and distributor settlement",
    shape: "hexPrism" as const,
    body: "Pay partners onchain. Fast, programmable, without publishing terms.",
  },
  {
    label: "Wallets in your app",
    shape: "octahedron" as const,
    body: "Let users hold and move value inside the product they already use. No separate app.",
  },
  {
    label: "Loyalty and rewards",
    shape: "icosahedron" as const,
    body: "Points, community or brand units on the same ledger as the rest of the money.",
  },
  {
    label: "Cards",
    badge: "In design with partners",
    shape: "slab" as const,
    body: "Let users spend from the asset, under your brand.",
  },
] as const

const LANDING_POSSIBILITIES = [
  {
    label: "Contracts you already issued",
    badge: "Tokenization platforms",
    shape: "cube" as const,
    body: "Issue and operate tokens against the contracts you already deployed. A factory, not another tenant.",
  },
  {
    label: "Mint, redeem, pause",
    badge: "Tokenization platforms",
    shape: "sphere" as const,
    body: "Run supply from the console: mint, redeem, pause, and reconcile reserves.",
  },
  {
    label: "Private cap tables",
    badge: "Tokenization platforms",
    shape: "tetrahedron" as const,
    body: "Holder lists and redemptions stay off the public ledger. Supply stays provable.",
  },
  {
    label: "Investor onboarding",
    badge: "Tokenization platforms",
    shape: "torus" as const,
    body: "KYC, wallet, then investment — without a manual accreditation desk.",
  },
  {
    label: "Custody and upgrades",
    badge: "Tokenization platforms",
    shape: "hexPrism" as const,
    body: "Key custody and contract-upgrade governance, next to the asset you already run.",
  },
  {
    label: "Console as back office",
    badge: "Tokenization platforms",
    shape: "octahedron" as const,
    body: "Replace a pile of repos with a back office that fits the stack you already have.",
  },
  {
    label: "Proof of reserves",
    badge: "Tokenization platforms",
    shape: "icosahedron" as const,
    body: "Prove supply and backing without publishing holders.",
  },
  {
    label: "Scoped disclosure",
    badge: "Tokenization platforms",
    shape: "slab" as const,
    body: "Show auditors and regulators only what policy allows.",
  },
  {
    label: "White-label wallets",
    badge: "Fintechs and orchestrators",
    shape: "cube" as const,
    body: "Wallets inside partner and bank apps. No standalone product.",
  },
  {
    label: "Remittance corridors",
    badge: "Fintechs and orchestrators",
    shape: "sphere" as const,
    body: "Cross-border corridors for the institutions you already serve, inside their apps.",
  },
  {
    label: "Hybrid cards",
    badge: "Fintechs and orchestrators",
    shape: "tetrahedron" as const,
    body: "Fiat and stablecoin cards under the partner brand. In design with partners.",
  },
  {
    label: "Orchestrator console",
    badge: "Fintechs and orchestrators",
    shape: "torus" as const,
    body: "One console that sees orchestrator, institution, and end user.",
  },
  {
    label: "Gasless transfers",
    badge: "Fintechs and orchestrators",
    shape: "hexPrism" as const,
    body: "End users send without holding a gas token.",
  },
  {
    label: "Fiat on and off ramps",
    badge: "Fintechs and orchestrators",
    shape: "octahedron" as const,
    body: "Ramps through the partners they already use. You keep the ledger.",
  },
  {
    label: "Policy per institution",
    badge: "Fintechs and orchestrators",
    shape: "icosahedron" as const,
    body: "Allowlists, KYC, and limits, gated per institution.",
  },
  {
    label: "Tokenized inventory",
    badge: "Brands and corporates",
    shape: "slab" as const,
    body: "Casks, bottles, stock — tokenized without replacing the program you have.",
  },
  {
    label: "Distributor settlement",
    badge: "Brands and corporates",
    shape: "cube" as const,
    body: "Pay distributors onchain without publishing terms.",
  },
  {
    label: "Loyalty on the ledger",
    badge: "Brands and corporates",
    shape: "sphere" as const,
    body: "Points, community or brand units on the same ledger as the money.",
  },
  {
    label: "Provenance next to payment",
    badge: "Brands and corporates",
    shape: "tetrahedron" as const,
    body: "Authenticity and payment on one ledger. Economics stay private.",
  },
  {
    label: "Inter-entity treasury",
    badge: "Brands and corporates",
    shape: "torus" as const,
    body: "Move funds across entities without publishing internal flows.",
  },
  {
    label: "Company stablecoin",
    badge: "Brands and corporates",
    shape: "hexPrism" as const,
    body: "Payroll and vendor payments on a unit you issue.",
  },
  {
    label: "Private collateral",
    badge: "Brands and corporates",
    shape: "octahedron" as const,
    body: "Collateral and internal flows stay off the public record.",
  },
  {
    label: "Auditor disclosure",
    badge: "Brands and corporates",
    shape: "icosahedron" as const,
    body: "Selective disclosure for auditors, without publishing economics.",
  },
  {
    label: "Tokenize real assets",
    badge: "Real-asset operators",
    shape: "slab" as const,
    body: "Lots, land, energy, grain or produce — issued and operated under your brand.",
  },
  {
    label: "Fund-share structures",
    badge: "Real-asset operators",
    shape: "cube" as const,
    body: "Fideicomiso and fund shares, with a cap table that stays private.",
  },
  {
    label: "Rents and yields",
    badge: "Real-asset operators",
    shape: "sphere" as const,
    body: "Distribute rents, yields and redemptions to holders without a manual desk.",
  },
  {
    label: "Branded investor wallet",
    badge: "Real-asset operators",
    shape: "tetrahedron" as const,
    body: "A wallet under the operator’s brand. No separate app.",
  },
  {
    label: "Community token",
    badge: "Real-asset operators",
    shape: "torus" as const,
    body: "A loyalty or community unit alongside the asset, on the same ledger.",
  },
  {
    label: "Asset traceability",
    badge: "Real-asset operators",
    shape: "hexPrism" as const,
    body: "Crop and asset traceability sitting next to the token.",
  },
  {
    label: "Spend from the asset",
    badge: "Real-asset operators",
    shape: "octahedron" as const,
    body: "Cards that spend from the tokenized asset. In design with partners.",
  },
  {
    label: "Treasury across subsidiaries",
    badge: "Any buyer",
    shape: "icosahedron" as const,
    body: "Hold and move funds across entities without publishing reserve size or internal flows.",
  },
  {
    label: "Your own stablecoin",
    badge: "Any buyer",
    shape: "slab" as const,
    body: "A unit of value for your product or network, with reserves and controls you keep.",
  },
  {
    label: "Supplier settlement",
    badge: "Any buyer",
    shape: "cube" as const,
    body: "Pay partners onchain. Fast, programmable, without publishing terms.",
  },
  {
    label: "Marketplace settlement",
    badge: "Any buyer",
    shape: "sphere" as const,
    body: "Settle buyers and sellers without leaking take rates or payouts.",
  },
  {
    label: "Embedded wallets",
    badge: "Any buyer",
    shape: "tetrahedron" as const,
    body: "Signup, send, receive, request, pay — inside the product they already use.",
  },
  {
    label: "Cards",
    badge: "Any buyer",
    shape: "torus" as const,
    body: "Let users spend from the asset, under your brand. In design with partners.",
  },
  {
    label: "AI-agent wallets",
    badge: "Any buyer",
    shape: "hexPrism" as const,
    body: "Agents that hold balances, pay for services, and settle with other agents under policy.",
  },
  {
    label: "Bank settlement",
    badge: "Any buyer",
    shape: "octahedron" as const,
    body: "Institution settlement that does not expose customer balances or liquidity.",
  },
  {
    label: "Compliance in your cloud",
    badge: "Any buyer",
    shape: "icosahedron" as const,
    body: "Disclosures, proofs, an audit log, and data residency in the client’s cloud.",
  },
] as const

const LANDING_POSSIBILITIES_TITLE_LEAD =
  "We can help you build the fintech experience your company needs."

const LANDING_POSSIBILITIES_TITLE_PREFIX = "Issue, move, spend. Modular. Private."

const LANDING_POSSIBILITIES_TITLE_ACCENT = "Yours"

const MARKETING_CLOSING_HEADLINE = "Own the rails your business runs on."

const MARKETING_CLOSING_SUBTITLE =
  "Issue, move, spend. Modular. Private by design. Yours."

const CLOSING_CTA_LABEL = "Talk to us"

const FOOTER_MARQUEE_WORDS = ["Modular", "Private", "Yours"] as const

const buildingNewTitleClassName = `relative text-left text-muted transition-colors duration-500 ease-out ${landingHeroTitleClassName}`

const buildingNewSublineClassName =
  "max-w-none text-left font-serif text-[28px] font-normal italic leading-snug tracking-[-0.03em] text-foreground transition-colors duration-500 ease-out sm:text-[32px]"

/**
 * Everything below the hero. Each block is a `LatticeSection`, so every
 * section top is a lattice line and the canvases join seamlessly.
 * Loaded via `next/dynamic` from {@link LandingNewHero} to defer client JS.
 */
export function LandingNewLowerSections() {
  return (
    <>
      <LatticeSection
        aria-labelledby="landing-new-pillars-heading"
        grid
        gridMask="fadeTop"
      >
        <LatticePlate>
          <LandingNewPillarsHeading
            headingId="landing-new-pillars-heading"
            lead={LANDING_PILLARS_SECTION_TITLE_LEAD}
            prefix={LANDING_PILLARS_SECTION_TITLE_PREFIX}
            accent={LANDING_PILLARS_SECTION_TITLE_ACCENT}
          />
        </LatticePlate>
        <div className={`${landingViewportBleedClassName} ${LATTICE_SPACE.block}`}>
          <LandingNewProductsCarousel
            ariaLabel="Use cases"
            className="w-full"
            items={LANDING_USE_CASES}
          />
        </div>
      </LatticeSection>
      <LandingNewConsoleSection headingId="landing-new-wallet-heading" />
      <LandingNewFeatureCards />
      <LandingNewProductOverviewCards />
      <LandingNewRemittancesSection />
      <LatticeSection
        aria-labelledby="landing-new-possibilities-heading"
        grid
        gridMask="fadeBoth"
      >
        <LatticePlate>
          <LandingNewPillarsHeading
            headingId="landing-new-possibilities-heading"
            lead={LANDING_POSSIBILITIES_TITLE_LEAD}
            prefix={LANDING_POSSIBILITIES_TITLE_PREFIX}
            accent={LANDING_POSSIBILITIES_TITLE_ACCENT}
          />
        </LatticePlate>
        <div className={`${landingViewportBleedClassName} ${LATTICE_SPACE.block}`}>
          <LandingNewProductsCarousel
            ariaLabel="What you can build"
            className="w-full"
            items={LANDING_POSSIBILITIES}
            flatShapes
          />
        </div>
      </LatticeSection>
      <LandingHomeNavFadeOutMarker />
      <LatticeSection
        aria-labelledby="landing-new-building-new-heading"
        grid={false}
        pad={false}
        className="pt-48 md:pt-64"
      >
        <LandingHomeBuildingNewBlock
          headingId="landing-new-building-new-heading"
          title={MARKETING_CLOSING_HEADLINE}
          subtitle={MARKETING_CLOSING_SUBTITLE}
          titleClassName={buildingNewTitleClassName}
          sublineClassName={buildingNewSublineClassName}
          contactCtaClassName={landingHeroPrimaryCtaClassName}
          contactCtaLabel={CLOSING_CTA_LABEL}
          sitemapInColumn
        />
      </LatticeSection>
      <LandingFooterMarquee words={FOOTER_MARQUEE_WORDS} className="-mt-8" />
    </>
  )
}
