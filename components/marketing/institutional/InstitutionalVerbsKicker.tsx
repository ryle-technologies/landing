"use client"

import { Fragment, useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { kickerClassName } from "@/components/marketing/institutional/styles"
import { usePageVisible } from "@/lib/usePageVisible"

const HOLD_MS = 1800

/**
 * Hero kicker: the four things the firm does with an asset. One verb is lit
 * at a time, in order; the same words close the page in the footer marquee.
 */
export function InstitutionalVerbsKicker({
  verbs,
  className = "",
}: {
  verbs: readonly string[]
  className?: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const pageVisible = usePageVisible()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion || !pageVisible || verbs.length < 2) return
    const id = window.setInterval(() => {
      setActive((index) => (index + 1) % verbs.length)
    }, HOLD_MS)
    return () => window.clearInterval(id)
  }, [pageVisible, reduceMotion, verbs.length])

  return (
    <p className={`${kickerClassName} ${className}`}>
      <span className="sr-only">{verbs.join(", ")}</span>
      <span aria-hidden className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {verbs.map((verb, index) => (
          <Fragment key={verb}>
            {index > 0 ? <span className="text-muted-light">·</span> : null}
            <span
              className="text-foreground transition-opacity duration-500 ease-out"
              style={{
                opacity: reduceMotion ? 0.6 : index === active ? 1 : 0.38,
              }}
            >
              {verb}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  )
}
