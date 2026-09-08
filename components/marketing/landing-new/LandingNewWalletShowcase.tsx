"use client"

import { WalletDemo } from "@/components/marketing/wallet-demo/WalletDemo"

/**
 * Phone cell: fills its lattice cell edge-to-edge. WalletDemo fit-scales the
 * 390×844 frame into that box; the cell stroke is the device outline.
 */
export function LandingNewWalletShowcase() {
  return (
    <div className="landing-new-wallet-grid-phone relative z-10 h-full min-h-0 w-full min-w-0 overflow-hidden bg-white">
      <WalletDemo
        maxScale={1}
        showCard={false}
        activityExpanded
        autoplay
        interactive={false}
      />
    </div>
  )
}
