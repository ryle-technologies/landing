/**
 * Cards + assets fixtures for the landing program dashboard.
 * Cards: ryle-app `hybrid-cards/mockData.ts` (all-clients / 30-day).
 * Assets: live seed assets + ActivityLineChart (holders / mints).
 */

export const CARDS_KPIS = {
  activeCards: "1,272",
  activeCardsTrend: [712, 698, 754, 802, 791, 864, 942, 1018, 1096, 1188, 1231, 1272],
  usdcInCustodyAmount: 3_012_000,
  custodyTrend: [2180, 2095, 2310, 2385, 2270, 2540, 2685, 2590, 2840, 2915, 2940, 3012],
  volume30DayAmount: 4_821_930,
  volumeTrend: [210, 220, 265, 300, 332, 359, 386, 422, 447, 487, 503, 546],
  collectedFees: 162_000,
  feesTrend: [48, 52, 61, 74, 82, 91, 104, 118, 128, 141, 152, 162],
} as const

export const CARDS_FUNDING_MIX = {
  fiatAmount: "$2,169,868.50",
  stablecoinAmount: "$2,652,061.50",
  fiatShare: 45,
  stablecoinShare: 55,
  avgSpread: "0.36%",
} as const

export const CARDS_SETTLEMENT = {
  nextNetworkSettlement: "$182,440.12",
  countdown: "3h 12m",
  window: "Today · 16:00 UTC",
  chains: ["Base", "Polygon", "Stellar"],
  collateralPosted: "$2,500,000.00",
  obligations: "$1,164,320.00",
  coveragePct: 215,
  committedPct: 47,
  status: "Healthy",
} as const

export const CARDS_SPEND = [
  { month: "Sep", fiat: 142, usdc: 68 },
  { month: "Oct", fiat: 129, usdc: 91 },
  { month: "Nov", fiat: 181, usdc: 84 },
  { month: "Dec", fiat: 168, usdc: 132 },
  { month: "Jan '26", fiat: 214, usdc: 118 },
  { month: "Feb '26", fiat: 191, usdc: 168 },
  { month: "Mar '26", fiat: 235, usdc: 151 },
  { month: "Apr '26", fiat: 208, usdc: 214 },
  { month: "May '26", fiat: 251, usdc: 196 },
  { month: "Jun '26", fiat: 219, usdc: 268 },
  { month: "Jul '26", fiat: 262, usdc: 241 },
  { month: "Aug", fiat: 244, usdc: 302 },
] as const

export type LiveAssetId = "ausdp" | "auyu" | "atrsy"

export type ConfigChipTone = "live" | "paused" | "draft" | "default"

export type AssetConfigIcon =
  | "file"
  | "tag"
  | "address"
  | "treasury"
  | "calendar"
  | "status"
  | "clock"
  | "user"
  | "globe"
  | "shield"
  | "plus"
  | "burn"
  | "dollar"
  | "send"
  | "receive"
  | "convert"
  | "onramp"
  | "offramp"
  | "card"

export type AssetConfigToken = "USDC" | "EURC" | "ETH" | "BTC"

export type AssetConfigRow = {
  id: string
  title: string
  description: string
  icon: AssetConfigIcon
  /** Official token mark instead of the Lucide icon + plate. */
  token?: AssetConfigToken
  kind?: "text" | "address" | "chip" | "placeholder"
  chip?: { tone: ConfigChipTone; label: string }
}

export type AssetConfigSection = {
  id: string
  title: string
  rows: readonly AssetConfigRow[]
}

export type AssetActivity = {
  id: LiveAssetId
  name: string
  symbol: string
  status: "Live"
  supply: string
  holders: string
  volume24h: string
  activity: readonly { month: string; holders: number; mints: number }[]
  config: readonly AssetConfigSection[]
}

const TREASURY_ADDRESS = "0xfb1000000000000000000000000000000000c001"
const DEPLOYER_LABEL = "Acme Corp"
const TOKEN_ADMIN_LABEL = "Meridian Bank Inc"

/** `1000000000 aUSDP` → `1B aUSDP`. Leaves non-numeric values (`No limit`) alone. */
function formatCompactTokenAmount(value: string): string {
  const match = /^(\d+(?:\.\d+)?)(?:\s+(.*))?$/.exec(value.trim())
  if (!match) return value
  const amount = Number(match[1])
  if (!Number.isFinite(amount)) return value
  const unit = match[2]
  const compact =
    amount >= 1_000_000_000_000
      ? `${trimCompact(amount / 1_000_000_000_000)}T`
      : amount >= 1_000_000_000
        ? `${trimCompact(amount / 1_000_000_000)}B`
        : amount >= 1_000_000
          ? `${trimCompact(amount / 1_000_000)}M`
          : amount >= 1_000
            ? `${trimCompact(amount / 1_000)}K`
            : String(amount)
  return unit ? `${compact} ${unit}` : compact
}

function trimCompact(value: number): string {
  const fixed = value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)
  return fixed.replace(/\.?0+$/, "")
}

function liveAssetConfig({
  name,
  symbol,
  slug,
  decimals,
  tokenAddress,
  createdAt,
  cap,
  dailyMint,
  dailyRedeem,
  fee,
}: {
  name: string
  symbol: string
  slug: string
  decimals: number
  tokenAddress: string
  createdAt: string
  cap: string
  dailyMint: string
  dailyRedeem: string
  fee: string
}): readonly AssetConfigSection[] {
  return [
    {
      id: "identity",
      title: "Identity",
      rows: [
        { id: "name", title: "Name", description: name, icon: "file" },
        { id: "symbol", title: "Symbol", description: symbol, icon: "tag" },
        { id: "slug", title: "Slug", description: slug, icon: "file" },
        {
          id: "decimals",
          title: "Decimals",
          description: String(decimals),
          icon: "file",
        },
        {
          id: "tokenAddress",
          title: "Token address",
          description: tokenAddress,
          icon: "address",
          kind: "address",
        },
        {
          id: "treasuryAddress",
          title: "Treasury address",
          description: TREASURY_ADDRESS,
          icon: "treasury",
          kind: "address",
        },
        { id: "createdAt", title: "Created", description: createdAt, icon: "calendar" },
      ],
    },
    {
      id: "status",
      title: "Status & lifecycle",
      rows: [
        {
          id: "status",
          title: "Status",
          description: "Live",
          icon: "status",
          kind: "chip",
          chip: { tone: "live", label: "Live" },
        },
        {
          id: "paused",
          title: "Mint & redeem",
          description: "Active",
          icon: "clock",
          kind: "chip",
          chip: { tone: "live", label: "Active" },
        },
      ],
    },
    {
      id: "deployment",
      title: "Deployment",
      rows: [
        { id: "chain", title: "Chain", description: "Base", icon: "globe" },
        {
          id: "environment",
          title: "Environment",
          description: "Mainnet",
          icon: "globe",
        },
        {
          id: "custody",
          title: "Custody",
          description: "Fireblocks primary vault",
          icon: "shield",
        },
      ],
    },
    {
      id: "roles",
      title: "Roles",
      rows: [
        {
          id: "deployer",
          title: "Deployer",
          description: DEPLOYER_LABEL,
          icon: "address",
        },
        {
          id: "tokenAdmin",
          title: "Token admin",
          description: TOKEN_ADMIN_LABEL,
          icon: "user",
        },
        {
          id: "minter",
          title: "Minter",
          description: "Meridian Bank Minter Account",
          icon: "user",
        },
        {
          id: "pauser",
          title: "Pauser",
          description: "Meridian Bank Pauser Account",
          icon: "user",
        },
        {
          id: "allowlistManager",
          title: "Allowlist manager",
          description: "Meridian Bank Allowlist Account",
          icon: "user",
        },
      ],
    },
    {
      id: "behavior",
      title: "Behavior",
      rows: [
        {
          id: "mintTrigger",
          title: "Mint trigger",
          description: "Operator action against reserves",
          icon: "plus",
        },
        { id: "burn", title: "Burn", description: "Enabled", icon: "burn" },
        {
          id: "reserves",
          title: "Reserves",
          description: "Operator-attested",
          icon: "shield",
        },
      ],
    },
    {
      id: "rails",
      title: "Reserves & rails",
      rows: [
        {
          id: "attestationContact",
          title: "Attestation contact",
          description: "—",
          icon: "shield",
          kind: "placeholder",
        },
      ],
    },
    {
      id: "limits",
      title: "Limits",
      rows: [
        { id: "cap", title: "Supply cap", description: formatCompactTokenAmount(cap), icon: "dollar" },
        {
          id: "dailyMintLimit",
          title: "Daily mint limit",
          description: dailyMint,
          icon: "dollar",
        },
        {
          id: "dailyRedeemLimit",
          title: "Daily limit",
          description: dailyRedeem,
          icon: "dollar",
        },
      ],
    },
    {
      id: "economics",
      title: "Fee & chain",
      rows: [
        { id: "feeBps", title: "Fee", description: fee, icon: "dollar" },
        { id: "chain", title: "Chain", description: "Base", icon: "globe" },
      ],
    },
    {
      id: "policy",
      title: "Policy",
      rows: [
        {
          id: "allowlist",
          title: "Allowlist",
          description: "Closed — allowlist required",
          icon: "shield",
        },
      ],
    },
  ]
}

export const LIVE_ASSETS: readonly AssetActivity[] = [
  {
    id: "ausdp",
    name: "Acme Private USDP",
    symbol: "aUSDP",
    status: "Live",
    supply: "12.4m",
    holders: "720",
    volume24h: "186k",
    activity: [
      { month: "Sep", holders: 180, mints: 8 },
      { month: "Oct", holders: 240, mints: 12 },
      { month: "Nov", holders: 310, mints: 9 },
      { month: "Dec", holders: 380, mints: 15 },
      { month: "Jan '26", holders: 450, mints: 11 },
      { month: "Feb '26", holders: 510, mints: 14 },
      { month: "Mar '26", holders: 560, mints: 18 },
      { month: "Apr '26", holders: 610, mints: 12 },
      { month: "May '26", holders: 655, mints: 16 },
      { month: "Jun '26", holders: 690, mints: 10 },
      { month: "Jul '26", holders: 710, mints: 13 },
      { month: "Aug", holders: 720, mints: 17 },
    ],
    config: liveAssetConfig({
      name: "Acme Private USDP",
      symbol: "aUSDP",
      slug: "acme-private-usdp",
      decimals: 6,
      tokenAddress: "0xa11ce0a5d1b2c34e56f7890a1b2c3d4e5f6a11ce",
      createdAt: "Aug 17, 2026, 09:00 UTC",
      cap: "1000000000 aUSDP",
      dailyMint: "500000 aUSDP",
      dailyRedeem: "250000 aUSDP",
      fee: "0.05% (5 bps)",
    }),
  },
  {
    id: "auyu",
    name: "Acme Private UYU",
    symbol: "aUYU",
    status: "Live",
    supply: "48.2m",
    holders: "310",
    volume24h: "42k",
    activity: [
      { month: "Sep", holders: 40, mints: 3 },
      { month: "Oct", holders: 70, mints: 5 },
      { month: "Nov", holders: 95, mints: 4 },
      { month: "Dec", holders: 130, mints: 7 },
      { month: "Jan '26", holders: 160, mints: 6 },
      { month: "Feb '26", holders: 190, mints: 8 },
      { month: "Mar '26", holders: 215, mints: 5 },
      { month: "Apr '26", holders: 240, mints: 9 },
      { month: "May '26", holders: 260, mints: 7 },
      { month: "Jun '26", holders: 280, mints: 6 },
      { month: "Jul '26", holders: 295, mints: 8 },
      { month: "Aug", holders: 310, mints: 10 },
    ],
    config: liveAssetConfig({
      name: "Acme Private UYU",
      symbol: "aUYU",
      slug: "acme-private-uyu",
      decimals: 2,
      tokenAddress: "0xa11ce0a5d1b2c34e56f7890a1b2c3d4e5f6b22df",
      createdAt: "Aug 21, 2026, 09:00 UTC",
      cap: "5000000000000 aUYU",
      dailyMint: "300000000 aUYU",
      dailyRedeem: "150000000 aUYU",
      fee: "0.08% (8 bps)",
    }),
  },
  {
    id: "atrsy",
    name: "Acme Treasury Pool",
    symbol: "aTRSY",
    status: "Live",
    supply: "2.10m",
    holders: "170",
    volume24h: "9.4k",
    activity: [
      { month: "Sep", holders: 20, mints: 2 },
      { month: "Oct", holders: 35, mints: 2 },
      { month: "Nov", holders: 50, mints: 3 },
      { month: "Dec", holders: 65, mints: 4 },
      { month: "Jan '26", holders: 80, mints: 3 },
      { month: "Feb '26", holders: 95, mints: 5 },
      { month: "Mar '26", holders: 110, mints: 4 },
      { month: "Apr '26", holders: 125, mints: 3 },
      { month: "May '26", holders: 140, mints: 5 },
      { month: "Jun '26", holders: 150, mints: 4 },
      { month: "Jul '26", holders: 160, mints: 6 },
      { month: "Aug", holders: 170, mints: 5 },
    ],
    config: liveAssetConfig({
      name: "Acme Treasury Pool",
      symbol: "aTRSY",
      slug: "acme-treasury-pool",
      decimals: 6,
      tokenAddress: "0xa11ce0a5d1b2c34e56f7890a1b2c3d4e5f6c33e0",
      createdAt: "Aug 23, 2026, 09:00 UTC",
      cap: "50000000 aTRSY",
      dailyMint: "No limit",
      dailyRedeem: "No limit",
      fee: "No fee",
    }),
  },
] as const
