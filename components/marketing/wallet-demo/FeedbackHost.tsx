"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { WalletDemoPortal } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import { Spinner } from "@/components/marketing/wallet-demo/ui/primitives"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

function FilledCheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      />
    </svg>
  )
}

/** Top pill toast inside the phone frame (pending → success / error / info). */
export function FeedbackHost() {
  const item = useWalletDemoStore((s) => s.feedback)
  const dismiss = useWalletDemoStore((s) => s.dismissFeedback)

  useEffect(() => {
    if (!item?.durationMs) return
    const timer = window.setTimeout(() => dismiss(), item.durationMs)
    return () => window.clearTimeout(timer)
  }, [item?.id, item?.durationMs, dismiss])

  const textClass =
    item?.status === "error"
      ? "min-w-0 shrink truncate whitespace-nowrap text-[12px] font-normal tracking-[-0.01em] text-red-600"
      : "min-w-0 shrink truncate whitespace-nowrap text-sm font-normal tracking-[-0.01em] text-foreground"

  return (
    <WalletDemoPortal>
      <AnimatePresence mode="wait">
        {item ? (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-0 top-10 z-[135] flex justify-center px-4"
          >
            <div
              className="pointer-events-auto inline-flex w-max max-w-full flex-nowrap items-center gap-2 rounded-full bg-surface px-4 py-2.5 shadow-sm"
              role={item.status === "error" ? "alert" : "status"}
              aria-live={item.status === "error" ? "assertive" : "polite"}
            >
              {item.status === "pending" ? <Spinner size="sm" /> : null}
              {item.status === "success" ? (
                <FilledCheckCircleIcon className="shrink-0 text-positive" />
              ) : null}
              <span className={textClass} title={item.message}>
                {item.message}
              </span>
              {item.dismissible ? (
                <button
                  type="button"
                  onClick={() => dismiss()}
                  className="-mr-1 shrink-0 rounded p-1 text-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <span aria-hidden className="text-[13px] leading-none">
                    ✕
                  </span>
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WalletDemoPortal>
  )
}
