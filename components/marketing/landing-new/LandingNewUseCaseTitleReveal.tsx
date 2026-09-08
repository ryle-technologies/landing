"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"

const WORD_STAGGER_S = 0.028
const WORD_DURATION_S = 0.16
const WORD_EASE = [0.22, 1, 0.36, 1] as const
const EXIT_DURATION_S = 0.14
const EXIT_EASE = [0.4, 0, 1, 1] as const

const wordVariants = {
  hidden: {
    opacity: 0,
    y: "0.35em",
    filter: "blur(4px)",
  },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: WORD_DURATION_S,
      ease: WORD_EASE,
      delay: index * WORD_STAGGER_S,
    },
  }),
  exit: (index: number) => ({
    opacity: 0,
    y: "-0.35em",
    filter: "blur(4px)",
    transition: {
      duration: EXIT_DURATION_S,
      ease: EXIT_EASE,
      delay: index * WORD_STAGGER_S,
    },
  }),
}

function titleWords(label: string) {
  return label.trim().split(/\s+/).filter(Boolean)
}

export function useCaseTitleRevealMs(label: string) {
  const n = titleWords(label).length
  return Math.round(
    (EXIT_DURATION_S + WORD_STAGGER_S * Math.max(0, n - 1)) * 1000,
  )
}

type LandingNewUseCaseTitleRevealProps = {
  label: string
  /** True while the expanded card is showing copy. */
  active: boolean
}

/**
 * Per-word blur, same motion as the hero headline words.
 * Plays once when the title appears, and again (exit) before collapse.
 */
export function LandingNewUseCaseTitleReveal({
  label,
  active,
}: LandingNewUseCaseTitleRevealProps) {
  const reduceMotion = useReducedMotion() ?? false
  const [phase, setPhase] = useState<"hidden" | "show" | "exit">("hidden")
  const words = useMemo(() => titleWords(label), [label])

  useEffect(() => {
    if (reduceMotion) return
    if (active) {
      setPhase("show")
      return
    }
    setPhase((prev) => (prev === "show" ? "exit" : prev))
  }, [active, reduceMotion])

  if (reduceMotion) return <>{label}</>

  return (
    <motion.span className="inline" initial="hidden" animate={phase}>
      {words.map((word, index) => (
        <span key={`${index}-${word}`}>
          {index > 0 ? " " : null}
          <motion.span
            className="inline-block whitespace-nowrap"
            custom={index}
            variants={wordVariants}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
