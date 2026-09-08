import { LandingNewUseCaseIdlePlate } from "@/components/marketing/landing-new/LandingNewUseCaseShape"
import type { LandingNewProductsCarouselItem } from "@/components/marketing/landing-new/LandingNewProductsCarousel"
import {
  LATTICE_CELL_PX,
  cellsPx,
  latticeCellStrokeClassName,
} from "@/lib/landingLattice"

const CELL = LATTICE_CELL_PX
const CARD_COLS = 5
const CARD_ROWS = 5
const PX_PER_SEC = 36
const FADE_PX = cellsPx(2)

const cardTitleClassName =
  "text-left font-sans text-[20px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-500 ease-out sm:text-[22px]"

const cardBadgeClassName =
  "mt-2 block text-left font-mono text-[11px] uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"

const cardBodyClassName =
  "text-left font-sans text-[14px] font-normal leading-[1.5] text-foreground transition-colors duration-500 ease-out sm:text-[15px]"

const cardCopyClassName = "flex w-full flex-col items-start px-8 pb-8 pt-16"

function splitRows<T>(items: readonly T[]) {
  const left: T[] = []
  const right: T[] = []
  items.forEach((item, index) => {
    if (index % 2 === 0) left.push(item)
    else right.push(item)
  })
  return { left, right }
}

function ExpandedCard({
  item,
  width,
  height,
}: {
  item: LandingNewProductsCarouselItem
  width: number
  height: number
}) {
  return (
    <article className="relative shrink-0" style={{ width, height }}>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 ${latticeCellStrokeClassName}`}
      />
      <div className="absolute inset-0 overflow-hidden bg-[var(--marketing-surface)]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
          style={{ width: CELL, height: CELL }}
        >
          <LandingNewUseCaseIdlePlate kind={item.shape} />
        </div>
        <div className={cardCopyClassName}>
          <h3 className={`${cardTitleClassName} pb-2`}>
            {item.label}
            {item.badge ? (
              <span className={cardBadgeClassName}>{item.badge}</span>
            ) : null}
          </h3>
          <p className={cardBodyClassName}>{item.body}</p>
        </div>
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
  const height = cellsPx(CARD_ROWS)
  const durationSec = Math.max(40, (items.length * width) / PX_PER_SEC)
  const trackClass =
    direction === "left"
      ? "landing-possibilities-marquee-left"
      : "landing-possibilities-marquee-right"

  if (items.length === 0) return null

  return (
    <div className="overflow-hidden" style={{ height }}>
      <div
        className={`flex w-max motion-reduce:animate-none ${trackClass}`}
        style={{
          ["--possibilities-marquee-duration" as string]: `${durationSec}s`,
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy > 0 || undefined}
            className="flex shrink-0"
          >
            {items.map((item) => (
              <ExpandedCard
                key={`${copy}-${item.badge ?? ""}-${item.label}`}
                item={item}
                width={width}
                height={height}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Always-expanded 2D possibility cards in two opposite marquees.
 * Markup is the same on the server and the client — motion is CSS only.
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
