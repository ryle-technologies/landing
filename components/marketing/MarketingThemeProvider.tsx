"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react"
import {
  MARKETING_THEME_STORAGE_KEY,
  readMarketingThemeFromLocalStorage,
  writeMarketingThemeCookie,
} from "@/lib/marketingTheme"

/**
 * Self-contained light/dark theme for the public marketing routes.
 *
 * Intentionally independent from `useThemeStore` (the wallet/app theme):
 * - own `localStorage` key (`marketing-theme`) + matching cookie for SSR
 * - the `dark` class is applied on the marketing wrapper only, never on
 *   `<html>`, so toggling it here cannot affect the wallet shell.
 *
 * The wrapper carries `marketing-viewport-bleed` plus optional `dark`. Token
 * values and scroll crossfades live in `globals.css` only — do not set theme
 * custom properties via inline `style` here or registered transitions will
 * snap instead of easing.
 */

type MarketingThemeContextValue = {
  isDark: boolean
  setTheme: (isDark: boolean, options?: { persist?: boolean }) => void
  toggle: () => void
  /** True after the first client effect; use to gate hydration-sensitive UI. */
  hasMounted: boolean
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

const MARKETING_THEME_EVENT = "marketing-theme-change"
let marketingThemeSnapshot: boolean | null = null

const subscribeHydration = () => () => {}
const getMountedSnapshot = () => true
const getServerMountedSnapshot = () => false

const subscribeMarketingTheme = (onStoreChange: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== MARKETING_THEME_STORAGE_KEY) {
      return
    }
    marketingThemeSnapshot = readMarketingThemeFromLocalStorage() ?? false
    onStoreChange()
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(MARKETING_THEME_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(MARKETING_THEME_EVENT, onStoreChange)
  }
}

type MarketingThemeProviderProps = {
  children: ReactNode
  /** SSR / first paint theme (landing uses `false` for light hero). */
  initialIsDark?: boolean
}

export function MarketingThemeProvider({
  children,
  initialIsDark = false,
}: MarketingThemeProviderProps) {
  // First-paint / SSR fallback for the store snapshot. Captured once: the
  // marketing layout always passes a constant value, and after mount
  // `marketingThemeSnapshot` (set in the layout effect below) takes over.
  const initialIsDarkRef = useRef(initialIsDark)

  const getClientSnapshot = useCallback(
    () => marketingThemeSnapshot ?? initialIsDarkRef.current,
    [],
  )

  const isDark = useSyncExternalStore(
    subscribeMarketingTheme,
    getClientSnapshot,
    () => initialIsDark,
  )

  const hasMounted = useSyncExternalStore(
    subscribeHydration,
    getMountedSnapshot,
    getServerMountedSnapshot,
  )

  const setTheme = useCallback(
    (nextIsDark: boolean, options: { persist?: boolean } = {}) => {
      const current = marketingThemeSnapshot ?? initialIsDarkRef.current
      if (current === nextIsDark) {
        return
      }

      marketingThemeSnapshot = nextIsDark

      if (options.persist ?? true) {
        try {
          window.localStorage.setItem(
            MARKETING_THEME_STORAGE_KEY,
            nextIsDark ? "dark" : "light",
          )
        } catch {
          // ignore: not being able to persist is fine, the theme still updates.
        }
        writeMarketingThemeCookie(nextIsDark)
      }

      window.dispatchEvent(new Event(MARKETING_THEME_EVENT))
    },
    [],
  )

  const toggle = useCallback(() => {
    setTheme(!isDark)
  }, [isDark, setTheme])

  useLayoutEffect(() => {
    marketingThemeSnapshot = initialIsDarkRef.current
  }, [])

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  return (
    <MarketingThemeContext.Provider
      value={{ isDark, setTheme, toggle, hasMounted }}
    >
      <MarketingScrollContainerContext.Provider value={scrollContainerRef}>
        <div
          ref={scrollContainerRef}
          className={[
            // `relative` is required: motion's `useScroll({ container })`
            // (hero pin + sticky nav) needs a non-static scroll container to
            // compute scroll offsets correctly. Without it the reveal progress
            // is non-monotonic and the nav jitters/tilts while scrolling.
            "marketing-viewport-bleed relative box-border flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 max-w-full flex-1 flex-col self-stretch overflow-x-hidden overflow-y-auto overscroll-y-contain",
            isDark ? "dark" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            backgroundColor: "var(--marketing-surface)",
            color: "var(--foreground)",
          }}
        >
        {/*
         * Full-bleed surface for the whole scroll height. Solid
         * `--marketing-surface` only — flips to dark via `.dark` on this
         * wrapper, never via `<html>.dark`.
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
