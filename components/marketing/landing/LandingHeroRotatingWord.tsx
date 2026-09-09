"use client"

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { useLayoutEffect, useRef, useState } from "react"
import {
  HERO_LETTER_DURATION_S,
  HERO_LETTER_STAGGER_S,
  HERO_UNDERLINE_DURATION_S,
  HERO_UNDERLINE_EASE,
  HERO_UNDERLINE_PAUSE_S,
  landingHeroLettersDoneS,
} from "@/lib/landingHeroIntro"

const LETTER_STAGGER_S = HERO_LETTER_STAGGER_S
const LETTER_DURATION_S = HERO_LETTER_DURATION_S
const WIDTH_DURATION_S = 0.5
const LETTER_EASE = [0.22, 1, 0.36, 1] as const
/** Gentler than the letters so the slot (and trailing period) travels with the stagger. */
const WIDTH_EASE = [0.33, 1, 0.68, 1] as const

const letterVariants = {
  hidden: {
    opacity: 0,
    y: "0.35em",
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: LETTER_DURATION_S,
      ease: LETTER_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: "-0.35em",
    filter: "blur(4px)",
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
}

type LandingHeroRotatingWordProps = {
  word: string
  /** Delay the first letter entrance so it lands with the headline reveal. */
  enterDelay?: number
  /** Headline prefix; used to time the first underline until letters are in. */
  prefix?: string
  /**
   * Snap the slot to the sizer again when this changes (e.g. the parent
   * fitted a new `font-size` after first paint). Word morphs still ease.
   */
  remeasureKey?: unknown
}

/**
 * x.ai-style last-word morph: letters blur/slide, the slot width eases,
 * and a rainbow underline shimmers once per word.
 *
 * The slot (width, underline, shimmer) follows `displayedWord`, which only
 * catches up with `word` once the outgoing letters have finished exiting.
 * Otherwise the slot would jump to the new word's size — dragging the
 * period and underline with it — while the old letters are still leaving.
 */
export function LandingHeroRotatingWord({
  word,
  enterDelay = 0,
  prefix = "",
  remeasureKey,
}: LandingHeroRotatingWordProps) {
  const reduceMotion = useReducedMotion()
  const sizerRef = useRef<HTMLSpanElement>(null)
  const latestWordRef = useRef(word)
  const [hasShown, setHasShown] = useState(false)
  const [displayedWord, setDisplayedWord] = useState(word)
  const [underlineReady, setUnderlineReady] = useState(false)
  const underlineRight = useMotionValue(0)
  const underlineClipPath = useTransform(
    underlineRight,
    (right) => `inset(0 ${100 - right}% 0 0)`,
  )
  /*
   * Driven imperatively (not via `animate` prop) so an explicit inline width
   * is always written after the first measurement. If the first target equals
   * the natural width, motion skips the write, the slot stays `auto`, and the
   * next word would snap to its full width instead of easing.
   */
  const slotWidth = useMotionValue<number | string>("auto")

  const isExiting = displayedWord !== word

  useLayoutEffect(() => {
    latestWordRef.current = word
  }, [word])

  useLayoutEffect(() => {
    const node = sizerRef.current
    if (!node) {
      return
    }
    const nextWidth = Math.ceil(node.getBoundingClientRect().width)
    if (nextWidth <= 0) {
      return
    }
    if (typeof slotWidth.get() !== "number") {
      slotWidth.set(nextWidth)
      return
    }
    const controls = animate(slotWidth, nextWidth, {
      duration: WIDTH_DURATION_S,
      ease: WIDTH_EASE,
    })
    return () => controls.stop()
  }, [displayedWord, slotWidth])

  useLayoutEffect(() => {
    const node = sizerRef.current
    if (!node) {
      return
    }
    const nextWidth = Math.ceil(node.getBoundingClientRect().width)
    if (nextWidth > 0) {
      slotWidth.set(nextWidth)
    }
  }, [remeasureKey, slotWidth])

  useLayoutEffect(() => {
    const node = sizerRef.current
    if (!node) {
      return
    }
    const snap = () => {
      const nextWidth = Math.ceil(node.getBoundingClientRect().width)
      if (nextWidth > 0) {
        slotWidth.set(nextWidth)
      }
    }
    let lastFontPx = parseFloat(getComputedStyle(node).fontSize)
    const onFontBoxChange = () => {
      const fontPx = parseFloat(getComputedStyle(node).fontSize)
      if (!Number.isFinite(fontPx) || fontPx === lastFontPx) {
        return
      }
      lastFontPx = fontPx
      snap()
    }
    const ro = new ResizeObserver(onFontBoxChange)
    ro.observe(node)
    const fonts = document.fonts?.ready.then(() => {
      lastFontPx = parseFloat(getComputedStyle(node).fontSize)
      snap()
    })
    return () => {
      ro.disconnect()
      void fonts
    }
  }, [slotWidth])

  useLayoutEffect(() => {
    if (reduceMotion || underlineReady) {
      return
    }

    underlineRight.set(0)
    const underlineAtMs =
      (landingHeroLettersDoneS(prefix, displayedWord) +
        HERO_UNDERLINE_PAUSE_S) *
      1000

    let cancelled = false
    let drawControls: ReturnType<typeof animate> | undefined
    const startId = window.setTimeout(() => {
      drawControls = animate(underlineRight, 100, {
        duration: HERO_UNDERLINE_DURATION_S,
        ease: HERO_UNDERLINE_EASE,
      })
      void drawControls.then(() => {
        if (!cancelled) {
          setUnderlineReady(true)
        }
      })
    }, underlineAtMs)

    return () => {
      cancelled = true
      window.clearTimeout(startId)
      drawControls?.stop()
    }
  }, [displayedWord, prefix, reduceMotion, underlineReady, underlineRight])

  if (reduceMotion) {
    return <span className="whitespace-nowrap">{word}</span>
  }

  return (
    <span
      className="relative inline-block align-bottom"
      style={{ verticalAlign: "bottom" }}
    >
      <span
        ref={sizerRef}
        aria-hidden
        className="invisible absolute whitespace-nowrap"
      >
        {Array.from(displayedWord).map((letter, index) => (
          <span key={`${displayedWord}-${index}`} className="inline-block">
            {letter}
          </span>
        ))}
      </span>
      <motion.span
        className="inline-block"
        style={{ clipPath: "inset(-0.55em -0.4em)", width: slotWidth }}
      >
        <AnimatePresence
          mode="wait"
          onExitComplete={() => setDisplayedWord(latestWordRef.current)}
        >
          {!isExiting && (
            <motion.span
              key={displayedWord}
              className="whitespace-nowrap"
              initial="hidden"
              animate="show"
              exit="exit"
              onAnimationComplete={() => setHasShown(true)}
              variants={{
                show: {
                  transition: {
                    staggerChildren: LETTER_STAGGER_S,
                    delayChildren: hasShown ? 0 : enterDelay,
                  },
                },
                exit: {
                  transition: {
                    staggerChildren: LETTER_STAGGER_S,
                  },
                },
              }}
            >
              {Array.from(displayedWord).map((letter, index) => (
                <motion.span
                  key={`${displayedWord}-${index}`}
                  className="inline-block"
                  variants={letterVariants}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
      <motion.span
        key={underlineReady ? displayedWord : "intro"}
        aria-hidden
        className={[
          "landing-hero-word-shimmer pointer-events-none absolute right-0 left-0 h-[3px] rounded-full !bottom-[0.04em]",
          underlineReady
            ? "landing-hero-underline-play"
            : "landing-hero-underline-wait",
        ].join(" ")}
        style={underlineReady ? undefined : { clipPath: underlineClipPath }}
      />
    </span>
  )
}
