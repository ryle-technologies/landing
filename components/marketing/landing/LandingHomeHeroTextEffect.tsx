"use client"

import {
  TextEffect,
} from "@/components/core/text-effect"
import { landingHeroH1ClassName } from "@/lib/landingHeroTypography"
import { useReducedMotion } from "motion/react"

const heroH1ClassName =
  `relative text-left text-foreground ${landingHeroH1ClassName}`

/** Tighter stagger + shorter segments than `TextEffect` defaults (~1×). */
const HERO_TEXT_SPEED_REVEAL = 1.55
const HERO_TEXT_SPEED_SEGMENT = 1.4

type LandingHomeHeroTextEffectProps = {
  /** Full headline for assistive tech / metadata parity. */
  title: string
  /** Below `sm`: two-line headline (`\\n` between lines). */
  titleTwoLine: string
}

/**
 * Hero headline: per-word blur on `sm+`; below `sm`, fixed two lines (`per="line"`).
 * Single `<h1>` for SEO — responsive variants are inner spans only.
 */
export function LandingHomeHeroTextEffect({
  title,
  titleTwoLine,
}: LandingHomeHeroTextEffectProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <h1 className={heroH1ClassName} aria-label={title}>
        <span className="whitespace-pre-line sm:hidden">{titleTwoLine}</span>
        <span className="hidden sm:block">{title}</span>
      </h1>
    )
  }

  return (
    <h1 className={heroH1ClassName} aria-label={title}>
      <TextEffect
        per="line"
        as="span"
        preset="blur"
        className={`block sm:hidden`}
        speedReveal={HERO_TEXT_SPEED_REVEAL}
        speedSegment={HERO_TEXT_SPEED_SEGMENT}
      >
        {titleTwoLine}
      </TextEffect>
      <TextEffect
        per="word"
        as="span"
        preset="blur"
        className={`hidden sm:block`}
        speedReveal={HERO_TEXT_SPEED_REVEAL}
        speedSegment={HERO_TEXT_SPEED_SEGMENT}
      >
        {title}
      </TextEffect>
    </h1>
  )
}

type LandingHomeHeroLeadTextEffectProps = {
  text: string
  className: string
  /** Container `delayChildren` so this starts after the headline reveal. */
  delay?: number
  /**
   * `word`: blur reveal per word (default).
   * `line`: split on `\\n` — one `<p>` with stacked lines (blur per line).
   */
  per?: "word" | "line"
}

/** Hero subline: same per-word blur as the title, with optional stagger offset. */
export function LandingHomeHeroLeadTextEffect({
  text,
  className,
  delay = 0,
  per = "word",
}: LandingHomeHeroLeadTextEffectProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <p
        className={
          per === "line" ? `${className} whitespace-pre-line` : className
        }
      >
        {text}
      </p>
    )
  }

  return (
    <TextEffect
      per={per}
      as="p"
      preset="blur"
      className={className}
      delay={delay}
      speedReveal={HERO_TEXT_SPEED_REVEAL}
      speedSegment={HERO_TEXT_SPEED_SEGMENT}
    >
      {text}
    </TextEffect>
  )
}
