"use client"

import { useEffect, useState } from "react"
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
  // Stable source so `useSpring` keeps one spring and rolls between digits.
  // Drive the source — setting the spring itself jumps to the target, then
  // the tape has to catch up (the flash of the final number before the roll).
  const [source] = useState(() => motionValue(valueRoundedToPlace))
  const animatedValue = useSpring(source, TRANSITION)
  const [spacerRef, spacer] = useMeasure({ offsetSize: true })

  useEffect(() => {
    source.set(valueRoundedToPlace)
  }, [source, valueRoundedToPlace])

  return (
    <div className="relative inline-block w-[0.82ch] shrink-0 overflow-x-visible overflow-y-clip text-center leading-none tabular-nums">
      <div ref={spacerRef} className="invisible">
        0
      </div>
      {spacer.height
        ? Array.from({ length: 10 }, (_, i) => (
            <OdometerGlyph
              key={i}
              mv={animatedValue}
              number={i}
              height={spacer.height}
            />
          ))
        : null}
    </div>
  )
}

function OdometerGlyph({
  mv,
  number,
  height,
}: {
  mv: MotionValue<number>
  number: number
  height: number
}) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * height
    if (offset > 5) {
      memo -= 10 * height
    }
    return memo
  })

  return (
    <motion.span
      style={{ y }}
      initial={false}
      className="absolute inset-0 flex items-center justify-center"
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
