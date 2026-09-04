"use client"

import React from "react"
import { AnimatePresence, motion } from "motion/react"
import { LuChevronsUpDown } from "react-icons/lu"
import { AccountAvatar } from "@/components/marketing/wallet-demo/home/AccountAvatar"
import { ActivityList } from "@/components/marketing/wallet-demo/home/ActivityList"
import { BannerCarousel } from "@/components/marketing/wallet-demo/home/BannerCarousel"
import { CardHomeSection } from "@/components/marketing/wallet-demo/home/CardHomeSection"
import { CryptoHoldingsSection } from "@/components/marketing/wallet-demo/home/CryptoHoldingsSection"
import { WalletSwitcherPopup } from "@/components/marketing/wallet-demo/home/WalletSwitcherPopup"
import {
  HOME_ACTION_CHIP_SURFACE_STYLE,
  HOME_HERO_ICON_SIZE_PX,
  MOVEMENT_ACTION_ICONS,
  SECTION_LABEL_CLASS,
} from "@/components/marketing/wallet-demo/ui/primitives"
import { SlidingNumber } from "@/components/marketing/wallet-demo/ui/SlidingNumber"
import { DEMO_PROFILE } from "@/lib/walletDemo/data"
import {
  THOUSAND_SEPARATOR,
  DECIMAL_SEPARATOR,
  accountTitleForKind,
  currencySymbolForKind,
  formatCents,
} from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

const WALLET_SWITCHER_ICON_CLASS =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

const HERO_EASE = [0.32, 0.72, 0, 1] as const

/**
 * Wallet home: header + switcher, rolling balance, action chips, banners /
 * coins, activity and card. Frontend-only port of the private wallet's
 * `HomeScreen`, driven by the demo store.
 */
export function HomeScreen({
  activityLimit,
  activityExpanded = false,
  showBanners = true,
  showCard = true,
}: {
  activityLimit?: number
  activityExpanded?: boolean
  showBanners?: boolean
  showCard?: boolean
} = {}) {
  const activeAccountKind = useWalletDemoStore((s) => s.activeAccountKind)
  const balancesCents = useWalletDemoStore((s) => s.balancesCents)
  const cryptoHoldings = useWalletDemoStore((s) => s.cryptoHoldings)
  const switcherOpen = useWalletDemoStore((s) => s.switcherOpen)
  const toggleSwitcher = useWalletDemoStore((s) => s.toggleSwitcher)
  const openSend = useWalletDemoStore((s) => s.openSend)
  const startConvert = useWalletDemoStore((s) => s.startConvert)
  const openReceiveMenu = useWalletDemoStore((s) => s.openReceiveMenu)
  const openPayRequest = useWalletDemoStore((s) => s.openPayRequest)
  const openRequest = useWalletDemoStore((s) => s.openRequest)
  const sendOpen = useWalletDemoStore((s) => s.send.isOpen)
  const shieldOpen = useWalletDemoStore((s) => s.shieldOpen)
  const qrScanOpen = useWalletDemoStore((s) => s.qrScanOpen)

  const flowSheetOpen = sendOpen || shieldOpen || qrScanOpen
  const isCrypto = activeAccountKind === "crypto"

  const balanceCents = React.useMemo(() => {
    if (isCrypto) {
      const total = cryptoHoldings.reduce((sum, h) => sum + h.valueEur, 0)
      return Math.floor(total * 100)
    }
    return balancesCents[activeAccountKind]
  }, [activeAccountKind, balancesCents, cryptoHoldings, isCrypto])

  const formatted = formatCents(balanceCents)
  const currencySymbol = isCrypto ? "€" : currencySymbolForKind(activeAccountKind)

  const openSwap = React.useCallback(() => {
    const source = activeAccountKind === "dolares" ? "dolares" : "euros"
    const target = source === "euros" ? "dolares" : "euros"
    startConvert({ source, target, entryPoint: "home" })
  }, [activeAccountKind, startConvert])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (flowSheetOpen) scrollRef.current?.scrollTo({ top: 0 })
  }, [flowSheetOpen])

  const actions = React.useMemo(
    () => [
      { id: "send", label: "Send", Icon: MOVEMENT_ACTION_ICONS.send, onPress: openSend },
      { id: "receive", label: "Receive", Icon: MOVEMENT_ACTION_ICONS.receive, onPress: openReceiveMenu },
      { id: "swap", label: "Swap", Icon: MOVEMENT_ACTION_ICONS.swap, onPress: openSwap, disabled: isCrypto },
      { id: "request", label: "Request", Icon: MOVEMENT_ACTION_ICONS.request, onPress: openRequest },
      { id: "pay", label: "Pay", Icon: MOVEMENT_ACTION_ICONS.pay, onPress: openPayRequest },
    ],
    [isCrypto, openPayRequest, openReceiveMenu, openRequest, openSend, openSwap],
  )

  return (
    <div className="relative isolate flex h-full min-h-0 w-full min-w-0 flex-col">
      <div
        ref={scrollRef}
        className="wallet-demo-scroll relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          overflowY: flowSheetOpen ? "hidden" : undefined,
        }}
      >
        <div className="flex min-h-full flex-1 flex-col">
          <div className="flex w-full min-w-0 flex-col" role="group" aria-label="Balance and actions">
            {/* Header: account + switcher */}
            <div className="w-full min-w-0 shrink-0">
              <div className="flex w-full min-w-0 flex-col px-6 pb-3 pt-6 text-foreground">
                <div className="flex w-full min-w-0 flex-col">
                  <div
                    className="flex w-full min-w-0 items-center justify-between gap-3"
                    style={{ pointerEvents: flowSheetOpen ? "none" : "auto" }}
                  >
                    <div className="relative flex min-w-0 flex-1 items-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={activeAccountKind}
                          initial={{ opacity: 0, y: 56 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -56 }}
                          transition={{ duration: 0.32, ease: HERO_EASE }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <button
                            type="button"
                            onClick={toggleSwitcher}
                            aria-expanded={switcherOpen}
                            aria-controls="wallet-demo-switcher-list"
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                            aria-label="Switch wallet"
                          >
                            <AccountAvatar
                              kind={activeAccountKind}
                              displayName={DEMO_PROFILE.displayName}
                            />
                            <span className="flex min-w-0 flex-1 flex-col gap-0">
                              <span className="min-w-0 truncate text-[16px] font-medium leading-[1.4] tracking-[-0.01em] text-foreground">
                                {accountTitleForKind(activeAccountKind)}
                              </span>
                              <span className="min-w-0 truncate text-[16px] font-medium leading-[1.4] text-muted">
                                {DEMO_PROFILE.tag}
                              </span>
                            </span>
                          </button>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="relative flex shrink-0 items-center justify-end gap-0.5">
                      <AnimatePresence mode="wait" initial={false}>
                        {flowSheetOpen ? (
                          <motion.span
                            key="balance"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap text-[16px] font-medium tabular-nums tracking-[-0.02em] text-foreground"
                          >
                            {currencySymbol}
                            {formatted.display}
                          </motion.span>
                        ) : (
                          <motion.button
                            key="switcher-row"
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={toggleSwitcher}
                            aria-expanded={switcherOpen}
                            aria-controls="wallet-demo-switcher-list"
                            className={WALLET_SWITCHER_ICON_CLASS}
                            aria-label="Switch currency wallet"
                          >
                            <LuChevronsUpDown className="block" size={HOME_HERO_ICON_SIZE_PX} aria-hidden />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="-mx-2 w-full min-w-0 px-2">
                    <WalletSwitcherPopup />
                  </div>
                </div>
              </div>
            </div>

            {/* Balance + quick actions */}
            <motion.div
              animate={{ opacity: flowSheetOpen ? 0 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="flex shrink-0 flex-col overflow-x-clip"
            >
              <div className="mt-3 w-full min-w-0 shrink-0">
                <div className="flex w-full min-w-0 flex-col gap-2 px-6 pb-6">
                  <div className="flex min-w-0 flex-1 items-center gap-1 text-[44px] font-medium leading-none">
                    <span className="shrink-0 text-[26px] uppercase tabular-nums text-muted-light">
                      {currencySymbol}
                    </span>
                    <SlidingNumber
                      valueString={formatted.slide}
                      thousandSeparator={THOUSAND_SEPARATOR}
                      decimalSeparator={DECIMAL_SEPARATOR}
                      className="tracking-[-0.035em]"
                      integerClassName="text-foreground"
                      decimalClassName="text-muted-light"
                    />
                  </div>
                  {isCrypto ? (
                    <p className="m-0 text-[15px] font-medium leading-snug tracking-[-0.01em] text-muted">
                      Total of your balance valued in euros.
                    </p>
                  ) : null}
                </div>
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeAccountKind}
                  initial={{ y: 64, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -64, opacity: 0 }}
                  transition={{ duration: 0.32, ease: HERO_EASE }}
                  className="flex w-full flex-col"
                >
                  <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex w-max min-w-0 gap-3 px-6 py-1">
                      {actions.map(({ id, label, Icon, onPress, disabled }) => (
                        <button
                          key={`${activeAccountKind}-${id}`}
                          type="button"
                          data-demo-target={`action-${id}`}
                          onClick={disabled ? undefined : onPress}
                          className={`shrink-0 transition-transform ${disabled ? "cursor-default opacity-35" : "active:scale-[0.97]"}`}
                        >
                          <div
                            className="flex min-h-11 flex-row items-center gap-2 rounded-2xl border border-transparent px-3 py-2.5 text-left text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle] [transform:translateZ(0)]"
                            style={HOME_ACTION_CHIP_SURFACE_STYLE}
                          >
                            <Icon className="block shrink-0" size={18} aria-hidden />
                            <span className="whitespace-nowrap text-[17px] font-medium leading-none tracking-[-0.01em]">
                              {label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              {isCrypto ? (
                <CryptoHoldingsSection />
              ) : showBanners ? (
                <BannerCarousel />
              ) : null}
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: flowSheetOpen ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip"
          >
            <section
              className="mt-10 w-full min-w-0 shrink-0 px-6 pb-1"
              aria-labelledby="wallet-demo-activity-heading"
            >
              <h2 id="wallet-demo-activity-heading" className={`mb-4 ${SECTION_LABEL_CLASS}`}>
                Activity
              </h2>
              <ActivityList
                key={activeAccountKind}
                pageSize={3}
                maxItems={activityLimit}
                initialExpanded={activityExpanded}
                scrollRootRef={scrollRef}
              />
            </section>

            {showCard ? <CardHomeSection scrollRootRef={scrollRef} /> : null}
            <div
              className="w-full shrink-0"
              style={{ paddingBottom: "1.5rem" }}
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
