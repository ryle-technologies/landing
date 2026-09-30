"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  TextEffect,
} from "@/components/core/text-effect"
import { LandingHeroRotatingWord } from "@/components/marketing/landing/LandingHeroRotatingWord"
import { landingHeroH1ClassName } from "@/lib/landingHeroTypography"
import {
  HERO_ROTATING_WORD_HOLD_MS,
  HERO_TEXT_SPEED_REVEAL,
  HERO_TEXT_SPEED_SEGMENT,
  landingHeroIntroDelays,
  landingHeroPrefixEnterDelayS,
} from "@/lib/landingHeroIntro"
import { useReducedMotion } from "motion/react"
import { usePageVisible } from "@/lib/usePageVisible"

const SM_MIN_PX = 640
const FIT_SAMPLE_PX = 100
/** Ceiling for the two-line phone fit, before shrinking to the column. */
const DISPLAY_FIT_MIN_PX = 40
const DISPLAY_FIT_MAX_PX = 88
const DISPLAY_FIT_VW = 0.12
const DISPLAY_FIT_SAFETY = 0.98

function desiredDisplayPx(viewportWidth: number) {
  return Math.min(
    DISPLAY_FIT_MAX_PX,
    Math.max(DISPLAY_FIT_MIN_PX, viewportWidth * DISPLAY_FIT_VW),
  )
}

/**
 * Below `sm`, shrink the display h1 so the longest nowrap line fits the
 * lattice column (or the nearest sized parent).
 */
function useMobileDisplayFitPx(lines: readonly string[], enabled: boolean) {
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const sizerRef = useRef<HTMLSpanElement>(null)
  const [fontPx, setFontPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled) {
      setFontPx(null)
      return
    }

    const h1 = h1Ref.current
    const sizer = sizerRef.current
    if (!h1 || !sizer) {
      return
    }

    const measure = () => {
      if (window.matchMedia(`(min-width: ${SM_MIN_PX}px)`).matches) {
        setFontPx(null)
        return
      }

      let maxLine = 0
      for (const child of sizer.children) {
        maxLine = Math.max(maxLine, child.getBoundingClientRect().width)
      }
      if (maxLine <= 0) {
        return
      }

      const column = h1.closest("[data-lattice-column]")
      const box =
        column instanceof HTMLElement
          ? column
          : h1.parentElement instanceof HTMLElement
            ? h1.parentElement
            : null
      const available = box?.getBoundingClientRect().width ?? window.innerWidth
      if (available <= 0) {
        return
      }

      const fit = (available * DISPLAY_FIT_SAFETY * FIT_SAMPLE_PX) / maxLine
      const next = Math.max(
        1,
        Math.floor(Math.min(desiredDisplayPx(window.innerWidth), fit)),
      )
      setFontPx((prev) => (prev === next ? prev : next))
    }

    measure()
    const column = h1.closest("[data-lattice-column]")
    const ro = new ResizeObserver(measure)
    if (column) {
      ro.observe(column)
    } else if (h1.parentElement) {
      ro.observe(h1.parentElement)
    }
    const mq = window.matchMedia(`(min-width: ${SM_MIN_PX}px)`)
    mq.addEventListener("change", measure)
    const fonts = document.fonts?.ready.then(measure)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      mq.removeEventListener("change", measure)
      window.removeEventListener("resize", measure)
      void fonts
    }
  }, [enabled, lines.join("\0")])

  return { h1Ref, sizerRef, fontPx }
}

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
  /** Second line inside the same `<h1>` (supporting sentence). */
  subtitle?: string
  /** Seconds before the subtitle blur reveal. */
  subtitleDelay?: number
  /** Overrides the default serif h1 scale (home lattice display type). */
  className?: string
}

/**
 * Second h1 line: same display face, stepped down under the rotating title.
 * Full column width below `sm` (normal wrap). `text-balance` only from `sm`,
 * where the line is long enough that balancing does not pull it in from the title.
 */
const HERO_SUBTITLE_CLASS =
  "mt-[0.55em] block w-full whitespace-normal text-[clamp(20px,4.2vw,32px)] leading-[1.12] tracking-tighter sm:text-balance sm:text-[clamp(24px,2.6vw,36px)]"

/**
 * Hero headline: per-word blur on `sm+`. Below `sm` with rotating words,
 * two nowrap lines (prefix / word) sized to the column; otherwise `titleTwoLine`.
 * Single `<h1>` for SEO — responsive variants are inner spans only.
 * Optional `subtitle` is a second block line under the title animation.
 */
export function LandingHomeHeroTextEffect({
  title,
  titleTwoLine,
  rotatingWords,
  subtitle,
  subtitleDelay = 0,
  className,
}: LandingHomeHeroTextEffectProps) {
  const heroH1ClassName = `relative text-left text-foreground ${
    className ?? landingHeroH1ClassName
  }`
  const reduceMotion = useReducedMotion()
  const pageVisible = usePageVisible()
  const [wordIndex, setWordIndex] = useState(0)
  const rotatingWord = rotatingWords?.[wordIndex] ?? null
  const enterDelay = landingHeroPrefixEnterDelayS(title)
  const firstMorphWaitMs = rotatingWords?.[0]
    ? landingHeroIntroDelays(title, rotatingWords[0]).firstMorph * 1000
    : HERO_ROTATING_WORD_HOLD_MS
  const fitLines = rotatingWords
    ? [title, ...rotatingWords.map((word) => `${word}.`)]
    : []
  const { h1Ref, sizerRef, fontPx } = useMobileDisplayFitPx(
    fitLines,
    Boolean(rotatingWord),
  )
  const titleFitStyle = fontPx != null ? { fontSize: fontPx } : undefined

  useEffect(() => {
    if (!rotatingWords || rotatingWords.length < 2 || !pageVisible) {
      return
    }

    const waitMs =
      wordIndex === 0 && !reduceMotion
        ? firstMorphWaitMs
        : HERO_ROTATING_WORD_HOLD_MS

    const id = window.setTimeout(() => {
      setWordIndex((index) => (index + 1) % rotatingWords.length)
    }, waitMs)

    return () => window.clearTimeout(id)
  }, [firstMorphWaitMs, pageVisible, reduceMotion, rotatingWords, wordIndex])

  const fullTitle = rotatingWord ? `${title} ${rotatingWord}.` : title
  const accessibleTitle = subtitle ? `${fullTitle} ${subtitle}` : fullTitle
  const fitSizer = rotatingWord ? (
    <span
      ref={sizerRef}
      aria-hidden
      className="pointer-events-none invisible absolute top-0 left-[-9999px]"
      style={{ fontSize: FIT_SAMPLE_PX }}
    >
      {fitLines.map((line) => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </span>
  ) : null

  const subtitleLine = subtitle ? (
    reduceMotion ? (
      <span aria-hidden className={HERO_SUBTITLE_CLASS}>
        {subtitle}
      </span>
    ) : (
      <span aria-hidden className="block w-full">
        <TextEffect
          per="word"
          as="span"
          preset="blur"
          className={HERO_SUBTITLE_CLASS}
          delay={subtitleDelay}
          speedReveal={HERO_TEXT_SPEED_REVEAL}
          speedSegment={HERO_TEXT_SPEED_SEGMENT}
        >
          {subtitle}
        </TextEffect>
      </span>
    )
  ) : null

  if (!rotatingWord) {
    if (reduceMotion) {
      return (
        <h1 className={heroH1ClassName} aria-label={accessibleTitle}>
          <span className="block whitespace-pre-line sm:hidden">
            {titleTwoLine}
          </span>
          <span className="hidden sm:block">{title}</span>
          {subtitleLine}
        </h1>
      )
    }

    return (
      <h1 className={heroH1ClassName} aria-label={accessibleTitle}>
        <TextEffect
          per="line"
          as="span"
          preset="blur"
          className="block sm:hidden"
          speedReveal={HERO_TEXT_SPEED_REVEAL}
          speedSegment={HERO_TEXT_SPEED_SEGMENT}
        >
          {titleTwoLine}
        </TextEffect>
        <TextEffect
          per="word"
          as="span"
          preset="blur"
          className="hidden sm:block"
          speedReveal={HERO_TEXT_SPEED_REVEAL}
          speedSegment={HERO_TEXT_SPEED_SEGMENT}
        >
          {title}
        </TextEffect>
        {subtitleLine}
      </h1>
    )
  }

  if (reduceMotion) {
    return (
      <h1 ref={h1Ref} className={heroH1ClassName}>
        <span className="sr-only">{accessibleTitle}</span>
        <span aria-hidden className="block" style={titleFitStyle}>
          <span className="block whitespace-nowrap sm:hidden">{title}</span>
          <span className="block whitespace-nowrap sm:hidden">
            {`${rotatingWord}.`}
          </span>
          <span className="hidden sm:block">{fullTitle}</span>
        </span>
        {subtitleLine}
        {fitSizer}
      </h1>
    )
  }

  return (
    <h1 ref={h1Ref} className={heroH1ClassName}>
      <span className="sr-only">{accessibleTitle}</span>
      <span aria-hidden className="block" style={titleFitStyle}>
        <span className="block whitespace-nowrap sm:hidden">
          <TextEffect
            per="word"
            as="span"
            preset="blur"
            className="inline"
            speedReveal={HERO_TEXT_SPEED_REVEAL}
            speedSegment={HERO_TEXT_SPEED_SEGMENT}
          >
            {title}
          </TextEffect>
        </span>
        <span className="block whitespace-nowrap sm:hidden">
          <LandingHeroRotatingWord
            word={rotatingWord}
            prefix={title}
            enterDelay={enterDelay}
            remeasureKey={fontPx}
          />
          .
        </span>
        <span className="hidden sm:block">
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
          <LandingHeroRotatingWord
            word={rotatingWord}
            prefix={title}
            enterDelay={enterDelay}
            remeasureKey={fontPx}
          />
          .
        </span>
      </span>
      {subtitleLine}
      {fitSizer}
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
