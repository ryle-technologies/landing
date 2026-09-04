"use client"

import { useEffect, useId, useState } from "react"
import {
  MotionValue,
  motion,
  motionValue,
  useSpring,
  useTransform,
} from "motion/react"
import useMeasure from "react-use-measure"

const TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 18,
  mass: 0.3,
}

function Digit({ value, place }: { value: number; place: number }) {
  const valueRoundedToPlace = ((Math.floor(value / place) % 10) + 10) % 10
  // One MotionValue per mount so `useSpring` keeps a stable source and rolls.
  const [source] = useState(() => motionValue(valueRoundedToPlace))
  const animatedValue = useSpring(source, TRANSITION)

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace)
  }, [animatedValue, valueRoundedToPlace])

  return (
    <div className="relative inline-block w-[0.82ch] shrink-0 overflow-x-visible overflow-y-clip text-center leading-none tabular-nums">
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <OdometerStack key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  )
}

function OdometerStack({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const uniqueId = useId()
  // offsetSize: ignore ancestor CSS transforms (the phone frame is scaled on desktop).
  const [ref, bounds] = useMeasure({ offsetSize: true })

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * bounds.height
    if (offset > 5) {
      memo -= 10 * bounds.height
    }
    return memo
  })

  if (!bounds.height) {
    return (
      <span ref={ref} className="invisible absolute">
        {number}
      </span>
    )
  }

  return (
    <motion.span
      style={{ y }}
      layoutId={`${uniqueId}-${number}`}
      className="absolute inset-0 flex items-center justify-center"
      transition={TRANSITION}
      ref={ref}
    >
      {number}
    </motion.span>
  )
}

type SlidingNumberProps = {
  /** Display string with `.` as decimal point (e.g. `3750.00`). */
  valueString: string
  thousandSeparator?: string
  decimalSeparator?: string
  className?: string
  integerClassName?: string
  decimalClassName?: string
}

/** Rolling odometer balance (same spring as the private wallet home hero). */
export function SlidingNumber({
  valueString,
  thousandSeparator = "",
  decimalSeparator = ".",
  className,
  integerClassName,
  decimalClassName,
}: SlidingNumberProps) {
  const negative = valueString.startsWith("-")
  const absStr = valueString.replace(/^-/, "")
  const [integerPartRaw, decimalPart = ""] = absStr.split(".")

  const integerValue = parseInt(integerPartRaw, 10) || 0
  const integerDigits = integerPartRaw.split("")
  const integerPlaces = integerDigits.map((_, i) =>
    Math.pow(10, integerDigits.length - i - 1),
  )

  const showDecimals = decimalPart.length > 0
  const decimalValue = parseInt(decimalPart, 10) || 0
  const decimalPlaces = decimalPart
    .split("")
    .map((_, index) => Math.pow(10, Math.max(0, decimalPart.length - index - 1)))

  return (
    <div className={`flex items-center ${className ?? ""}`}>
      <span className={`flex items-center -space-x-[0ch] ${integerClassName ?? ""}`}>
        {negative && <span className="shrink-0">-</span>}
        {integerPlaces.map((place, idx) => {
          const digitsFromRight = integerPlaces.length - idx
          const showGroup =
            Boolean(thousandSeparator) && idx > 0 && digitsFromRight % 3 === 0
          return (
            <span key={`int-${place}`} className="inline-flex items-center">
              {showGroup ? (
                <span className="inline-flex w-[0.35ch] shrink-0 justify-center leading-none tabular-nums">
                  {thousandSeparator}
                </span>
              ) : null}
              <Digit value={integerValue} place={place} />
            </span>
          )
        })}
      </span>
      {showDecimals && (
        <span className={`flex items-center -space-x-[0ch] ${decimalClassName ?? ""}`}>
          <span className="inline-flex w-[0.4ch] shrink-0 justify-center leading-none tabular-nums">
            {decimalSeparator}
          </span>
          {decimalPlaces.map((place) => (
            <Digit key={`frac-${place}`} value={decimalValue} place={place} />
          ))}
        </span>
      )}
    </div>
  )
}
