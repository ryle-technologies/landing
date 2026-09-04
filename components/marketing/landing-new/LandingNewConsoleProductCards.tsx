import type { ComponentType, SVGProps } from "react"
import {
  BadgeCheck,
  Boxes,
  CreditCard,
  Globe,
  KeyRound,
  ShieldCheck,
} from "lucide-react"

/**
 * Port of the Console home “Products available in your account” cards
 * (ryle-app `components/home/ProductOverviewCard.tsx`). Copy, order, colour
 * washes and metric labels mirror the app; values are static fixtures taken
 * from the app's mock data. HeroUI/Gravity primitives are replaced with plain
 * Tailwind + lucide so the landing keeps its dependency surface.
 */

type ProductId =
  | "cards"
  | "remittances"
  | "wallet"
  | "assets"
  | "custody"
  | "proofs"

type Tone = "live" | "attention" | "setup"

type ProductCard = {
  id: ProductId
  title: string
  description: string
  cta: string
  tone: Tone
  statusLabel: string
  metrics: { label: string; value: string }[]
}

/** Cards, remittances and wallet lead; issuance products follow (app order). */
export const CONSOLE_PRODUCT_CARDS: ProductCard[] = [
  {
    id: "cards",
    title: "Cards",
    description: "Issue hybrid cards funded by fiat and stablecoins.",
    cta: "Open cards",
    tone: "live",
    statusLabel: "Live",
    metrics: [
      { label: "Active cards", value: "1,272" },
      { label: "In custody", value: "$3.01M" },
      { label: "30-day spend", value: "$4.82M" },
    ],
  },
  {
    id: "remittances",
    title: "Remittances",
    description: "Move money across corridors on stablecoin rails.",
    cta: "Open remittances",
    tone: "live",
    statusLabel: "Live",
    metrics: [
      { label: "30-day volume", value: "€4.25M" },
      { label: "Transfers", value: "10,262" },
      { label: "Median delivery", value: "48s" },
    ],
  },
  {
    id: "wallet",
    title: "Wallet",
    description: "Brand and run the white-label wallet your customers use.",
    cta: "Open Wallet",
    tone: "live",
    statusLabel: "Live",
    metrics: [
      { label: "Active wallets", value: "48,260" },
      { label: "Provisioned · 30d", value: "3,840" },
      { label: "Brands", value: "3" },
    ],
  },
  {
    id: "assets",
    title: "Assets",
    description: "Issue and operate confidential tokenized assets.",
    cta: "Open assets",
    tone: "live",
    statusLabel: "3 live",
    metrics: [
      { label: "Live", value: "3" },
      { label: "Drafts", value: "1" },
      { label: "Allowlisted", value: "1.2K" },
    ],
  },
  {
    id: "custody",
    title: "Custody",
    description: "Choose how your organization holds and signs for assets.",
    cta: "Manage custody",
    tone: "live",
    statusLabel: "2 connected",
    metrics: [
      { label: "Connected", value: "2" },
      { label: "Pending", value: "0" },
      { label: "Assets held", value: "3" },
    ],
  },
  {
    id: "proofs",
    title: "Proofs",
    description: "Record signed, verifiable proof of what happened.",
    cta: "Open proofs",
    tone: "attention",
    statusLabel: "2 pending",
    metrics: [
      { label: "Categories", value: "4" },
      { label: "Proofs", value: "1.4K" },
      { label: "Pending", value: "2" },
    ],
  },
]

const PRODUCT_ICON: Record<ProductId, ComponentType<SVGProps<SVGSVGElement>>> = {
  cards: CreditCard,
  remittances: Globe,
  wallet: KeyRound,
  assets: Boxes,
  custody: ShieldCheck,
  proofs: BadgeCheck,
}

/** Signature colour per product, so a card is recognisable before it is read. */
const PRODUCT_WASH: Record<ProductId, string> = {
  cards: "from-amber-500/8",
  remittances: "from-cyan-500/10",
  wallet: "from-emerald-500/10",
  assets: "from-blue-500/10",
  custody: "from-emerald-500/10",
  proofs: "from-violet-500/10",
}

const PRODUCT_MEDALLION: Record<ProductId, string> = {
  cards: "bg-amber-500/15 text-amber-700",
  remittances: "bg-cyan-500/12 text-cyan-700",
  wallet: "bg-emerald-500/12 text-emerald-700",
  assets: "bg-blue-500/12 text-blue-700",
  custody: "bg-emerald-500/12 text-emerald-700",
  proofs: "bg-violet-500/12 text-violet-700",
}

/** HeroUI `Chip variant="soft"` colours: success / warning / default. */
const TONE_CHIP: Record<Tone, string> = {
  live: "bg-emerald-500/12 text-emerald-700",
  attention: "bg-amber-500/15 text-amber-700",
  setup: "bg-neutral-200/80 text-neutral-600",
}

export function LandingNewConsoleProductCard({ card }: { card: ProductCard }) {
  const Icon = PRODUCT_ICON[card.id]

  return (
    <article className="relative isolate flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br via-transparent to-transparent ${PRODUCT_WASH[card.id]}`}
      />

      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${PRODUCT_MEDALLION[card.id]}`}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 ${TONE_CHIP[card.tone]}`}
        >
          {card.statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 pt-3">
        <h3 className="text-[13px] font-semibold leading-4 text-neutral-900">
          {card.title}
        </h3>
        <p className="text-[11px] leading-snug text-neutral-500">
          {card.description}
        </p>
      </div>

      {/* Anchored to the bottom so the panels line up across the row. */}
      <div className="mt-auto pt-3">
        <dl className="flex flex-col gap-1.5 rounded-xl bg-neutral-100/70 px-2.5 py-2.5">
          {card.metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-baseline justify-between gap-2"
            >
              <dt className="truncate text-[9px] uppercase tracking-wide text-neutral-500">
                {metric.label}
              </dt>
              <dd className="shrink-0 text-[13px] font-semibold leading-tight tabular-nums text-neutral-900">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pt-3.5">
        <span className="inline-flex h-7 items-center rounded-lg bg-neutral-100 px-2.5 text-[11px] font-medium text-neutral-800">
          {card.cta}
        </span>
      </div>
    </article>
  )
}
