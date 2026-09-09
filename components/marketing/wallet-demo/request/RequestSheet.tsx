"use client"

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { LuCheck, LuCopy, LuQrCode } from "react-icons/lu"
import { SiWhatsapp } from "react-icons/si"
import { BottomSheet } from "@/components/marketing/wallet-demo/ui/BottomSheet"
import { QRCodeDotMatrix } from "@/components/marketing/wallet-demo/receive/QRCodeDotMatrix"
import { NumPad, HOME_ACTION_CHIP_SURFACE_STYLE } from "@/components/marketing/wallet-demo/ui/primitives"
import { nextAmountForKey } from "@/components/marketing/wallet-demo/ui/SlidingDigits"
import { useDesktopAmountKeyboard } from "@/components/marketing/wallet-demo/ui/useDesktopAmountKeyboard"
import { DEMO_CREATE_REQUEST } from "@/lib/walletDemo/data"
import { getSiteOrigin } from "@/lib/siteUrl"
import { currencySymbolForKind, formatCents, parseAmountToCents } from "@/lib/walletDemo/format"
import { useWalletDemoStore, type RequestStep } from "@/lib/walletDemo/store"

const STEPS: RequestStep[] = ["amount", "reason"]
const QR_EDGE_INSET = 24

const CONTINUE_BUTTON_CLASS =
  "flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-foreground px-4 py-3 text-center text-[16px] font-medium leading-snug tracking-[-0.01em] text-background transition-opacity active:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [corner-shape:squircle] [transform:translateZ(0)]"

const CHIP_WRAP = "shrink-0 cursor-pointer transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
const CHIP_SURFACE =
  "flex h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl border border-transparent px-3 text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle] [transform:translateZ(0)]"
const ICON_CHIP =
  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-transparent text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle] [transform:translateZ(0)]"

function requestShareUrl(): string {
  const origin = getSiteOrigin() || "https://ryle.app"
  return `${origin}/request/${DEMO_CREATE_REQUEST.shortCode}`
}

function RequestAmountStep() {
  const amount = useWalletDemoStore((s) => s.request.amount)
  const setAmount = useWalletDemoStore((s) => s.setRequestAmount)
  const next = useWalletDemoStore((s) => s.requestNext)
  const kind = useWalletDemoStore((s) => s.activeAccountKind)
  const currencySymbol = kind === "crypto" ? "€" : currencySymbolForKind(kind)
  const hasAmount = parseAmountToCents(amount) > 0
  const display = amount || "0"

  const handleKey = useCallback(
    (key: string) => {
      const nextVal = nextAmountForKey(amount, key, 2)
      if (nextVal == null) return
      setAmount(nextVal)
    },
    [amount, setAmount],
  )

  useDesktopAmountKeyboard({
    handleKey,
    onEnter: () => next(),
    enterEnabled: hasAmount,
  })

  return (
    <div className="flex flex-col pb-8">
      <div className="flex items-baseline justify-start gap-2 px-6 pb-6 pt-8">
        <span className="text-[40px] font-medium leading-[1.05] tracking-[-0.03em] text-muted-light">
          {currencySymbol}
        </span>
        <span
          className={`text-[40px] font-medium leading-[1.05] tracking-[-0.03em] transition-colors ${
            hasAmount ? "text-foreground" : "text-muted-light"
          }`}
        >
          {display}
        </span>
        <span className="h-[37px] w-[2px] animate-[blink_1s_step-end_infinite] self-center rounded-full bg-foreground" />
      </div>
      <div className="px-6">
        <NumPad onKey={handleKey} className="pt-9" />
      </div>
      <div className="px-6 pb-2 pt-12">
        <button
          type="button"
          data-demo-target="request-continue"
          disabled={!hasAmount}
          onClick={next}
          className={CONTINUE_BUTTON_CLASS}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function RequestReasonStep() {
  const reason = useWalletDemoStore((s) => s.request.reason)
  const setReason = useWalletDemoStore((s) => s.setRequestReason)
  const amount = useWalletDemoStore((s) => s.request.amount)
  const showQr = useWalletDemoStore((s) => s.request.showQr)
  const toggleQr = useWalletDemoStore((s) => s.toggleRequestQr)
  const markCreated = useWalletDemoStore((s) => s.markRequestCreated)
  const close = useWalletDemoStore((s) => s.closeRequest)
  const showEphemeral = useWalletDemoStore((s) => s.showEphemeralFeedback)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const qrHostRef = useRef<HTMLDivElement>(null)
  const [qrWidth, setQrWidth] = useState(0)
  const [copied, setCopied] = useState(false)

  useLayoutEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [])

  useLayoutEffect(() => {
    if (!showQr) return
    const el = qrHostRef.current
    if (!el) return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      setQrWidth(w > 0 ? Math.floor(w) : 0)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [showQr])

  const canShare = reason.trim().length > 0 && parseAmountToCents(amount) > 0
  const shareUrl = useMemo(() => requestShareUrl(), [])
  const qrSize = qrWidth > 0 ? Math.max(120, Math.floor(qrWidth - QR_EDGE_INSET * 2)) : 0
  const amountLabel = `€${formatCents(parseAmountToCents(amount) || DEMO_CREATE_REQUEST.amountCents).display}`

  const copyLink = () => {
    if (!canShare) return
    markCreated()
    void navigator.clipboard?.writeText(shareUrl).then(
      () => {
        setCopied(true)
        showEphemeral("Link copied", "success")
        window.setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }

  return (
    <div className="flex flex-col px-6 pb-8 pt-5">
      <textarea
        ref={inputRef}
        data-demo-target="request-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Friday dinner"
        rows={4}
        className="min-h-[5.5rem] w-full resize-none appearance-none rounded-none border-0 bg-transparent p-0 text-[20px] tracking-[-0.02em] text-foreground shadow-none outline-none ring-0 placeholder:text-muted-light focus:outline-none focus:ring-0"
      />

      <div className="mt-6 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            disabled={!canShare}
            data-demo-target="request-whatsapp"
            onClick={() => {
              if (!canShare) return
              markCreated()
              showEphemeral("Payment request created", "success")
              close()
            }}
            className={`${CHIP_WRAP} w-full`}
          >
            <span className={CHIP_SURFACE} style={HOME_ACTION_CHIP_SURFACE_STYLE}>
              <SiWhatsapp size={18} className="text-[#25D366]" aria-hidden />
              <span className="whitespace-nowrap text-[17px] font-medium leading-none tracking-[-0.01em]">
                WhatsApp
              </span>
            </span>
          </button>
        </div>
        <button
          type="button"
          disabled={!canShare}
          onClick={toggleQr}
          data-demo-target="request-qr"
          aria-label={showQr ? "Hide QR code" : "Show QR code"}
          aria-pressed={showQr}
          className={`${CHIP_WRAP} rounded-2xl`}
        >
          <span className={ICON_CHIP} style={HOME_ACTION_CHIP_SURFACE_STYLE}>
            <LuQrCode size={18} strokeWidth={2} className="text-foreground" aria-hidden />
          </span>
        </button>
        <button
          type="button"
          disabled={!canShare}
          onClick={copyLink}
          aria-label={copied ? "Link copied" : "Copy link"}
          className={`${CHIP_WRAP} rounded-2xl`}
        >
          <span className={ICON_CHIP} style={HOME_ACTION_CHIP_SURFACE_STYLE}>
            {copied ? (
              <LuCheck size={18} strokeWidth={2} className="text-positive" aria-hidden />
            ) : (
              <LuCopy size={18} strokeWidth={2} className="text-foreground" aria-hidden />
            )}
          </span>
        </button>
      </div>

      {showQr ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div
            className="w-full self-stretch overflow-hidden rounded-[14px] bg-[color-mix(in_srgb,var(--background)_25%,var(--surface))]"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div
              ref={qrHostRef}
              className="relative flex aspect-square w-full max-w-full items-center justify-center"
            >
              {qrSize > 0 ? (
                <div className="relative inline-flex shrink-0 overflow-hidden rounded-xl">
                  <QRCodeDotMatrix
                    value={shareUrl}
                    size={qrSize}
                    bgColor="transparent"
                    fgColor="color-mix(in srgb, var(--foreground) 78%, var(--muted))"
                    level="M"
                    title="Request QR code"
                  />
                </div>
              ) : null}
            </div>
          </div>
          <p className="w-full px-2 text-center text-[14px] leading-snug tracking-[-0.01em] text-muted">
            Scan to open the request · {amountLabel}
          </p>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Create-a-request sheet: amount → reason → share. Mirrors the private
 * wallet `RequestSheet` (no network). WhatsApp dismisses the sheet.
 */
export function RequestSheet() {
  const isOpen = useWalletDemoStore((s) => s.request.isOpen)
  const step = useWalletDemoStore((s) => s.request.step)
  const close = useWalletDemoStore((s) => s.closeRequest)
  const stepIndex = STEPS.indexOf(step)

  return (
    <BottomSheet
      fullWidth
      isOpen={isOpen}
      onClose={close}
      height="auto"
      sheetClassName="max-h-[min(760px,90%)]"
      demoId="request"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <div className="flex items-center justify-between px-6 pb-4 pt-4">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIndex ? 20 : 6,
                    height: 6,
                    background: i <= stepIndex ? "var(--foreground)" : "var(--border-strong)",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="shrink-0 px-6 pb-6 pt-4">
            <h2 className="text-[22px] font-medium tracking-[-0.02em] text-foreground">
              {step === "amount" ? "How much do you want to request?" : "What is it for?"}
            </h2>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col"
            >
              {step === "amount" ? <RequestAmountStep /> : <RequestReasonStep />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  )
}
