"use client"

import { useCallback } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { WalletDemoPortal } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import {
  nextAmountForKey,
  SlidingDigits,
} from "@/components/marketing/wallet-demo/ui/SlidingDigits"
import {
  ArrowLeft,
  ConfirmAmountButton,
  NumPad,
  XIcon,
} from "@/components/marketing/wallet-demo/ui/primitives"
import { useDesktopAmountKeyboard } from "@/components/marketing/wallet-demo/ui/useDesktopAmountKeyboard"
import {
  currencySymbolForKind,
  formatCents,
  parseAmountToCents,
} from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

const FLOW_SPRING = { type: "spring" as const, stiffness: 400, damping: 40 }

/** Full-frame shield flow that scales in over the peeked home. */
export function ShieldSheet() {
  const prefersReducedMotion = useReducedMotion()
  const shieldOpen = useWalletDemoStore((s) => s.shieldOpen)
  const shieldAmount = useWalletDemoStore((s) => s.shieldAmount)
  const shieldPending = useWalletDemoStore((s) => s.shieldPending)
  const activeAccountKind = useWalletDemoStore((s) => s.activeAccountKind)
  const balanceCents = useWalletDemoStore((s) => s.balanceCentsFor(activeAccountKind))
  const closeShield = useWalletDemoStore((s) => s.closeShield)
  const setShieldAmount = useWalletDemoStore((s) => s.setShieldAmount)
  const executeShield = useWalletDemoStore((s) => s.executeShield)

  const currencySymbol = currencySymbolForKind(activeAccountKind)
  const cents = parseAmountToCents(shieldAmount)
  const hasAmount = cents > 0
  const isOverBalance = hasAmount && cents > balanceCents
  const canConfirm = hasAmount && !isOverBalance && !shieldPending

  const handleKey = useCallback(
    (key: string) => {
      const next = nextAmountForKey(shieldAmount, key)
      if (next != null) setShieldAmount(next)
    },
    [shieldAmount, setShieldAmount],
  )

  useDesktopAmountKeyboard({
    handleKey,
    onEnter: () => void executeShield(),
    enterEnabled: canConfirm,
  })

  return (
    <WalletDemoPortal>
      <AnimatePresence>
        {shieldOpen ? (
          <motion.div
            key="shield-flow"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={FLOW_SPRING}
            className="absolute inset-0 z-[80] flex min-h-0 flex-col overflow-hidden rounded-[inherit] bg-background"
            role="dialog"
            aria-label="Shield"
          >
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <button
                type="button"
                onClick={closeShield}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-opacity active:opacity-70"
                aria-label="Close"
              >
                <ArrowLeft />
              </button>
              <span className="text-[16px] font-medium tracking-[-0.01em] text-foreground">
                Shield
              </span>
              <button
                type="button"
                onClick={closeShield}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-opacity active:opacity-70"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-stretch pb-8 text-center">
              <p className="px-6 pt-2 text-[14px] leading-snug text-muted">
                Move funds into a private balance under your control.
              </p>
              <div className="grid h-[176px] w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center px-6 pt-6 pb-5">
                <div className="flex min-w-0 items-center justify-end pr-2">
                  <span className="shrink-0 whitespace-nowrap text-[28px] font-normal leading-none tracking-[-0.03em] text-muted-light tabular-nums">
                    {currencySymbol}
                  </span>
                </div>
                <div className="flex min-w-0 items-center justify-center">
                  <SlidingDigits
                    value={shieldAmount || "0"}
                    hasAmount={hasAmount}
                    reduceMotion={!!prefersReducedMotion}
                  />
                </div>
                <div className="min-w-0" aria-hidden />
              </div>
              <p className="px-6 text-[13px] text-muted">
                Available {currencySymbol}
                {formatCents(balanceCents).display}
              </p>
              <div className="mt-6 w-full">
                <NumPad onKey={handleKey} className="pt-0" bold />
              </div>
              <div className="mt-auto w-full pt-4">
                <ConfirmAmountButton
                  label="Shield"
                  disabled={!canConfirm}
                  pending={shieldPending}
                  onPress={() => void executeShield()}
                  blockingMessage={isOverBalance ? "Insufficient balance" : null}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WalletDemoPortal>
  )
}
