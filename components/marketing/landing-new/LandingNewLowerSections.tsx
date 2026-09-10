import {
  LandingHomeNavFadeOutMarker,
} from "@/components/marketing/landing/LandingHomeStickyNav"
import { LandingNewConsoleSection } from "@/components/marketing/landing-new/LandingNewConsoleSection"
import { LandingNewFooter } from "@/components/marketing/landing-new/LandingNewFooter"
import { LandingNewFeatureCards } from "@/components/marketing/landing-new/LandingNewFeatureCards"
import { LandingNewRemittancesSection } from "@/components/marketing/landing-new/LandingNewRemittancesSection"
import {
  LandingNewProductsCarousel,
  type LandingNewProductsCarouselItem,
} from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { LandingNewPillarsHeading } from "@/components/marketing/landing-new/LandingNewPillarsHeading"
import { LandingNewLatticeCtaCell } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const LANDING_PILLARS_SECTION_TITLE_PREFIX =
  "Launch and run digital assets across your products,"

const LANDING_PILLARS_SECTION_TITLE_ACCENT = "now and next"

/** Tiles on the grid at once; the rest of the pool rotates in Cloud-style. */
const LANDING_PILLARS_SLOTS = 15

/**
 * What you can build with the stack. One tile per outcome, grouped by the
 * hero verbs (issue / move / spend / hold) plus what AI agents can do on it.
 *
 * The array is interleaved across those groups on purpose: slots fill in
 * pool order, so the first {@link LANDING_PILLARS_SLOTS} tiles show the whole
 * range (assets, payments, the card, wallets, agents) before rotation starts.
 * Titles stay under ~29 characters so an idle tile never exceeds the
 * 5-column expanded width. `badge` marks the two items that depend on
 * partners we have not signed.
 */
const LANDING_PILLARS_POOL: readonly LandingNewProductsCarouselItem[] = [
  {
    label: "Your own stablecoin",
    shape: "sphere",
    body: "A dollar or local-currency unit for your product. You hold the reserves, set the rules, and see every mint and redemption.",
  },
  {
    label: "Cross-border payments",
    shape: "torus",
    body: "Send money between countries in seconds on stablecoin rails, inside your own app.",
  },
  {
    label: "Wallet inside your app",
    shape: "cube",
    body: "Sign up, hold, send, receive and pay without leaving your product. No seed phrases.",
  },
  {
    label: "Wallets for AI agents",
    shape: "hexPrism",
    body: "Give an agent a balance, a spending limit and an allowlist. It pays for what it needs; you see every transaction.",
  },
  {
    label: "Your own card",
    shape: "slab",
    badge: "In design with partners",
    body: "A card under your brand that spends from stablecoin, fiat, or an asset you issued.",
  },
  {
    label: "Tokenized real estate",
    shape: "octahedron",
    body: "Sell a building or a plot as units investors can buy, hold and trade. Rent flows to holders automatically.",
  },
  {
    label: "Supplier payments",
    shape: "tetrahedron",
    body: "Settle invoices onchain in minutes, on terms you program: due dates, splits, approvals.",
  },
  {
    label: "Partner wallets",
    shape: "icosahedron",
    body: "The same wallet inside your clients’ apps, each with its own brand, rules and limits.",
  },
  {
    label: "Pay per request",
    shape: "sphere",
    body: "Charge for your API, data or content per call, in stablecoin. Apps and agents pay as they go.",
  },
  {
    label: "Tokenized commodities",
    shape: "torus",
    body: "Grain, energy or metals as onchain units, redeemable for the physical stock.",
  },
  {
    label: "Gasless transactions",
    shape: "cube",
    body: "Your users send and pay without ever holding a gas token. You cover the fee, or price it in.",
  },
  {
    label: "Run ops from your AI tools",
    shape: "hexPrism",
    body: "Mint, redeem, reconcile and pull reports from Cursor, Claude or ChatGPT. The console speaks MCP.",
  },
  {
    label: "Loyalty and cashback",
    shape: "slab",
    body: "Points and cashback on the same ledger as the money, so they can be spent, not just collected.",
  },
  {
    label: "Marketplace payouts",
    shape: "octahedron",
    body: "Collect from buyers, take your fee, pay sellers on a schedule. One ledger for all of it.",
  },
  {
    label: "Investor wallet",
    shape: "tetrahedron",
    body: "KYC, then buy, hold and sell your assets in one flow. Onboarding runs itself.",
  },
  {
    label: "Agents paying agents",
    shape: "icosahedron",
    body: "Services settle with each other in seconds, under limits you set. No invoices, no month-end.",
  },
  {
    label: "Fund and trust shares",
    shape: "sphere",
    body: "Issue fund units, run subscriptions and redemptions from the console, and keep the holder list off the public chain.",
  },
  {
    label: "Payroll in stablecoin",
    shape: "torus",
    body: "Pay teams and contractors in any country, same day, from one balance.",
  },
  {
    label: "Build with your coding agent",
    shape: "cube",
    body: "SDK and docs written for AI tools. Have your agent wire a wallet or a payout flow into your app in an afternoon.",
  },
  {
    label: "Tokenized inventory",
    shape: "hexPrism",
    body: "Bottles, batches or stock as onchain units. Ownership and payment move together.",
  },
  {
    label: "Multi-entity treasury",
    shape: "slab",
    body: "Move funds between subsidiaries and accounts instantly, with every transfer attributed and exportable.",
  },
  {
    label: "Agent-run treasury",
    shape: "octahedron",
    body: "An agent sweeps, rebalances and distributes on rules you set, and stops at limits it cannot cross.",
  },
  {
    label: "Bring your own contracts",
    shape: "tetrahedron",
    body: "Already issued a token? Plug it into the console and run mint, redeem and reporting without redeploying.",
  },
  {
    label: "Dividends and rents",
    shape: "icosahedron",
    body: "Pay every holder their share each period, automatically. No spreadsheet, no manual desk.",
  },
  {
    label: "An agent on the audit log",
    shape: "sphere",
    body: "Every mint, transfer and policy change, read by an agent that flags what looks wrong before it becomes a problem.",
  },
  {
    label: "Fiat in and out",
    shape: "torus",
    badge: "Through partners",
    body: "Let users top up and cash out through the ramp partners you choose. You keep the ledger.",
  },
]

const LANDING_POSSIBILITIES_TITLE_PREFIX = "Your product, at the speed of"

const LANDING_POSSIBILITIES_TITLE_ACCENT = "the internet"

/** Hero face. Floor stays under ~50px so a 5-cell mobile column wraps to 3 lines; 104px max so it still fills the 16-cell column. */
const LANDING_POSSIBILITIES_TITLE_CLASS =
  "font-sans text-[clamp(44px,12vw,104px)] leading-none tracking-tighter text-foreground"

const LANDING_POSSIBILITIES_CTA_LABEL = "Talk to us"

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
        <LatticePlate inset={false} fill>
          <div className={LATTICE_SPACE.inset}>
            <LandingNewPillarsHeading
              headingId="landing-new-pillars-heading"
              prefix={LANDING_PILLARS_SECTION_TITLE_PREFIX}
              accent={LANDING_PILLARS_SECTION_TITLE_ACCENT}
            />
          </div>
        </LatticePlate>
        <LandingNewProductsCarousel
          ariaLabel="Use cases"
          className={`w-full ${LATTICE_SPACE.blockTight}`}
          items={LANDING_PILLARS_POOL}
          slots={LANDING_PILLARS_SLOTS}
        />
      </LatticeSection>
      <LandingNewConsoleSection headingId="landing-new-wallet-heading" />
      <LandingNewFeatureCards />
      <LandingNewRemittancesSection />
      <LandingHomeNavFadeOutMarker />
      <LatticeSection
        aria-labelledby="landing-new-possibilities-heading"
        grid
        gridMask="fadeIn"
        pad={false}
        className={LATTICE_SPACE.sectionBottom}
      >
        <LatticePlate inset={false}>
          <LandingNewPillarsHeading
            headingId="landing-new-possibilities-heading"
            prefix={LANDING_POSSIBILITIES_TITLE_PREFIX}
            accent={LANDING_POSSIBILITIES_TITLE_ACCENT}
            displayClassName={LANDING_POSSIBILITIES_TITLE_CLASS}
          />
        </LatticePlate>
        <LandingNewLatticeCtaCell label={LANDING_POSSIBILITIES_CTA_LABEL} />
      </LatticeSection>
      <LandingNewFooter />
    </>
  )
}
