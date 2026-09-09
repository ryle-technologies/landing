/**
 * Frontend-only data model for the hero wallet demo.
 * Mirrors the private wallet's shapes, minus everything on-chain.
 */

/** Personal currency views of the embedded wallet. */
export type AccountKind = "euros" | "dolares" | "crypto"

export type TransactionKind = "transfer" | "exchange"

export type TransactionStatus = "confirmed" | "pending" | "failed"

export interface Transaction {
  id: string
  account: AccountKind
  kind: TransactionKind
  direction: "in" | "out"
  /** Amount in minor units (cents) of the account currency. */
  amountCents: number
  /** Counterparty display name (person or merchant). For exchanges, the other account label. */
  counterpartyName: string
  /** `@tag` when the counterparty is a wallet user. */
  counterpartyTag?: string
  counterpartyAvatarUrl?: string
  occurredAt: string
  status: TransactionStatus
  /** Pseudo tx hash for the detail sheet. */
  txHash: string
  /** For exchanges: human summary ("You exchanged US$100.00 for €87.00"). */
  exchangePhrase?: string
}

export interface Contact {
  id: string
  name: string
  tag?: string
  wallet: string
  avatarUrl?: string
}

export interface CryptoHolding {
  name: string
  ticker: "BTC" | "USDC" | "EURC"
  balance: number
  balanceFractionDigits: number
  valueEur: number
}

export type CardPayAsset = "euros" | "dolares" | "usdc" | "eurc" | "btc"
