"use client"

import { WalletDemo } from "@/components/marketing/wallet-demo/WalletDemo"

/**
 * Right-column phone: fills the lattice cell edge-to-edge. WalletDemo
 * fit-scales the 390×844 frame into that box.
 */
export function LandingNewWalletShowcase() {
  return (
    <div className="landing-new-wallet-grid-phone relative h-full min-h-0 w-full min-w-0 overflow-hidden max-md:mx-auto max-md:aspect-[360/780] max-md:max-w-[360px] md:aspect-auto">
      <style>{`
        .landing-new-wallet-grid-phone .wallet-demo-shell {
          border: 0 !important;
          border-radius: 0 !important;
        }
      `}</style>
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
