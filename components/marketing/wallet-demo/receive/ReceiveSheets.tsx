"use client"

import { useState, type ComponentType } from "react"
import {
  LuAtSign,
  LuCheck,
  LuChevronRight,
  LuCreditCard,
  LuLandmark,
  LuQrCode,
  LuWallet,
} from "react-icons/lu"
import { Avatar } from "@/components/marketing/wallet-demo/ui/Avatar"
import { BottomSheet } from "@/components/marketing/wallet-demo/ui/BottomSheet"
import { CopyIcon, MOVEMENT_LIST_ROW_BUTTON_CLASS } from "@/components/marketing/wallet-demo/ui/primitives"
import { QRCodeDotMatrix } from "@/components/marketing/wallet-demo/receive/QRCodeDotMatrix"
import { DEMO_PROFILE } from "@/lib/walletDemo/data"
import { shortenAddress } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

// ─── Shared chrome ───────────────────────────────────────────────────────────

export const SHEET_TITLE_AREA_CLASS = "flex shrink-0 flex-col gap-1.5 px-6 pb-6 pt-4"
export const SHEET_TITLE_H2_CLASS =
  "text-[28px] font-medium leading-tight tracking-[-0.03em] text-foreground"
const DETAIL_SUBTITLE_CLASS = "text-base leading-snug tracking-[-0.01em] font-normal text-muted"

export function SheetDetailHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={`${SHEET_TITLE_AREA_CLASS} text-center`}>
      <h2 className={SHEET_TITLE_H2_CLASS}>{title}</h2>
      <p className={DETAIL_SUBTITLE_CLASS}>{subtitle}</p>
    </div>
  )
}

const SEND_LIST_ROW_BUTTON_CLASS = `${MOVEMENT_LIST_ROW_BUTTON_CLASS} py-2.5 active:opacity-70`
const SEND_LIST_ROW_BUTTON_DISABLED_CLASS = `${MOVEMENT_LIST_ROW_BUTTON_CLASS} py-2.5 cursor-not-allowed opacity-45`

type LucideIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

export function MenuRow({
  icon: Icon,
  title,
  "aria-label": ariaLabel,
  onClick,
  disabled,
  demoTarget,
}: {
  icon: LucideIcon
  title: string
  "aria-label": string
  onClick?: () => void
  disabled?: boolean
  /** `data-demo-target` hook for the scripted demo cursor. */
  demoTarget?: string
}) {
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        data-demo-target={demoTarget}
        className={disabled ? SEND_LIST_ROW_BUTTON_DISABLED_CLASS : SEND_LIST_ROW_BUTTON_CLASS}
      >
        <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center">
          <Icon size={22} strokeWidth={1.75} className="shrink-0 text-foreground" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-base font-medium tracking-[-0.01em] text-foreground">
          {title}
        </span>
        {!disabled ? (
          <LuChevronRight size={16} className="shrink-0 self-center text-muted-light" strokeWidth={1.75} aria-hidden />
        ) : null}
      </button>
    </div>
  )
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export function ReceiveMenuSheet() {
  const view = useWalletDemoStore((s) => s.receiveView)
  const close = useWalletDemoStore((s) => s.closeReceive)
  const goTo = useWalletDemoStore((s) => s.goToReceive)

  return (
    <BottomSheet fullWidth isOpen={view === "menu"} onClose={close} height="auto" demoId="receive-menu">
      <div className="flex flex-col">
        <div className={SHEET_TITLE_AREA_CLASS}>
          <h2 className={SHEET_TITLE_H2_CLASS}>Receive</h2>
        </div>
        <div className="flex flex-col gap-0 px-6 pb-8 pt-2">
          <MenuRow icon={LuQrCode} title="QR code" aria-label="QR code to receive payments" onClick={() => goTo("qr")} />
          <MenuRow
            icon={LuAtSign}
            title="To your username"
            aria-label="Receive to your username"
            onClick={() => goTo("handle")}
            demoTarget="receive-handle"
          />
          <MenuRow
            icon={LuWallet}
            title="From another wallet"
            aria-label="Receive with your wallet address"
            onClick={() => goTo("wallet")}
            demoTarget="receive-wallet"
          />
          <MenuRow icon={LuLandmark} title="Bank transfer" aria-label="Bank transfer, not available in the demo" disabled />
          <MenuRow icon={LuCreditCard} title="Card" aria-label="Card, not available in the demo" disabled />
        </div>
      </div>
    </BottomSheet>
  )
}

// ─── QR ──────────────────────────────────────────────────────────────────────

const QR_MATRIX_PX = 200
const QR_CENTER_AVATAR_PX = 40
const QR_CENTER_EXCAVATION = { width: QR_CENTER_AVATAR_PX, height: QR_CENTER_AVATAR_PX } as const

export function ReceiveQrSheet() {
  const view = useWalletDemoStore((s) => s.receiveView)
  const close = useWalletDemoStore((s) => s.closeReceive)

  return (
    <BottomSheet
      fullWidth
      isOpen={view === "qr"}
      onClose={close}
      height="auto"
      sheetClassName="max-h-[min(760px,90%)]"
      demoId="receive-qr"
    >
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <SheetDetailHeader title="Your QR code" subtitle="Show your QR so others can pay you" />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-5">
          <div className="flex w-full flex-col items-center gap-8 pb-8 pt-2 text-center">
            <div
              className="flex items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--background)_25%,var(--surface))] p-4"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="relative inline-flex overflow-hidden rounded-xl">
                <QRCodeDotMatrix
                  value={DEMO_PROFILE.walletAddress}
                  size={QR_MATRIX_PX}
                  bgColor="transparent"
                  fgColor="color-mix(in srgb, var(--foreground) 78%, var(--muted))"
                  level="M"
                  title={`QR code for ${DEMO_PROFILE.displayName}`}
                  centerExcavation={QR_CENTER_EXCAVATION}
                />
                <span className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                  <Avatar
                    name={DEMO_PROFILE.displayName}
                    src={DEMO_PROFILE.avatarUrl}
                    size="lg"
                    ghost
                    ghostFill="surface"
                    ghostEdge="soft"
                  />
                </span>
                <div className="qr-shimmer-overlay z-[2] rounded-xl" aria-hidden />
              </div>
            </div>
            <p className="max-w-[min(100%,280px)] text-[13px] font-normal leading-snug text-muted">
              Use this QR to receive in the app.
            </p>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

// ─── Handle ──────────────────────────────────────────────────────────────────

export function ReceiveHandleSheet() {
  const view = useWalletDemoStore((s) => s.receiveView)
  const close = useWalletDemoStore((s) => s.closeReceive)

  return (
    <BottomSheet fullWidth isOpen={view === "handle"} onClose={close} height="auto" demoId="receive-handle">
      <div className="flex flex-col pb-16">
        <SheetDetailHeader title="Your username" subtitle="Share your username to receive instantly" />
        <div className="flex w-full flex-col items-center px-6 pt-6 text-center">
          <p className="quote-shimmer-text quote-shimmer-text--emphasized break-all text-center text-[34px] font-semibold leading-snug tracking-[-0.02em]">
            {DEMO_PROFILE.tag}
          </p>
        </div>
      </div>
    </BottomSheet>
  )
}

// ─── Wallet address ──────────────────────────────────────────────────────────

const ACTION_ICON_PX = 20
const ACTION_BUTTON_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl text-muted transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] hover:text-foreground active:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

export function ReceiveWalletSheet() {
  const view = useWalletDemoStore((s) => s.receiveView)
  const close = useWalletDemoStore((s) => s.closeReceive)

  return (
    <BottomSheet fullWidth isOpen={view === "wallet"} onClose={close} height="auto" demoId="receive-wallet">
      <ReceiveWalletSheetBody />
    </BottomSheet>
  )
}

/** Body is unmounted with the sheet, so the copied state resets on every open. */
function ReceiveWalletSheetBody() {
  const goTo = useWalletDemoStore((s) => s.goToReceive)
  const showEphemeralFeedback = useWalletDemoStore((s) => s.showEphemeralFeedback)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard?.writeText(DEMO_PROFILE.walletAddress).then(
      () => {
        setCopied(true)
        showEphemeralFeedback("Address copied", "success")
        window.setTimeout(() => setCopied(false), 2200)
      },
      () => {},
    )
  }

  return (
      <div className="flex flex-col pb-10">
        <SheetDetailHeader title="From another wallet" subtitle="Use your address to receive" />
        <div className="flex w-full flex-col items-center gap-5 px-6 pt-4 text-center">
          <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-border/45 px-4 py-4">
            <Avatar name={DEMO_PROFILE.displayName} src={DEMO_PROFILE.avatarUrl} size="lg" filled />
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
              <span className="truncate text-base font-medium leading-snug text-foreground">
                {DEMO_PROFILE.tag}
              </span>
              <span
                className="truncate text-[13px] leading-snug text-muted"
                title={DEMO_PROFILE.walletAddress}
              >
                {shortenAddress(DEMO_PROFILE.walletAddress, 8, 6)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 self-center">
              <button
                type="button"
                onClick={handleCopy}
                className={ACTION_BUTTON_CLASS}
                aria-label={copied ? "Address copied" : "Copy address"}
              >
                {copied ? (
                  <LuCheck size={ACTION_ICON_PX} strokeWidth={2} className="shrink-0" aria-hidden />
                ) : (
                  <CopyIcon color="currentColor" size={ACTION_ICON_PX} />
                )}
              </button>
              <button
                type="button"
                onClick={() => goTo("qr")}
                className={ACTION_BUTTON_CLASS}
                aria-label="QR code to receive payments"
                data-demo-target="receive-wallet-qr"
              >
                <LuQrCode size={ACTION_ICON_PX} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>

          <div className="mx-auto my-5 w-full max-w-[340px]">
            <div className="flex w-full max-w-full flex-row flex-wrap items-center justify-center gap-1 px-1 py-0.5 text-center text-[16px] font-medium leading-snug tracking-[-0.02em] text-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG mark */}
              <img
                src="/images/wallet-demo/circle-usdc.svg"
                alt=""
                width={20}
                height={20}
                className="shrink-0 rounded-full"
                aria-hidden
              />
              <span className="inline-flex min-w-0">Address to receive USDC</span>
            </div>
          </div>

          <p className="mx-auto max-w-md px-2 text-base font-normal leading-snug text-muted">
            Only USDC on Base is accepted. Sending another token or from another network may
            result in lost funds.
          </p>
        </div>
      </div>
  )
}
