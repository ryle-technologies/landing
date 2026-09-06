"use client"

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react"
import Image from "next/image"
import { Copy } from "lucide-react"
import { useReducedMotion } from "motion/react"

import {
  CONSOLE_PRODUCT_CARDS,
  LandingNewConsoleProductCard,
  type ProductId,
} from "@/components/marketing/landing-new/LandingNewConsoleProductCards"
import {
  LANDING_CONSOLE_HOLD_MS,
  LANDING_SNAP_MS,
} from "@/lib/landingSnapMotion"
import {
  useLandingSnapLoop,
  type LandingSnapLoopControl,
} from "@/lib/useLandingSnapLoop"

const LOOPED_PRODUCT_CARDS = [
  ...CONSOLE_PRODUCT_CARDS,
  ...CONSOLE_PRODUCT_CARDS,
]

type ProductCardsSnapTrackProps = {
  onActiveIdChange: (id: ProductId) => void
  controlRef: MutableRefObject<LandingSnapLoopControl | null>
  viewportRef: RefObject<HTMLDivElement | null>
}

/**
 * One card at a time: hold, then the same ease-in-out snap as the
 * use-case carousel. Two copies so the wrap is seamless.
 */
function ProductCardsSnapTrack({
  onActiveIdChange,
  controlRef,
  viewportRef,
}: ProductCardsSnapTrackProps) {
  const reduceMotion = useReducedMotion() ?? false
  const trackRef = useRef<HTMLDivElement>(null)
  const slotPxRef = useRef(0)

  const measure = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return
    const styles = getComputedStyle(track)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    slotPxRef.current = first.getBoundingClientRect().width + gap
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    if (track.firstElementChild) observer.observe(track.firstElementChild)
    return () => observer.disconnect()
  }, [measure])

  const apply = useCallback((offsetPx: number) => {
    const track = trackRef.current
    if (track) track.style.transform = `translate3d(${-offsetPx}px, 0, 0)`
  }, [])

  const getStepPx = useCallback(() => slotPxRef.current, [])
  const getWrapPx = useCallback(
    () => slotPxRef.current * CONSOLE_PRODUCT_CARDS.length,
    [],
  )

  const handleIndexChange = useCallback(
    (index: number) => {
      const card = CONSOLE_PRODUCT_CARDS[index]
      if (card) onActiveIdChange(card.id)
    },
    [onActiveIdChange],
  )

  useLandingSnapLoop({
    enabled: !reduceMotion,
    getStepPx,
    getWrapPx,
    apply,
    holdMs: LANDING_CONSOLE_HOLD_MS,
    snapMs: LANDING_SNAP_MS,
    onIndexChange: handleIndexChange,
    controlRef,
  })

  return (
    <div
      ref={viewportRef}
      className="relative mt-2.5 -mx-4 overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]"
    >
      <div
        ref={trackRef}
        className="flex w-max gap-3 pl-3 will-change-transform"
      >
        {LOOPED_PRODUCT_CARDS.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            aria-hidden={index >= CONSOLE_PRODUCT_CARDS.length || undefined}
            className="w-[216px] shrink-0"
          >
            <LandingNewConsoleProductCard card={card} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Right column: landscape well, inset chrome window, pills tied to the
 * product cards in the strip.
 */
export function LandingNewConsoleShowcase() {
  const reduceMotion = useReducedMotion() ?? false
  const [activeId, setActiveId] = useState<ProductId>(CONSOLE_PRODUCT_CARDS[0].id)
  const snapControlRef = useRef<LandingSnapLoopControl | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const seekToProduct = useCallback(
    (id: ProductId) => {
      const index = CONSOLE_PRODUCT_CARDS.findIndex((card) => card.id === id)
      if (index < 0) return
      setActiveId(id)

      if (reduceMotion) {
        const viewport = viewportRef.current
        const track = viewport?.firstElementChild as HTMLElement | null
        const first = track?.firstElementChild as HTMLElement | null
        if (!viewport || !track || !first) return
        const styles = getComputedStyle(track)
        const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
        const slot = first.getBoundingClientRect().width + gap
        viewport.scrollTo({ left: index * slot, behavior: "smooth" })
        return
      }

      snapControlRef.current?.seekToIndex(index)
    },
    [reduceMotion],
  )

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-2xl bg-emerald-950">
        <div className="absolute inset-0">
          <Image
            src="/images/landing/console-landscape.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-center"
            priority={false}
          />
        </div>
        <div className="relative p-[10%] sm:p-[12%]">
          <div className="flex flex-col overflow-hidden rounded-[10px] bg-[#fafaf9] shadow-[0_16px_48px_rgba(12,28,16,0.28)]">
            <div className="flex h-8 shrink-0 items-center justify-between px-3">
              <span className="flex items-center gap-[5px]" aria-hidden>
                <span className="size-[10px] rounded-full bg-[#ff5f57]" />
                <span className="size-[10px] rounded-full bg-[#febc2e]" />
                <span className="size-[10px] rounded-full bg-[#28c840]" />
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                <Copy className="size-3" strokeWidth={1.75} />
                Copy
              </span>
            </div>
            <div className="px-4 pb-4 pt-1">
              <p className="text-[11px] font-medium text-neutral-500">
                Products available in your account
              </p>
              <ProductCardsSnapTrack
                onActiveIdChange={setActiveId}
                controlRef={snapControlRef}
                viewportRef={viewportRef}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        role="tablist"
        aria-label="Console products"
        className="mt-3.5 flex flex-wrap items-center gap-x-1 gap-y-1"
      >
        {CONSOLE_PRODUCT_CARDS.map((card) => {
          const selected = card.id === activeId
          return (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => seekToProduct(card.id)}
              className={
                selected
                  ? "rounded-full bg-black/[0.06] px-3 py-1 text-[13px] text-neutral-700 dark:bg-white/10 dark:text-white/80"
                  : "rounded-full px-3 py-1 text-[13px] text-neutral-400 hover:text-neutral-600 dark:text-white/40 dark:hover:text-white/70"
              }
            >
              {card.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
