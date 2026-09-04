"use client"

import { createContext, useContext, type ReactNode } from "react"
import { createPortal } from "react-dom"

/**
 * The phone frame element. Sheets, toasts and the send flow portal into it so
 * they stay clipped inside the device on the landing page (the private wallet
 * uses `#mobile-shell` for the same purpose).
 */
export const WalletDemoShellContext = createContext<HTMLElement | null>(null)

export function useWalletDemoShell(): HTMLElement | null {
  return useContext(WalletDemoShellContext)
}

/** Renders children inside the phone frame once it exists; inline otherwise. */
export function WalletDemoPortal({ children }: { children: ReactNode }) {
  const shell = useWalletDemoShell()
  if (shell) return createPortal(children, shell)
  return <>{children}</>
}
