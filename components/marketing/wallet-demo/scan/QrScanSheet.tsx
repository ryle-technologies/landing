"use client"

import { AnimatePresence, motion } from "motion/react"
import { LuArrowLeft, LuScanLine } from "react-icons/lu"
import { WalletDemoPortal } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import { DEMO_FAVORITES } from "@/lib/walletDemo/data"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

/** Full-screen QR scanner mock for the landing wallet demo. */
export function QrScanSheet() {
  const qrScanOpen = useWalletDemoStore((s) => s.qrScanOpen)
  const closeQrScan = useWalletDemoStore((s) => s.closeQrScan)
  const openSend = useWalletDemoStore((s) => s.openSend)
  const setSendRecipient = useWalletDemoStore((s) => s.setSendRecipient)
  const sendNext = useWalletDemoStore((s) => s.sendNext)

  const simulateScan = () => {
    const contact = DEMO_FAVORITES[0]
    if (!contact) return
    closeQrScan()
    openSend()
    setSendRecipient(contact)
    sendNext()
  }

  return (
    <WalletDemoPortal>
      <AnimatePresence>
        {qrScanOpen ? (
          <motion.div
            key="qr-scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[96] flex min-h-0 flex-col overflow-hidden bg-black text-white"
            role="dialog"
            aria-label="Scan QR code"
          >
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <button
                type="button"
                onClick={closeQrScan}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-opacity active:opacity-70"
                aria-label="Close scanner"
              >
                <LuArrowLeft size={22} aria-hidden />
              </button>
              <span className="text-[16px] font-medium tracking-[-0.01em]">Scan QR</span>
              <span className="h-10 w-10" aria-hidden />
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-8">
              <div
                className="relative aspect-square w-full max-w-[240px] rounded-[28px] border border-white/30"
                style={{
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
                <div className="absolute left-4 top-4 size-8 rounded-tl-xl border-l-2 border-t-2 border-white" />
                <div className="absolute right-4 top-4 size-8 rounded-tr-xl border-r-2 border-t-2 border-white" />
                <div className="absolute bottom-4 left-4 size-8 rounded-bl-xl border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-4 right-4 size-8 rounded-br-xl border-b-2 border-r-2 border-white" />
                <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-white/50" />
              </div>
              <p className="mt-8 max-w-[18rem] text-center text-[14px] leading-relaxed text-white/75">
                Point the camera at a payment QR to start a transfer.
              </p>
            </div>

            <div className="flex shrink-0 justify-center px-6 pb-8">
              <button
                type="button"
                onClick={simulateScan}
                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-white/35 bg-white/10 px-6 text-[15px] font-medium tracking-[-0.01em] text-white backdrop-blur-sm active:opacity-80"
              >
                <LuScanLine size={18} aria-hidden />
                Simulate scan
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WalletDemoPortal>
  )
}
