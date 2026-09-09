/**
 * Wallet fixtures for the landing program dashboard.
 * Ported from ryle-app `apps/console/components/wallets/mockData.ts`
 * (all-clients overview + Nubi Pay Wallet product). Display-only.
 */

import type { AssetConfigSection } from "@/lib/landingConsoleDashboard"

export const WALLET_FLOW_MIX = {
  sendAmount: "$28.4m",
  receiveAmount: "$31.2m",
  convertAmount: "$12.9m",
  sendShare: 39,
  receiveShare: 43,
  convertShare: 18,
  avgSendSize: "$528",
  avgConvertSize: "$412",
} as const

export const WALLET_BALANCES = {
  totalUsd: 70_100_000,
  totalLabel: "$70.1m",
  openRiskCases: 31,
  travelRuleBacklog: 47,
} as const

export const WALLET_ASSET_MIX = [
  { asset: "USDC", valueUsd: 30_900_000, sharePct: 44.1, tone: 1 },
  { asset: "BTC", valueUsd: 18_400_000, sharePct: 26.2, tone: 2 },
  { asset: "EURC", valueUsd: 14_200_000, sharePct: 20.3, tone: 3 },
  { asset: "ETH", valueUsd: 6_600_000, sharePct: 9.4, tone: 4 },
] as const

export const WALLET_PRODUCT_NAME = "Nubi Pay Wallet"

export const WALLET_CONFIG_SECTIONS: readonly AssetConfigSection[] = [
  {
    id: "wallet-features",
    title: "Features",
    rows: [
      {
        id: "send",
        title: "Send",
        description: "Outbound transfers to other wallets or external destinations.",
        icon: "send",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
      {
        id: "receive",
        title: "Receive",
        description: "Accept inbound transfers and deposits into the wallet.",
        icon: "receive",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
      {
        id: "convert",
        title: "Convert",
        description: "Swap between enabled assets inside the holder wallet.",
        icon: "convert",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
      {
        id: "on-ramp",
        title: "On-ramp",
        description: "Fund the wallet from fiat through integrated providers.",
        icon: "onramp",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
    ],
  },
  {
    id: "wallet-access",
    title: "Access",
    rows: [
      {
        id: "off-ramp",
        title: "Off-ramp",
        description: "Cash out to bank accounts or other fiat rails.",
        icon: "offramp",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
      {
        id: "card-link",
        title: "Card link",
        description: "Link a payment card for spend against the wallet balance.",
        icon: "card",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
      {
        id: "global-tag",
        title: "Global tag",
        description: "Shared tag used across partners for reporting and controls.",
        icon: "tag",
        kind: "chip",
        chip: { tone: "draft", label: "Off" },
      },
    ],
  },
  {
    id: "wallet-assets",
    title: "Assets & limits",
    rows: [
      {
        id: "usdc",
        title: "USDC",
        description: "On · max 500,000 USDC",
        icon: "dollar",
        token: "USDC",
      },
      {
        id: "eurc",
        title: "EURC",
        description: "On · max 450,000 EURC",
        icon: "dollar",
        token: "EURC",
      },
      {
        id: "eth",
        title: "ETH",
        description: "On · max 80 ETH",
        icon: "dollar",
        token: "ETH",
      },
      {
        id: "btc",
        title: "BTC",
        description: "On · max 1.5 BTC",
        icon: "dollar",
        token: "BTC",
      },
    ],
  },
  {
    id: "wallet-custody",
    title: "Custody",
    rows: [
      {
        id: "status",
        title: "Product status",
        description: "Nubi Pay Wallet",
        icon: "status",
        kind: "chip",
        chip: { tone: "live", label: "Live" },
      },
      {
        id: "model",
        title: "Custody model",
        description: "Ryle holds signing keys and operates the relayer.",
        icon: "shield",
        kind: "chip",
        chip: { tone: "default", label: "Platform managed" },
      },
      {
        id: "gas",
        title: "Gas sponsorship",
        description: "Ryle covers network fees so holders do not need a gas token.",
        icon: "globe",
        kind: "chip",
        chip: { tone: "live", label: "On" },
      },
      {
        id: "kyc",
        title: "Minimum KYC",
        description: "Program-specific rules defined outside the standard tiers.",
        icon: "user",
        kind: "chip",
        chip: { tone: "default", label: "Custom" },
      },
    ],
  },
  {
    id: "wallet-limits",
    title: "General limits",
    rows: [
      {
        id: "daily-send",
        title: "Daily send",
        description: "Ceiling enforced across enabled assets at send time.",
        icon: "dollar",
        kind: "chip",
        chip: { tone: "default", label: "$150,000" },
      },
    ],
  },
]
