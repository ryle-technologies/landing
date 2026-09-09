"use client"

import { useEffect, useRef, useState } from "react"
import { TextEffect } from "@/components/core/text-effect"
import { useReducedMotion } from "motion/react"

const HERO_TEXT_SPEED_REVEAL = 1.55
const HERO_TEXT_SPEED_SEGMENT = 1.4
const HERO_WORD_STAGGER_S = 0.05 / HERO_TEXT_SPEED_REVEAL

const pillarsDisplayClassName =
  "font-sans text-[clamp(40px,8.2vw,76px)] leading-none tracking-tighter text-foreground"

const leadClassName =
  "block font-serif text-[18px] font-normal italic leading-snug tracking-[-0.03em] text-muted sm:text-[28px]"

const restClassName = "relative text-left transition-colors duration-500 ease-out"

type LandingNewPillarsHeadingProps = {
  headingId: string
  lead?: string
  prefix: string
  accent: string
  /** Overrides the default display scale of the headline. */
  displayClassName?: string
}

/**
 * Pillars headline: H1 word-blur on first view, rainbow underline on the
 * closing phrase (same treatment as the hero’s rotating last word).
 */
export function LandingNewPillarsHeading({
  headingId,
  lead,
  prefix,
  accent,
  displayClassName = pillarsDisplayClassName,
}: LandingNewPillarsHeadingProps) {
  const reduceMotionPref = useReducedMotion()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [inView, setInView] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const reduceMotion = hasMounted && reduceMotionPref === true
  const enterDelay =
    prefix.trim().split(/\s+/).filter(Boolean).length * HERO_WORD_STAGGER_S
  const fullTitle = [lead, prefix, `${accent}.`].filter(Boolean).join(" ")

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const node = headingRef.current
    if (!node) {
      return
    }

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
  }, [])

  return (
    <h2
      ref={headingRef}
      id={headingId}
      aria-label={fullTitle}
      className={`relative flex flex-col text-left ${lead ? "gap-8 sm:gap-16" : ""}`}
    >
      {lead ? (
        <span
          aria-hidden
          className={`${leadClassName} transition-opacity duration-500 ease-out ${
            inView || reduceMotion ? "opacity-100" : "opacity-0"
          }`}
        >
          {lead}
        </span>
      ) : null}
      <span aria-hidden className={`${restClassName} ${displayClassName}`}>
        {reduceMotion ? (
          <>
            {prefix}{" "}
            <span className="whitespace-nowrap">
              <span className="relative inline-block">{accent}</span>.
            </span>
          </>
        ) : !inView ? (
          <span className="opacity-0">
            {prefix} {accent}.
          </span>
        ) : (
          <>
            <TextEffect
              per="word"
              as="span"
              preset="blur"
              className="inline"
              speedReveal={HERO_TEXT_SPEED_REVEAL}
              speedSegment={HERO_TEXT_SPEED_SEGMENT}
            >
              {prefix}
            </TextEffect>{" "}
            {/* Period travels with the accent so it can never wrap alone. */}
            <span className="whitespace-nowrap">
              <span className="relative inline-block pb-[0.14em]">
                <TextEffect
                  per="word"
                  as="span"
                  preset="blur"
                  className="inline"
                  delay={enterDelay}
                  speedReveal={HERO_TEXT_SPEED_REVEAL}
                  speedSegment={HERO_TEXT_SPEED_SEGMENT}
                >
                  {accent}
                </TextEffect>
                <span
                  aria-hidden
                  className="landing-hero-word-shimmer pointer-events-none absolute right-0 left-0 h-[3px] rounded-full !bottom-[0.04em]"
                />
              </span>
              .
            </span>
          </>
        )}
      </span>
    </h2>
  )
}
