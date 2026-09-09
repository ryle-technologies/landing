"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, useReducedMotion, type MotionValue, type Transition } from "motion/react"
import { NumPad } from "@/components/marketing/wallet-demo/ui/primitives"
import { SlideUpToConfirm } from "@/components/marketing/wallet-demo/ui/SlideUpToConfirm"
import { nextAmountForKey } from "@/components/marketing/wallet-demo/ui/SlidingDigits"
import { useDesktopAmountKeyboard } from "@/components/marketing/wallet-demo/ui/useDesktopAmountKeyboard"
import {
  DECIMAL_SEPARATOR,
  currencySymbolForKind,
  formatCents,
  parseAmountToCents,
} from "@/lib/walletDemo/format"
import { convertCents, convertRateLine, useWalletDemoStore } from "@/lib/walletDemo/store"

/** First quote after the amount changes — long enough to read as a fetch. */
const QUOTE_INITIAL_MS = 1_400
/** Quote "refresh" cadence: shimmer briefly, then flash the refreshed rate (mirrors the live quote poll). */
const QUOTE_REFRESH_EVERY_MS = 12_000
const QUOTE_REFRESHING_MS = 1_400

/**
 * Simulated FX quote: every amount change re-fetches, then a slower poll
 * refreshes the same line. Swipe stays disabled until the first quote lands.
 */
function useSimulatedQuote(hasAmount: boolean, amount: string) {
  const [quotedAmount, setQuotedAmount] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(0)

  const ready = hasAmount && quotedAmount === amount

  useEffect(() => {
    if (!hasAmount) return
    const settle = window.setTimeout(() => {
      setQuotedAmount(amount)
      setRefreshedAt((n) => n + 1)
    }, QUOTE_INITIAL_MS)
    return () => window.clearTimeout(settle)
  }, [amount, hasAmount])

  useEffect(() => {
    if (!ready) return
    let settle: number | undefined
    const tick = window.setInterval(() => {
      setRefreshing(true)
      settle = window.setTimeout(() => {
        setRefreshing(false)
        setRefreshedAt((n) => n + 1)
      }, QUOTE_REFRESHING_MS)
    }, QUOTE_REFRESH_EVERY_MS)
    return () => {
      window.clearInterval(tick)
      if (settle != null) window.clearTimeout(settle)
    }
  }, [ready])

  return { ready, refreshing: refreshing || (hasAmount && !ready), refreshedAt }
}

/** Convert step: amount, source balance, live quote and swipe-up to confirm (mock). */
export function ConvertAmountStep({
  sheetY,
  contentProgress,
}: {
  sheetY?: MotionValue<number>
  contentProgress?: MotionValue<number>
}) {
  const prefersReducedMotion = useReducedMotion()
  const amount = useWalletDemoStore((s) => s.send.amount)
  const setAmount = useWalletDemoStore((s) => s.setSendAmount)
  const source = useWalletDemoStore((s) => s.send.sourceAccountKind)
  const target = useWalletDemoStore((s) => s.send.targetAccountKind)
  const pending = useWalletDemoStore((s) => s.send.pending)
  const sourceBalanceCents = useWalletDemoStore((s) => s.balanceCentsFor(s.send.sourceAccountKind))
  const executeConvert = useWalletDemoStore((s) => s.executeConvert)

  const cents = parseAmountToCents(amount)
  const hasAmount = cents > 0
  const { ready: quoteReady, refreshing: quoteRefreshing, refreshedAt } = useSimulatedQuote(hasAmount, amount)
  const isOverBalance = hasAmount && cents > sourceBalanceCents
  const canConvert = hasAmount && quoteReady && !isOverBalance && !pending

  const srcSymbol = currencySymbolForKind(source)
  const dstSymbol = currencySymbolForKind(target)
  const display = amount || "0"
  const receive = formatCents(hasAmount ? convertCents(cents, source, target) : 0)

  const handleKey = useCallback(
    (key: string) => {
      const next = nextAmountForKey(amount, key)
      if (next == null) return
      setAmount(next)
    },
    [amount, setAmount],
  )

  useDesktopAmountKeyboard({
    handleKey,
    onEnter: () => void executeConvert(),
    enterEnabled: canConvert,
  })

  const blockingMessage = isOverBalance ? "Insufficient balance" : null

  const flashVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0.6 },
        animate: { opacity: 1 },
        transition: { duration: 0 } as Transition,
      }
    : {
        initial: { backgroundColor: "var(--quote-flash)" },
        animate: { backgroundColor: "rgba(0, 0, 0, 0)" },
        transition: { duration: 0.6, ease: "easeOut" as const } as Transition,
      }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center text-center">
      <div className="flex w-full min-w-0 shrink-0 flex-col items-center self-stretch">
        <div className="flex w-full items-baseline justify-center gap-2 px-6 pb-3 pt-10">
          <span className="text-[54px] font-medium leading-none tracking-[-0.035em] tabular-nums text-muted-light">
            {srcSymbol}
          </span>
          <span
            className={`text-[54px] font-medium leading-none tracking-[-0.035em] tabular-nums transition-colors ${
              hasAmount ? "text-foreground" : "text-muted-light"
            }`}
          >
            {display}
          </span>
        </div>

        <div
          className="flex min-h-[1lh] w-full max-w-[min(100%,340px)] flex-col items-center px-6 pb-2 pt-1 text-base"
          role="status"
          aria-live="polite"
        >
          <p className="text-center font-normal leading-snug tabular-nums text-muted">
            Balance {srcSymbol}
            {formatCents(sourceBalanceCents).display}
          </p>
        </div>

        <div className="relative mx-auto mt-5 flex w-full max-w-sm shrink-0 items-center gap-3 px-6 py-1.5">
          <div
            className="pointer-events-none h-px min-w-0 flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--border-strong) 22%, var(--border-strong) 100%)",
            }}
            aria-hidden
          />
          <span
            id="wallet-demo-convert-receive-label"
            className="shrink-0 truncate text-[13px] font-medium leading-none tracking-[-0.01em] text-muted"
          >
            You receive
          </span>
          <div
            className="pointer-events-none h-px min-w-0 flex-1"
            style={{
              background:
                "linear-gradient(90deg, var(--border-strong) 0%, var(--border-strong) 78%, transparent 100%)",
            }}
            aria-hidden
          />
        </div>

        <div
          className="flex w-full flex-col items-center gap-2 px-6 pb-3 pt-7"
          aria-labelledby="wallet-demo-convert-receive-label"
        >
          <div
            className={`flex items-baseline justify-center gap-1.5 text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums ${
              hasAmount && !quoteReady ? "quote-shimmer-text" : ""
            }`}
          >
            <span className="shrink-0 text-foreground">{dstSymbol}</span>
            <span className="flex items-baseline justify-center leading-none tabular-nums" aria-label={receive.display}>
              <span className="text-foreground">{hasAmount && !quoteReady ? "—" : receive.whole}</span>
              {hasAmount && !quoteReady ? null : (
                <span className="text-muted-light">
                  {DECIMAL_SEPARATOR}
                  {receive.fraction}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex w-full justify-center px-6 pb-2 pt-1">
          <motion.span
            key={`flash-${refreshedAt}`}
            data-demo-target="convert-quote"
            data-demo-quote={quoteReady ? "ready" : hasAmount ? "loading" : "idle"}
            initial={flashVariants.initial}
            animate={flashVariants.animate}
            transition={flashVariants.transition}
            className="-mx-1 inline-flex max-w-full flex-wrap items-center justify-center gap-x-1 rounded px-1 text-center text-base font-normal leading-snug"
            aria-busy={quoteRefreshing || (hasAmount && !quoteReady) || undefined}
          >
            <span className="shrink-0 text-muted">Rate</span>
            <span
              className={
                "inline-block max-w-full truncate whitespace-nowrap tabular-nums " +
                (quoteRefreshing || (hasAmount && !quoteReady) ? "quote-shimmer-text" : "text-muted")
              }
            >
              {hasAmount && !quoteReady ? "Fetching quote…" : convertRateLine(source, target)}
            </span>
          </motion.span>
        </div>

        <div className="mt-8 w-full min-w-0 shrink-0 self-stretch">
          <NumPad onKey={handleKey} className="pt-0" />
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-0 pb-6 pt-4">
        <div className="w-full shrink-0">
          <SlideUpToConfirm
            idPrefix="convert"
            disabled={!canConvert}
            pending={pending}
            onComplete={() => void executeConvert()}
            sheetY={sheetY}
            contentProgress={contentProgress}
            hasAmountEntered={hasAmount && quoteReady}
            emptyMessage="Enter how much you want to exchange"
            dragMessage="Swipe to exchange"
            blockingMessage={blockingMessage}
            reduceMotion={!!prefersReducedMotion}
          />
        </div>
      </div>
    </div>
  )
}
