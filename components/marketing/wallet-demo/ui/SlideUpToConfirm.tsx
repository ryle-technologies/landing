"use client"

import {
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from "react"
import { AnimatePresence, animate, motion, motionValue, useTransform, type MotionValue } from "motion/react"
import { LuChevronUp, LuCircleX } from "react-icons/lu"
import { useWalletDemoShell } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import { Spinner } from "@/components/marketing/wallet-demo/ui/primitives"

/** Upward drag past this fraction of the phone height confirms. */
const SLIDE_COMPLETE_RATIO = 0.5
/** Drag distance over which the blur / chevron effects reach full strength. */
const VISUAL_EFFECT_DISTANCE_PX = 140
/** Fallback when the phone frame isn't measurable yet. */
const DEFAULT_FRAME_HEIGHT = 844

/** Keeps empty / ready / blocked strips the same height so the layout doesn't jump. */
const STRIP_MIN_H = "min-h-[9.75rem]"

const easeSwipe = [0.25, 0.1, 0.25, 1] as const

/** Stacked chevrons scrolling upward (masked). Motion lives in `globals.css`. */
function SwipeChevronMarquee() {
  const strip = (id: "a" | "b") => (
    <div className="flex flex-col items-center gap-0 -space-y-2 py-0">
      {[0, 1, 2].map((i) => (
        <span key={`${id}-${i}`} className="flex shrink-0 justify-center">
          <LuChevronUp strokeWidth={2} className="h-5 w-5 text-muted-light" aria-hidden />
        </span>
      ))}
    </div>
  )
  return (
    <div className="swipe-chevron-marquee-viewport relative mx-auto h-8 w-6 overflow-hidden">
      <div className="swipe-chevron-marquee-track flex flex-col items-stretch">
        {strip("a")}
        {strip("b")}
      </div>
    </div>
  )
}

export interface SlideUpToConfirmProps {
  disabled: boolean
  pending: boolean
  onComplete: () => void | Promise<void>
  /** Sheet translateY driven by the drag (the whole step lifts with the finger). */
  sheetY?: MotionValue<number>
  /** 0..1 drag progress used by the sheet for its backdrop blur. */
  contentProgress?: MotionValue<number>
  hasAmountEntered: boolean
  emptyMessage: string
  dragMessage: string
  /** Insufficient balance etc. — strip shows an error instead of the swipe hint. */
  blockingMessage: string | null
  /** Optional line under the drag hint (e.g. rate disclosure). */
  detailLine?: string
  reduceMotion: boolean
  /** Prefix for stable aria ids across instances. */
  idPrefix: string
}

/**
 * Vertical slide-up gesture that confirms an amount step (send, swap). Ported
 * from the wallet; pointer deltas are converted into the phone's unscaled
 * coordinate space so the gesture feels identical at any render scale.
 */
export function SlideUpToConfirm({
  disabled,
  pending,
  onComplete,
  sheetY,
  contentProgress,
  hasAmountEntered,
  emptyMessage,
  dragMessage,
  blockingMessage,
  detailLine,
  reduceMotion,
  idPrefix,
}: SlideUpToConfirmProps) {
  const shell = useWalletDemoShell()
  const emptyId = `${idPrefix}-swipe-hint-empty`
  const blockedId = `${idPrefix}-swipe-blocked`
  const hintId = `${idPrefix}-swipe-hint`
  const detailId = `${idPrefix}-swipe-detail`
  const hasDetail = detailLine != null && detailLine.trim() !== ""

  const dragStartYRef = useRef<number | null>(null)
  const latestYRef = useRef(0)
  /** Prevents duplicate `onComplete` and re-entry while async work runs. */
  const completingRef = useRef(false)

  const fallbackProgress = useMemo(() => motionValue(0), [])
  const progress = contentProgress ?? fallbackProgress
  const chevronBlur = useTransform(progress, (v) =>
    reduceMotion ? "blur(0px)" : `blur(${Math.min(12, Math.round(v * 12))}px)`,
  )

  const frameHeight = () => shell?.offsetHeight || DEFAULT_FRAME_HEIGHT
  /** Screen px → phone px. */
  const frameScale = () => {
    if (!shell) return 1
    const h = shell.offsetHeight
    return h ? shell.getBoundingClientRect().height / h || 1 : 1
  }

  const setSheetOffset = useCallback(
    (nextY: number) => {
      latestYRef.current = nextY
      sheetY?.set(nextY)
      progress.set(Math.min(1, Math.max(0, Math.abs(nextY) / VISUAL_EFFECT_DISTANCE_PX)))
    },
    [progress, sheetY],
  )

  const reset = useCallback(() => {
    latestYRef.current = 0
    progress.set(0)
    if (sheetY) void animate(sheetY, 0, { type: "spring", stiffness: 420, damping: 38 })
  }, [progress, sheetY])

  const complete = useCallback(async () => {
    if (completingRef.current) return
    completingRef.current = true
    const h = frameHeight()
    try {
      if (sheetY) {
        if (reduceMotion) {
          sheetY.set(-h)
        } else {
          await animate(sheetY, -h, { duration: 0.3, ease: [0.32, 0.72, 0, 1] })
        }
      }
      await onComplete()
    } finally {
      latestYRef.current = 0
      progress.set(0)
      sheetY?.set(0)
      completingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- frameHeight reads the shell lazily
  }, [onComplete, progress, reduceMotion, sheetY, shell])

  const locked = disabled || pending || completingRef.current

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (locked) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Synthetic pointers (scripted demo) have no active pointer to capture.
    }
    dragStartYRef.current = event.clientY
    latestYRef.current = 0
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartYRef.current == null || locked) return
    const deltaY = (event.clientY - dragStartYRef.current) / frameScale()
    setSheetOffset(Math.max(-frameHeight(), Math.min(0, deltaY)))
  }

  const handlePointerEnd = () => {
    if (dragStartYRef.current == null) return
    dragStartYRef.current = null
    if (locked) {
      reset()
      return
    }
    if (latestYRef.current <= -frameHeight() * SLIDE_COMPLETE_RATIO) {
      void complete()
      return
    }
    reset()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (locked) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      void complete()
    }
  }

  const groupVariants = {
    show: { transition: reduceMotion ? { duration: 0 } : { staggerChildren: 0.045 } },
    leave: {
      transition: reduceMotion ? { duration: 0 } : { staggerChildren: 0.06, staggerDirection: -1 },
    },
  }
  const chevronVariants = {
    show: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : { duration: 0.22, ease: easeSwipe } },
    exit: reduceMotion
      ? { opacity: 0, y: 0, transition: { duration: 0 } }
      : { opacity: 0, y: 12, transition: { duration: 0.2, ease: easeSwipe } },
  }
  const hintVariants = {
    show: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    enter: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.18, delay: 0.04, ease: easeSwipe },
    },
    exit: reduceMotion
      ? { opacity: 0, y: 0, transition: { duration: 0 } }
      : { opacity: 0, y: 10, transition: { duration: 0.14, ease: easeSwipe } },
  }
  const emptyVariants = {
    initial: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : { duration: 0.26, ease: easeSwipe } },
    exit: reduceMotion
      ? { opacity: 1, y: 0, transition: { duration: 0 } }
      : { opacity: 0, y: -12, transition: { duration: 0.22, ease: easeSwipe } },
  }

  return (
    <div className="relative flex w-full min-w-0 shrink-0 flex-col items-center self-stretch bg-transparent px-6 pt-0">
      <AnimatePresence mode="wait" initial={false}>
        {!hasAmountEntered ? (
          <motion.div
            key="swipe-empty"
            className={`flex w-full max-w-[min(100%,22rem)] flex-col items-center gap-3 px-5 pb-6 pt-3 ${STRIP_MIN_H}`}
            variants={emptyVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {/* Reserve the chevron row's slot so the hint doesn't jump when it appears. */}
            <div className="flex min-h-10 min-w-10 shrink-0 items-center justify-center px-2" aria-hidden />
            <p
              id={emptyId}
              className="flex w-full flex-1 flex-col justify-center px-2 text-center text-base font-medium leading-snug tracking-[-0.01em]"
              aria-live="polite"
            >
              <span className="quote-shimmer-text">{emptyMessage}</span>
            </p>
          </motion.div>
        ) : blockingMessage ? (
          <motion.div
            key="swipe-blocked"
            className={`flex w-full max-w-[min(100%,22rem)] flex-col items-center gap-3 px-5 pb-6 pt-3 ${STRIP_MIN_H}`}
            variants={groupVariants}
            initial="show"
            animate="show"
            exit="leave"
          >
            <motion.div
              variants={chevronVariants}
              initial="show"
              animate="enter"
              exit="exit"
              className="relative flex min-h-10 min-w-10 items-center justify-center px-1.5"
              aria-hidden
            >
              <LuCircleX strokeWidth={2} className="h-5 w-5 shrink-0 text-[#FF3B30]" />
            </motion.div>
            <motion.p
              id={blockedId}
              role="status"
              className="max-w-[20rem] px-2 pb-1 text-center text-base font-medium leading-snug tracking-[-0.01em] text-[#FF3B30]"
              aria-live="polite"
              variants={hintVariants}
              initial="show"
              animate="enter"
              exit="exit"
            >
              {blockingMessage}
            </motion.p>
          </motion.div>
        ) : (
          <motion.button
            key="swipe-ready"
            type="button"
            data-demo-target="swipe-confirm"
            disabled={disabled || pending}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
            onKeyDown={handleKeyDown}
            tabIndex={disabled || pending ? -1 : 0}
            aria-labelledby={hintId}
            aria-describedby={hasDetail ? detailId : undefined}
            variants={groupVariants}
            initial="show"
            animate="show"
            exit="leave"
            className={`relative flex w-full max-w-[min(100%,22rem)] touch-none flex-col items-center justify-center gap-3 rounded-none bg-transparent px-5 pb-6 pt-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 active:cursor-grabbing ${STRIP_MIN_H} ${
              disabled ? "cursor-not-allowed opacity-35" : "cursor-grab"
            }`}
          >
            <motion.span
              variants={chevronVariants}
              initial="show"
              animate="enter"
              exit="exit"
              className="flex min-h-10 min-w-10 shrink-0 items-center justify-center px-2"
              aria-hidden
            >
              <motion.span className="inline-flex items-center justify-center" style={{ filter: chevronBlur }}>
                {pending ? (
                  <Spinner size="sm" />
                ) : !disabled && !reduceMotion ? (
                  <SwipeChevronMarquee />
                ) : (
                  <LuChevronUp strokeWidth={2} className="h-5 w-5 text-muted-light" aria-hidden />
                )}
              </motion.span>
            </motion.span>
            <motion.span
              id={hintId}
              variants={hintVariants}
              initial="show"
              animate="enter"
              exit="exit"
              className="block max-w-[20rem] px-2 text-center text-base font-medium leading-snug tracking-[-0.01em]"
              aria-live="polite"
            >
              <span className="quote-shimmer-text">{dragMessage}</span>
            </motion.span>
            {hasDetail ? (
              <motion.span
                id={detailId}
                variants={hintVariants}
                initial="show"
                animate="enter"
                exit="exit"
                className="mt-2 block max-w-[20rem] px-2 pb-0.5 text-center text-sm font-normal leading-tight tracking-[-0.01em] text-muted"
              >
                {detailLine}
              </motion.span>
            ) : null}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
