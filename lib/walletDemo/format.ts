import type { AccountKind } from "@/lib/walletDemo/types"

export const THOUSAND_SEPARATOR = ","
export const DECIMAL_SEPARATOR = "."

function groupInteger(int: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSAND_SEPARATOR)
}

export interface FormattedAmount {
  /** `3,750.00` */
  display: string
  /** `3,750` */
  whole: string
  /** `00` */
  fraction: string
  /** `3750.00` — for `SlidingNumber` (`.` decimal point, no grouping). */
  slide: string
}

/** Cents → display parts, always two decimals, truncated toward zero. */
export function formatCents(cents: number): FormattedAmount {
  const abs = Math.abs(Math.trunc(cents))
  const whole = String(Math.floor(abs / 100))
  const fraction = String(abs % 100).padStart(2, "0")
  const sign = cents < 0 ? "-" : ""
  return {
    display: `${sign}${groupInteger(whole)}${DECIMAL_SEPARATOR}${fraction}`,
    whole: `${sign}${groupInteger(whole)}`,
    fraction,
    slide: `${sign}${whole}.${fraction}`,
  }
}

/** Number → grouped display with fixed fraction digits (truncated). */
export function formatNumber(value: number, fractionDigits: number): string {
  if (!Number.isFinite(value)) return "—"
  const scale = 10 ** fractionDigits
  const scaled = Math.floor(Math.abs(value) * scale + 1e-9)
  const whole = String(Math.floor(scaled / scale))
  const frac = String(scaled % scale).padStart(fractionDigits, "0")
  const sign = value < 0 ? "-" : ""
  return fractionDigits > 0
    ? `${sign}${groupInteger(whole)}${DECIMAL_SEPARATOR}${frac}`
    : `${sign}${groupInteger(whole)}`
}

/** Parse the numpad amount string ("12.5") into cents. */
export function parseAmountToCents(amount: string): number {
  const n = Number.parseFloat(amount)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100)
}

export function currencySymbolForKind(kind: AccountKind): string {
  if (kind === "dolares") return "US$"
  return "€"
}

export function accountTitleForKind(kind: AccountKind): string {
  if (kind === "euros") return "Euros account"
  if (kind === "dolares") return "Dollars account"
  return "Crypto account"
}

export function sendRowTitleForKind(kind: AccountKind): string {
  if (kind === "euros") return "To your Euros account"
  if (kind === "dolares") return "To your Dollars account"
  return "To your Crypto account"
}

/** Movements list date: `12m` / `3h` / `Yesterday` / `D/M`. */
export function formatListDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (sameDay) {
    const diffMs = now.getTime() - date.getTime()
    const minutes = Math.round(diffMs / 60_000)
    if (minutes < 60) return `${Math.max(1, minutes)}m`
    return `${Math.max(1, Math.round(diffMs / 3_600_000))}h`
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  if (isYesterday) return "Yesterday"
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export function formatDetailDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Not available"
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function shortenHash(hash: string, head = 6, tail = 4): string {
  if (hash.length <= head + tail + 1) return hash
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`
}

export function shortenAddress(address: string, head = 8, tail = 6): string {
  return shortenHash(address, head, tail)
}
