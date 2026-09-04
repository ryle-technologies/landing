"use client"

import { Moon, Sun } from "lucide-react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"

type LandingThemeToggleProps = {
  className?: string
}

/**
 * Manual light/dark control for marketing routes. Hidden until the theme
 * provider has mounted so the icon matches the hydrated preference.
 */
export function LandingThemeToggle({ className }: LandingThemeToggleProps) {
  const theme = useMarketingTheme()

  if (!theme) {
    return null
  }

  const { isDark, toggle, hasMounted } = theme
  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={[
        "inline-flex size-8 shrink-0 items-center justify-center self-center rounded-full",
        "cursor-pointer border-0 bg-transparent p-0 text-muted",
        "transition-colors duration-500 ease-out hover:text-foreground",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasMounted ? (
        isDark ? (
          <Sun className="size-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Moon className="size-4" strokeWidth={1.75} aria-hidden />
        )
      ) : (
        <span className="size-4" aria-hidden />
      )}
    </button>
  )
}
