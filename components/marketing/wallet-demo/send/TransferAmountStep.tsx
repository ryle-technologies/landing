"use client"

import { useCallback } from "react"
import { useReducedMotion, type MotionValue } from "motion/react"
import { NumPad } from "@/components/marketing/wallet-demo/ui/primitives"
import { SlideUpToConfirm } from "@/components/marketing/wallet-demo/ui/SlideUpToConfirm"
import { SlidingDigits, nextAmountForKey } from "@/components/marketing/wallet-demo/ui/SlidingDigits"
import { useDesktopAmountKeyboard } from "@/components/marketing/wallet-demo/ui/useDesktopAmountKeyboard"
import { currencySymbolForKind, parseAmountToCents } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

/** Send step 2: numpad amount + swipe-up to confirm (mock execution). */
export function TransferAmountStep({
  sheetY,
  contentProgress,
}: {
  sheetY?: MotionValue<number>
  contentProgress?: MotionValue<number>
}) {
  const amount = useWalletDemoStore((s) => s.send.amount)
  const setAmount = useWalletDemoStore((s) => s.setSendAmount)
  const sourceKind = useWalletDemoStore((s) => s.send.sourceAccountKind)
  const pending = useWalletDemoStore((s) => s.send.pending)
  const balanceCents = useWalletDemoStore((s) => s.balanceCentsFor(s.send.sourceAccountKind))
  const executeTransfer = useWalletDemoStore((s) => s.executeTransfer)
  const prefersReducedMotion = useReducedMotion()

  const currencySymbol = sourceKind === "crypto" ? "€" : currencySymbolForKind(sourceKind)
  const cents = parseAmountToCents(amount)
  const hasAmount = cents > 0
  const insufficient = hasAmount && cents > balanceCents
  const canConfirm = hasAmount && !insufficient && !pending
  const display = amount || "0"

  const handleKey = useCallback(
    (key: string) => {
      const next = nextAmountForKey(amount, key, 2)
      if (next == null) return
      setAmount(next)
    },
    [amount, setAmount],
  )

  useDesktopAmountKeyboard({
    handleKey,
    onEnter: () => void executeTransfer(),
    enterEnabled: canConfirm,
  })

  const blockingMessage = insufficient ? "Insufficient balance" : null

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch text-center">
      <div className="grid h-[176px] w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center px-6 pb-5 pt-9">
        <div className="flex min-w-0 items-center justify-end pr-2">
          <span className="shrink-0 whitespace-nowrap text-[28px] font-normal leading-none tracking-[-0.03em] tabular-nums text-muted-light">
            {currencySymbol}
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-center">
          <SlidingDigits value={display} hasAmount={hasAmount} reduceMotion={!!prefersReducedMotion} />
        </div>
        <div className="min-w-0" aria-hidden />
      </div>

      <div className="mt-12 w-full shrink-0">
        <NumPad onKey={handleKey} className="pt-0" bold />
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-0 pb-6 pt-4">
        <div className="w-full shrink-0">
          <SlideUpToConfirm
            idPrefix="send"
            disabled={!canConfirm}
            pending={pending}
            onComplete={() => void executeTransfer()}
            sheetY={sheetY}
            contentProgress={contentProgress}
            hasAmountEntered={hasAmount}
            emptyMessage="Enter how much you want to send"
            dragMessage="Swipe to send"
            blockingMessage={blockingMessage}
            reduceMotion={!!prefersReducedMotion}
          />
        </div>
      </div>
    </div>
  )
}
