"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { landingNewHeroDisplayClassName } from "@/lib/landingHeroTypography"

/**
 * Giant figure band cloned from the x.ai Colossus module that sits directly
 * under the hero. Same layout and orange rule — tokens swapped onto this
 * page’s theme. Renders inside the hero `LatticeSection`; the plate snaps
 * itself to the lattice.
 * The figure uses the hero’s owns/creates letter blur plus rainbow underline.
 */

const ACCENT = "rgb(255, 99, 8)"
const FIGURE = "2,000,000"

const LETTER_STAGGER_S = 0.045
const LETTER_DURATION_S = 0.4
const LETTER_EASE = [0.22, 1, 0.36, 1] as const

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
}

function StatFigure() {
  const reduceMotion = useReducedMotion() ?? false
  const wrapRef = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const letters = Array.from(FIGURE)

  return (
    <span
      ref={wrapRef}
      className={`relative inline-block pb-[0.14em] ${landingNewHeroDisplayClassName}`}
    >
      {reduceMotion || !inView ? (
        <span className={inView ? undefined : "opacity-0"}>{FIGURE}</span>
      ) : (
        <motion.span
          className="flex whitespace-nowrap"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: { staggerChildren: LETTER_STAGGER_S },
            },
          }}
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className="inline-block"
              variants={letterVariants}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      )}
      {inView && !reduceMotion ? (
        <span
          aria-hidden
          className="landing-hero-word-shimmer pointer-events-none absolute right-0 left-0 h-[3px] rounded-full !bottom-[0.04em]"
          onAnimationEnd={(event) => {
            event.currentTarget.style.opacity = "0"
          }}
        />
      ) : null}
    </span>
  )
}

export function LandingNewHeroStat({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="2,000,000 USD already passed through our platform"
      className={`relative w-full min-w-0 ${className}`}
    >
      <LatticePlate>
        <div className="flex flex-col items-start gap-8">
          <p className="m-0">
            <StatFigure />
          </p>
          <div className="flex items-center gap-4">
            <div className="h-px w-12 shrink-0" style={{ background: ACCENT }} />
            <p className="text-lg font-medium text-foreground/50">
              USD already passed through our platform
            </p>
          </div>
        </div>
      </LatticePlate>
    </section>
  )
}
