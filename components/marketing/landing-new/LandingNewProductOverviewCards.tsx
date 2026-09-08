"use client"

import { useLayoutEffect, useRef, useState, type ComponentType, type SVGProps } from "react"
import {
  BadgeCheck,
  Boxes,
  CreditCard,
  Globe,
  KeyRound,
  ShieldCheck,
} from "lucide-react"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_ATTR,
  LATTICE_SPACE,
  cellsPx,
} from "@/lib/landingLattice"
import {
  LANDING_PRODUCT_OVERVIEW_CARDS,
  type LandingProductOverviewCard,
  type LandingProductOverviewId,
  type LandingProductOverviewTone,
} from "@/lib/landingProductOverview"

const CARD_COLS = 5
const CARD_ROWS = 4
const CARD_GAP = LATTICE_CELL_PX
const FADE_TAIL_PX = cellsPx(2)

const PRODUCT_ICON: Record<
  LandingProductOverviewId,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  assets: Boxes,
  custody: ShieldCheck,
  proofs: BadgeCheck,
  cards: CreditCard,
  remittances: Globe,
  wallet: KeyRound,
}

const PRODUCT_WASH: Record<LandingProductOverviewId, string> = {
  assets: "from-blue-500/10",
  custody: "from-emerald-500/10",
  proofs: "from-violet-500/10",
  cards: "from-amber-500/8",
  remittances: "from-cyan-500/10",
  wallet: "from-emerald-500/10",
}

const PRODUCT_MEDALLION: Record<LandingProductOverviewId, string> = {
  assets: "bg-blue-500/12 text-blue-700",
  custody: "bg-emerald-500/12 text-emerald-700",
  proofs: "bg-violet-500/12 text-violet-700",
  cards: "bg-amber-500/15 text-amber-700",
  remittances: "bg-cyan-500/12 text-cyan-700",
  wallet: "bg-emerald-500/12 text-emerald-700",
}

const TONE_CHIP: Record<LandingProductOverviewTone, string> = {
  live: "bg-emerald-500/15 text-emerald-700",
  attention: "bg-amber-500/15 text-amber-700",
  setup: "bg-neutral-200/80 text-neutral-600",
}

function ProductOverviewCard({ card }: { card: LandingProductOverviewCard }) {
  const Icon = PRODUCT_ICON[card.id]

  return (
    <article className="relative isolate flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-[var(--surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br via-transparent to-transparent ${PRODUCT_WASH[card.id]}`}
      />

      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${PRODUCT_MEDALLION[card.id]}`}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <span
          className={`inline-flex h-6 shrink-0 items-center rounded-full px-2 text-xs font-medium ${TONE_CHIP[card.tone]}`}
        >
          {card.statusLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-1 pt-4">
        <h3 className="text-base leading-5 font-semibold text-foreground">{card.title}</h3>
        <p className="text-sm leading-snug text-muted">{card.description}</p>
      </div>

      <div className="mt-auto pt-5">
        <span className="inline-flex h-8 items-center rounded-lg bg-black/[0.06] px-3 text-sm font-medium text-foreground dark:bg-white/[0.08]">
          {card.cta}
        </span>
      </div>
    </article>
  )
}

function columnInset(viewport: HTMLElement) {
  const column = viewport.closest(`[${LATTICE_COLUMN_ATTR}]`)
  if (!column) return LATTICE_CELL_PX
  const inset =
    column.getBoundingClientRect().left - viewport.getBoundingClientRect().left
  return inset > 0 ? inset : LATTICE_CELL_PX
}

/**
 * Console product cards as a horizontal lattice track. First card sits on the
 * column edge; the row bleeds and scrolls in whole-cell steps.
 */
export function LandingNewProductOverviewCards() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [inset, setInset] = useState(LATTICE_CELL_PX)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const apply = () => {
      setInset(columnInset(viewport))
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(viewport)
    const column = viewport.closest(`[${LATTICE_COLUMN_ATTR}]`)
    if (column) observer.observe(column)
    return () => observer.disconnect()
  }, [])

  const cardWidth = cellsPx(CARD_COLS)
  const cardHeight = cellsPx(CARD_ROWS)
  const fadeLeadPx = Math.min(32, Math.max(0, inset - LATTICE_CELL_PX))

  return (
    <div
      ref={viewportRef}
      className={`${landingViewportBleedClassName} ${LATTICE_SPACE.block}`}
    >
      <div
        className="snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent_0,transparent_var(--product-fade-lead),black_var(--product-fade-lead),black_calc(100%-var(--product-fade-tail)),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,transparent_var(--product-fade-lead),black_var(--product-fade-lead),black_calc(100%-var(--product-fade-tail)),transparent_100%)]"
        role="region"
        aria-label="Products"
        tabIndex={0}
        style={{
          paddingLeft: inset,
          paddingRight: inset,
          scrollPaddingLeft: inset,
          height: cardHeight,
          ["--product-fade-lead" as string]: `${fadeLeadPx}px`,
          ["--product-fade-tail" as string]: `${FADE_TAIL_PX}px`,
        }}
      >
        <div
          role="list"
          className="flex flex-nowrap"
          style={{ gap: CARD_GAP, height: cardHeight }}
        >
          {LANDING_PRODUCT_OVERVIEW_CARDS.map((card) => (
            <div
              key={card.id}
              role="listitem"
              className="shrink-0 snap-start"
              style={{ width: cardWidth, height: cardHeight }}
            >
              <ProductOverviewCard card={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
