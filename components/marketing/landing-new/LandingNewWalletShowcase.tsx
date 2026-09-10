"use client"

import { WalletDemo } from "@/components/marketing/wallet-demo/WalletDemo"
import { LATTICE_CELL_PX } from "@/lib/landingLattice"

/**
 * Phone cell: fills its lattice cell edge-to-edge. WalletDemo fit-scales the
 * 390×844 frame into that box; the cell stroke is the device outline.
 * The frame pins to the top so leftover ratio lands at the bottom, where
 * one lattice cell fades into the page.
 */
export function LandingNewWalletShowcase() {
  return (
    <div className="landing-new-wallet-grid-phone relative z-10 h-full min-h-0 w-full min-w-0 overflow-hidden">
      <WalletDemo
        maxScale={1}
        showCard={false}
        activityExpanded
        autoplay
        interactive={false}
        align="top"
      />
      <div
        aria-hidden
        data-wallet-bottom-fade
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
        style={{
          height: LATTICE_CELL_PX,
          background:
            "linear-gradient(to bottom, transparent, var(--marketing-surface))",
        }}
      />
    </div>
  )
}
