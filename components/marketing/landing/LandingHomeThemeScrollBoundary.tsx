"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import {
  useMarketingScrollContainer,
  useMarketingTheme,
} from "@/components/marketing/MarketingThemeProvider"

type LandingHomeThemeScrollBoundaryProps = {
  children: ReactNode
  className?: string
}

/**
 * Flip to finale theme once the suite top has moved this fraction of the way from
 * the scrollport bottom toward the top (1 = first pixel visible; lower = later).
 */
const THEME_FINALE_ACTIVATE_VIEWPORT_RATIO = 0.86

/** Hero / pillars stay light; suite section onward uses dark. */
const HERO_THEME_IS_DARK = false

/**
 * Scroll-driven light → dark: hero and pillars stay light; once the suite block
 * has entered the scrollport slightly, the page switches to dark. Scrolling
 * back above restores light.
 */
export function LandingHomeThemeScrollBoundary({
  children,
  className,
}: LandingHomeThemeScrollBoundaryProps) {
  const boundaryRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const isFinaleActiveRef = useRef(false)
  const lastAppliedThemeRef = useRef<boolean | null>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const marketingTheme = useMarketingTheme()
  const marketingThemeRef = useRef(marketingTheme)

  useEffect(() => {
    marketingThemeRef.current = marketingTheme
  }, [marketingTheme])

  const updateThemeForScroll = useCallback(() => {
    const boundary = boundaryRef.current
    const currentMarketingTheme = marketingThemeRef.current

    if (!boundary || !currentMarketingTheme) {
      return
    }

    const scrollContainer = scrollContainerRef?.current ?? null
    const rootRect = scrollContainer?.getBoundingClientRect()
    const rootTop = rootRect?.top ?? 0
    const rootHeight = rootRect?.height ?? window.innerHeight
    const boundaryTop = boundary.getBoundingClientRect().top - rootTop
    const finaleThreshold = rootHeight * THEME_FINALE_ACTIVATE_VIEWPORT_RATIO
    /** True once the suite has scrolled in slightly (after first peek). */
    const isFinaleActive = boundaryTop <= finaleThreshold
    const shouldUseDarkTheme = isFinaleActive ? true : HERO_THEME_IS_DARK

    if (lastAppliedThemeRef.current === shouldUseDarkTheme) {
      isFinaleActiveRef.current = isFinaleActive
      return
    }

    isFinaleActiveRef.current = isFinaleActive
    lastAppliedThemeRef.current = shouldUseDarkTheme
    currentMarketingTheme.setTheme(shouldUseDarkTheme, { persist: false })
  }, [scrollContainerRef])

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current ?? null
    const scrollTarget = scrollContainer ?? window

    const requestThemeUpdate = () => {
      if (frameRef.current !== null) {
        return
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        updateThemeForScroll()
      })
    }

    updateThemeForScroll()
    scrollTarget.addEventListener("scroll", requestThemeUpdate, {
      passive: true,
    })
    window.addEventListener("resize", requestThemeUpdate)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }

      scrollTarget.removeEventListener("scroll", requestThemeUpdate)
      window.removeEventListener("resize", requestThemeUpdate)

      const currentMarketingTheme = marketingThemeRef.current

      if (
        currentMarketingTheme &&
        lastAppliedThemeRef.current !== HERO_THEME_IS_DARK
      ) {
        currentMarketingTheme.setTheme(HERO_THEME_IS_DARK, { persist: false })
        lastAppliedThemeRef.current = HERO_THEME_IS_DARK
        isFinaleActiveRef.current = false
      }
    }
  }, [scrollContainerRef, updateThemeForScroll])

  return (
    <div ref={boundaryRef} className={className}>
      {children}
    </div>
  )
}
