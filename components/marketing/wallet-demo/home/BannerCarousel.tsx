"use client"

import Image from "next/image"
import React from "react"
import { DEMO_BANNERS, type BannerSlide } from "@/lib/walletDemo/data"

const IMAGE_PX = 72
const RADIUS_PX = 16
const IMAGE_INSET_PX = 4
const IMAGE_CLIP_RADIUS_PX = RADIUS_PX - IMAGE_INSET_PX
const SIDE_PEEK_PX = 14
const GAP_PX = 16
const WIDTH_TRIM_PX = 6
const FIRST_ACTIVE_PADDING_LEFT_PX = 16
const INACTIVE_SCALE = 0.9
const INACTIVE_OPACITY = 0.62
const TRANSITION_MS = 480
const TRANSITION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"
const EDGE_DRAG_RESISTANCE = 0.32
const TOUCH_VERTICAL_DOMINANCE_PX = 14

/**
 * Horizontal banner carousel (white cards, side peek, pointer drag, dots).
 * Direct port of the wallet's home banner (`inline` layout).
 */
export function BannerCarousel({
  slides = DEMO_BANNERS,
  sectionLabel = "For your demo",
}: {
  slides?: readonly BannerSlide[]
  sectionLabel?: string
}) {
  const slideCount = slides.length
  const [current, setCurrent] = React.useState(0)
  const [bannerWidth, setBannerWidth] = React.useState(0)
  const [dragOffsetPx, setDragOffsetPx] = React.useState(0)
  const [isDragGesture, setIsDragGesture] = React.useState(false)
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const currentRef = React.useRef(0)
  const bannerWidthRef = React.useRef(0)
  const gestureStartIndexRef = React.useRef(0)
  const touchStartXRef = React.useRef(0)
  const touchStartYRef = React.useRef(0)
  const axisRef = React.useRef<"none" | "h" | "v">("none")
  const activePointerIdRef = React.useRef<number | null>(null)

  const measure = React.useCallback(() => {
    if (!carouselRef.current) return
    const width = carouselRef.current.getBoundingClientRect().width
    const sidePeek = slideCount > 1 ? SIDE_PEEK_PX : 0
    setBannerWidth(Math.max(0, width - 2 * sidePeek - WIDTH_TRIM_PX))
  }, [slideCount])

  React.useLayoutEffect(() => {
    measure()
    const node = carouselRef.current
    const ro =
      typeof ResizeObserver !== "undefined" && node
        ? new ResizeObserver(() => measure())
        : null
    if (node) ro?.observe(node)
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("resize", measure)
      ro?.disconnect()
    }
  }, [measure])

  React.useLayoutEffect(() => {
    currentRef.current = current
    bannerWidthRef.current = bannerWidth
  }, [current, bannerWidth])

  React.useEffect(() => {
    const el = carouselRef.current
    if (!el || slideCount <= 1) return

    const stride = () => bannerWidthRef.current + GAP_PX

    const applyRubber = (raw: number, startIndex: number) => {
      if (raw > 0 && startIndex === 0) return raw * EDGE_DRAG_RESISTANCE
      if (raw < 0 && startIndex === slideCount - 1) return raw * EDGE_DRAG_RESISTANCE
      return raw
    }

    const releaseCapture = (pointerId: number) => {
      if (el.hasPointerCapture(pointerId)) {
        try {
          el.releasePointerCapture(pointerId)
        } catch {
          /* already released */
        }
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return
      if (activePointerIdRef.current !== null) return
      activePointerIdRef.current = event.pointerId
      axisRef.current = "none"
      gestureStartIndexRef.current = currentRef.current
      touchStartXRef.current = event.clientX
      touchStartYRef.current = event.clientY
      setDragOffsetPx(0)
      setIsDragGesture(false)
      if (event.pointerType === "touch") {
        try {
          el.setPointerCapture(event.pointerId)
        } catch {
          /* unsupported */
        }
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerIdRef.current) return
      const dx = event.clientX - touchStartXRef.current
      const dy = event.clientY - touchStartYRef.current

      if (axisRef.current === "none") {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        if (event.pointerType === "touch") {
          if (Math.abs(dy) >= Math.abs(dx) + TOUCH_VERTICAL_DOMINANCE_PX) {
            activePointerIdRef.current = null
            axisRef.current = "none"
            releaseCapture(event.pointerId)
            return
          }
        } else if (Math.abs(dx) <= Math.abs(dy)) {
          axisRef.current = "v"
          return
        }
        axisRef.current = "h"
        setIsDragGesture(true)
        if (event.pointerType !== "touch") {
          try {
            el.setPointerCapture(event.pointerId)
          } catch {
            /* unsupported */
          }
        }
      }

      if (axisRef.current !== "h") return
      event.preventDefault()
      setDragOffsetPx(applyRubber(dx, gestureStartIndexRef.current))
    }

    const finishPointer = (event: PointerEvent) => {
      if (event.pointerId !== activePointerIdRef.current) return
      releaseCapture(event.pointerId)
      activePointerIdRef.current = null

      if (axisRef.current === "h") {
        const totalDrag = event.clientX - touchStartXRef.current
        const s = stride()
        if (s > 0) {
          const startIdx = gestureStartIndexRef.current
          let next = Math.round(startIdx - totalDrag / s)
          next = Math.max(0, Math.min(slideCount - 1, next))
          if (next !== currentRef.current) setCurrent(next)
        }
        setDragOffsetPx(0)
        setIsDragGesture(false)
      }
      axisRef.current = "none"
    }

    const onLostPointerCapture = (event: PointerEvent) => {
      if (event.pointerId !== activePointerIdRef.current) return
      activePointerIdRef.current = null
      axisRef.current = "none"
      setDragOffsetPx(0)
      setIsDragGesture(false)
    }

    const onTouchMove = (event: TouchEvent) => {
      if (axisRef.current === "h") event.preventDefault()
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove, { passive: false })
    el.addEventListener("pointerup", finishPointer)
    el.addEventListener("pointercancel", finishPointer)
    el.addEventListener("lostpointercapture", onLostPointerCapture)
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", finishPointer)
      el.removeEventListener("pointercancel", finishPointer)
      el.removeEventListener("lostpointercapture", onLostPointerCapture)
      el.removeEventListener("touchmove", onTouchMove)
    }
  }, [slideCount])

  const cardMotionTransition = `transform ${TRANSITION_MS}ms ${TRANSITION_EASING}, opacity ${TRANSITION_MS}ms ${TRANSITION_EASING}`
  const trackTransition = `transform ${TRANSITION_MS}ms ${TRANSITION_EASING}`

  const stridePx = bannerWidth + GAP_PX
  const peekPx = slideCount > 1 ? SIDE_PEEK_PX : 0
  const trackInsetPx =
    slideCount <= 1 ? 0 : current === 0 ? FIRST_ACTIVE_PADDING_LEFT_PX : peekPx
  const trackTranslatePx = slideCount <= 1 ? 0 : trackInsetPx - current * stridePx
  const trackDisplayTranslatePx = trackTranslatePx + dragOffsetPx

  if (slideCount === 0) return null

  return (
    <div className="mt-10 w-full min-w-0 shrink-0">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3 px-6">
        <h2 className="min-w-0 text-[13px] font-medium leading-snug tracking-[-0.01em] text-muted">
          {sectionLabel}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5" role="tablist" aria-label={sectionLabel}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              tabIndex={index === current ? 0 : -1}
              aria-selected={index === current}
              aria-label={`Card ${index + 1} of ${slideCount}`}
              onClick={() => setCurrent(index)}
              className="cursor-pointer border-0 bg-transparent p-0 transition-all duration-200"
              style={{
                width: index === current ? "14px" : "5px",
                height: "5px",
                borderRadius: "2.5px",
                background: index === current ? "var(--muted)" : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="min-w-0 pr-0">
        <div
          ref={carouselRef}
          className={`no-text-selection min-w-0 w-full touch-pan-y overflow-hidden pb-1.5 ${
            slideCount > 1 ? (isDragGesture ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
        >
          <div
            className="flex items-stretch"
            style={{
              transform: `translateX(${trackDisplayTranslatePx}px)`,
              transition: isDragGesture ? "none" : trackTransition,
            }}
          >
            {slides.map((slide, index) => {
              const isSelected = index === current
              const transformOrigin =
                index > current ? "left center" : index < current ? "right center" : "center center"
              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-label={`${slide.title}. ${slide.subtitle}`}
                  className="shrink-0 self-stretch touch-pan-y rounded-2xl border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle]"
                  style={{
                    width: bannerWidth > 0 ? bannerWidth : "100%",
                    maxWidth: bannerWidth > 0 ? bannerWidth : undefined,
                    minWidth: bannerWidth > 0 ? 0 : undefined,
                    marginRight: `${GAP_PX}px`,
                    transform: `scale(${isSelected ? 1 : INACTIVE_SCALE})`,
                    transformOrigin,
                    opacity: isSelected ? 1 : INACTIVE_OPACITY,
                    transition: cardMotionTransition,
                    backgroundImage:
                      "linear-gradient(var(--surface), var(--surface)), var(--home-action-chip-stroke)",
                  }}
                >
                  <div className="flex h-full min-h-0 w-full min-w-0 flex-row items-stretch overflow-hidden rounded-2xl p-0 text-left [corner-shape:squircle]">
                    <div
                      className="flex min-h-0 min-w-0 flex-1 flex-row items-stretch gap-3 pr-6 [corner-shape:squircle]"
                      style={{ height: IMAGE_PX }}
                    >
                      <div
                        className="pointer-events-none box-border shrink-0 overflow-hidden [corner-shape:squircle]"
                        style={{
                          width: IMAGE_PX,
                          height: IMAGE_PX,
                          padding: IMAGE_INSET_PX,
                          borderRadius: RADIUS_PX,
                        }}
                        aria-hidden
                      >
                        <div
                          className="relative size-full min-h-0 min-w-0 overflow-hidden [corner-shape:squircle]"
                          style={{ borderRadius: IMAGE_CLIP_RADIUS_PX }}
                        >
                          <Image
                            src={slide.imageSrc}
                            alt=""
                            fill
                            sizes={`${IMAGE_PX}px`}
                            className="object-cover object-center"
                          />
                        </div>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1">
                        <span className="line-clamp-1 min-h-0 break-words text-base font-medium leading-snug tracking-[-0.01em] text-foreground">
                          {slide.title}
                        </span>
                        <span className="line-clamp-1 min-h-0 break-words text-sm font-normal leading-snug text-muted">
                          {slide.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
