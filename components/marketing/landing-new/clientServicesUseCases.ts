import type { LandingNewProductsCarouselItem } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { HOME_SECTION_HREFS } from "@/lib/siteNav"

/**
 * What you can build with the stack. One tile per outcome, grouped by the
 * hero verbs (issue / move / spend / hold) plus what AI agents can do on it.
 *
 * The array is interleaved across those groups on purpose: slots fill in
 * pool order, so the first tiles on screen show the whole range (assets,
 * payments, the card, wallets, agents) before rotation starts.
 * Titles stay under ~29 characters so an idle tile never exceeds the
 * 5-column expanded width. `badge` marks the two items that depend on
 * partners we have not signed.
 */
const POOL: readonly Omit<LandingNewProductsCarouselItem, "cta">[] = [
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
    label: "Dividends and rents",
    shape: "icosahedron",
    body: "Pay every holder their share each period, automatically. No spreadsheet, no manual desk.",
  },
  {
    label: "Fiat in and out",
    shape: "torus",
    badge: "Through partners",
    body: "Let users top up and cash out through the ramp partners you choose. You keep the ledger.",
  },
]

/**
 * Tiles that describe tokenizing an asset. That work is led by Ryle Issuance,
 * so the expanded tile points there.
 */
const ISSUANCE_USE_CASE_LABELS: ReadonlySet<string> = new Set([
  "Tokenized real estate",
  "Tokenized commodities",
  "Fund and trust shares",
  "Tokenized inventory",
  "Dividends and rents",
])

const ISSUANCE_USE_CASE_CTA = {
  label: "See Ryle Issuance",
  href: HOME_SECTION_HREFS.issuance,
} as const

/** Ryle Client Services use cases, in display order. */
export const CLIENT_SERVICES_USE_CASES: readonly LandingNewProductsCarouselItem[] =
  POOL.map((item) =>
    ISSUANCE_USE_CASE_LABELS.has(item.label)
      ? { ...item, cta: ISSUANCE_USE_CASE_CTA }
      : item,
  )

/** The use cases with these labels, in the order given. Unknown labels are skipped. */
export function clientServicesUseCasesByLabel(
  labels: readonly string[],
): LandingNewProductsCarouselItem[] {
  return labels.flatMap((label) => {
    const item = CLIENT_SERVICES_USE_CASES.find((useCase) => useCase.label === label)
    return item ? [item] : []
  })
}
