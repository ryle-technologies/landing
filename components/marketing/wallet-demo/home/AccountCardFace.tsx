"use client"

import { LuChevronDown, LuNfc } from "react-icons/lu"
import { READY_BLUE_GRADIENT } from "@/components/marketing/wallet-demo/ui/primitives"
import { DEMO_BRAND_NAME, DEMO_CARD, DEMO_PROFILE } from "@/lib/walletDemo/data"
import type { CardPayAsset } from "@/lib/walletDemo/types"

export const CARD_PAY_ASSET_LABEL: Record<CardPayAsset, string> = {
  euros: "Euros",
  dolares: "Dollars",
  usdc: "USDC",
  eurc: "EURC",
  btc: "BTC",
}

/**
 * Card face. Ink fill (`bg-foreground` / `text-background`) with a faint
 * 45° hatch texture; direct port of the wallet's `AccountCardFace`.
 */
export function AccountCardFace({
  className,
  payAsset = "usdc",
  onPayAssetPress,
  payWithOpen = false,
  size = "sheet",
  showPayPill = true,
}: {
  className?: string
  payAsset?: CardPayAsset
  onPayAssetPress?: () => void
  payWithOpen?: boolean
  size?: "home" | "sheet"
  showPayPill?: boolean
}) {
  const holderName = DEMO_PROFILE.displayName.toUpperCase()
  const payLabel = CARD_PAY_ASSET_LABEL[payAsset]
  const isHome = size === "home"

  const payPillClassName = isHome
    ? "inline-flex items-center gap-1 rounded-full pt-2 pr-2.5 pb-[7px] pl-3 text-[16px] font-medium leading-none tracking-[-0.01em] text-white"
    : "inline-flex items-center gap-0.5 rounded-full pt-[6px] pr-1.5 pb-[5px] pl-2 text-[13px] font-medium leading-none tracking-[-0.01em] text-white"
  const nfcSize = isHome ? 28 : 20
  const chevronSize = isHome ? 16 : 12

  return (
    <div
      role="img"
      aria-label={`${DEMO_BRAND_NAME} card ending in ${DEMO_CARD.last4}, cardholder ${holderName}`}
      className={`relative isolate flex aspect-[1.586/1] w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-foreground px-5 py-[18px] text-background shadow-[0_1px_3px_rgba(0,0,0,0.075)] [corner-shape:squircle] [transform:translateZ(0)]${
        className ? ` ${className}` : ""
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl [corner-shape:squircle]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent 0,
            transparent 5px,
            color-mix(in oklab, var(--background) 7%, transparent) 5px,
            color-mix(in oklab, var(--background) 7%, transparent) 6px
          )`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-background/10 blur-2xl"
      />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-1.5" aria-hidden>
          <span className="truncate text-[17px] font-medium leading-none tracking-[-0.01em]">
            {DEMO_BRAND_NAME}
          </span>
          <span className="text-[11px] font-medium uppercase leading-none tracking-[0.16em] opacity-60">
            Debit
          </span>
        </span>

        {showPayPill ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            {onPayAssetPress ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPayAssetPress()
                }}
                className={`${payPillClassName} relative z-10 cursor-pointer transition-opacity active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                style={{ backgroundImage: READY_BLUE_GRADIENT }}
                aria-label="Choose payment asset"
                aria-haspopup="dialog"
                aria-expanded={payWithOpen}
              >
                <span className="leading-none">{payLabel}</span>
                <LuChevronDown
                  size={chevronSize}
                  strokeWidth={1.75}
                  className="shrink-0 text-white/80"
                  aria-hidden
                />
              </button>
            ) : (
              <span
                className={payPillClassName}
                style={{ backgroundImage: READY_BLUE_GRADIENT }}
                aria-hidden
              >
                <span className="leading-none">{payLabel}</span>
              </span>
            )}
            <span
              className={`font-medium leading-none tracking-[-0.01em] text-background ${
                isHome ? "text-[12px]" : "text-[11px]"
              }`}
              aria-hidden
            >
              Payment configured
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-start" aria-hidden>
        <LuNfc size={nfcSize} strokeWidth={1.75} className="shrink-0 opacity-70" />
      </div>

      <div className="flex min-w-0 flex-col gap-3.5" aria-hidden>
        <span className="text-[18px] font-medium leading-none tabular-nums tracking-[0.16em]">
          •••• •••• •••• {DEMO_CARD.last4}
        </span>
        <div className="flex min-w-0 items-end justify-between gap-4">
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.16em] opacity-55">
              Cardholder
            </span>
            <span className="truncate text-[14px] font-medium leading-none tracking-[0.04em]">
              {holderName}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.16em] opacity-55">
              Expires
            </span>
            <span className="text-[14px] font-medium leading-none tabular-nums tracking-[0.04em]">
              {DEMO_CARD.expiry}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
