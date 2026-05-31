"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

const ROTATING_SENTENCES = [
  "Institutional tokenization",
  "Launching stablecoin products",
  "Building with regulated issuers",
  "Private B2B rails",
  "Private tokenized funds",
  "Confidential stablecoin rails",
  "Enterprise onchain programs",
] as const

const SENTENCE_COUNT = ROTATING_SENTENCES.length

/** Matches {@link LandingHomeOrbitNetworkNames} idle interval. */
const ROTATE_MS = 4500

type LandingHomeIssuerPromptRotatorProps = {
  /** Matches the suite section `h2` (e.g. {@link buildingNewTitleClassName}). */
  titleClassName: string
}

/** Opacity only — matches {@link LandingHomeOrbitNetworkNames}. */
const sentenceFadeTransition = {
  duration: 1.35,
  ease: [0.42, 0, 0.58, 1] as const,
}

function RotatingSentenceSlot({ sentence }: { sentence: string }) {
  return (
    <span className="relative inline-flex min-w-0 w-full items-baseline">
      <span className="relative flex min-w-0 w-full items-end">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={sentence}
            className="block w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sentenceFadeTransition}
          >
            {sentence}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

/** Rotating marketing prompts above the suite heading (opacity crossfade). */
export function LandingHomeIssuerPromptRotator({
  titleClassName,
}: LandingHomeIssuerPromptRotatorProps) {
  const reduceMotion = useReducedMotion()
  const [sentenceIndex, setSentenceIndex] = useState(0)

  const visibleSentence = ROTATING_SENTENCES[sentenceIndex]

  useEffect(() => {
    if (reduceMotion) return

    const id = window.setTimeout(() => {
      setSentenceIndex((i) => (i + 1) % SENTENCE_COUNT)
    }, ROTATE_MS)

    return () => window.clearTimeout(id)
  }, [sentenceIndex, reduceMotion])

  useEffect(() => {
    if (!reduceMotion) return

    const id = window.setInterval(() => {
      setSentenceIndex((i) => (i + 1) % SENTENCE_COUNT)
    }, ROTATE_MS)

    return () => window.clearInterval(id)
  }, [reduceMotion])

  const promptClass = `${titleClassName} mb-4 min-h-[1.2em] min-w-0 max-w-full sm:mb-6`

  if (reduceMotion) {
    return (
      <p className={promptClass} aria-live="polite">
        {visibleSentence}
      </p>
    )
  }

  return (
    <p className={promptClass} aria-live="polite" aria-atomic="true">
      <span className="sr-only">{visibleSentence}</span>
      <span aria-hidden className="inline-flex w-full min-w-0 items-baseline">
        <RotatingSentenceSlot sentence={visibleSentence} />
      </span>
    </p>
  )
}
