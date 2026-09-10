"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { motion, type PanInfo } from "motion/react"
import { WalletDemoShellContext } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import { FeedbackHost } from "@/components/marketing/wallet-demo/FeedbackHost"
import { CardSheet } from "@/components/marketing/wallet-demo/card/CardSheet"
import { HomeScreen } from "@/components/marketing/wallet-demo/home/HomeScreen"
import {
  ReceiveHandleSheet,
  ReceiveMenuSheet,
  ReceiveQrSheet,
  ReceiveWalletSheet,
} from "@/components/marketing/wallet-demo/receive/ReceiveSheets"
import { ShieldSheet } from "@/components/marketing/wallet-demo/shield/ShieldSheet"
import { PayRequestSheet } from "@/components/marketing/wallet-demo/pay/PayRequestSheet"
import { RequestSheet } from "@/components/marketing/wallet-demo/request/RequestSheet"
import { QrScanSheet } from "@/components/marketing/wallet-demo/scan/QrScanSheet"
import { SendSheet } from "@/components/marketing/wallet-demo/send/SendSheet"
import { WalletDemoAutoplay } from "@/components/marketing/wallet-demo/WalletDemoAutoplay"
import { WalletDemoStoreProvider } from "@/components/marketing/wallet-demo/WalletDemoStoreProvider"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

/** iPhone 14 logical viewport; matches `.wallet-demo-shell` in globals.css. */
export const WALLET_DEMO_FRAME_W = 390
export const WALLET_DEMO_FRAME_H = 844

const SEND_SHELL_SPRING = { type: "spring" as const, stiffness: 400, damping: 40 }
/** Visible strip of home (account row + balance peek) while the send flow is open. */
const SEND_PEEK_STRIP_PX = 88

/**
 * Phone frame + home + every global sheet. Mirrors the private wallet's
 * `WalletAuthenticatedShell`: when Send opens, home slides down to a peek
 * strip and the flow scales in on top.
 */
function WalletDemoShell({
  activityLimit,
  activityExpanded,
  showBanners,
  showCard,
  autoplay,
  interactive = true,
}: {
  activityLimit?: number
  activityExpanded?: boolean
  showBanners?: boolean
  showCard?: boolean
  autoplay?: boolean
  interactive?: boolean
}) {
  const [shell, setShell] = useState<HTMLElement | null>(null)
  const sendOpen = useWalletDemoStore((s) => s.send.isOpen)
  const sendMode = useWalletDemoStore((s) => s.send.mode)
  const sendStep = useWalletDemoStore((s) => s.send.step)
  const shieldOpen = useWalletDemoStore((s) => s.shieldOpen)
  const closeSend = useWalletDemoStore((s) => s.closeSend)
  const closeShield = useWalletDemoStore((s) => s.closeShield)
  const reset = useWalletDemoStore((s) => s.reset)

  useEffect(() => reset, [reset])

  const hideSendStrip = sendOpen && sendMode === "convert" && sendStep === "amount"
  const peekEngaged = sendOpen || shieldOpen

  const closeActiveFlow = useCallback(() => {
    if (sendOpen) closeSend()
    if (shieldOpen) closeShield()
  }, [sendOpen, shieldOpen, closeSend, closeShield])

  const handleStripPanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (!peekEngaged) return
      if (info.offset.y < -40 || info.velocity.y < -200) closeActiveFlow()
    },
    [peekEngaged, closeActiveFlow],
  )

  return (
    <div
      ref={setShell}
      className={`wallet-demo-shell no-text-selection${interactive ? "" : " pointer-events-none"}`}
      data-wallet-demo
    >
      <WalletDemoShellContext.Provider value={shell}>
        <motion.div
          className={`relative z-[90] flex h-full min-h-0 w-full flex-col overflow-hidden ${
            peekEngaged ? "bg-transparent" : "bg-app-gradient"
          }`}
          animate={{
            y: hideSendStrip
              ? "100%"
              : peekEngaged
                ? `calc(100% - ${SEND_PEEK_STRIP_PX}px)`
                : 0,
          }}
          transition={SEND_SHELL_SPRING}
          style={{ cursor: interactive && peekEngaged && !hideSendStrip ? "pointer" : "auto" }}
          onClick={interactive && peekEngaged ? closeActiveFlow : undefined}
          onPanEnd={interactive ? handleStripPanEnd : undefined}
          aria-hidden={peekEngaged}
        >
          <HomeScreen
            activityLimit={activityLimit}
            activityExpanded={activityExpanded}
            showBanners={showBanners}
            showCard={showCard}
          />
        </motion.div>

        {peekEngaged && !hideSendStrip ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[89] overflow-hidden rounded-t-[22px]"
            style={{
              height: SEND_PEEK_STRIP_PX,
              backdropFilter: "blur(24px) saturate(140%)",
              WebkitBackdropFilter: "blur(24px) saturate(140%)",
              background:
                "linear-gradient(to bottom, transparent 0%, var(--background) 40%, var(--background) 100%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 10%, rgba(0,0,0,1) 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 10%, rgba(0,0,0,1) 100%)",
            }}
          />
        ) : null}

        {shell ? (
          <>
            <FeedbackHost />
            <SendSheet />
            <ShieldSheet />
            <QrScanSheet />
            <RequestSheet />
            <PayRequestSheet />
            <ReceiveMenuSheet />
            <ReceiveHandleSheet />
            <ReceiveQrSheet />
            <ReceiveWalletSheet />
            <CardSheet />
            {autoplay ? <WalletDemoAutoplay yieldToUser={interactive} /> : null}
          </>
        ) : null}
      </WalletDemoShellContext.Provider>
    </div>
  )
}

/**
 * Fit-scales the fixed 390×844 frame into whatever box the hero gives it.
 * The stage reserves the scaled height so surrounding layout never jumps.
 */
export function WalletDemo({
  className = "",
  maxScale = 1,
  activityLimit,
  activityExpanded = false,
  showBanners = true,
  showCard = true,
  autoplay = false,
  interactive = true,
  align = "center",
}: {
  className?: string
  /** Cap so the phone never renders larger than its logical size. */
  maxScale?: number
  /** Cap activity rows (no pagination). */
  activityLimit?: number
  /** Show every activity row from the start (no "Load more"). */
  activityExpanded?: boolean
  /** Show the home banner carousel on fiat accounts. */
  showBanners?: boolean
  /** Show the home card section below activity. */
  showCard?: boolean
  /** Scripted cursor that runs a send flow on loop while the phone is in view. */
  autoplay?: boolean
  /** When false, pointer and wheel input are ignored so autoplay is never interrupted. */
  interactive?: boolean
  /** Letterbox leftover: `center` splits it, `top` pins the frame to the cell top. */
  align?: "center" | "top"
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const byWidth = width / WALLET_DEMO_FRAME_W
      const byHeight = height > 0 ? height / WALLET_DEMO_FRAME_H : Infinity
      const next = Math.min(maxScale, byWidth, byHeight)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxScale])

  const s = scale ?? 1

  return (
    <div
      ref={stageRef}
      className={`relative flex h-full w-full min-w-0 justify-center ${align === "top" ? "items-start" : "items-center"} ${className}`.trim()}
      style={{ visibility: scale == null ? "hidden" : undefined }}
    >
      <div
        className="relative"
        style={{
          width: WALLET_DEMO_FRAME_W * s,
          height: WALLET_DEMO_FRAME_H * s,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: WALLET_DEMO_FRAME_W,
            height: WALLET_DEMO_FRAME_H,
            transform: `scale(${s})`,
            transformOrigin: "top left",
          }}
        >
          <WalletDemoStoreProvider>
            <WalletDemoShell
              activityLimit={activityLimit}
              activityExpanded={activityExpanded}
              showBanners={showBanners}
              showCard={showCard}
              autoplay={autoplay}
              interactive={interactive}
            />
          </WalletDemoStoreProvider>
        </div>
        {/*
         * Captures wheel/touch so inner overflow:auto sheets do not steal
         * page scroll. Sits beside the scaled frame: Safari still scrolls
         * overflow:auto descendants of pointer-events: none.
         */}
        {interactive ? null : (
          <div aria-hidden className="absolute inset-0 z-10 touch-pan-y" />
        )}
      </div>
    </div>
  )
}
