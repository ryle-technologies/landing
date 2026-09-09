"use client"

import { useMemo } from "react"
import { BottomSheet } from "@/components/marketing/wallet-demo/ui/BottomSheet"
import { DEMO_PAY_REQUEST } from "@/lib/walletDemo/data"
import { formatCents } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

const PAY_BUTTON_CLASS =
  "flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-foreground px-4 py-3 text-center text-[16px] font-medium leading-snug tracking-[-0.01em] text-background transition-opacity active:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [corner-shape:squircle] [transform:translateZ(0)]"

function validUntilLabel(fromIso?: string): { iso: string; label: string } {
  const parsed = fromIso ? new Date(fromIso) : new Date()
  const start = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  const end = new Date(start.getTime())
  end.setDate(end.getDate() + 7)
  return {
    iso: end.toISOString(),
    label: end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  }
}

/**
 * Incoming payment-request sheet — the same chrome a shared `/request/:id`
 * link opens in the private wallet (reason, creator, amount, Send transfer).
 */
export function PayRequestSheet() {
  const isOpen = useWalletDemoStore((s) => s.payRequestOpen)
  const close = useWalletDemoStore((s) => s.closePayRequest)
  const execute = useWalletDemoStore((s) => s.executePayRequest)
  const eurosBalance = useWalletDemoStore((s) => s.balanceCentsFor("euros"))

  const amountTitle = `€${formatCents(DEMO_PAY_REQUEST.amountCents).display}`
  const validUntil = useMemo(() => validUntilLabel(), [])
  const insufficient = DEMO_PAY_REQUEST.amountCents > eurosBalance
  const handle = DEMO_PAY_REQUEST.creator.tag ?? DEMO_PAY_REQUEST.creator.name

  return (
    <BottomSheet
      fullWidth
      isOpen={isOpen}
      onClose={close}
      height="auto"
      sheetClassName="max-h-[min(760px,90%)]"
      demoId="pay-request"
    >
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-8 pt-4">
        <div className="flex shrink-0 flex-col gap-1.5 pb-6">
          <h2 className="break-words text-[22px] font-bold leading-tight tracking-[-0.025em] text-foreground">
            {DEMO_PAY_REQUEST.reason}
          </h2>
          <p className="text-[16px] leading-snug tracking-[-0.01em] text-muted">
            Created by <span className="font-medium text-foreground">{handle}</span>
          </p>
        </div>

        <section className="pb-2 pt-2">
          <p className="break-words text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground">
            {amountTitle}
          </p>
          <p className="mt-2.5 text-[16px] leading-snug tracking-[-0.01em] text-muted">
            Valid until{" "}
            <span title={validUntil.iso}>{validUntil.label}</span>
          </p>
        </section>

        <div className="mt-8">
          <button
            type="button"
            data-demo-target="pay-request-confirm"
            disabled={insufficient}
            onClick={() => void execute()}
            className={PAY_BUTTON_CLASS}
          >
            {insufficient ? "Insufficient balance" : "Send transfer"}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
