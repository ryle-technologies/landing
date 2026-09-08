/**
 * Console home product cards for the new landing.
 * Copy, order and figures match ryle-app `lib/home/product-overview.ts`
 * plus the Cards / Remittances / Wallet fixtures those cards read.
 */

import { CARDS_KPIS } from "@/lib/landingConsoleDashboard"
import { formatCompactMoney, KPIS } from "@/lib/landingRemittances"

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
  metrics: { label: string; value: string }[]
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
      metrics: [
        { label: "Active cards", value: CARDS_KPIS.activeCards },
        {
          label: "In custody",
          value: formatCompactMoney(CARDS_KPIS.usdcInCustodyAmount, "USD"),
        },
        {
          label: "30-day spend",
          value: formatCompactMoney(CARDS_KPIS.volume30DayAmount, "USD"),
        },
      ],
    },
    {
      id: "remittances",
      title: "Remittances",
      description: "Move money across corridors on stablecoin rails.",
      tone: "live",
      statusLabel: "Live",
      metrics: [
        {
          label: "30-day volume",
          value: formatCompactMoney(KPIS.volume30DayAmount, "EUR"),
        },
        { label: "Transfers", value: KPIS.transfers30Day },
        { label: "Median delivery", value: KPIS.medianDelivery },
      ],
    },
    {
      id: "wallet",
      title: "Wallet",
      description: "Brand and run the white-label wallet your customers use.",
      tone: "live",
      statusLabel: "Live",
      metrics: [
        { label: "Active wallets", value: "48,260" },
        { label: "Provisioned · 30d", value: "3,840" },
        { label: "Brands", value: "3" },
      ],
    },
    {
      id: "assets",
      title: "Assets",
      description: "Issue and operate confidential tokenized assets.",
      tone: "live",
      statusLabel: "3 live",
      metrics: [
        { label: "Live", value: "3" },
        { label: "Drafts", value: "1" },
        { label: "Allowlisted", value: "1.2K" },
      ],
    },
    {
      id: "custody",
      title: "Custody",
      description: "Choose how your organization holds and signs for assets.",
      tone: "live",
      statusLabel: "2 connected",
      metrics: [
        { label: "Connected", value: "2" },
        { label: "Pending", value: "0" },
        { label: "Assets held", value: "3" },
      ],
    },
    {
      id: "proofs",
      title: "Proofs",
      description: "Record signed, verifiable proof of what happened.",
      tone: "attention",
      statusLabel: "2 pending",
      metrics: [
        { label: "Categories", value: "4" },
        { label: "Proofs", value: "1.4K" },
        { label: "Pending", value: "2" },
      ],
    },
  ]
