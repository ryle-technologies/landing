"use client"

import { useEffect, useState } from "react"
import {
  TextEffect,
} from "@/components/core/text-effect"
import { LandingHeroRotatingWord } from "@/components/marketing/landing/LandingHeroRotatingWord"
import { landingHeroH1ClassName } from "@/lib/landingHeroTypography"
import { useReducedMotion } from "motion/react"

/** Tighter stagger + shorter segments than `TextEffect` defaults (~1×). */
const HERO_TEXT_SPEED_REVEAL = 1.55
const HERO_TEXT_SPEED_SEGMENT = 1.4
const HERO_WORD_STAGGER_S = 0.05 / HERO_TEXT_SPEED_REVEAL
/** Hold each rotating verb before morphing to the next. */
const HERO_ROTATING_WORD_HOLD_MS = 3000

type LandingHomeHeroTextEffectProps = {
  /** Full headline for assistive tech / metadata parity. */
  title: string
  /** Below `sm`: two-line headline (`\\n` between lines). */
  titleTwoLine: string
  /**
   * When set, `title` / `titleTwoLine` are the prefix and the last word
   * cycles through these verbs (x.ai-style letter morph).
   */
  rotatingWords?: readonly string[]
  /** Overrides the default serif h1 scale (new-landing display type). */
  className?: string
}

/**
 * Hero headline: per-word blur on `sm+`; below `sm`, fixed two lines (`per="line"`).
 * Single `<h1>` for SEO — responsive variants are inner spans only.
 */
export function LandingHomeHeroTextEffect({
  title,
  titleTwoLine,
  rotatingWords,
  className,
}: LandingHomeHeroTextEffectProps) {
  const heroH1ClassName = `relative text-left text-foreground ${
    className ?? landingHeroH1ClassName
  }`
  const reduceMotion = useReducedMotion()
  const [wordIndex, setWordIndex] = useState(0)
  const rotatingWord = rotatingWords?.[wordIndex] ?? null
  const enterDelay =
    title.trim().split(/\s+/).filter(Boolean).length * HERO_WORD_STAGGER_S

  useEffect(() => {
    if (!rotatingWords || rotatingWords.length < 2) {
      return
    }

    const waitMs =
      wordIndex === 0 && !reduceMotion
        ? enterDelay * 1000 + HERO_ROTATING_WORD_HOLD_MS
        : HERO_ROTATING_WORD_HOLD_MS

    const id = window.setTimeout(() => {
      setWordIndex((index) => (index + 1) % rotatingWords.length)
    }, waitMs)

    return () => window.clearTimeout(id)
  }, [enterDelay, reduceMotion, rotatingWords, wordIndex])

  const fullTitle = rotatingWord ? `${title} ${rotatingWord}.` : title
  const twoLinePrefix = titleTwoLine.split("\n")
  const twoLineFirst = twoLinePrefix[0] ?? titleTwoLine
  const twoLineRest = twoLinePrefix.slice(1).join(" ")

  if (!rotatingWord) {
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

  if (reduceMotion) {
    return (
      <h1 className={heroH1ClassName}>
        <span className="sr-only">{fullTitle}</span>
        <span aria-hidden className="whitespace-pre-line sm:hidden">
          {`${twoLineFirst}\n${twoLineRest} ${rotatingWord}.`}
        </span>
        <span aria-hidden className="hidden sm:inline">
          {fullTitle}
        </span>
      </h1>
    )
  }

  return (
    <h1 className={heroH1ClassName}>
      <span className="sr-only">{fullTitle}</span>
      <span aria-hidden>
        <TextEffect
          per="line"
          as="span"
          preset="blur"
          className="block sm:hidden"
          speedReveal={HERO_TEXT_SPEED_REVEAL}
          speedSegment={HERO_TEXT_SPEED_SEGMENT}
        >
          {twoLineFirst}
        </TextEffect>
        <span className="sm:hidden">
          <TextEffect
            per="word"
            as="span"
            preset="blur"
            className="inline"
            delay={HERO_WORD_STAGGER_S}
            speedReveal={HERO_TEXT_SPEED_REVEAL}
            speedSegment={HERO_TEXT_SPEED_SEGMENT}
          >
            {twoLineRest}
          </TextEffect>{" "}
          <LandingHeroRotatingWord word={rotatingWord} enterDelay={enterDelay} />
          .
        </span>
        <span className="hidden sm:inline">
          <TextEffect
            per="word"
            as="span"
            preset="blur"
            className="inline"
            speedReveal={HERO_TEXT_SPEED_REVEAL}
            speedSegment={HERO_TEXT_SPEED_SEGMENT}
          >
            {title}
          </TextEffect>{" "}
          <LandingHeroRotatingWord word={rotatingWord} enterDelay={enterDelay} />
          .
        </span>
      </span>
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
