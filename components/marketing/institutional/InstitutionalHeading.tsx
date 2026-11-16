"use client"

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useReducedMotion } from "motion/react"
import { TextEffect } from "@/components/core/text-effect"
import {
  HERO_TEXT_SPEED_REVEAL,
  HERO_TEXT_SPEED_SEGMENT,
  HERO_WORD_STAGGER_S,
} from "@/lib/landingHeroIntro"

const LINE_BREAK_CLASS = {
  md: "md:block",
  lg: "lg:block",
  xl: "xl:block",
} as const

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

const subscribeToNothing = () => () => {}

/** False on the server and during hydration, true afterwards. */
function useHasMounted() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )
}

type InstitutionalHeadingProps = {
  as?: "h1" | "h2" | "h3"
  id?: string
  /** Display scale (see `styles.ts`). */
  className: string
  /**
   * Display lines. Each sits on its own row from `breakFrom`; below it the
   * headline wraps naturally and balances.
   */
  lines: readonly string[]
  /** Closing phrase on the last line; carries the shimmer underline. */
  accent?: string
  /** Punctuation after the accent. */
  end?: string
  accentUnderline?: boolean
  breakFrom?: keyof typeof LINE_BREAK_CLASS
  /** Reveal on mount (hero) instead of on first view. */
  immediate?: boolean
}

/**
 * Institutional display headline: per-word blur reveal and the rainbow
 * underline on the closing phrase, same treatment as the Client Services
 * headings (`LandingNewPillarsHeading`) with explicit display lines.
 */
export function InstitutionalHeading({
  as: Tag = "h2",
  id,
  className,
  lines,
  accent,
  end = ".",
  accentUnderline = true,
  breakFrom = "lg",
  immediate = false,
}: InstitutionalHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reduceMotionPref = useReducedMotion()
  const hasMounted = useHasMounted()
  const [inView, setInView] = useState(immediate)
  // The preference is unknown on the server; only honour it once mounted so
  // the first client render matches the server markup.
  const reduceMotion = hasMounted && reduceMotionPref === true
  const animated = inView && !reduceMotion

  useEffect(() => {
    if (immediate) return
    const node = headingRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [immediate])

  const fullTitle = [...lines, accent ? `${accent}${end}` : null]
    .filter(Boolean)
    .join(" ")

  const wordsBefore = (index: number) =>
    lines.slice(0, index).reduce((total, line) => total + countWords(line), 0)

  /**
   * One `TextEffect` per word, joined by plain spaces. A single effect over
   * the whole line keeps its spaces as `whitespace-pre` boxes, which indent
   * the next row whenever a line wraps on its own.
   */
  const renderWords = (value: string, firstWordIndex: number) => {
    if (!animated) return value
    const words = value.trim().split(/\s+/).filter(Boolean)
    return words.map((word, index) => (
      <Fragment key={`${index}-${word}`}>
        {index > 0 ? " " : null}
        <TextEffect
          per="word"
          as="span"
          preset="blur"
          className="inline"
          delay={(firstWordIndex + index) * HERO_WORD_STAGGER_S}
          speedReveal={HERO_TEXT_SPEED_REVEAL}
          speedSegment={HERO_TEXT_SPEED_SEGMENT}
        >
          {word}
        </TextEffect>
      </Fragment>
    ))
  }

  const lastIndex = lines.length - 1

  return (
    <Tag
      ref={headingRef}
      id={id}
      aria-label={fullTitle}
      className={`relative text-balance text-left ${className}`}
    >
      <span
        aria-hidden
        className={`[&_.sr-only]:hidden ${inView || reduceMotion ? "" : "opacity-0"}`}
      >
        {lines.map((line, index) => (
          <span key={`${index}-${line}`} className={LINE_BREAK_CLASS[breakFrom]}>
            {renderWords(line, wordsBefore(index))}
            {index === lastIndex && accent ? (
              <>
                {" "}
                {/* Punctuation travels with the accent so it never wraps alone. */}
                <span className="whitespace-nowrap">
                  <span
                    className={
                      accentUnderline ? "relative inline-block pb-[0.14em]" : "inline"
                    }
                  >
                    {renderWords(accent, wordsBefore(lines.length))}
                    {accentUnderline && (animated || reduceMotion) ? (
                      <span
                        aria-hidden
                        className="landing-hero-word-shimmer pointer-events-none absolute right-0 left-0 h-[3px] rounded-full !bottom-[0.04em]"
                      />
                    ) : null}
                  </span>
                  {end}
                </span>
              </>
            ) : null}
            {index === lastIndex ? null : " "}
          </span>
        ))}
      </span>
    </Tag>
  )
}
