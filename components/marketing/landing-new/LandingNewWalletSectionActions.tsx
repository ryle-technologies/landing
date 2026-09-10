"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { LandingNewActionChip } from "@/components/marketing/landing-new/LandingNewActionChip"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

const ALL_ACTIONS = [
  { id: "send", label: "Send", scene: "send" as const },
  { id: "receive", label: "Receive", scene: "receive" as const },
  { id: "swap", label: "Swap", scene: "swap" as const },
  { id: "request", label: "Request", scene: "request" as const },
  { id: "pay", label: "Pay", scene: "pay" as const },
] as const

/**
 * Wallet quick actions. The copy column uses a wrapping row; the mobile
 * phone rail uses a 90° spine stacked from the top of the first cell.
 */
export function LandingNewWalletSectionActions({
  variant = "row",
}: {
  variant?: "row" | "spine"
} = {}) {
  const activeAccountKind = useWalletDemoStore((s) => s.activeAccountKind)
  const requestAutoplay = useWalletDemoStore((s) => s.requestAutoplay)
  const autoplayAction = useWalletDemoStore((s) => s.autoplayAction)
  const progress = useWalletDemoStore((s) => s.autoplayProgress)

  const isCrypto = activeAccountKind === "crypto"
  const actions = ALL_ACTIONS.map((action) => ({
    ...action,
    disabled: action.id === "swap" && isCrypto,
  }))

  if (actions.length === 0) return null

  const chips = actions.map(({ id, label, scene, disabled }) => (
    <LandingNewActionChip
      key={id}
      label={label}
      onPress={scene ? () => requestAutoplay(scene) : undefined}
      disabled={disabled}
      autoplayActive={autoplayAction === id}
      progress={progress}
    />
  ))

  if (variant === "spine") {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-start gap-3 py-3"
        data-wallet-demo-controls
      >
        {actions.map((action, i) => (
          <SpineChip key={action.id}>{chips[i]}</SpineChip>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3" data-wallet-demo-controls>
      {chips}
    </div>
  )
}

/** Slot that swaps a chip's width/height so `rotate-90` doesn't overflow the rail. */
function SpineChip({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [slot, setSlot] = useState({ w: 44, h: 80 })

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const apply = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w < 1 || h < 1) return
      setSlot((prev) =>
        prev.w === h && prev.h === w ? prev : { w: h, h: w },
      )
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ width: slot.w, height: slot.h }}
    >
      <div ref={innerRef} className="rotate-90">
        {children}
      </div>
    </div>
  )
}
