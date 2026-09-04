"use client"

import type { ComponentType } from "react"
import {
  LuBanknote,
  LuBitcoin,
  LuCar,
  LuChevronDown,
  LuCircleDollarSign,
  LuCoffee,
  LuCoins,
  LuEuro,
  LuPlane,
  LuShoppingBag,
  LuStore,
  LuTv,
} from "react-icons/lu"
import { AccountCardFace, CARD_PAY_ASSET_LABEL } from "@/components/marketing/wallet-demo/home/AccountCardFace"
import {
  MenuRow,
  SHEET_TITLE_AREA_CLASS,
  SHEET_TITLE_H2_CLASS,
} from "@/components/marketing/wallet-demo/receive/ReceiveSheets"
import { BottomSheet } from "@/components/marketing/wallet-demo/ui/BottomSheet"
import {
  MOVEMENT_LIST_AMOUNT_CLASS,
  MOVEMENT_LIST_ROW_SECONDARY_CLASS,
  MOVEMENT_LIST_ROW_TITLE_CLASS,
  READY_BLUE_GRADIENT,
  SECTION_LABEL_CLASS,
} from "@/components/marketing/wallet-demo/ui/primitives"
import { DEMO_EUR_PER_USD } from "@/lib/walletDemo/data"
import { formatCents, formatListDate, formatNumber } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"
import type { CardPayAsset, CryptoHolding } from "@/lib/walletDemo/types"

type LucideIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

type Category = "groceries" | "dining" | "transport" | "subscription" | "shopping" | "travel"

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  groceries: LuStore,
  dining: LuCoffee,
  transport: LuCar,
  subscription: LuTv,
  shopping: LuShoppingBag,
  travel: LuPlane,
}

const CATEGORY_LABEL: Record<Category, string> = {
  groceries: "Groceries",
  dining: "Dining",
  transport: "Transport",
  subscription: "Subscriptions",
  shopping: "Shopping",
  travel: "Travel",
}

/** Seeded relative to module load; the sheet only renders after a user tap, so no SSR mismatch. */
const CARD_MOVEMENTS = (
  [
    { id: "m1", merchant: "Disco", category: "groceries", hoursAgo: 5, amountCents: 62_40 },
    { id: "m2", merchant: "La Linda", category: "dining", hoursAgo: 27, amountCents: 28_90 },
    { id: "m3", merchant: "Uber", category: "transport", hoursAgo: 31, amountCents: 11_20 },
    { id: "m4", merchant: "Spotify", category: "subscription", hoursAgo: 70, amountCents: 9_99 },
    { id: "m5", merchant: "Zara", category: "shopping", hoursAgo: 96, amountCents: 84_00 },
    { id: "m6", merchant: "Iberia", category: "travel", hoursAgo: 140, amountCents: 312_00 },
  ] as const satisfies readonly { id: string; merchant: string; category: Category; hoursAgo: number; amountCents: number }[]
).map((m) => ({
  ...m,
  occurredAt: new Date(Date.now() - m.hoursAgo * 3_600_000).toISOString(),
}))

const PAY_OPTIONS: { id: CardPayAsset; icon: LucideIcon }[] = [
  { id: "euros", icon: LuBanknote },
  { id: "dolares", icon: LuCircleDollarSign },
  { id: "usdc", icon: LuCoins },
  { id: "eurc", icon: LuEuro },
  { id: "btc", icon: LuBitcoin },
]

function useSelectedAvailable(asset: CardPayAsset): { symbol: string; label: string } {
  const balances = useWalletDemoStore((s) => s.balancesCents)
  const holdings = useWalletDemoStore((s) => s.cryptoHoldings)
  if (asset === "euros") return { symbol: "€", label: formatCents(balances.euros).display }
  if (asset === "dolares") return { symbol: "US$", label: formatCents(balances.dolares).display }
  const ticker = asset.toUpperCase()
  const h = holdings.find((x) => x.ticker === ticker)
  return {
    symbol: ticker,
    label: h ? formatNumber(h.balance, h.balanceFractionDigits) : "0.00",
  }
}

type SegmentId = "euros" | "dolares" | "crypto"

const SEGMENT_CLASS: Record<SegmentId, string> = {
  euros: "bg-[#0095FF]",
  dolares: "bg-[#22C55E]",
  crypto: "bg-[#7C3AED]",
}

const SEGMENT_LABEL: Record<SegmentId, string> = {
  euros: "Euros account",
  dolares: "Dollars account",
  crypto: "Crypto account",
}

/** Segmented available bar (euros / dollars / crypto) + per-asset list; mirrors the wallet's `CardBalanceMix`. */
function CardBalanceMix({
  eurosCents,
  dolaresCents,
  holdings,
}: {
  eurosCents: number
  dolaresCents: number
  holdings: readonly CryptoHolding[]
}) {
  const eurosEur = eurosCents / 100
  const dolaresUsd = dolaresCents / 100
  const dolaresEur = dolaresUsd * DEMO_EUR_PER_USD
  const cryptoEur = holdings.reduce((sum, h) => sum + h.valueEur, 0)
  const total = eurosEur + dolaresEur + cryptoEur

  const segments = (
    [
      { id: "euros" as const, eur: eurosEur },
      { id: "dolares" as const, eur: dolaresEur },
      { id: "crypto" as const, eur: cryptoEur },
    ] as { id: SegmentId; eur: number }[]
  )
    .filter((s) => s.eur > 0)
    .map((s) => ({ ...s, percent: total > 0 ? (s.eur / total) * 100 : 0 }))

  return (
    <div className="mt-8 w-full min-w-0">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-foreground/10"
        role="img"
        aria-label="Available balance mix by account"
      >
        {segments.length === 0 ? (
          <span className="h-full w-full bg-foreground/10" aria-hidden />
        ) : (
          segments.map((segment) => (
            <span
              key={segment.id}
              className={`h-full min-w-[3px] ${SEGMENT_CLASS[segment.id]}`}
              style={{ width: `${segment.percent}%` }}
              title={`${SEGMENT_LABEL[segment.id]}: €${formatNumber(segment.eur, 2)}`}
            />
          ))
        )}
      </div>

      {segments.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1" aria-label="Accounts in available balance">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium leading-snug tracking-[-0.01em] text-muted"
            >
              <span className={`size-2 shrink-0 rounded-full ${SEGMENT_CLASS[segment.id]}`} aria-hidden />
              <span className="truncate">{SEGMENT_LABEL[segment.id]}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-5 flex min-w-0 list-none flex-col gap-0 p-0" aria-label="Available balance detail">
        <li className="flex min-w-0 items-center gap-3 py-2.5">
          <span className={`size-2.5 shrink-0 rounded-full ${SEGMENT_CLASS.euros}`} aria-hidden />
          <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
            <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>Euros</span>
          </div>
          <span className={MOVEMENT_LIST_AMOUNT_CLASS}>€ {formatCents(eurosCents).display}</span>
        </li>
        <li className="flex min-w-0 items-center gap-3 py-2.5">
          <span className={`size-2.5 shrink-0 rounded-full ${SEGMENT_CLASS.dolares}`} aria-hidden />
          <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
            <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>USD</span>
            <span className={`${MOVEMENT_LIST_ROW_SECONDARY_CLASS} truncate`}>
              € {formatNumber(dolaresEur, 2)} in euros
            </span>
          </div>
          <span className={MOVEMENT_LIST_AMOUNT_CLASS}>US$ {formatCents(dolaresCents).display}</span>
        </li>
        {holdings.map((holding) => (
          <li key={holding.ticker} className="flex min-w-0 items-center gap-3 py-2.5">
            <span className={`size-2.5 shrink-0 rounded-full ${SEGMENT_CLASS.crypto}`} aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
              <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>{holding.ticker}</span>
              <span className={`${MOVEMENT_LIST_ROW_SECONDARY_CLASS} truncate`}>
                {formatNumber(holding.balance, holding.balanceFractionDigits)} {holding.ticker}
              </span>
            </div>
            <span className={MOVEMENT_LIST_AMOUNT_CLASS}>€ {formatNumber(holding.valueEur, 2)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CardPayWithSheet({
  isOpen,
  onClose,
  selected,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  selected: CardPayAsset
  onSelect: (asset: CardPayAsset) => void
}) {
  return (
    <BottomSheet fullWidth isOpen={isOpen} onClose={onClose} height="auto" nested>
      <div className="flex flex-col">
        <div className={SHEET_TITLE_AREA_CLASS}>
          <h2 className={SHEET_TITLE_H2_CLASS}>Pay with</h2>
        </div>
        <div className="flex flex-col gap-0 px-6 pb-8 pt-2" role="listbox" aria-label="Pay with">
          {PAY_OPTIONS.map((option) => (
            <MenuRow
              key={option.id}
              icon={option.icon}
              title={CARD_PAY_ASSET_LABEL[option.id]}
              aria-label={
                option.id === selected
                  ? `Pay with ${CARD_PAY_ASSET_LABEL[option.id]}, selected`
                  : `Pay with ${CARD_PAY_ASSET_LABEL[option.id]}`
              }
              onClick={() => {
                onSelect(option.id)
                onClose()
              }}
            />
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}

/** Card detail sheet: face, available balance + pay-with picker, card movements. */
export function CardSheet() {
  const isOpen = useWalletDemoStore((s) => s.cardSheetOpen)
  const close = useWalletDemoStore((s) => s.closeCardSheet)
  const payAsset = useWalletDemoStore((s) => s.cardPayAsset)
  const setPayAsset = useWalletDemoStore((s) => s.setCardPayAsset)
  const payWithOpen = useWalletDemoStore((s) => s.cardPayWithOpen)
  const setPayWithOpen = useWalletDemoStore((s) => s.setCardPayWithOpen)
  const available = useSelectedAvailable(payAsset)
  const balances = useWalletDemoStore((s) => s.balancesCents)
  const holdings = useWalletDemoStore((s) => s.cryptoHoldings)

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={close} height="auto" fullWidth>
        <div className="flex flex-col pb-6">
          <div className={SHEET_TITLE_AREA_CLASS}>
            <h2 className={SHEET_TITLE_H2_CLASS}>Card</h2>
          </div>

          <div className="w-full min-w-0 shrink-0 px-6">
            <AccountCardFace payAsset={payAsset} showPayPill={false} />
          </div>

          <section className="mt-8 w-full min-w-0 shrink-0 px-6" aria-label="Available">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className={SECTION_LABEL_CLASS}>Available</p>
                <p className="mt-1.5 flex items-baseline gap-1 text-[28px] font-medium leading-none tracking-[-0.03em] text-foreground">
                  <span className="shrink-0 text-[18px] uppercase text-muted-light">{available.symbol}</span>
                  <span className="tabular-nums">{available.label}</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <p className={SECTION_LABEL_CLASS}>Pay with</p>
                <button
                  type="button"
                  onClick={() => setPayWithOpen(true)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-0.5 rounded-full pb-[5px] pl-2 pr-1.5 pt-[6px] text-[17px] font-medium leading-none tracking-[-0.01em] text-white transition-opacity active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0095FF]"
                  style={{ backgroundImage: READY_BLUE_GRADIENT }}
                  aria-label="Choose payment asset"
                  aria-haspopup="dialog"
                  aria-expanded={payWithOpen}
                >
                  <span className="leading-none">{CARD_PAY_ASSET_LABEL[payAsset]}</span>
                  <LuChevronDown size={14} strokeWidth={1.75} className="shrink-0 text-white/80" aria-hidden />
                </button>
              </div>
            </div>

            <CardBalanceMix
              eurosCents={balances.euros}
              dolaresCents={balances.dolares}
              holdings={holdings}
            />
          </section>

          <section className="mt-10 w-full min-w-0 shrink-0 px-6" aria-labelledby="wallet-demo-card-activity">
            <h2 id="wallet-demo-card-activity" className={`mb-4 ${SECTION_LABEL_CLASS}`}>
              Card movements
            </h2>
            <ul className="flex min-w-0 flex-col gap-8">
              {CARD_MOVEMENTS.map((m) => {
                const Icon = CATEGORY_ICON[m.category]
                return (
                  <li key={m.id} className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-avatar-bg text-muted">
                      <Icon size={16} strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
                      <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>{m.merchant}</span>
                      <span className={MOVEMENT_LIST_ROW_SECONDARY_CLASS}>
                        {CATEGORY_LABEL[m.category]}
                        <span className="mx-1.5 select-none text-muted" aria-hidden>
                          ·
                        </span>
                        {formatListDate(m.occurredAt)}
                      </span>
                    </div>
                    <span className={MOVEMENT_LIST_AMOUNT_CLASS}>{`\u2212€${formatCents(m.amountCents).display}`}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-8 text-[13px] leading-snug tracking-[-0.01em] text-muted">
              Demo data: this card is not issued yet and does not move real funds.
            </p>
          </section>
        </div>
      </BottomSheet>

      <CardPayWithSheet
        isOpen={isOpen && payWithOpen}
        onClose={() => setPayWithOpen(false)}
        selected={payAsset}
        onSelect={setPayAsset}
      />
    </>
  )
}
