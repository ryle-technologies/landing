"use client"

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

const sequenceVhPerItem = 110
const springConfig = { stiffness: 120, damping: 26, mass: 0.35 }
const itemEnterDistance = 0.1
const itemResetDistance = 0.24
const LandingScrollItemEnteredContext = createContext<boolean | null>(null)

export function useLandingScrollItemEntered() {
  return useContext(LandingScrollItemEnteredContext)
}

function findScrollContainer(el: HTMLElement | null): HTMLElement | Window {
  let node: HTMLElement | null = el?.parentElement ?? null
  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node)
    if (overflowY === "auto" || overflowY === "scroll") return node
    node = node.parentElement
  }
  return window
}

/**
 * Tall scroll tracks sit above the sticky hero (see `z-10` on the pillars
 * section). The track uses `pointer-events: none` so hero CTAs stay clickable;
 * only each pillar’s content re-enables hit-testing.
 */
export function LandingHomeScrollFadeSequence({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const rawProgress = useMotionValue(0)
  const progress = useSpring(rawProgress, springConfig)
  const items = useMemo(() => Children.toArray(children), [children])

  useEffect(() => {
    if (shouldReduceMotion) return

    const element = ref.current
    if (!element) return

    const scrollContainer = findScrollContainer(element)
    let frame = 0

    const update = () => {
      frame = 0

      const rect = element.getBoundingClientRect()
      const viewportHeight =
        scrollContainer === window
          ? window.innerHeight
          : (scrollContainer as HTMLElement).clientHeight
      const scrollableDistance = Math.max(1, rect.height - viewportHeight)

      rawProgress.set(-rect.top / scrollableDistance)
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    scrollContainer.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      scrollContainer.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [rawProgress, shouldReduceMotion])

  if (shouldReduceMotion) {
    return (
      <div
        className={`pointer-events-none flex min-w-0 flex-col gap-y-56 ${className ?? ""}`}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="pointer-events-auto min-w-0 py-14 sm:py-20"
          >
            {item}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={["pointer-events-none", className].filter(Boolean).join(" ")}
      style={{ height: `${items.length * sequenceVhPerItem}vh` }}
    >
      <div className="pointer-events-none sticky top-0 h-[100svh] min-h-[520px] w-full min-w-0">
        {items.map((item, index) => (
          <SequenceItem
            key={index}
            index={index}
            total={items.length}
            progress={progress}
          >
            {item}
          </SequenceItem>
        ))}
      </div>
    </div>
  )
}

function SequenceItem({
  children,
  index,
  total,
  progress,
}: {
  children: ReactNode
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const center = (index + 0.5) / total
  const [isActive, setIsActive] = useState(
    () => Math.abs(progress.get() - center) <= itemEnterDistance,
  )
  const opacity = useTransform(
    progress,
    [center - 0.22, center - 0.08, center + 0.08, center + 0.22],
    [0, 1, 1, 0],
  )
  const y = useTransform(
    progress,
    [center - 0.22, center, center + 0.22],
    [80, 0, -80],
  )
  const scale = useTransform(
    progress,
    [center - 0.08, center + 0.22],
    [1, 0.95],
  )

  useMotionValueEvent(progress, "change", (value) => {
    const distanceFromCenter = Math.abs(value - center)
    setIsActive((current) => {
      if (current) return distanceFromCenter <= itemResetDistance
      return distanceFromCenter <= itemEnterDistance
    })
  })

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 min-w-0"
      style={{ opacity, scale, y }}
    >
      <div className="box-border flex h-full w-full min-w-0 flex-col items-stretch justify-center pt-[clamp(1rem,4.25vh,2.85rem)] sm:pt-[clamp(1.125rem,5vh,3.25rem)]">
        <LandingScrollItemEnteredContext.Provider value={isActive}>
          <div className="pointer-events-auto w-full min-w-0">{children}</div>
        </LandingScrollItemEnteredContext.Provider>
      </div>
    </motion.div>
  )
}
