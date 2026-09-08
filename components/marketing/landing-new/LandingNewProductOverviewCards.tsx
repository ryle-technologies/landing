import type { ComponentType, SVGProps } from "react"
import {
  BadgeCheck,
  Boxes,
  CreditCard,
  Globe,
  KeyRound,
  ShieldCheck,
} from "lucide-react"
import { LatticeCell, LatticeGrid } from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { landingNewLargeDisplayClassName } from "@/lib/landingHeroTypography"
import { LATTICE_SPACE } from "@/lib/landingLattice"
import {
  LANDING_PRODUCT_OVERVIEW_CARDS,
  type LandingProductOverviewCard,
  type LandingProductOverviewId,
  type LandingProductOverviewTone,
} from "@/lib/landingProductOverview"

const PRODUCT_COLS = 5
const PRODUCT_ROW_MIN_COLS = 3 * PRODUCT_COLS
const PRODUCT_MIN_ROWS = 5

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const sectionTitleClassName = `relative text-left transition-colors duration-500 ease-out ${landingNewLargeDisplayClassName}`

const PRODUCT_ICON: Record<
  LandingProductOverviewId,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  cards: CreditCard,
  remittances: Globe,
  wallet: KeyRound,
  assets: Boxes,
  custody: ShieldCheck,
  proofs: BadgeCheck,
}

const PRODUCT_MEDALLION: Record<LandingProductOverviewId, string> = {
  cards: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  remittances: "bg-cyan-500/12 text-cyan-800 dark:text-cyan-200",
  wallet: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  assets: "bg-blue-500/12 text-blue-800 dark:text-blue-200",
  custody: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  proofs: "bg-violet-500/12 text-violet-800 dark:text-violet-200",
}

const TONE_CHIP: Record<LandingProductOverviewTone, string> = {
  live: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  attention: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  setup: "bg-foreground/8 text-muted",
}

function ProductCard({ card }: { card: LandingProductOverviewCard }) {
  const Icon = PRODUCT_ICON[card.id]

  return (
    <article
      className={`flex h-full min-w-0 flex-col items-start text-left ${LATTICE_SPACE.inset}`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span
          aria-hidden
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${PRODUCT_MEDALLION[card.id]}`}
        >
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ${TONE_CHIP[card.tone]}`}
        >
          {card.statusLabel}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1 pt-4">
        <h3 className="text-left font-serif text-[22px] font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[24px]">
          {card.title}
        </h3>
        <p className="text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]">
          {card.description}
        </p>
      </div>
      <dl className="mt-auto flex w-full flex-col gap-2 pt-6">
        {card.metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-baseline justify-between gap-2"
          >
            <dt className="truncate font-mono text-[11px] uppercase tracking-wide text-muted">
              {metric.label}
            </dt>
            <dd className="shrink-0 text-[15px] font-medium tabular-nums tracking-[-0.02em] text-foreground">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

const LEAD_CARDS = LANDING_PRODUCT_OVERVIEW_CARDS.slice(0, 3)
const REST_CARDS = LANDING_PRODUCT_OVERVIEW_CARDS.slice(3)

/**
 * Console homepage product cards (Cards, Remittances, Wallet, then issuance)
 * as two lattice rows under the platform feature list.
 */
export function LandingNewProductOverviewCards() {
  return (
    <LatticeSection
      aria-labelledby="landing-new-products-heading"
      grid
      gridMask="fadeBoth"
    >
      <LatticePlate>
        <p className={kickerClassName}>Products</p>
        <h2
          id="landing-new-products-heading"
          className={`${sectionTitleClassName} mt-3 min-w-0 md:mt-4 md:max-w-[56rem]`}
        >
          <span>Cards, remittances, wallets.</span>
          <br />
          The rest of the stack, in one console.
        </h2>
      </LatticePlate>
      <LatticeGrid
        className={LATTICE_SPACE.block}
        minCols={PRODUCT_ROW_MIN_COLS}
        stroke
        equalRows
      >
        {LEAD_CARDS.map((card) => (
          <LatticeCell key={card.id} cols={PRODUCT_COLS} minRows={PRODUCT_MIN_ROWS}>
            <ProductCard card={card} />
          </LatticeCell>
        ))}
      </LatticeGrid>
      <LatticeGrid minCols={PRODUCT_ROW_MIN_COLS} stroke equalRows>
        {REST_CARDS.map((card) => (
          <LatticeCell key={card.id} cols={PRODUCT_COLS} minRows={PRODUCT_MIN_ROWS}>
            <ProductCard card={card} />
          </LatticeCell>
        ))}
      </LatticeGrid>
    </LatticeSection>
  )
}
