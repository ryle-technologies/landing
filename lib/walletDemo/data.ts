import type {
  AccountKind,
  Contact,
  CryptoHolding,
  Transaction,
} from "@/lib/walletDemo/types"

export const DEMO_PROFILE = {
  displayName: "Alex Rivera",
  tag: "@alex",
  avatarUrl: "/images/wallet-demo/avatar.png",
  /** Display / QR only. */
  walletAddress: "0x7A3f1C9e42B8d5F0a6E1c3D9b7F2e4A8c5D6B1e0",
} as const

export const DEMO_BRAND_NAME = "Ryle"

export const DEMO_CARD = {
  last4: "4921",
  expiry: "09/29",
} as const

/** Demo FX: 1 US$ = 0.87 € (matches the seeded exchange rows). */
export const DEMO_EUR_PER_USD = 0.87

/** Seed balances in cents. */
export const DEMO_SEED_BALANCES: Record<Exclude<AccountKind, "crypto">, number> =
  {
    euros: 3_750_00,
    dolares: 1_500_00,
  }

export const DEMO_BTC_PRICE_EUR = 85_463.415

export const DEMO_CRYPTO_HOLDINGS: readonly CryptoHolding[] = [
  {
    name: "EURC Coin",
    ticker: "EURC",
    balance: 2296,
    balanceFractionDigits: 2,
    valueEur: 2296,
  },
  {
    name: "USDC Coin",
    ticker: "USDC",
    balance: 2279.17,
    balanceFractionDigits: 2,
    valueEur: 1982.87,
  },
  {
    name: "Bitcoin",
    ticker: "BTC",
    balance: 0.0006,
    balanceFractionDigits: 4,
    valueEur: 51.27,
  },
]

const sofia: Contact = {
  id: "contact:sofia",
  name: "Sofía Pereira",
  tag: "@sofia",
  wallet: "0x3333333333333333333333333333333333333333",
}
const martin: Contact = {
  id: "contact:martin",
  name: "Martín Acosta",
  tag: "@martin",
  wallet: "0x4444444444444444444444444444444444444444",
}
const lucia: Contact = {
  id: "contact:lucia",
  name: "Lucía Fernández",
  tag: "@lucia",
  wallet: "0x5555555555555555555555555555555555555555",
}
const diego: Contact = {
  id: "contact:diego",
  name: "Diego Vargas",
  tag: "@diego",
  wallet: "0x8888888888888888888888888888888888888888",
}
const nora: Contact = {
  id: "contact:nora",
  name: "Nora Castillo",
  tag: "@nora",
  wallet: "0x9999999999999999999999999999999999999998",
}

export const DEMO_FAVORITES: readonly Contact[] = [sofia, martin, lucia]

/** Incoming payment-request link the Pay scene “opens” (no real URL). */
export const DEMO_PAY_REQUEST = {
  amountCents: 74_00,
  reason: "Friday dinner",
  creator: sofia,
} as const

/** Outgoing request the Request scene creates, then shows as a QR. */
export const DEMO_CREATE_REQUEST = {
  amountCents: 33_00,
  reason: "Dinner last night",
  shortCode: "dn8k2x",
} as const

export const DEMO_RECENT: readonly Contact[] = [diego, nora]

export const DEMO_EXTERNAL_WALLETS: readonly Contact[] = [
  {
    id: "external:ledger",
    name: "Ledger",
    wallet: "0xA1b2C3d4E5f60718293a4B5c6D7e8F9012345678",
  },
  {
    id: "external:exchange",
    name: "Exchange",
    wallet: "0xB2c3D4e5F60718293A4b5C6d7E8f90123456789a",
  },
]

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function hash(n: number): string {
  return `0x${n.toString(16).padStart(2, "0")}${"ab".repeat(31)}`
}

type Seed = {
  id: string
  account: AccountKind
  hoursAgo: number
  direction: "in" | "out"
  amountCents: number
  contact?: Contact
  merchant?: string
  kind?: "exchange"
  exchangePhrase?: string
  counterpartyName?: string
}

function seed(s: Seed, idx: number): Transaction {
  const kind = s.kind ?? "transfer"
  return {
    id: s.id,
    account: s.account,
    kind,
    direction: s.direction,
    amountCents: s.amountCents,
    counterpartyName:
      s.counterpartyName ?? s.contact?.name ?? s.merchant ?? "Unknown",
    counterpartyTag: s.contact?.tag,
    counterpartyAvatarUrl: s.contact?.avatarUrl,
    occurredAt: hoursAgo(s.hoursAgo),
    status: "confirmed",
    txHash: hash(0x10 + idx),
    exchangePhrase: s.exchangePhrase,
  }
}

/** Movements are seeded relative to "now" so they always read as recent. */
export function buildSeedTransactions(): Transaction[] {
  const seeds: Seed[] = [
    // Euros
    { id: "a1", account: "euros", hoursAgo: 2, direction: "in", amountCents: 1_500_00, contact: sofia },
    { id: "a2", account: "euros", hoursAgo: 18, direction: "out", amountCents: 450_00, contact: martin },
    { id: "a3", account: "euros", hoursAgo: 26, direction: "out", amountCents: 24_00, merchant: "Farmacia Sur" },
    {
      id: "a4",
      account: "euros",
      hoursAgo: 30,
      direction: "in",
      amountCents: 87_00,
      kind: "exchange",
      counterpartyName: "Your Dollars account",
      exchangePhrase: "You exchanged US$100.00 for €87.00",
    },
    { id: "a5", account: "euros", hoursAgo: 40, direction: "out", amountCents: 89_00, merchant: "Café Brasilero" },
    { id: "a6", account: "euros", hoursAgo: 60, direction: "in", amountCents: 175_00, contact: diego },
    { id: "a7", account: "euros", hoursAgo: 72, direction: "in", amountCents: 3_200_00, contact: lucia },
    { id: "a8", account: "euros", hoursAgo: 110, direction: "out", amountCents: 65_00, contact: sofia },
    // Dollars
    { id: "b1", account: "dolares", hoursAgo: 6, direction: "in", amountCents: 320_00, contact: sofia },
    { id: "b2", account: "dolares", hoursAgo: 14, direction: "out", amountCents: 18_50, merchant: "Uber" },
    { id: "b3", account: "dolares", hoursAgo: 28, direction: "out", amountCents: 85_00, contact: martin },
    {
      id: "b4",
      account: "dolares",
      hoursAgo: 30,
      direction: "out",
      amountCents: 100_00,
      kind: "exchange",
      counterpartyName: "Your Euros account",
      exchangePhrase: "You exchanged US$100.00 for €87.00",
    },
    { id: "b5", account: "dolares", hoursAgo: 36, direction: "in", amountCents: 210_00, contact: diego },
    { id: "b6", account: "dolares", hoursAgo: 55, direction: "out", amountCents: 142_00, merchant: "Hotel Plaza" },
    { id: "b7", account: "dolares", hoursAgo: 80, direction: "out", amountCents: 45_00, contact: lucia },
    // Crypto (valued in €)
    { id: "c1", account: "crypto", hoursAgo: 4, direction: "in", amountCents: 1_875_00, contact: lucia },
    { id: "c2", account: "crypto", hoursAgo: 22, direction: "out", amountCents: 120_00, merchant: "Ledger" },
    { id: "c3", account: "crypto", hoursAgo: 48, direction: "in", amountCents: 421_00, contact: martin },
    { id: "c4", account: "crypto", hoursAgo: 96, direction: "out", amountCents: 51_27, merchant: "Exchange" },
  ]
  return seeds.map(seed)
}

export interface BannerSlide {
  id: string
  title: string
  subtitle: string
  imageSrc: string
}

export const DEMO_BANNERS: readonly BannerSlide[] = [
  {
    id: "welcome",
    title: "Welcome to the demo",
    subtitle: "What you can do today in your wallet",
    imageSrc: "/images/wallet-demo/banner-welcome.jpg",
  },
  {
    id: "funds",
    title: "Instant settlement",
    subtitle: "Move money between accounts in seconds",
    imageSrc: "/images/wallet-demo/banner-coins.jpg",
  },
  {
    id: "security",
    title: "Wallet security",
    subtitle: "How your security works",
    imageSrc: "/images/wallet-demo/banner-security.jpg",
  },
]
