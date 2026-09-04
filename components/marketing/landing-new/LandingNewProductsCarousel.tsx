"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { useReducedMotion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  LANDING_SNAP_HOLD_MS,
  LANDING_SNAP_MS,
  landingSnapEaseInOutCubic,
} from "@/lib/landingSnapMotion"

type EmblaCarouselType = NonNullable<UseEmblaCarouselType[1]>
type EmblaEventType = Parameters<EmblaCarouselType["on"]>[0]
type EmblaEngineType = ReturnType<EmblaCarouselType["internalEngine"]>
type EmblaScrollBodyType = EmblaEngineType["scrollBody"]

export type LandingNewProductsCarouselItem = {
  /** Card title (e.g. "Issuance"). Always visible, even on side cards. */
  label: string
  /** Optional mono badge under the title (e.g. "In design with partners"). */
  badge?: string
  /** Description, revealed only on the centered card. */
  body: string
  /** Optional decorative visual above the title (chains marquee, console…). */
  visual?: ReactNode
  /** Optional CTA rendered under the description on the centered card. */
  cta?: { label: string; href: string; external?: boolean }
}

type LandingNewProductsCarouselProps = {
  items: readonly LandingNewProductsCarouselItem[]
  /** Accessible name for the carousel region. */
  ariaLabel: string
  className?: string
  /** Milliseconds to hold a card before snapping to the next. 0 disables autoplay. */
  autoplayDelayMs?: number
}

/**
 * Reference geometry (pomelo.la "use cases"): 310×400 slides in a flat track;
 * each card is tweened by its distance `d` (in slides) from the centered snap:
 *   transform: scale(1 - 0.2|d|) translateY(-100px * d)
 *   filter:    blur(clamp((|d| - 1.4) * 2.29, 0, 8)px)
 *   opacity:   1 - 0.32 * max(0, |d| - 0.12)
 * The translate is applied after the scale, so the row bends into an arc
 * (right side rises, left side dips) and cards vanish five slides out.
 */
const SCALE_PER_SLIDE = 0.2
const LIFT_PER_SLIDE_RATIO = 100 / 310
const BLUR_START_SLIDES = 1.4
const BLUR_PER_SLIDE_PX = 2.29
const BLUR_MAX_PX = 8
const OPACITY_FADE_START_SLIDES = 0.12
const OPACITY_PER_SLIDE = 0.32
const HOLD_MS = LANDING_SNAP_HOLD_MS
const SNAP_MS = LANDING_SNAP_MS
const TWEEN_EVENTS: EmblaEventType[] = ["reInit", "scroll", "slideFocus", "select"]

/** One timer for the page — survives Strict Mode remounts and HMR stacks. */
let autoplayTimerId = 0

/**
 * Time-based ease-in-out scroll body, swapped into Embla's engine for one
 * programmatic move (same hook Embla's AutoScroll plugin uses). Embla keeps
 * driving `render()`, so loop wrapping stays seamless — unlike animating the
 * container with a CSS transition, which visibly rewinds at loop points.
 */
function createEasedScrollBody(
  engine: EmblaEngineType,
  durationMs: number,
): EmblaScrollBodyType {
  const { location, previousLocation, offsetLocation, target } = engine
  let startTime = -1
  let totalDistance = 0
  let direction = 0
  let done = false

  const self: EmblaScrollBodyType = {
    seek() {
      const now = performance.now()
      if (startTime < 0) {
        startTime = now
        totalDistance = target.get() - location.get()
        direction = Math.sign(totalDistance)
      }
      previousLocation.set(location)
      const t = Math.min(1, (now - startTime) / durationMs)
      // Anchor on `target` so loop wraps (which shift both vectors) stay consistent.
      location.set(target.get() - totalDistance * (1 - landingSnapEaseInOutCubic(t)))
      if (t >= 1) {
        location.set(target)
        done = true
      }
      return self
    },
    settled: () => done && Math.abs(target.get() - offsetLocation.get()) < 0.001,
    duration: () => durationMs,
    direction: () => direction,
    velocity: () => 0,
    useBaseFriction: () => self,
    useBaseDuration: () => self,
    useFriction: () => self,
    useDuration: () => self,
  }
  return self
}

const arrowButtonClassName =
  "absolute top-1/2 z-20 hidden size-[4.5rem] -translate-y-1/2 items-center justify-center rounded-full border border-border-strong text-foreground opacity-50 transition-opacity duration-300 ease-in-out hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:inline-flex lg:size-[5.25rem] [&_svg]:size-6"

const cardTitleClassName =
  "text-center font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]"

const cardBadgeClassName =
  "mt-2 block text-center font-mono text-[11px] uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"

const cardBodyClassName =
  "text-center text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

const cardCtaClassName =
  "inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-[-0.01em] text-foreground transition-[border-color,opacity,color] duration-500 ease-out hover:border-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

export function LandingNewProductsCarousel({
  items,
  ariaLabel,
  className,
  autoplayDelayMs = HOLD_MS,
}: LandingNewProductsCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false
  const autoplayEnabled = autoplayDelayMs > 0 && !reduceMotion
  const defaultBodyRef = useRef<EmblaScrollBodyType | null>(null)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    duration: 25,
  })

  const [selected, setSelected] = useState(0)
  const innerRefs = useRef<(HTMLDivElement | null)[]>([])
  const descRefs = useRef<(HTMLDivElement | null)[]>([])

  const tween = useCallback(
    (api: EmblaCarouselType) => {
      const engine = api.internalEngine()
      const progress = api.scrollProgress()
      const snapList = api.scrollSnapList()
      const count = snapList.length
      const slideWidth = api.slideNodes()[0]?.getBoundingClientRect().width ?? 310
      const lift = slideWidth * LIFT_PER_SLIDE_RATIO

      snapList.forEach((scrollSnap, snapIndex) => {
        let diff = scrollSnap - progress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)
                if (sign === -1) diff = scrollSnap - (1 + progress)
                if (sign === 1) diff = scrollSnap + (1 - progress)
              }
            })
          }

          // `diff` is in scroll-progress units; convert to slide units.
          const d = diff * count
          const dist = Math.abs(d)
          const scale = Math.max(0, 1 - SCALE_PER_SLIDE * dist)
          const blur = Math.min(
            BLUR_MAX_PX,
            Math.max(0, (dist - BLUR_START_SLIDES) * BLUR_PER_SLIDE_PX),
          )
          const opacity =
            scale <= 0
              ? 0
              : Math.max(
                  0,
                  1 - Math.max(0, dist - OPACITY_FADE_START_SLIDES) * OPACITY_PER_SLIDE,
                )

          const inner = innerRefs.current[slideIndex]
          if (inner) {
            inner.style.transform = `scale(${scale}) translateY(${(-lift * d).toFixed(2)}px)`
            inner.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none"
            inner.style.opacity = opacity.toFixed(3)
          }
          const desc = descRefs.current[slideIndex]
          if (desc) desc.style.opacity = dist < 0.5 ? "1" : "0"
        })
      })
    },
    [],
  )

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    onSelect()
    tween(emblaApi)
    emblaApi.on("select", onSelect)
    TWEEN_EVENTS.forEach((evt) => emblaApi.on(evt, tween))
    return () => {
      emblaApi.off("select", onSelect)
      TWEEN_EVENTS.forEach((evt) => emblaApi.off(evt, tween))
    }
  }, [emblaApi, tween])

  // Track Embla's own scroll body so we can hand control back after each eased move.
  useEffect(() => {
    if (!emblaApi) return
    const capture = () => {
      defaultBodyRef.current = emblaApi.internalEngine().scrollBody
    }
    const restore = () => {
      const engine = emblaApi.internalEngine()
      if (defaultBodyRef.current && engine.scrollBody !== defaultBodyRef.current) {
        engine.scrollBody = defaultBodyRef.current
      }
    }
    capture()
    emblaApi.on("reInit", capture)
    emblaApi.on("settle", restore)
    emblaApi.on("pointerDown", restore)
    return () => {
      emblaApi.off("reInit", capture)
      emblaApi.off("settle", restore)
      emblaApi.off("pointerDown", restore)
      restore()
    }
  }, [emblaApi])

  const animateMove = useCallback(
    (action: (api: EmblaCarouselType) => void) => {
      if (!emblaApi) return
      if (reduceMotion) {
        action(emblaApi)
        return
      }
      const engine = emblaApi.internalEngine()
      // `engine.scrollTo` decides start-vs-instant from the original body's duration.
      defaultBodyRef.current?.useBaseFriction().useBaseDuration()
      engine.scrollBody = createEasedScrollBody(engine, SNAP_MS)
      action(emblaApi)
      engine.animation.start()
    },
    [emblaApi, reduceMotion],
  )

  const animateMoveRef = useRef(animateMove)
  useEffect(() => {
    animateMoveRef.current = animateMove
  }, [animateMove])

  // Every move (manual or automatic) restarts the hold, so a click is never
  // followed a moment later by an autoplay advance.
  const armAutoplay = useCallback(() => {
    const arm = () => {
      window.clearTimeout(autoplayTimerId)
      if (!autoplayEnabled) return
      autoplayTimerId = window.setTimeout(() => {
        animateMoveRef.current((api) => api.scrollNext())
        arm()
      }, autoplayDelayMs)
    }
    arm()
  }, [autoplayDelayMs, autoplayEnabled])

  const go = useCallback(
    (action: (api: EmblaCarouselType) => void) => {
      animateMove(action)
      armAutoplay()
    },
    [animateMove, armAutoplay],
  )

  const scrollPrev = useCallback(() => {
    go((api) => api.scrollPrev(reduceMotion))
  }, [go, reduceMotion])
  const scrollNext = useCallback(() => {
    go((api) => api.scrollNext(reduceMotion))
  }, [go, reduceMotion])
  const scrollTo = useCallback(
    (index: number) => {
      go((api) => api.scrollTo(index, reduceMotion))
    },
    [go, reduceMotion],
  )

  useEffect(() => {
    if (!emblaApi) return
    armAutoplay()
    // Dragging counts as interaction too: restart the hold once the drag settles.
    emblaApi.on("pointerUp", armAutoplay)
    return () => {
      emblaApi.off("pointerUp", armAutoplay)
      window.clearTimeout(autoplayTimerId)
    }
  }, [armAutoplay, emblaApi])

  return (
    <div
      className={["relative w-full min-w-0", className ?? ""].join(" ")}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Previous"
          onClick={scrollPrev}
          className={`${arrowButtonClassName} left-0 lg:left-4`}
        >
          <ChevronLeft aria-hidden strokeWidth={1.5} />
        </button>

        {/* Vertical padding leaves room for the arc (cards lift ~40px beyond the slide box). */}
        <div ref={emblaRef} className="overflow-hidden py-14">
          <div className="flex items-center [backface-visibility:hidden] [touch-action:pan-y_pinch-zoom]">
            {items.map((item, index) => {
              const isSelected = index === selected
              return (
                <div
                  key={item.label}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${items.length}: ${item.label}`}
                  aria-hidden={!isSelected}
                  onClick={() => {
                    if (!isSelected) scrollTo(index)
                  }}
                  className="min-w-0 shrink-0 grow-0 basis-[min(65vw,310px)] cursor-pointer select-none"
                  style={{ height: 400 }}
                >
                  <div
                    ref={(el) => {
                      innerRefs.current[index] = el
                    }}
                    className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[color-mix(in_srgb,white_42%,var(--marketing-surface))] px-5 pt-7 pb-8 text-center will-change-transform sm:px-7"
                    style={{ transformOrigin: "50% 50%" }}
                  >
                    {item.visual ? (
                      <div
                        aria-hidden
                        className="relative mb-6 w-full min-w-0 shrink-0 overflow-hidden"
                      >
                        {item.visual}
                      </div>
                    ) : null}
                    <h3 className={cardTitleClassName}>
                      {item.label}
                      {item.badge ? (
                        <span className={cardBadgeClassName}>{item.badge}</span>
                      ) : null}
                    </h3>
                    <div
                      ref={(el) => {
                        descRefs.current[index] = el
                      }}
                      className="mt-3 flex w-full flex-col items-center transition-opacity duration-500 ease-in-out"
                      style={{ opacity: isSelected ? 1 : 0 }}
                    >
                      <p className={cardBodyClassName}>{item.body}</p>
                      {item.cta ? (
                        <a
                          href={item.cta.href}
                          className={`${cardCtaClassName} mt-5`}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={(event) => event.stopPropagation()}
                          {...(item.cta.external
                            ? { target: "_blank", rel: "noreferrer noopener" }
                            : {})}
                        >
                          {item.cta.label}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next"
          onClick={scrollNext}
          className={`${arrowButtonClassName} right-0 lg:right-4`}
        >
          <ChevronRight aria-hidden strokeWidth={1.5} />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Slides"
        className="mt-2 flex shrink-0 items-center justify-center"
      >
        {items.map((item, index) => {
          const isSelected = index === selected
          return (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Go to slide ${index + 1}: ${item.label}`}
              onClick={() => scrollTo(index)}
              className="flex h-6 cursor-pointer items-center px-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <span
                aria-hidden
                className={[
                  "block size-[5px] rounded-full transition-colors duration-300",
                  isSelected ? "bg-foreground" : "bg-foreground/20",
                ].join(" ")}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
