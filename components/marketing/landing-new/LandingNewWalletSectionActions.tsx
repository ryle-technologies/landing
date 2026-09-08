"use client"

import { LandingNewActionChip } from "@/components/marketing/landing-new/LandingNewActionChip"
import { useWalletDemoStore, type WalletDemoAutoplayAction } from "@/lib/walletDemo/store"

/**
 * Wallet quick actions for the product-section copy column. Each chip restarts
 * the scripted demo on the right from a fresh homepage on that scene.
 */
export function LandingNewWalletSectionActions() {
  const activeAccountKind = useWalletDemoStore((s) => s.activeAccountKind)
  const requestAutoplay = useWalletDemoStore((s) => s.requestAutoplay)
  const autoplayAction = useWalletDemoStore((s) => s.autoplayAction)
  const progress = useWalletDemoStore((s) => s.autoplayProgress)

  const isCrypto = activeAccountKind === "crypto"

  const actions: {
    id: string
    label: string
    scene?: WalletDemoAutoplayAction
    disabled?: boolean
  }[] = [
    { id: "send", label: "Send", scene: "send" },
    { id: "receive", label: "Receive", scene: "receive" },
    { id: "swap", label: "Swap", scene: "swap", disabled: isCrypto },
    { id: "request", label: "Request", scene: "request" },
    { id: "pay", label: "Pay", scene: "pay" },
  ]

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3" data-wallet-demo-controls>
      {actions.map(({ id, label, scene, disabled }) => (
        <LandingNewActionChip
          key={id}
          label={label}
          onPress={scene ? () => requestAutoplay(scene) : undefined}
          disabled={disabled}
          autoplayActive={autoplayAction === id}
          progress={progress}
        />
      ))}
    </div>
  )
}
