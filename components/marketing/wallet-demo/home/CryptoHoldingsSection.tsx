"use client"

import {
  MOVEMENT_LIST_AMOUNT_CLASS,
  MOVEMENT_LIST_ROW_SECONDARY_CLASS,
  MOVEMENT_LIST_ROW_TITLE_CLASS,
  SECTION_LABEL_CLASS,
} from "@/components/marketing/wallet-demo/ui/primitives"
import { formatNumber } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

/** Soft squircle avatar for coin rows: USDC blue, EURC deep blue, BTC orange. */
export function cryptoCoinAvatarClassName(ticker: string): string {
  const base =
    "flex h-[39px] w-[39px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] text-[12px] font-medium tracking-[-0.01em]"
  switch (ticker.toUpperCase()) {
    case "USDC":
      return `${base} bg-[#2775CA] text-white`
    case "EURC":
      return `${base} bg-[#1E4B9E] text-white`
    case "BTC":
      return `${base} bg-[#F7931A] text-white`
    default:
      return `${base} bg-avatar-bg text-foreground`
  }
}

/** Vertical coin holdings for the Crypto account. */
export function CryptoHoldingsSection() {
  const holdings = useWalletDemoStore((s) => s.cryptoHoldings)

  return (
    <section
      className="mt-10 w-full min-w-0 shrink-0 px-6 pb-1"
      aria-labelledby="wallet-demo-crypto-heading"
    >
      <h2 id="wallet-demo-crypto-heading" className={`mb-4 ${SECTION_LABEL_CLASS}`}>
        Your crypto balance
      </h2>
      <ul className="m-0 flex list-none flex-col gap-0 p-0" aria-label="Crypto holdings">
        {holdings.map((coin) => (
          <li key={coin.ticker} className="flex min-w-0 items-center gap-3 py-2.5">
            <span className={cryptoCoinAvatarClassName(coin.ticker)} aria-hidden>
              {coin.ticker.slice(0, 3)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
              <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>{coin.name}</span>
              <span className={`${MOVEMENT_LIST_ROW_SECONDARY_CLASS} truncate`}>
                {formatNumber(coin.balance, coin.balanceFractionDigits)} {coin.ticker}
              </span>
            </div>
            <span className={MOVEMENT_LIST_AMOUNT_CLASS}>
              €{formatNumber(coin.valueEur, 2)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
