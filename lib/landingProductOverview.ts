/**
 * Console home product cards for the new landing.
 * Copy and order match ryle-app `lib/home/product-overview.ts`.
 */

export type LandingProductOverviewId =
  | "cards"
  | "remittances"
  | "wallet"
  | "assets"
  | "custody"
  | "proofs"

export type LandingProductOverviewTone = "live" | "attention" | "setup"

export type LandingProductOverviewCard = {
  id: LandingProductOverviewId
  title: string
  description: string
  tone: LandingProductOverviewTone
  statusLabel: string
  cta: string
}

/** Same lead order as the console homepage product track. */
export const LANDING_PRODUCT_OVERVIEW_CARDS: readonly LandingProductOverviewCard[] =
  [
    {
      id: "cards",
      title: "Cards",
      description: "Issue hybrid cards funded by fiat and stablecoins.",
      tone: "live",
      statusLabel: "Live",
      cta: "Open cards",
    },
    {
      id: "remittances",
      title: "Remittances",
      description: "Move money across corridors on stablecoin rails.",
      tone: "live",
      statusLabel: "Live",
      cta: "Open remittances",
    },
    {
      id: "wallet",
      title: "Wallet",
      description: "Brand and run the white-label wallet your customers use.",
      tone: "live",
      statusLabel: "Live",
      cta: "Open Wallet",
    },
    {
      id: "assets",
      title: "Assets",
      description: "Issue and operate confidential tokenized assets.",
      tone: "live",
      statusLabel: "3 live",
      cta: "Deploy a new asset",
    },
    {
      id: "custody",
      title: "Custody",
      description: "Choose how your organization holds and signs for assets.",
      tone: "live",
      statusLabel: "2 connected",
      cta: "Connect a third party custody",
    },
    {
      id: "proofs",
      title: "Proofs",
      description: "Record signed, verifiable proof of what happened.",
      tone: "attention",
      statusLabel: "2 pending",
      cta: "Create proof",
    },
  ]
