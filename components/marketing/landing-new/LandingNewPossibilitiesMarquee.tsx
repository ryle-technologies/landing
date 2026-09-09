"use client"

import { useLayoutEffect, useRef, useState } from "react"
import type { LandingNewProductsCarouselItem } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import { ceilCells, cellsPx } from "@/lib/landingLattice"

const CARD_COLS = 5
/** Row height before measuring (SSR); most cards fit two cells. */
const CARD_MIN_ROWS = 2
const PX_PER_SEC = 36
const FADE_PX = cellsPx(2)

/** Same chrome and type scale as the use-case cards in the first carousel. */
const cardChromeClassName =
  "rounded-2xl bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--border)]"

const cardTitleClassName =
  "text-left font-sans text-[16px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-500 ease-out sm:text-[17px]"

const cardBodyClassName =
  "mt-2 text-left font-sans text-[13px] font-normal leading-[1.5] text-foreground transition-colors duration-500 ease-out sm:text-[14px]"

/** Not `h-full`: this is the node the row measures for its natural height. */
const cardCopyClassName = "flex w-full flex-col items-start p-6"

function splitRows<T>(items: readonly T[]) {
  const left: T[] = []
  const right: T[] = []
  items.forEach((item, index) => {
    if (index % 2 === 0) left.push(item)
    else right.push(item)
  })
  return { left, right }
}

function PossibilityCard({
  item,
  width,
}: {
  item: LandingNewProductsCarouselItem
  width: number
}) {
  // No explicit height: the flex row stretches every card to the row height.
  return (
    <article
      className={`relative shrink-0 overflow-hidden ${cardChromeClassName}`}
      style={{ width }}
    >
      <div className={cardCopyClassName}>
        <h3 className={cardTitleClassName}>{item.label}</h3>
        <p className={cardBodyClassName}>{item.body}</p>
      </div>
    </article>
  )
}

function MarqueeRow({
  items,
  direction,
}: {
  items: readonly LandingNewProductsCarouselItem[]
  direction: "left" | "right"
}) {
  const width = cellsPx(CARD_COLS)
  const durationSec = Math.max(40, (items.length * width) / PX_PER_SEC)
  const trackClass =
    direction === "left"
      ? "landing-possibilities-marquee-left"
      : "landing-possibilities-marquee-right"
  const { rows, measureRef } = useRowCells(items)
  const height = cellsPx(rows)

  if (items.length === 0) return null

  return (
    <div className="overflow-hidden" style={{ height }}>
      <div
        className={`flex w-max items-stretch motion-reduce:animate-none ${trackClass}`}
        style={{
          height,
          ["--possibilities-marquee-duration" as string]: `${durationSec}s`,
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            ref={copy === 0 ? measureRef : undefined}
            aria-hidden={copy > 0 || undefined}
            className="flex shrink-0 items-stretch"
          >
            {items.map((item) => (
              <PossibilityCard
                key={`${copy}-${item.badge ?? ""}-${item.label}`}
                item={item}
                width={width}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Whole-cell row height that fits the tallest card's copy. Measures the copy
 * node (not the stretched card) so the result doesn't depend on the row's
 * current height; re-measures on resize and once fonts are ready.
 */
function useRowCells(items: readonly LandingNewProductsCarouselItem[]) {
  const measureRef = useRef<HTMLDivElement | null>(null)
  const [rows, setRows] = useState(CARD_MIN_ROWS)

  useLayoutEffect(() => {
    const root = measureRef.current
    if (!root) return

    const apply = () => {
      let tallest = 0
      for (const article of Array.from(root.children)) {
        const copy = article.firstElementChild
        if (!copy) continue
        tallest = Math.max(tallest, copy.getBoundingClientRect().height)
      }
      if (tallest < 1) return
      const next = ceilCells(tallest, CARD_MIN_ROWS)
      setRows((prev) => (prev === next ? prev : next))
    }

    apply()
    const observer = new ResizeObserver(apply)
    for (const article of Array.from(root.children)) {
      if (article.firstElementChild) observer.observe(article.firstElementChild)
    }
    const fonts = document.fonts?.ready.then(apply)
    return () => {
      observer.disconnect()
      void fonts
    }
  }, [items])

  return { rows, measureRef }
}

/**
 * Plain title + body cards in two opposite marquees (top row drifts left,
 * bottom row right). Markup is the same on the server and the client — motion
 * is CSS only.
 */
export function LandingNewPossibilitiesMarquee({
  items,
  leadItems = [],
  ariaLabel,
  className,
}: {
  items: readonly LandingNewProductsCarouselItem[]
  /** Shown at the start of both rows, ahead of the split track. */
  leadItems?: readonly LandingNewProductsCarouselItem[]
  ariaLabel: string
  className?: string
}) {
  const { left, right } = splitRows(items)
  const leftItems = leadItems.length > 0 ? [...leadItems, ...left] : left
  const rightItems = leadItems.length > 0 ? [...leadItems, ...right] : right

  if (items.length === 0 && leadItems.length === 0) return null

  return (
    <div
      className={["landing-possibilities-marquee relative w-full min-w-0", className ?? ""].join(
        " ",
      )}
      role="region"
      aria-label={ariaLabel}
      style={{
        ["--possibilities-fade" as string]: `${FADE_PX}px`,
      }}
    >
      <div className="overflow-x-clip overflow-y-hidden [mask-image:linear-gradient(to_right,transparent_0,black_var(--possibilities-fade),black_calc(100%-var(--possibilities-fade)),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_var(--possibilities-fade),black_calc(100%-var(--possibilities-fade)),transparent_100%)]">
        <MarqueeRow items={leftItems} direction="left" />
        <MarqueeRow items={rightItems} direction="right" />
      </div>
    </div>
  )
}
