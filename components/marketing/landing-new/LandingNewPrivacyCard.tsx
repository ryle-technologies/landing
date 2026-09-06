"use client"

import { useEffect, useRef } from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"
import {
  createHinkalBloom,
  type HinkalBloomHandle,
  type HinkalPalette,
} from "@/lib/hinkalBloom/createHinkalBloom"
/*
 * Privacy block: sits in the `LandingNewFeatureCards` grid, spanning two of
 * the three lattice columns. Copy on the left, stippled dot-matrix disc on
 * the right (canvas engine ported from the hinkal.io hero, `lib/hinkalBloom`).
 *
 * The animation tells the privacy story: a counterparty wallet sends a clear
 * amount → it is absorbed into the disc → re-emerges as a blurred `***` →
 * lands as a shielded block at its centre.
 */

const PRIVACY_CONTENT = {
  title: "Don\u2019t want your transactions on a public ledger?",
  titleMuted: "No problem.",
  body:
    "Public chains show everyone who paid whom, and how much. Ryle shields amounts, balances and counterparties by default \u2014 settlement stays onchain and final, and provable only to the auditors you choose.",
} as const

const cardTitleClassName =
  "text-left font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]"

const cardBodyClassName =
  "mt-2 text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

/**
 * Canvas colours per marketing theme, taken from the `.marketing-viewport-bleed`
 * tokens in `globals.css`. Canvas can't read CSS variables mid-transition, so
 * the values are mirrored here.
 */
const LIGHT_PALETTE: HinkalPalette = {
  // Cream cells a step darker than the card surface, with a muted ink cross
  // inside (same relationship as the original cream-on-navy blocks).
  block: "#ddd6c8",
  blockInk: "#9a9186",
  glyph: "#a0988e",
  glyphAccent: "#b8934a",
  accentBlock: "#d9c08a",
  landedBg: "#4a3d28",
  landedFg: "#e3c98a",
  pill: "#141210",
  pillInk: "#f5f2ee",
  walletBlock: "#f5f2ee",
  walletInk: "#141210",
  walletGlow: "20,18,16",
  shield: "#d9b96a",
  shieldInk: "#141210",
  shieldGlow: "184,147,74",
  nodeGlow: "20,18,16",
  grid: "rgba(28,24,20,0.055)",
}

const DARK_PALETTE: HinkalPalette = {
  block: "#f5f2ee",
  blockInk: "#141210",
  glyph: "#9a938a",
  glyphAccent: "#d9b96a",
  accentBlock: "#b8934a",
  landedBg: "#4a3d28",
  landedFg: "#e3c98a",
  pill: "#f5f2ee",
  pillInk: "#141210",
  walletBlock: "#f5f2ee",
  walletInk: "#141210",
  walletGlow: "245,242,238",
  shield: "#d9b96a",
  shieldInk: "#141210",
  shieldGlow: "217,185,106",
  nodeGlow: "245,242,238",
  grid: "#1c1a17",
}

type LandingNewPrivacyCardProps = {
  className?: string
}

export function LandingNewPrivacyCard({ className = "" }: LandingNewPrivacyCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bloomRef = useRef<HinkalBloomHandle | null>(null)
  const isDark = useMarketingTheme()?.isDark ?? false

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const bloom = createHinkalBloom(canvas, {
      monoFontFamily: getComputedStyle(canvas).getPropertyValue("--font-mono") || undefined,
      palette: isDark ? DARK_PALETTE : LIGHT_PALETTE,
    })
    bloomRef.current = bloom
    return () => {
      bloom.destroy()
      bloomRef.current = null
    }
    // Palette changes are applied via setPalette below; only mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bloomRef.current?.setPalette(isDark ? DARK_PALETTE : LIGHT_PALETTE)
  }, [isDark])

  return (
    <article
      aria-labelledby="landing-new-privacy-heading"
      className={`grid h-full min-w-0 items-center overflow-hidden sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8 ${className}`}
    >
      <div className="flex min-w-0 flex-col justify-center">
        <h3 id="landing-new-privacy-heading" className={cardTitleClassName}>
          {PRIVACY_CONTENT.title}{" "}
          <span className="text-muted">{PRIVACY_CONTENT.titleMuted}</span>
        </h3>
        <p className={cardBodyClassName}>{PRIVACY_CONTENT.body}</p>
      </div>
      {/*
        Stage height follows the copy. Canvas is absolute so its bitmap size
        never feeds back into layout (that would loop through the engine's
        ResizeObserver).
      */}
      <div className="relative mt-5 min-h-0 min-w-0 overflow-hidden max-sm:aspect-[2/1] sm:mt-0 sm:h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full touch-pan-y"
          aria-hidden
        />
      </div>
    </article>
  )
}
