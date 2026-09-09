"use client"

import { useContext, useState, type ReactNode } from "react"
import { WalletDemoStoreContext, createWalletDemoStore } from "@/lib/walletDemo/store"

/**
 * Gives a wallet demo (and any controls beside it) an isolated store. When
 * nested inside another provider it reuses the parent's store instead.
 */
export function WalletDemoStoreProvider({ children }: { children: ReactNode }) {
  const parent = useContext(WalletDemoStoreContext)
  const [own] = useState(() => (parent ? null : createWalletDemoStore()))
  const store = parent ?? own
  if (!store) return null
  return (
    <WalletDemoStoreContext.Provider value={store}>{children}</WalletDemoStoreContext.Provider>
  )
}
