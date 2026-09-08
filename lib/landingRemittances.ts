/**
 * Static fixtures for the landing remittances dashboard.
 * Ported from ryle-app `apps/console/components/remittances/mockData.ts`
 * (All-partners / 30-day overview). Display-only.
 */

export const MONTH_LABELS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan '26",
  "Feb '26",
  "Mar '26",
  "Apr '26",
  "May '26",
  "Jun '26",
  "Jul '26",
  "Aug",
] as const

export const KPIS = {
  volume30DayAmount: 4256700,
  transfers30DayAmount: 10262,
  transfers30Day: "10,262",
  medianDelivery: "48s",
  avgCostPct: 1.42,
  avgCost: "1.42%",
} as const

export const VOLUME_TREND = [
  { month: "Sep", sent: 1180, delivered: 1148 },
  { month: "Oct", sent: 1342, delivered: 1308 },
  { month: "Nov", sent: 1518, delivered: 1479 },
  { month: "Dec", sent: 2064, delivered: 2011 },
  { month: "Jan '26", sent: 1832, delivered: 1786 },
  { month: "Feb '26", sent: 2148, delivered: 2094 },
  { month: "Mar '26", sent: 2496, delivered: 2434 },
  { month: "Apr '26", sent: 2812, delivered: 2743 },
  { month: "May '26", sent: 3164, delivered: 3088 },
  { month: "Jun '26", sent: 3542, delivered: 3457 },
  { month: "Jul '26", sent: 3968, delivered: 3874 },
  { month: "Aug", sent: 4257, delivered: 4157 },
] as const

export const TRANSFER_COUNTS = [
  { month: "Sep", transfers: 3120 },
  { month: "Oct", transfers: 3542 },
  { month: "Nov", transfers: 3986 },
  { month: "Dec", transfers: 5218 },
  { month: "Jan '26", transfers: 4640 },
  { month: "Feb '26", transfers: 5412 },
  { month: "Mar '26", transfers: 6284 },
  { month: "Apr '26", transfers: 7048 },
  { month: "May '26", transfers: 7942 },
  { month: "Jun '26", transfers: 8716 },
  { month: "Jul '26", transfers: 9604 },
  { month: "Aug", transfers: 10262 },
] as const

export const DELIVERY_TREND = [
  { day: "Jul 21", seconds: 58 },
  { day: "Jul 22", seconds: 61 },
  { day: "Jul 23", seconds: 54 },
  { day: "Jul 24", seconds: 57 },
  { day: "Jul 25", seconds: 52 },
  { day: "Jul 26", seconds: 49 },
  { day: "Jul 27", seconds: 55 },
  { day: "Jul 28", seconds: 51 },
  { day: "Jul 29", seconds: 47 },
  { day: "Jul 30", seconds: 53 },
  { day: "Jul 31", seconds: 50 },
  { day: "Aug 1", seconds: 46 },
  { day: "Aug 2", seconds: 49 },
  { day: "Aug 3", seconds: 48 },
] as const

export const COST_TREND = [
  2.1, 2.04, 1.96, 1.88, 1.82, 1.74, 1.68, 1.61, 1.55, 1.49, 1.45, 1.42,
] as const

export type CorridorStatus = "LIVE" | "PILOT"

export const CORRIDOR_MIX = [
  {
    label: "ES → AR",
    route: "Spain → Argentina",
    volume: 1284500,
    share: 34,
    status: "LIVE" as CorridorStatus,
  },
  {
    label: "US → GB",
    route: "United States → London",
    volume: 864200,
    share: 23,
    status: "LIVE" as CorridorStatus,
  },
  {
    label: "BR → PT",
    route: "Brazil → Portugal",
    volume: 612800,
    share: 16,
    status: "LIVE" as CorridorStatus,
  },
] as const

export const COST_BENCHMARKS = [
  { channel: "Ryle crypto rail", costPct: 1.42, settlement: "Seconds", isRail: true },
  {
    channel: "Money transfer operator",
    costPct: 4.9,
    settlement: "1–2 days",
    isRail: false,
  },
  { channel: "Bank / SWIFT", costPct: 6.3, settlement: "2–5 days", isRail: false },
] as const

export const VALUE_SPLIT = {
  gross: 3949100,
  delivered: { amount: 3893023, sharePct: 98.58 },
  fees: { amount: 34951, sharePct: 0.88 },
  spread: { amount: 21127, sharePct: 0.53 },
} as const

export type ActivityKind = "transfer" | "liquidity" | "corridor" | "compliance" | "api"

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  transfer: "Transfer",
  liquidity: "Liquidity",
  corridor: "Corridor",
  compliance: "Compliance",
  api: "API",
}

export const ACTIVITY = [
  {
    id: "act-16",
    label: "€2,750 in flight to Mexico City · off-ramp settling",
    timestamp: "2026-08-03T16:01:00Z",
    kind: "transfer" as ActivityKind,
  },
  {
    id: "act-03",
    label: "Recipient screening cleared for CVU ···· 3317",
    timestamp: "2026-08-03T15:53:00Z",
    kind: "compliance" as ActivityKind,
  },
  {
    id: "act-04",
    label: "Uruguay payout batch released · 18 transfers",
    timestamp: "2026-08-03T15:00:00Z",
    kind: "transfer" as ActivityKind,
  },
  {
    id: "act-01",
    label: "€1,200 delivered to Buenos Aires in 44s",
    timestamp: "2026-08-03T14:12:44Z",
    kind: "transfer" as ActivityKind,
  },
  {
    id: "act-02",
    label: "Spain → Mexico corridor crossed 2,000 transfers this month",
    timestamp: "2026-08-03T13:05:00Z",
    kind: "corridor" as ActivityKind,
  },
  {
    id: "act-13",
    label: "Webhook transfer.delivered retried and recovered",
    timestamp: "2026-08-03T12:31:00Z",
    kind: "api" as ActivityKind,
  },
  {
    id: "act-10",
    label: "Cash pickup payout confirmed in Guadalajara",
    timestamp: "2026-08-03T10:48:00Z",
    kind: "transfer" as ActivityKind,
  },
  {
    id: "act-05",
    label: "USDC float topped up on Polygon · 150,000 USDC",
    timestamp: "2026-08-03T09:41:00Z",
    kind: "liquidity" as ActivityKind,
  },
  {
    id: "act-06",
    label: "Quote API p95 latency improved to 210ms",
    timestamp: "2026-08-03T08:12:00Z",
    kind: "api" as ActivityKind,
  },
  {
    id: "act-11",
    label: "Correspondent bank float flagged low · 0.9 days of cover",
    timestamp: "2026-08-03T07:15:00Z",
    kind: "liquidity" as ActivityKind,
  },
  {
    id: "act-15",
    label: "Mercado Pago float rebalanced · 180m ARS",
    timestamp: "2026-08-03T06:40:00Z",
    kind: "liquidity" as ActivityKind,
  },
  {
    id: "act-07",
    label: "FX spread on Spain → Argentina tightened to 0.35%",
    timestamp: "2026-08-02T17:26:00Z",
    kind: "corridor" as ActivityKind,
  },
] as const

export type RailAssetForm = "SEND_FIAT" | "USDC" | "LOCAL_FIAT"

export const RAIL_ASSET_LABELS: Record<RailAssetForm, string> = {
  SEND_FIAT: "Euro fiat",
  USDC: "USDC on chain",
  LOCAL_FIAT: "Local currency",
}

export const RAIL_FLOW_STAGES = [
  {
    id: "origin",
    label: "Sent from Europe",
    asset: "SEND_FIAT" as RailAssetForm,
    hops: [
      { name: "Banco Santander", volume: 1284500 },
      { name: "CaixaBank", volume: 918600 },
      { name: "BBVA", volume: 742300 },
      { name: "Intesa Sanpaolo", volume: 486200 },
      { name: "UniCredit", volume: 302700 },
      { name: "Deutsche Bank", volume: 214800 },
    ],
  },
  {
    id: "sendPartner",
    label: "Sending EDE",
    asset: "SEND_FIAT" as RailAssetForm,
    sole: true,
    hops: [{ name: "Pecunpay (EDE)", volume: 3949100 }],
  },
  {
    id: "onramp",
    label: "On-ramp",
    asset: "SEND_FIAT" as RailAssetForm,
    hops: [
      { name: "B2Me", volume: 1985500 },
      { name: "Nuek Exchange", volume: 1963600 },
    ],
  },
  {
    id: "rail",
    label: "On the rail",
    asset: "USDC" as RailAssetForm,
    hops: [
      { name: "Base · USDC", volume: 3206800 },
      { name: "Polygon · USDC", volume: 742300 },
    ],
  },
  {
    id: "offramp",
    label: "Off-ramp desk",
    asset: "USDC" as RailAssetForm,
    hops: [
      { name: "Bitso", volume: 1963600 },
      { name: "Ripio", volume: 1499300 },
      { name: "Buenbit", volume: 486200 },
    ],
  },
  {
    id: "payoutPartner",
    label: "Credited",
    asset: "LOCAL_FIAT" as RailAssetForm,
    hops: [
      { name: "Banco Galicia", volume: 1284500 },
      { name: "BBVA México", volume: 918600 },
      { name: "Banco de Chile", volume: 742300 },
      { name: "Banco Nación", volume: 486200 },
      { name: "Banorte", volume: 302700 },
      { name: "Banco Macro", volume: 214800 },
    ],
  },
] as const

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

/** Grouping and decimals only — no `Intl`, so SSR and the browser match. */
function formatGrouped(value: number, decimals: number): string {
  const [int, frac = ""] = Math.abs(value).toFixed(decimals).split(".")
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const sign = value < 0 ? "-" : ""
  return decimals > 0 ? `${sign}${grouped}.${frac}` : `${sign}${grouped}`
}

export function formatCompactMoney(value: number, currency: "EUR" | "USD"): string {
  const symbol = currency === "EUR" ? "€" : "$"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `${sign}${symbol}${formatGrouped(abs / 1_000_000, 2).replace(/\.?0+$/, "")}m`
  }
  if (abs >= 1_000) {
    const scaled = abs / 1_000
    const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
    return `${sign}${symbol}${formatGrouped(scaled, decimals).replace(/\.?0+$/, "")}k`
  }
  return `${sign}${symbol}${formatGrouped(abs, abs % 1 === 0 ? 0 : 2)}`
}

export function formatMoney(value: number, currency: "EUR"): string {
  const symbol = currency === "EUR" ? "€" : "$"
  return `${value < 0 ? "-" : ""}${symbol}${formatGrouped(Math.abs(value), 2)}`
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

/** UTC, fixed en-US shape — timezone must not depend on the machine. */
export function formatActivityTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const month = MONTHS[date.getUTCMonth()]
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()
  const minute = String(date.getUTCMinutes()).padStart(2, "0")
  const hour24 = date.getUTCHours()
  const hour12 = hour24 % 12 || 12
  const ampm = hour24 >= 12 ? "PM" : "AM"
  return `${month} ${day}, ${year}, ${hour12}:${minute} ${ampm}`
}

export function trendFromSeries(values: readonly number[]): {
  trend: "up" | "down" | "neutral"
  label: string
} {
  if (values.length < 2) return { trend: "neutral", label: "—" }
  const start = values[0] ?? 0
  const end = values[values.length - 1] ?? 0
  if (start === 0 && end === 0) return { trend: "neutral", label: "0%" }
  const pct = ((end - start) / (start === 0 ? 1 : start)) * 100
  const trend = pct > 0.5 ? "up" : pct < -0.5 ? "down" : "neutral"
  const sign = pct >= 0 ? "+" : ""
  return { trend, label: `${sign}${pct.toFixed(1)}%` }
}
