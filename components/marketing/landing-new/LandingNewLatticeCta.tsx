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
import { LandingHomeChainsMarquee } from "@/components/marketing/landing/LandingHomeChainsMarquee"
import { LandingHomeHeroFadeUp } from "@/components/marketing/landing/LandingHomeHeroFadeUp"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import {
  HOME_ACTION_CHIP_SURFACE_STYLE,
  MOVEMENT_ACTION_ICONS,
} from "@/components/marketing/wallet-demo/ui/primitives"
import { LATTICE_CELL_PX } from "@/lib/landingLattice"
import {
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CONTACT_HREF,
} from "@/lib/siteNav"

/** Fade-in delay matching the previous hero pill. */
const HERO_CTA_FADE_DELAY_S = 1.1

const SUPPORTED_NETWORKS_LABEL = "Supported Networks: "

const SendIcon = MOVEMENT_ACTION_ICONS.send

const CHIP_SURFACE_CLASS =
  "flex w-fit flex-row items-center gap-2 rounded-2xl border border-transparent px-5 text-left text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle] [transform:translateZ(0)]"

const CTA_LETTER_STAGGER_S = 0.02
const CTA_LETTER_EASE = [0.22, 1, 0.36, 1] as const

/** Same px travel for icon and letters so the row does not tilt. */
const CTA_LETTER_Y_PX = 7

const ctaLetterVariants = {
  hidden: {
    opacity: 0,
    y: CTA_LETTER_Y_PX,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: CTA_LETTER_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -CTA_LETTER_Y_PX,
    filter: "blur(4px)",
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
}

const letterStagger = {
  show: {
    transition: { staggerChildren: CTA_LETTER_STAGGER_S },
  },
  exit: {
    transition: { staggerChildren: CTA_LETTER_STAGGER_S },
  },
}

const CTA_LABEL_CLASS =
  "whitespace-nowrap text-[19px] font-medium leading-none tracking-[-0.01em]"

const UNDERLINE_EASE = [0.22, 1, 0.36, 1] as const
const UNDERLINE_DURATION_S = 0.5

function CtaUnderline({ active }: { active: boolean }) {
  const left = useMotionValue(0)
  const right = useMotionValue(0)
  const clipPath = useTransform(
    [left, right],
    ([leftEdge, rightEdge]: number[]) =>
      `inset(0 ${100 - rightEdge}% 0 ${leftEdge}%)`,
  )

  useLayoutEffect(() => {
    if (active) {
      left.set(0)
      right.set(0)
      const controls = animate(right, 100, {
        duration: UNDERLINE_DURATION_S,
        ease: UNDERLINE_EASE,
      })
      return () => controls.stop()
    }
    const shown = right.get()
    if (shown <= 0.5) {
      return
    }
    const controls = animate(left, shown, {
      duration: UNDERLINE_DURATION_S,
      ease: UNDERLINE_EASE,
    })
    return () => controls.stop()
  }, [active, left, right])

  return (
    <motion.span
      aria-hidden
      className="landing-hero-word-shimmer pointer-events-none absolute inset-x-0 -bottom-px h-[2px] rounded-full"
      style={{ clipPath }}
    />
  )
}

/** Same letter morph as the hero rotating word; plays once per hover. */
function LandingNewCtaSwap({
  label,
  cycle,
  hovered,
}: {
  label: string
  cycle: number
  hovered: boolean
}) {
  const [displayedCycle, setDisplayedCycle] = useState(cycle)
  const latestCycleRef = useRef(cycle)

  useLayoutEffect(() => {
    latestCycleRef.current = cycle
  }, [cycle])

  const isExiting = displayedCycle !== cycle

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => setDisplayedCycle(latestCycleRef.current)}
    >
      {!isExiting && (
        <motion.span
          key={displayedCycle}
          className="relative flex flex-row items-center gap-2"
          initial={displayedCycle === 0 ? false : "hidden"}
          animate="show"
          exit="exit"
          variants={letterStagger}
        >
          <motion.span className="block shrink-0" variants={ctaLetterVariants}>
            <SendIcon className="block shrink-0" size={18} aria-hidden />
          </motion.span>
          <span className={CTA_LABEL_CLASS}>
            {Array.from(label).map((letter, index) => (
              <motion.span
                key={`${displayedCycle}-${index}`}
                className="inline-block align-bottom"
                variants={ctaLetterVariants}
              >
                {letter === " " ? "\u00a0" : letter}
              </motion.span>
            ))}
          </span>
          {displayedCycle > 0 ? <CtaUnderline active={hovered} /> : null}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

/**
 * Wallet Send chrome, one lattice cell tall (64px). Width hugs the label.
 */
export function LandingNewLatticeCta({
  label,
  href = LANDING_MARKETING_CONTACT_HREF,
  className = "",
}: {
  label: string
  href?: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const [cycle, setCycle] = useState(0)
  const [hovered, setHovered] = useState(false)
  const hoverLockedRef = useRef(false)

  const onPointerEnter = () => {
    if (!hoverLockedRef.current) {
      hoverLockedRef.current = true
      setCycle((current) => current + 1)
    }
    setHovered(true)
  }

  return (
    <a
      href={href}
      className={`shrink-0 cursor-pointer! [&_*]:cursor-pointer! transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${className}`}
      aria-label={label}
      onPointerEnter={reduceMotion ? undefined : onPointerEnter}
      onPointerLeave={
        reduceMotion
          ? undefined
          : () => {
              hoverLockedRef.current = false
              setHovered(false)
            }
      }
      {...landingMarketingCtaAnchorProps(href)}
    >
      <span
        className={`relative ${CHIP_SURFACE_CLASS}`}
        style={{ ...HOME_ACTION_CHIP_SURFACE_STYLE, height: LATTICE_CELL_PX }}
      >
        {reduceMotion ? (
          <>
            <SendIcon className="block shrink-0" size={18} aria-hidden />
            <span className={CTA_LABEL_CLASS}>{label}</span>
          </>
        ) : (
          <>
            <SendIcon className="invisible block shrink-0" size={18} aria-hidden />
            <span className={`invisible ${CTA_LABEL_CLASS}`}>{label}</span>
            <span className="pointer-events-none absolute inset-0 flex flex-row items-center overflow-hidden rounded-2xl px-5">
              <LandingNewCtaSwap
                label={label}
                cycle={cycle}
                hovered={hovered}
              />
            </span>
          </>
        )}
      </span>
    </a>
  )
}

/** CTA on the lattice (closing / possibilities). */
export function LandingNewLatticeCtaCell({
  label,
  href,
  className = "",
}: {
  label: string
  href?: string
  className?: string
}) {
  return (
    <div className={className}>
      <LandingNewLatticeCta label={label} href={href} />
    </div>
  )
}

/** Hero row: 64px-tall CTA, networks on the same lattice line. */
export function LandingNewHeroCtaRow({
  label,
  href,
  delay = HERO_CTA_FADE_DELAY_S,
  className = "",
}: {
  label: string
  href?: string
  delay?: number
  className?: string
}) {
  return (
    <LandingHomeHeroFadeUp delay={delay} className={className}>
      <div className="flex min-w-0 flex-wrap items-stretch">
        <LandingNewLatticeCta label={label} href={href} />
        <LatticePlate inset={false}>
          <div className="flex h-16 items-center gap-2 px-3 sm:gap-2.5 sm:px-4">
            <span className="shrink-0 whitespace-nowrap text-xs font-normal leading-none text-muted-light transition-colors duration-500 ease-out sm:text-[13px]">
              {SUPPORTED_NETWORKS_LABEL}
            </span>
            <LandingHomeChainsMarquee />
          </div>
        </LatticePlate>
      </div>
    </LandingHomeHeroFadeUp>
  )
}
