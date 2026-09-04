"use client"

import { WalletDemo } from "@/components/marketing/wallet-demo/WalletDemo"

/**
 * Right column (wallet section): autoplaying wallet demo (non-interactive).
 */
export function LandingNewWalletShowcase() {
  return (
    <div className="min-w-0">
      <div className="relative flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="aspect-[390/844] w-full max-w-[290px]">
          <WalletDemo
            maxScale={1}
            showCard={false}
            activityExpanded
            autoplay
            interactive={false}
          />
        </div>
      </div>
    </div>
  )
}
