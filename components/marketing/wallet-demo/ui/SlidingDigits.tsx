"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"

const DIGIT_EASE = [0.25, 0.1, 0.25, 1] as const

function digitFontSize(len: number): string {
  if (len <= 5) return "text-[80px]"
  if (len <= 7) return "text-[64px]"
  return "text-[52px]"
}

/** Each character of the amount string is an individually animated slot. */
export function SlidingDigits({
  value,
  hasAmount,
  reduceMotion,
}: {
  value: string
  hasAmount: boolean
  reduceMotion: boolean
}) {
  const currentLen = hasAmount ? value.length : 0
  const [[prevLen, growing], setPrevState] = useState<[number, boolean]>([0, true])
  if (currentLen !== prevLen) {
    setPrevState([currentLen, currentLen >= prevLen])
  }

  const enterY = reduceMotion ? 0 : growing ? 22 : -22
  const exitY = reduceMotion ? 0 : growing ? -22 : 22
  const dur = reduceMotion ? 0 : 0.14
  const fontSize = digitFontSize(hasAmount ? value.length : 1)

  if (!hasAmount) {
    return (
      <span
        className={`inline-block ${fontSize} font-medium leading-none tracking-[-0.04em] text-muted-light tabular-nums`}
      >
        0
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-baseline overflow-hidden ${fontSize} font-medium leading-none tracking-[-0.04em] text-foreground tabular-nums`}
      aria-label={value}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {[...value].map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            initial={{ opacity: 0, y: enterY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: exitY }}
            transition={{ duration: dur, ease: DIGIT_EASE }}
            style={{ display: "inline-block" }}
            aria-hidden
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

export function nextAmountForKey(
  amount: string,
  key: string,
  maxFrac = 2,
): string | null {
  if (key === "⌫") {
    return amount.slice(0, -1)
  }
  if (key === ".") {
    if (amount.includes(".")) return null
    return `${amount || "0"}.`
  }
  if (!/^\d$/.test(key)) return null

  const next = amount === "0" ? key : amount + key
  const parts = next.split(".")
  if (parts[1]?.length > maxFrac) return null
  if (parts[0].length > 7) return null
  return next
}
