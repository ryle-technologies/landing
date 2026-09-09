"use client"

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type RefObject,
} from "react"

/**
 * Marketing surface wrapper. Light-only for now — no `dark` class, and the
 * wrapper never writes to `<html>`, so the wallet/app theme stays independent.
 *
 * Token values live in `globals.css` only — do not set theme custom properties
 * via inline `style` here or registered transitions will snap instead of easing.
 */

type MarketingThemeContextValue = {
  isDark: boolean
}

const MarketingThemeContext =
  createContext<MarketingThemeContextValue | null>(null)

/**
 * Ref to the `overflow-y-auto` marketing wrapper so scroll-driven effects
 * (e.g. hero scale/opacity) can use `useScroll({ container })` — `window`
 * does not move on `/landing/*` because scrolling happens here, not on the
 * document.
 */
export const MarketingScrollContainerContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null)

const LIGHT_THEME: MarketingThemeContextValue = { isDark: false }

type MarketingThemeProviderProps = {
  children: ReactNode
}

export function MarketingThemeProvider({ children }: MarketingThemeProviderProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  return (
    <MarketingThemeContext.Provider value={LIGHT_THEME}>
      <MarketingScrollContainerContext.Provider value={scrollContainerRef}>
        <div
          ref={scrollContainerRef}
          className="marketing-viewport-bleed relative box-border flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 max-w-full flex-1 flex-col self-stretch overflow-x-hidden overflow-y-auto overscroll-y-contain"
          style={{
            backgroundColor: "var(--marketing-surface)",
            color: "var(--foreground)",
          }}
        >
        {/*
         * Full-bleed surface for the whole scroll height. Solid
         * `--marketing-surface` only — never via `<html>.dark`.
         */}
        <div
          className="min-h-full w-full min-w-0 max-w-full shrink-0"
          style={{ backgroundColor: "var(--marketing-surface)" }}
        >
          {children}
        </div>
        </div>
      </MarketingScrollContainerContext.Provider>
    </MarketingThemeContext.Provider>
  )
}

/**
 * Read the marketing theme. Returns `null` when used outside the provider so
 * components rendered in non-marketing contexts can no-op gracefully.
 */
export function useMarketingTheme(): MarketingThemeContextValue | null {
  return useContext(MarketingThemeContext)
}

/** `null` if not under `MarketingThemeProvider` (e.g. Storybook). */
export function useMarketingScrollContainer() {
  return useContext(MarketingScrollContainerContext)
}
