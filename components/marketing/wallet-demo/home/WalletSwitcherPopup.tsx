"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AccountAvatar } from "@/components/marketing/wallet-demo/home/AccountAvatar"
import { DEMO_PROFILE } from "@/lib/walletDemo/data"
import { accountTitleForKind } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

const easeOut = [0.25, 0.1, 0.25, 1] as const

const SWITCH_SUBTITLE = "Switch to this account"

/**
 * The header always shows the *current* account; this popup lists the others
 * so the active one is never duplicated.
 */
export function WalletSwitcherPopup() {
  const isOpen = useWalletDemoStore((s) => s.switcherOpen)
  const close = useWalletDemoStore((s) => s.closeSwitcher)
  const setPersonalAccount = useWalletDemoStore((s) => s.setPersonalAccount)
  const rows = useWalletDemoStore((s) => s.popupOtherRows) ?? []

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, close])

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="wallet-switcher-expand"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{
            height: 0,
            transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
          }}
          transition={{ height: { duration: 0.32, ease: easeOut } }}
          className="-mx-2 w-[calc(100%+1rem)] min-w-0 overflow-hidden px-2"
        >
          <div className="mt-1.5 w-full min-w-0 pb-1.5">
            <div
              id="wallet-demo-switcher-list"
              aria-label="Change wallet"
              className="flex w-full min-w-0 flex-col gap-5 pt-4"
            >
              {rows.map((rowKind) => {
                const rowTitle = accountTitleForKind(rowKind)
                return (
                  <motion.button
                    type="button"
                    key={rowKind}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.2, ease: easeOut },
                    }}
                    exit={{
                      y: -56,
                      opacity: 0,
                      transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
                    }}
                    onClick={() => {
                      setPersonalAccount(rowKind)
                      close()
                    }}
                    aria-label={`${rowTitle}. ${SWITCH_SUBTITLE}`}
                    className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 border-0 bg-transparent py-0 pl-0 pr-0 text-left"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <AccountAvatar kind={rowKind} displayName={DEMO_PROFILE.displayName} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
                        <span className="min-w-0 truncate text-[16px] font-medium leading-[1.4] tracking-[-0.01em] text-foreground">
                          {rowTitle}
                        </span>
                        <div className="min-w-0 overflow-hidden" style={{ height: 22 }}>
                          <span className="block min-w-0 truncate text-[16px] font-medium leading-[1.4] text-muted">
                            {SWITCH_SUBTITLE}
                          </span>
                        </div>
                      </div>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
