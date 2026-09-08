"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import { LandingNewActionChip } from "@/components/marketing/landing-new/LandingNewActionChip"
import { LandingNewWalletAssetMark } from "@/components/marketing/landing-new/LandingNewWalletAssetMark"
import {
  CloudMorphCard,
  CloudMorphRoot,
  useCloudMorphBusy,
} from "@/components/marketing/landing-new/CloudMasonryMorph"
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ArrowUpRight,
  Calendar,
  ChartColumn,
  CircleDollarSign,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  KeyRound,
  Plus,
  ShieldCheck,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react"
import {
  CARDS_FUNDING_MIX,
  CARDS_KPIS,
  CARDS_SETTLEMENT,
  CARDS_SPEND,
  LIVE_ASSETS,
  type AssetConfigIcon,
  type AssetConfigSection,
  type ConfigChipTone,
  type LiveAssetId,
} from "@/lib/landingConsoleDashboard"
import {
  WALLET_ASSET_MIX,
  WALLET_BALANCES,
  WALLET_CONFIG_SECTIONS,
  WALLET_FLOW_MIX,
} from "@/lib/landingWallets"
import {
  CORRIDOR_MIX,
  COST_BENCHMARKS,
  COST_TREND,
  DELIVERY_TREND,
  KPIS,
  RAIL_ASSET_LABELS,
  RAIL_FLOW_STAGES,
  TRANSFER_COUNTS,
  VALUE_SPLIT,
  VOLUME_TREND,
  formatCompactMoney,
  formatMoney,
  formatPercent,
  trendFromSeries,
  type ActivityKind,
  type RailAssetForm,
} from "@/lib/landingRemittances"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { landingNewLargeDisplayClassName } from "@/lib/landingHeroTypography"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_ATTR,
  LATTICE_SPACE,
} from "@/lib/landingLattice"

/** Same 5-cell cards as Ready for enterprises. */
const FEATURE_CARD_COLS = 5
const FEATURE_ROW_MIN_COLS = 3 * FEATURE_CARD_COLS
const LIMITS_COLS = 4
const FUNDING_COLS = 6
const ROLES_COLS = FUNDING_COLS - 1
const TRANSFERS_COLS = 4
const BREAKDOWN_COLS = 4

/** Four-across KPIs wrap before they stack. */
const KPI_MIN_COLS = 12
/** Side-by-side pairs. */
const PAIR_MIN_COLS = 12

const KPI_MIN_ROWS = 3
const RAIL_MIN_ROWS = 6
const WIDGET_MIN_ROWS = 6
const CHART_MIN_ROWS = 5
const TRANSFERS_ROWS = 4
const SPEND_ROWS = 4
const TITLE_ROWS = 6

function splitAcross(cols: number, parts: number) {
  const base = Math.floor(cols / parts)
  const rem = cols % parts
  return Array.from({ length: parts }, (_, i) => base + (i < rem ? 1 : 0))
}

function DashboardGrid({
  children,
  className = "",
  minCols,
  equalRows,
  dense,
}: {
  children: ReactNode
  className?: string
  minCols?: number
  equalRows?: boolean
  dense?: boolean
}) {
  const bleedRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ pad: 0, width: 0 })

  useLayoutEffect(() => {
    const bleed = bleedRef.current
    if (!bleed) return

    const apply = () => {
      const column = bleed.closest(`[${LATTICE_COLUMN_ATTR}]`)
      const box = bleed.getBoundingClientRect()
      const origin = column ? column.getBoundingClientRect().left : box.left
      const nLeft = Math.floor((origin - box.left + 0.01) / LATTICE_CELL_PX)
      const first = origin - nLeft * LATTICE_CELL_PX
      const pad = Math.max(0, first - box.left)
      const cols = Math.max(1, Math.floor((box.width - pad + 0.01) / LATTICE_CELL_PX))
      const width = cols * LATTICE_CELL_PX
      setFrame((prev) =>
        prev.pad === pad && prev.width === width ? prev : { pad, width },
      )
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(bleed)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={bleedRef}
      className={`${landingViewportBleedClassName} ${className}`}
    >
      <div
        className="min-w-0"
        style={
          frame.width > 0
            ? { marginLeft: frame.pad, width: frame.width }
            : undefined
        }
      >
        <LatticeGrid dense={dense} equalRows={equalRows} minCols={minCols} stroke>
          {children}
        </LatticeGrid>
      </div>
    </div>
  )
}

const COMPARISON_BASE = 1000

const BREAKDOWN_LEAKAGE = [
  {
    key: "fees",
    label: "Fees",
    amount: VALUE_SPLIT.fees.amount,
    sharePct: VALUE_SPLIT.fees.sharePct,
    tone: 1,
  },
  {
    key: "spread",
    label: "FX spread",
    amount: VALUE_SPLIT.spread.amount,
    sharePct: VALUE_SPLIT.spread.sharePct,
    tone: 2,
  },
] as const

const LARGEST_LEAKAGE = Math.max(...BREAKDOWN_LEAKAGE.map((segment) => segment.sharePct))

const ASSET_COLOR: Record<RailAssetForm, string> = {
  SEND_FIAT: "var(--chart-1)",
  USDC: "var(--chart-3)",
  LOCAL_FIAT: "var(--chart-4)",
}

const CHIP: Record<ActivityKind | "pilot" | "success" | "warning", string> = {
  transfer: "bg-emerald-500/12 text-emerald-700",
  liquidity: "bg-sky-500/12 text-sky-700",
  corridor: "bg-neutral-200/80 text-neutral-600",
  compliance: "bg-amber-500/15 text-amber-800",
  api: "bg-neutral-200/80 text-neutral-600",
  pilot: "bg-amber-500/15 text-amber-800",
  success: "bg-emerald-500/12 text-emerald-700",
  warning: "bg-amber-500/15 text-amber-800",
}

const CONFIG_ICON: Record<AssetConfigIcon, LucideIcon> = {
  file: FileText,
  tag: Tag,
  address: KeyRound,
  treasury: CircleDollarSign,
  calendar: Calendar,
  status: ChartColumn,
  clock: Clock,
  user: User,
  globe: Globe,
  shield: ShieldCheck,
  plus: Plus,
  burn: ExternalLink,
  dollar: CircleDollarSign,
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  convert: ArrowLeftRight,
  onramp: ArrowDownToLine,
  offramp: ArrowUpFromLine,
  card: CreditCard,
}

const CONFIG_CHIP: Record<ConfigChipTone, string> = {
  live: "bg-[#1E4B9E]/15 text-[#1E4B9E]",
  paused: "bg-amber-500/15 text-amber-800",
  draft: "bg-[var(--rem-secondary)] text-[var(--rem-muted)]",
  default: "bg-[var(--rem-secondary)] text-[var(--rem-fg)]",
}

function truncateAddress(value: string) {
  const trimmed = value.trim()
  if (trimmed.length <= 12) return trimmed
  return `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`
}

type ChartTone = 1 | 2 | 3 | 4

function chartGradient(tone: ChartTone = 1, axis: "x" | "y" = "x") {
  const dir = axis === "x" ? "to right" : "to top"
  return `linear-gradient(${dir}, var(--chart-${tone}-from), var(--chart-${tone}))`
}

function GradientBar({
  widthPct,
  tone = 1,
  animated = false,
  className = "h-2",
}: {
  widthPct: number
  tone?: ChartTone
  animated?: boolean
  className?: string
}) {
  const fillStyle = { backgroundImage: chartGradient(tone) }
  return (
    <div className={`w-full overflow-hidden bg-[var(--rem-secondary)] ${className}`}>
      {animated ? (
        <motion.span
          animate={{ width: `${widthPct}%` }}
          className="block h-full"
          initial={false}
          style={fillStyle}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        />
      ) : (
        <span className="block h-full" style={{ ...fillStyle, width: `${widthPct}%` }} />
      )}
    </div>
  )
}

function ProgressTrack({
  value,
  max = 100,
  tone = 1,
  label,
  className = "h-2",
}: {
  value: number
  max?: number
  tone?: ChartTone
  label?: string
  className?: string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      className={`w-full overflow-hidden bg-[var(--rem-secondary)] ${className}`}
      role="progressbar"
    >
      <span
        className="block h-full"
        style={{ width: `${pct}%`, backgroundImage: chartGradient(tone) }}
      />
    </div>
  )
}

function invertTrend(trend: "up" | "down" | "neutral") {
  if (trend === "up") return "down"
  if (trend === "down") return "up"
  return trend
}

function sparklineStroke(trend: "up" | "down" | "neutral") {
  if (trend === "down") return "var(--danger)"
  if (trend === "up") return "var(--chart-1)"
  return "var(--muted)"
}

function easedLinePath(
  points: readonly { x: number; y: number }[],
  ease = 1,
) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`
  if (points.length === 2) {
    return `M${points[0].x} ${points[0].y} L${points[1].x} ${points[1].y}`
  }

  let d = `M${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + ((p2.x - p0.x) / 6) * ease
    const c1y = p1.y + ((p2.y - p0.y) / 6) * ease
    const c2x = p2.x - ((p3.x - p1.x) / 6) * ease
    const c2y = p2.y - ((p3.y - p1.y) / 6) * ease
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return d
}

function Sparkline({
  values,
  color,
}: {
  values: readonly number[]
  color: string
}) {
  const width = 240
  const height = 70
  const pad = 2
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((value, index) => ({
    x: pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2),
    y: height - pad - ((value - min) / span) * (height - pad * 2),
  }))

  return (
    <svg
      aria-hidden
      className="mt-auto h-16 w-full shrink-0"
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={easedLinePath(points)}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function KpiTile({
  title,
  caption,
  value,
  series,
  lowerIsBetter = false,
  badge,
  chart = true,
  hero = false,
}: {
  title: string
  caption: string
  value: string
  series: readonly number[]
  lowerIsBetter?: boolean
  badge?: ReactNode
  chart?: boolean
  /** Larger figure than the standard KPI tiles (e.g. Collected fees). */
  hero?: boolean
}) {
  const derived = trendFromSeries(series)
  const trend = lowerIsBetter ? invertTrend(derived.trend) : derived.trend
  const stroke = sparklineStroke(trend)
  const chip =
    trend === "down" ? CHIP.warning : trend === "up" ? CHIP.success : CHIP.api

  return (
    <article className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--rem-border)] bg-[var(--rem-card)] p-4">
      <div className={hero ? "shrink-0" : "flex flex-col gap-0.5"}>
        <h3
          className={`font-medium text-[var(--rem-fg)] ${
            hero ? "text-sm leading-none" : "text-sm"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-[var(--rem-muted)] ${
            hero ? "mt-1 truncate text-xs leading-none" : "text-xs"
          }`}
        >
          {caption}
        </p>
      </div>
      <div
        className={`flex items-end justify-between gap-4 ${
          hero ? "mt-auto" : "mt-3"
        }`}
      >
        <span
          className={`truncate font-semibold tracking-tight tabular-nums text-[var(--rem-fg)] ${
            hero ? "text-[2rem] leading-none" : "text-2xl"
          }`}
        >
          {value}
        </span>
        {badge === undefined ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ${chip}`}
          >
            {derived.label}
          </span>
        ) : (
          badge
        )}
      </div>
      {chart ? <Sparkline color={stroke} values={series} /> : null}
    </article>
  )
}

/** One lattice cell. Rows are a hard 64px from the card origin so dividers sit on the grid. */
const LATTICE_ROW_MIN = "min-w-0 px-4"

function latticeOffsetY(el: HTMLElement, root: Element) {
  const cell = (el.closest("[data-cloud-shift]") as HTMLElement | null) ?? el
  const transform = getComputedStyle(cell).transform
  const shiftY =
    transform && transform !== "none" ? new DOMMatrixReadOnly(transform).m42 : 0
  return cell.getBoundingClientRect().top - shiftY - root.getBoundingClientRect().top
}

function useLatticeRowLead(ref: { current: HTMLElement | null }) {
  const [lead, setLead] = useState(LATTICE_CELL_PX)

  useLayoutEffect(() => {
    const el = ref.current
    const root = el?.closest("[data-lattice-root]")
    if (!el || !root) return

    const apply = () => {
      const offset =
        ((latticeOffsetY(el, root) % LATTICE_CELL_PX) + LATTICE_CELL_PX) %
        LATTICE_CELL_PX
      const next =
        offset < 0.75 || offset > LATTICE_CELL_PX - 0.75
          ? LATTICE_CELL_PX
          : LATTICE_CELL_PX - offset
      setLead((prev) => (Math.abs(prev - next) < 0.25 ? prev : next))
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    observer.observe(root)
    return () => observer.disconnect()
  }, [ref])

  return lead
}

function LatticeListCard({
  title,
  description,
  legend,
  label,
  flush = false,
  children,
}: {
  title?: string
  description?: string
  legend?: ReactNode
  label?: string
  flush?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const lead = useLatticeRowLead(ref)

  return (
    <section
      ref={ref}
      aria-label={label}
      className={`grid min-h-0 min-w-0 content-start overflow-hidden rounded-2xl bg-[var(--rem-card)] shadow-[inset_0_0_0_1px_var(--rem-border)] ${
        flush ? "h-full" : ""
      }`}
      style={{
        gridTemplateRows: title ? `${lead}px` : `${LATTICE_CELL_PX}px`,
        gridAutoRows: LATTICE_CELL_PX,
      }}
    >
      {title ? (
        <header className={`flex items-center justify-between gap-3 ${LATTICE_ROW_MIN}`}>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-none text-[var(--rem-fg)]">{title}</h3>
            {description ? (
              <p className="mt-1 truncate text-xs leading-none text-[var(--rem-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {legend}
        </header>
      ) : null}
      {children}
    </section>
  )
}

function LatticeListRow({
  children,
  lined = true,
  row = false,
  grow = 1,
  className = "",
}: {
  children: ReactNode
  lined?: boolean
  row?: boolean
  grow?: number
  className?: string
}) {
  return (
    <div
      className={`${LATTICE_ROW_MIN} h-full ${
        row ? "flex items-center gap-3" : "flex flex-col justify-center gap-1.5"
      } ${lined ? "border-t border-[var(--rem-border)]" : ""} ${className}`}
      style={grow === 1 ? undefined : { gridRow: `span ${grow}` }}
    >
      {children}
    </div>
  )
}

function configCount(sections: readonly AssetConfigSection[], id: string) {
  return sections.find((section) => section.id === id)?.rows.length ?? 1
}

function Widget({
  title,
  description,
  legend,
  children,
  className = "",
  contentClassName = "",
  fill = true,
  flush = false,
}: {
  title: string
  description?: string
  legend?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  fill?: boolean
  /** Fill the lattice cell. Radius and card border stay on. */
  flush?: boolean
}) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-[var(--rem-border)] bg-[var(--rem-card)] p-4 ${
        flush || fill ? "h-full" : "h-auto"
      } ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--rem-fg)]">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-[var(--rem-muted)]">{description}</p>
          ) : null}
        </div>
        {legend}
      </header>
      <div className={`mt-3 min-h-0 flex-1 ${contentClassName}`}>{children}</div>
    </section>
  )
}

function useChartBox() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 520, height: 200 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const next = { width: el.clientWidth, height: el.clientHeight }
      if (next.width < 8 || next.height < 8) return
      setSize((prev) =>
        Math.abs(prev.width - next.width) < 0.5 && Math.abs(prev.height - next.height) < 0.5
          ? prev
          : next,
      )
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, ...size }
}

function DualLineChart({
  series,
  aKey,
  bKey,
  aColor = "var(--chart-1)",
  bColor = "var(--chart-3)",
  formatY,
}: {
  series: readonly Record<string, string | number>[]
  aKey: string
  bKey: string
  aColor?: string
  bColor?: string
  formatY: (value: number) => string
}) {
  const { ref, width, height } = useChartBox()
  const pad = { top: 8, right: 10, bottom: 28, left: 44 }
  const innerW = Math.max(width - pad.left - pad.right, 1)
  const innerH = Math.max(height - pad.top - pad.bottom, 1)
  const values = series.flatMap((point) => [
    Number(point[aKey] ?? 0),
    Number(point[bKey] ?? 0),
  ])
  const max = Math.max(...values, 1)
  const yMax = Math.ceil(max / 5) * 5
  const xAt = (index: number) =>
    pad.left + (index / Math.max(series.length - 1, 1)) * innerW
  const yAt = (value: number) => pad.top + innerH - (value / yMax) * innerH
  const path = (key: string) =>
    easedLinePath(
      series.map((point, index) => ({
        x: xAt(index),
        y: yAt(Number(point[key] ?? 0)),
      })),
    )

  return (
    <div ref={ref} className="h-full min-h-0 w-full">
    <svg
      className="block"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {[0, 0.5, 1].map((t) => {
        const y = pad.top + innerH * (1 - t)
        return (
          <g key={t}>
            <line
              stroke="var(--rem-border)"
              strokeDasharray="3 4"
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
            />
            <text
              fill="var(--rem-muted)"
              fontSize={10}
              textAnchor="end"
              x={pad.left - 6}
              y={y + 3}
            >
              {formatY(yMax * t)}
            </text>
          </g>
        )
      })}
      <path
        d={path(aKey)}
        fill="none"
        stroke={aColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <path
        d={path(bKey)}
        fill="none"
        stroke={bColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      {series.map((point, index) =>
        index % 2 === 0 ? (
          <text
            key={String(point.month)}
            fill="var(--rem-muted)"
            fontSize={10}
            textAnchor="middle"
            x={xAt(index)}
            y={height - 8}
          >
            {String(point.month).replace(" '26", "")}
          </text>
        ) : null,
      )}
    </svg>
    </div>
  )
}

function BarChart({
  series,
}: {
  series: readonly { month: string; transfers: number }[]
}) {
  const max = Math.max(...series.map((point) => point.transfers))
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-end gap-2">
        {series.map((point) => (
          <div key={point.month} className="relative h-full min-w-0 flex-1">
            <span
              className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2"
              style={{
                height: `${(point.transfers / max) * 100}%`,
                backgroundImage: chartGradient(1, "y"),
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex h-8 gap-2">
        {series.map((point) => (
          <span
            key={point.month}
            className="min-w-0 flex-1 truncate text-center text-[10px] leading-8 text-[var(--rem-muted)]"
          >
            {point.month.replace(" '26", "")}
          </span>
        ))}
      </div>
    </div>
  )
}

function RailFlow() {
  const tallest = Math.max(
    ...RAIL_FLOW_STAGES.map((stage) =>
      stage.hops.reduce((sum, hop) => sum + hop.volume, 0),
    ),
  )

  return (
    <Widget
      contentClassName="pt-4"
      legend={
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {(Object.keys(RAIL_ASSET_LABELS) as RailAssetForm[]).map((asset) => (
            <span key={asset} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: ASSET_COLOR[asset] }}
              />
              <span className="text-xs text-[var(--rem-muted)]">
                {RAIL_ASSET_LABELS[asset]}
              </span>
            </span>
          ))}
        </div>
      }
      title="Overview of the flow"
    >
      <div className="-mx-1 overflow-x-auto">
        <div className="flex min-w-[1040px] gap-3 px-1">
          {RAIL_FLOW_STAGES.map((stage) => {
            const total = stage.hops.reduce((sum, hop) => sum + hop.volume, 0)
            return (
              <div key={stage.id} className="flex min-w-0 flex-1 flex-col gap-3">
                <div
                  className="flex h-[280px] flex-col justify-end gap-1.5"
                  style={{ height: 280 }}
                >
                  {[...stage.hops]
                    .slice()
                    .reverse()
                    .map((hop) => {
                      const share = hop.volume / tallest
                      return (
                        <div
                          key={hop.name}
                          className="flex min-h-6 items-center gap-2"
                          style={{ height: `${Math.max(share * 100, 8)}%` }}
                        >
                          <span
                            className="h-full w-2.5 shrink-0 rounded-sm"
                            style={{
                              backgroundColor: ASSET_COLOR[stage.asset],
                              boxShadow:
                                "sole" in stage && stage.sole
                                  ? "0 0 0 1.5px var(--warning)"
                                  : undefined,
                            }}
                          />
                          <span className="min-w-0 truncate text-[11px] font-medium text-[var(--rem-fg)]">
                            {hop.name}
                          </span>
                        </div>
                      )
                    })}
                </div>
                <p className="text-center text-[11px] font-medium leading-tight text-[var(--rem-muted)]">
                  {stage.label}
                  <span className="mt-0.5 block tabular-nums">
                    {formatCompactMoney(total, "EUR")}
                  </span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Widget>
  )
}

function FundingMixWidget() {
  return (
    <LatticeListCard flush title="Funding mix at authorization">
      <LatticeListRow grow={2} lined={false}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--chart-1)]" />
              <span className="text-sm font-medium text-[var(--rem-fg)]">Fiat accounts</span>
            </div>
            <span className="text-xl font-semibold tabular-nums text-[var(--rem-fg)]">
              {CARDS_FUNDING_MIX.fiatShare}%
            </span>
            <span className="text-xs tabular-nums text-[var(--rem-muted)]">
              {CARDS_FUNDING_MIX.fiatAmount}
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-end gap-1 text-right">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--chart-3)]" />
              <span className="text-sm font-medium text-[var(--rem-fg)]">USDC wallets</span>
            </div>
            <span className="text-xl font-semibold tabular-nums text-[var(--rem-fg)]">
              {CARDS_FUNDING_MIX.stablecoinShare}%
            </span>
            <span className="text-xs tabular-nums text-[var(--rem-muted)]">
              {CARDS_FUNDING_MIX.stablecoinAmount}
            </span>
          </div>
        </div>
        <div
          aria-label={`Fiat ${CARDS_FUNDING_MIX.fiatShare} percent, USDC ${CARDS_FUNDING_MIX.stablecoinShare} percent`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={CARDS_FUNDING_MIX.fiatShare}
          className="flex h-2 w-full overflow-hidden bg-[var(--marketing-surface)]"
          role="progressbar"
        >
          <span
            className="h-full shrink-0"
            style={{
              width: `${CARDS_FUNDING_MIX.fiatShare}%`,
              backgroundImage: chartGradient(1),
            }}
          />
          <span
            className="h-full shrink-0"
            style={{
              width: `${CARDS_FUNDING_MIX.stablecoinShare}%`,
              backgroundImage: chartGradient(3),
            }}
          />
        </div>
      </LatticeListRow>
      <LatticeListRow>
        <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--rem-muted)]">Avg. conversion spread</span>
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {CARDS_FUNDING_MIX.avgSpread}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--rem-muted)]">Merchant payout</span>
            <span className="text-sm font-medium text-[var(--rem-fg)]">Always fiat</span>
          </div>
        </div>
      </LatticeListRow>
    </LatticeListCard>
  )
}

function SettlementWidget() {
  return (
    <Widget flush title="Next on-chain settlement">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-[var(--rem-fg)]">
            {CARDS_SETTLEMENT.nextNetworkSettlement}
          </span>
          <span className="text-sm font-medium text-[var(--rem-muted)]">USDC</span>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--rem-border)] pt-4">
          <span className="text-xs text-[var(--rem-muted)]">USDC collateral</span>
          <ProgressTrack
            label={`${CARDS_SETTLEMENT.committedPct}% of posted collateral committed`}
            value={CARDS_SETTLEMENT.committedPct}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {CARDS_SETTLEMENT.collateralPosted} posted
            </span>
            <span className="text-xs tabular-nums text-[var(--rem-muted)]">
              {(CARDS_SETTLEMENT.coveragePct / 100).toFixed(2)}× coverage
            </span>
          </div>
        </div>
      </div>
    </Widget>
  )
}

function RemittancesBreakdownWidget({ flush = false }: { flush?: boolean }) {
  return (
    <LatticeListCard
      description="credited to recipients"
      flush={flush}
      title="Remittances breakdown"
    >
      <LatticeListRow lined={false}>
        <span className="text-2xl font-semibold tabular-nums text-[var(--rem-fg)]">
          {formatPercent(VALUE_SPLIT.delivered.sharePct)}
        </span>
      </LatticeListRow>
      {BREAKDOWN_LEAKAGE.map((segment) => (
        <LatticeListRow key={segment.key} lined={false}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm text-[var(--rem-fg)]">{segment.label}</span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
                {formatCompactMoney(segment.amount, "EUR")}
              </span>
              <span className="text-xs tabular-nums text-[var(--rem-muted)]">
                {formatPercent(segment.sharePct)}
              </span>
            </span>
          </div>
          <GradientBar
            animated
            tone={segment.tone}
            widthPct={LARGEST_LEAKAGE > 0 ? (segment.sharePct / LARGEST_LEAKAGE) * 100 : 0}
          />
        </LatticeListRow>
      ))}
    </LatticeListCard>
  )
}

const TRANSFER_MONTH_BARS = TRANSFER_COUNTS.slice(-8)

function TransfersMonthWidget({ flush = false }: { flush?: boolean }) {
  return (
    <Widget description="Last 8 months" flush={flush} title="Transfers per month">
      <BarChart series={TRANSFER_MONTH_BARS} />
    </Widget>
  )
}

function TransfersKpi() {
  return (
    <KpiTile
      badge={null}
      caption="Every leg settled end to end"
      chart={false}
      series={TRANSFER_COUNTS.map((point) => point.transfers)}
      title="Transfers settled"
      value={KPIS.transfers30Day}
    />
  )
}

const MASONRY_CONFIG_IDS = new Set(["limits", "economics"])
const MASONRY_WALLET_IDS = new Set(["wallet-custody"])

const cloudKickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const cloudTitleClassName = `relative text-left transition-colors duration-500 ease-out ${landingNewLargeDisplayClassName}`

const CLOUD_ACTION_CHIPS = [
  "Assets",
  "Wallets",
  "Cards",
  "Remittances",
  "Payments",
] as const

type CloudActionChip = (typeof CLOUD_ACTION_CHIPS)[number]

/** Placeholder scene lengths until Cloud has a real demo driver. */
const CLOUD_PLACEHOLDER_MS: Record<CloudActionChip, number> = {
  Assets: 5500,
  Wallets: 6500,
  Cards: 6000,
  Remittances: 7000,
  Payments: 5500,
}

const CLOUD_ACTIVE_CHIP: CloudActionChip = "Remittances"

function CloudActionChips({
  active,
  onActiveChange,
}: {
  active: CloudActionChip
  onActiveChange: (label: CloudActionChip) => void
}) {
  const reduceMotion = useReducedMotion()
  const morphing = useCloudMorphBusy()
  const progress = useMotionValue(0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1)
      return
    }
    if (morphing) return
    progress.set(0)
    const controls = animate(progress, 1, {
      duration: CLOUD_PLACEHOLDER_MS[active] / 1000,
      ease: "linear",
      onComplete: () => {
        const index = CLOUD_ACTION_CHIPS.indexOf(active)
        onActiveChange(CLOUD_ACTION_CHIPS[(index + 1) % CLOUD_ACTION_CHIPS.length])
      },
    })
    return () => controls.stop()
  }, [active, morphing, onActiveChange, progress, reduceMotion, run])

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3" aria-label="Cloud products">
      {CLOUD_ACTION_CHIPS.map((label) => (
        <LandingNewActionChip
          key={label}
          label={label}
          autoplayActive={label === active}
          progress={progress}
          onPress={() => {
            onActiveChange(label)
            setRun((n) => n + 1)
          }}
        />
      ))}
    </div>
  )
}

function CloudTitle({
  product,
  onProductChange,
}: {
  product: CloudActionChip
  onProductChange: (label: CloudActionChip) => void
}) {
  return (
    <LatticePlate>
      <p className={cloudKickerClassName}>Cloud</p>
      <h2
        id="landing-new-cloud-heading"
        className={`${cloudTitleClassName} mt-3 min-w-0 md:mt-4`}
      >
        <span className="whitespace-nowrap">Use Ryle Cloud</span>
        <br />
        and start today.
      </h2>
      <CloudActionChips active={product} onActiveChange={onProductChange} />
    </LatticePlate>
  )
}

type CloudPackFrame = {
  stacked: boolean
  cols: number
  side: number
  sideStart: number | undefined
}

function remittanceCompare() {
  const worstCost = COST_BENCHMARKS.reduce(
    (highest, benchmark) => Math.max(highest, benchmark.costPct),
    0,
  )
  const rail = COST_BENCHMARKS.find((benchmark) => benchmark.isRail)
  const extraPerBase =
    rail && worstCost > 0 ? ((worstCost - rail.costPct) / 100) * COMPARISON_BASE : 0
  const largestCorridor = CORRIDOR_MIX.reduce(
    (highest, entry) => Math.max(highest, entry.volume),
    0,
  )
  return { extraPerBase, largestCorridor, worstCost }
}

function AssetSupplyWidget() {
  const asset = LIVE_ASSETS[0]
  return (
    <LatticeListCard flush title={asset.name}>
      <LatticeListRow lined={false}>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-semibold leading-none tracking-tight tabular-nums text-[var(--rem-fg)]">
            {asset.supply}
          </span>
          <span className="text-sm font-medium leading-none text-[var(--rem-muted)]">
            {asset.symbol}
          </span>
        </div>
      </LatticeListRow>
      <LatticeListRow lined={false}>
        <div className="grid grid-cols-2 gap-x-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--rem-muted)]">Holders</span>
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {asset.holders}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--rem-muted)]">24h volume</span>
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {asset.volume24h}
            </span>
          </div>
        </div>
      </LatticeListRow>
    </LatticeListCard>
  )
}

function AssetActivityWidget() {
  const asset = LIVE_ASSETS[0]
  return (
    <Widget
      description="Holders and mints, last 12 months"
      flush
      legend={
        <div className="flex items-center gap-3 text-xs text-[var(--rem-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-1)]" />
            Holders
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-3)]" />
            Mints
          </span>
        </div>
      }
      title={`${asset.symbol} activity`}
    >
      <DualLineChart
        aKey="holders"
        bKey="mints"
        formatY={(value) => String(Math.round(value))}
        series={asset.activity}
      />
    </Widget>
  )
}

const MORPH_CELL = "overflow-visible"
const MORPH_BODY = "overflow-visible"

const SEED_ASSET_CONFIG = LIVE_ASSETS[0].config
const FLOW_MIX_ROWS = 4
const FUNDING_MIX_ROWS = 4
const BALANCES_ROWS = 2 + WALLET_ASSET_MIX.length
const BREAKDOWN_ROWS = 2 + BREAKDOWN_LEAKAGE.length
const CORRIDOR_ROWS = 1 + CORRIDOR_MIX.length
const COST_COMPARE_ROWS = 2 + COST_BENCHMARKS.length
const LIMITS_ROWS = configCount(SEED_ASSET_CONFIG, "limits")
const ECONOMICS_ROWS = configCount(SEED_ASSET_CONFIG, "economics")
const FEATURES_ROWS = configCount(WALLET_CONFIG_SECTIONS, "wallet-features")
const ACCESS_ROWS = configCount(WALLET_CONFIG_SECTIONS, "wallet-access")
const SPLIT_PACKS = new Set<CloudActionChip>(["Assets", "Wallets", "Remittances"])

/**
 * Per-pack spans for slots 2–8. List cards are one cell per header/item so
 * adding a row grows the cell; mix/chart widgets keep a leftover cell.
 * Slot 8 is the split companion (fee / access) and is omitted for Cards/Payments.
 */
const CLOUD_PACK_ITEM_ROWS: Record<
  CloudActionChip,
  readonly [number, number, number, number, number, number, number]
> = {
  Assets: [
    configCount(SEED_ASSET_CONFIG, "status"),
    configCount(SEED_ASSET_CONFIG, "roles"),
    LIMITS_ROWS,
    configCount(SEED_ASSET_CONFIG, "behavior"),
    CHART_MIN_ROWS,
    CHART_MIN_ROWS - 2,
    ECONOMICS_ROWS,
  ],
  Wallets: [
    FEATURES_ROWS,
    FLOW_MIX_ROWS,
    configCount(WALLET_CONFIG_SECTIONS, "wallet-assets"),
    configCount(WALLET_CONFIG_SECTIONS, "wallet-limits"),
    BALANCES_ROWS,
    TRANSFERS_ROWS,
    ACCESS_ROWS,
  ],
  Cards: [3, 4, 3, 3, 3, TRANSFERS_ROWS, 0],
  Remittances: [
    configCount(WALLET_CONFIG_SECTIONS, "wallet-custody"),
    FUNDING_MIX_ROWS,
    LIMITS_ROWS,
    BREAKDOWN_ROWS,
    BALANCES_ROWS,
    TRANSFERS_ROWS,
    ECONOMICS_ROWS,
  ],
  Payments: [
    CORRIDOR_ROWS,
    COST_COMPARE_ROWS,
    3,
    BREAKDOWN_ROWS,
    CHART_MIN_ROWS,
    TRANSFERS_ROWS,
    0,
  ],
}

function CloudSideSlot({
  frame,
  children,
}: {
  frame: CloudPackFrame
  children: ReactNode
}) {
  return (
    <LatticeCell
      bodyClassName={MORPH_BODY}
      className={MORPH_CELL}
      colStart={frame.sideStart}
      cols={frame.side}
      minRows={SPEND_ROWS}
      rowStart={frame.stacked ? undefined : 1}
      rows={frame.stacked ? "auto" : SPEND_ROWS}
      shiftIndex={0}
    >
      <CloudMorphCard index={0}>{children}</CloudMorphCard>
    </LatticeCell>
  )
}

function CloudKpiSlot({
  frame,
  children,
}: {
  frame: CloudPackFrame
  children: ReactNode
}) {
  return (
    <LatticeCell
      bodyClassName={MORPH_BODY}
      className={MORPH_CELL}
      cols={frame.stacked ? frame.cols : TRANSFERS_COLS}
      minRows={2}
      rows={frame.stacked ? "auto" : 2}
      shiftIndex={1}
    >
      <CloudMorphCard index={1}>{children}</CloudMorphCard>
    </LatticeCell>
  )
}

function CloudItemCell({
  index,
  cols,
  minRows,
  stacked,
  children,
}: {
  index: number
  cols: number
  minRows: number
  stacked: boolean
  children: ReactNode
}) {
  return (
    <LatticeCell
      bodyClassName={MORPH_BODY}
      className={MORPH_CELL}
      cols={cols}
      minRows={minRows}
      rows={stacked ? "auto" : minRows}
      shiftIndex={index}
    >
      <CloudMorphCard index={index}>{children}</CloudMorphCard>
    </LatticeCell>
  )
}

function SentVsDeliveredChart({ flush = false }: { flush?: boolean }) {
  return (
    <Widget
      description="Monthly EUR-equivalent volume, last 12 months"
      flush={flush}
      legend={
        <div className="flex items-center gap-3 text-xs text-[var(--rem-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-1)]" />
            Sent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-3)]" />
            Delivered
          </span>
        </div>
      }
      title="Sent vs delivered"
    >
      <DualLineChart
        aKey="sent"
        bKey="delivered"
        formatY={(value) => formatCompactMoney(value * 1000, "EUR")}
        series={VOLUME_TREND}
      />
    </Widget>
  )
}

function CloudSideBody({ product }: { product: CloudActionChip }) {
  if (product === "Assets") return <AssetActivityWidget />
  if (product === "Wallets") return <WalletFlowMixWidget flush />
  if (product === "Cards") return <SpendChart flush />
  if (product === "Payments") return <TransfersMonthWidget flush />
  return <SentVsDeliveredChart flush />
}

function CloudKpiBody({ product }: { product: CloudActionChip }) {
  const asset = LIVE_ASSETS[0]
  if (product === "Assets") {
    return (
      <KpiTile
        badge={null}
        caption="Unique holders on this asset"
        chart={false}
        hero
        series={asset.activity.map((point) => point.holders)}
        title="Holders"
        value={asset.holders}
      />
    )
  }
  if (product === "Wallets") {
    return (
      <KpiTile
        badge={null}
        caption="Across all wallets"
        chart={false}
        hero
        series={WALLET_ASSET_MIX.map((entry) => entry.valueUsd)}
        title="Total held"
        value={WALLET_BALANCES.totalLabel}
      />
    )
  }
  if (product === "Cards") {
    return (
      <KpiTile
        badge={null}
        caption="vs previous month"
        chart={false}
        hero
        series={CARDS_KPIS.activeCardsTrend}
        title="Active cards"
        value={CARDS_KPIS.activeCards}
      />
    )
  }
  if (product === "Payments") {
    return (
      <KpiTile
        badge={null}
        caption="Fee plus FX spread, blended"
        chart={false}
        hero
        lowerIsBetter
        series={COST_TREND}
        title="All-in cost"
        value={KPIS.avgCost}
      />
    )
  }
  return <TransfersKpi />
}

function CloudItemBody({
  product,
  slot,
}: {
  product: CloudActionChip
  slot: 2 | 3 | 4 | 5 | 6 | 7 | 8
}) {
  const asset = LIVE_ASSETS[0]
  const { extraPerBase, largestCorridor, worstCost } = remittanceCompare()
  const deliverySeries = DELIVERY_TREND.map((point) => point.seconds)

  if (slot === 2) {
    if (product === "Assets") {
      return <CloudConfigSection id="status" sections={asset.config} />
    }
    if (product === "Wallets") {
      return <CloudConfigSection id="wallet-features" sections={WALLET_CONFIG_SECTIONS} />
    }
    if (product === "Cards") {
      return (
        <KpiTile
          caption="Held against card balances"
          series={CARDS_KPIS.custodyTrend}
          title="USDC in custody"
          value={formatCompactMoney(CARDS_KPIS.usdcInCustodyAmount, "USD")}
        />
      )
    }
    if (product === "Payments") {
      return <CorridorMixWidget flush largestCorridor={largestCorridor} />
    }
    return <CloudConfigSection id="wallet-custody" sections={WALLET_CONFIG_SECTIONS} />
  }

  if (slot === 3) {
    if (product === "Assets") {
      return <CloudConfigSection id="roles" sections={asset.config} />
    }
    if (product === "Wallets") return <WalletFlowMixWidget flush />
    if (product === "Payments") {
      return <CostCompareWidget extraPerBase={extraPerBase} flush worstCost={worstCost} />
    }
    return <FundingMixWidget />
  }

  if (slot === 4) {
    if (product === "Cards") {
      return (
        <KpiTile
          caption="Fiat and USDC legs combined"
          series={CARDS_KPIS.volumeTrend}
          title="30-day spend"
          value={formatCompactMoney(CARDS_KPIS.volume30DayAmount, "USD")}
        />
      )
    }
    if (product === "Payments") {
      return (
        <KpiTile
          caption="Average of last 1000 transactions"
          lowerIsBetter
          series={deliverySeries}
          title="Median delivery"
          value={KPIS.medianDelivery}
        />
      )
    }
    if (product === "Wallets") {
      return <CloudConfigSection id="wallet-assets" sections={WALLET_CONFIG_SECTIONS} />
    }
    return <CloudConfigSection id="limits" sections={asset.config} />
  }

  if (slot === 5) {
    if (product === "Assets") {
      return <CloudConfigSection id="behavior" sections={asset.config} />
    }
    if (product === "Wallets") {
      return <CloudConfigSection id="wallet-limits" sections={WALLET_CONFIG_SECTIONS} />
    }
    if (product === "Cards") {
      return (
        <KpiTile
          badge={
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CHIP.success}`}>
              Collected
            </span>
          }
          caption="Network fee collections"
          series={CARDS_KPIS.feesTrend}
          title="Collected fees"
          value={formatCompactMoney(CARDS_KPIS.collectedFees, "USD")}
        />
      )
    }
    return <RemittancesBreakdownWidget flush />
  }

  if (slot === 6) {
    if (product === "Assets") return <AssetActivityWidget />
    if (product === "Cards") return <SettlementWidget />
    if (product === "Payments") return <SentVsDeliveredChart flush />
    return <WalletBalancesWidget flush />
  }

  if (slot === 8) {
    if (product === "Wallets") {
      return <CloudConfigSection id="wallet-access" sections={WALLET_CONFIG_SECTIONS} />
    }
    return <CloudConfigSection id="economics" sections={asset.config} />
  }

  if (product === "Assets") return <AssetSupplyWidget />
  return <TransfersMonthWidget flush />
}

function CloudPack({
  frame,
  visuals,
}: {
  frame: CloudPackFrame
  visuals: readonly CloudActionChip[]
}) {
  const { stacked, cols } = frame
  const rowsFor = (index: number) => CLOUD_PACK_ITEM_ROWS[visuals[index]][index - 2]

  return (
    <>
      <CloudSideSlot frame={frame}>
        <CloudSideBody product={visuals[0]} />
      </CloudSideSlot>
      <CloudKpiSlot frame={frame}>
        <CloudKpiBody product={visuals[1]} />
      </CloudKpiSlot>
      <CloudItemCell cols={FEATURE_CARD_COLS} index={2} minRows={rowsFor(2)} stacked={stacked}>
        <CloudItemBody product={visuals[2]} slot={2} />
      </CloudItemCell>
      <CloudItemCell
        cols={stacked ? cols : visuals[3] === "Assets" ? ROLES_COLS : FUNDING_COLS}
        index={3}
        minRows={rowsFor(3)}
        stacked={stacked}
      >
        <CloudItemBody product={visuals[3]} slot={3} />
      </CloudItemCell>
      <CloudItemCell
        cols={stacked ? cols : LIMITS_COLS}
        index={4}
        minRows={rowsFor(4)}
        stacked={stacked}
      >
        <CloudItemBody product={visuals[4]} slot={4} />
      </CloudItemCell>
      <CloudItemCell
        cols={stacked ? cols : BREAKDOWN_COLS}
        index={5}
        minRows={rowsFor(5)}
        stacked={stacked}
      >
        <CloudItemBody product={visuals[5]} slot={5} />
      </CloudItemCell>
      <CloudItemCell cols={FEATURE_CARD_COLS} index={6} minRows={rowsFor(6)} stacked={stacked}>
        <CloudItemBody product={visuals[6]} slot={6} />
      </CloudItemCell>
      <CloudItemCell
        cols={stacked ? cols : FEATURE_CARD_COLS}
        index={7}
        minRows={rowsFor(7)}
        stacked={stacked}
      >
        <CloudItemBody product={visuals[7]} slot={7} />
      </CloudItemCell>
      {SPLIT_PACKS.has(visuals[8]) ? (
        <CloudItemCell
          cols={stacked ? cols : LIMITS_COLS}
          index={8}
          minRows={rowsFor(8)}
          stacked={stacked}
        >
          <CloudItemBody product={visuals[8]} slot={8} />
        </CloudItemCell>
      ) : null}
    </>
  )
}

function CloudWidgetCells() {
  const { cols, stacked } = useLatticeGrid()
  const [product, setProduct] = useState<CloudActionChip>(CLOUD_ACTIVE_CHIP)
  const side = stacked ? cols : FEATURE_CARD_COLS
  const titleCols = stacked ? cols : cols - FEATURE_CARD_COLS
  const sideStart = stacked ? undefined : titleCols + 1
  const frame: CloudPackFrame = { stacked, cols, side, sideStart }

  return (
    <CloudMorphRoot immediate={[0]} product={product}>
      {(visuals) => (
        <>
          <LatticeCell
            colStart={stacked ? undefined : 1}
            cols={titleCols}
            minRows={TITLE_ROWS}
            paper={false}
            rowStart={stacked ? undefined : 1}
            rows={stacked ? "auto" : TITLE_ROWS}
            stroke={false}
          >
            <CloudTitle product={product} onProductChange={setProduct} />
          </LatticeCell>
          <CloudPack frame={frame} visuals={visuals} />
        </>
      )}
    </CloudMorphRoot>
  )
}

function CloudWidgetGrid() {
  return (
    <LatticeGrid className="overflow-visible" minCols={FEATURE_ROW_MIN_COLS} dense>
      <CloudWidgetCells />
    </LatticeGrid>
  )
}

function CloudConfigSection({
  id,
  sections,
}: {
  id: string
  sections: readonly AssetConfigSection[]
}) {
  const section = sections.find((item) => item.id === id)
  return section ? <AssetConfigSectionBlock hideTitle section={section} /> : null
}

function AssetConfigSectionBlock({
  section,
  hideTitle = false,
}: {
  section: AssetConfigSection
  hideTitle?: boolean
}) {
  return (
    <LatticeListCard
      flush
      label={hideTitle ? section.title : undefined}
      title={hideTitle ? undefined : section.title}
    >
      {section.rows.map((row, index) => {
        const Icon = CONFIG_ICON[row.icon]
        const hideDescription = row.kind === "chip"
        return (
          <LatticeListRow
            key={row.id}
            lined={hideTitle ? index > 0 : true}
            row
          >
            {row.token ? (
              <LandingNewWalletAssetMark className="size-8" name={row.token} />
            ) : (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--marketing-surface)] text-[var(--rem-muted)]">
                <Icon aria-hidden className="size-3.5" strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-none text-[var(--rem-fg)]">
                {row.title}
              </p>
              {hideDescription ? null : row.kind === "address" ? (
                <p className="mt-1 font-mono text-xs font-semibold leading-none text-[var(--rem-muted)]">
                  {truncateAddress(row.description)}
                </p>
              ) : (
                <p
                  className={`mt-1 text-xs leading-none text-[var(--rem-muted)] ${
                    row.kind === "placeholder" ? "italic" : ""
                  }`}
                >
                  {row.description}
                </p>
              )}
            </div>
            {row.kind === "chip" && row.chip ? (
              <span
                className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${CONFIG_CHIP[row.chip.tone]}`}
              >
                {row.chip.label}
              </span>
            ) : null}
          </LatticeListRow>
        )
      })}
    </LatticeListCard>
  )
}

function SpendChart({ flush = false }: { flush?: boolean }) {
  return (
    <Widget
      description="Monthly authorization volume, last 12 months"
      flush={flush}
      legend={
        <div className="flex items-center gap-3 text-xs text-[var(--rem-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-1)]" />
            Fiat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-3)]" />
            USDC
          </span>
        </div>
      }
      title="Spend by funding source"
    >
      <DualLineChart
        aKey="fiat"
        bKey="usdc"
        formatY={(value) => formatCompactMoney(value * 1000, "USD")}
        series={CARDS_SPEND}
      />
    </Widget>
  )
}

function AssetsCells({
  asset,
  onAssetChange,
}: {
  asset: (typeof LIVE_ASSETS)[number]
  onAssetChange: (id: LiveAssetId) => void
}) {
  const { cols, stacked } = useLatticeGrid()
  const tile = stacked
    ? cols
    : cols >= 12
      ? Math.floor(cols / 2)
      : cols

  return (
    <>
      <LatticeCell cols="full" minRows={1}>
        <div
          aria-label="Live assets"
          className="flex h-full flex-wrap items-center gap-1 px-4"
          role="tablist"
        >
          {LIVE_ASSETS.map((item) => {
            const selected = item.id === asset.id
            return (
              <button
                key={item.id}
                aria-selected={selected}
                className={
                  selected
                    ? "rounded-full bg-black/[0.06] px-3 py-1 text-[13px] text-neutral-800"
                    : "rounded-full px-3 py-1 text-[13px] text-neutral-400 hover:text-neutral-600"
                }
                role="tab"
                type="button"
                onClick={() => onAssetChange(item.id)}
              >
                {item.symbol}
              </button>
            )
          })}
        </div>
      </LatticeCell>
      {asset.config
        .filter((section) => !MASONRY_CONFIG_IDS.has(section.id))
        .map((section) => (
          <LatticeCell
            key={section.id}
            cols={section.id === "roles" && !stacked ? Math.max(1, tile - 1) : tile}
            minRows={1 + section.rows.length}
          >
            <AssetConfigSectionBlock section={section} />
          </LatticeCell>
        ))}
    </>
  )
}

function AssetsBand() {
  const [assetId, setAssetId] = useState<LiveAssetId>(LIVE_ASSETS[0].id)
  const asset = LIVE_ASSETS.find((item) => item.id === assetId) ?? LIVE_ASSETS[0]

  return (
    <DashboardGrid className={LATTICE_SPACE.block} minCols={PAIR_MIN_COLS}>
      <AssetsCells asset={asset} onAssetChange={setAssetId} />
    </DashboardGrid>
  )
}

function WalletFlowMixWidget({ flush = false }: { flush?: boolean }) {
  const mix = WALLET_FLOW_MIX
  return (
    <LatticeListCard description="Send, receive, and swap" flush={flush} title="Flow mix · 30 days">
      <LatticeListRow grow={2}>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              {
                name: "Send",
                share: mix.sendShare,
                amount: mix.sendAmount,
                color: "var(--chart-1)",
                align: "items-start text-left",
              },
              {
                name: "Receive",
                share: mix.receiveShare,
                amount: mix.receiveAmount,
                color: "var(--chart-3)",
                align: "items-center text-center",
              },
              {
                name: "Swap",
                share: mix.convertShare,
                amount: mix.convertAmount,
                color: "var(--chart-4)",
                align: "items-end text-right",
              },
            ] as const
          ).map((leg) => (
            <div key={leg.name} className={`flex min-w-0 flex-col gap-0.5 ${leg.align}`}>
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: leg.color }}
                />
                <span className="text-sm font-medium text-[var(--rem-fg)]">{leg.name}</span>
              </div>
              <span className="text-xl font-semibold tabular-nums text-[var(--rem-fg)]">
                {leg.share}%
              </span>
              <span className="text-xs tabular-nums text-[var(--rem-muted)]">{leg.amount}</span>
            </div>
          ))}
        </div>
        <div
          aria-label={`Send ${mix.sendShare} percent, receive ${mix.receiveShare} percent, swap ${mix.convertShare} percent`}
          className="flex h-2 w-full overflow-hidden bg-[var(--rem-secondary)]"
          role="img"
        >
          <span
            className="h-full shrink-0"
            style={{ width: `${mix.sendShare}%`, backgroundImage: chartGradient(1) }}
          />
          <span
            className="h-full shrink-0"
            style={{ width: `${mix.receiveShare}%`, backgroundImage: chartGradient(3) }}
          />
          <span
            className="h-full shrink-0"
            style={{ width: `${mix.convertShare}%`, backgroundImage: chartGradient(4) }}
          />
        </div>
      </LatticeListRow>
      <LatticeListRow>
        <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--rem-muted)]">Avg. send size</span>
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {mix.avgSendSize}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--rem-muted)]">Avg. swap size</span>
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {mix.avgConvertSize}
            </span>
          </div>
        </div>
      </LatticeListRow>
    </LatticeListCard>
  )
}

function WalletBalancesWidget({ flush = false }: { flush?: boolean }) {
  const largest = Math.max(...WALLET_ASSET_MIX.map((entry) => entry.valueUsd))
  return (
    <LatticeListCard flush={flush} title="Balances held across all wallets">
      <LatticeListRow lined={false}>
        <span className="text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-[var(--rem-fg)]">
          {WALLET_BALANCES.totalLabel}
        </span>
      </LatticeListRow>
      {WALLET_ASSET_MIX.map((entry) => (
        <LatticeListRow key={entry.asset} lined={false}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <LandingNewWalletAssetMark className="size-3.5" name={entry.asset} />
              <span className="text-sm text-[var(--rem-fg)]">{entry.asset}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
                {formatCompactMoney(entry.valueUsd, "USD")}
              </span>
              <span className="text-xs tabular-nums text-[var(--rem-muted)]">
                {entry.sharePct}%
              </span>
            </span>
          </div>
          <GradientBar
            tone={entry.tone}
            widthPct={largest > 0 ? (entry.valueUsd / largest) * 100 : 0}
          />
        </LatticeListRow>
      ))}
    </LatticeListCard>
  )
}

function WalletsOpsRow() {
  return (
    <LatticeCell cols="full" minRows={FLOW_MIX_ROWS}>
      <WalletFlowMixWidget />
    </LatticeCell>
  )
}

function WalletsConfigCells() {
  const { cols, stacked } = useLatticeGrid()
  const tile = stacked ? cols : cols >= 12 ? Math.floor(cols / 2) : cols

  return (
    <>
      {WALLET_CONFIG_SECTIONS.filter((section) => !MASONRY_WALLET_IDS.has(section.id)).map(
        (section) => (
          <LatticeCell key={section.id} cols={tile} minRows={1 + section.rows.length}>
            <AssetConfigSectionBlock section={section} />
          </LatticeCell>
        ),
      )}
    </>
  )
}

function WalletsBand() {
  return (
    <>
      <DashboardGrid className={LATTICE_SPACE.block} dense minCols={PAIR_MIN_COLS}>
        <WalletsOpsRow />
      </DashboardGrid>
      <DashboardGrid dense minCols={PAIR_MIN_COLS}>
        <WalletsConfigCells />
      </DashboardGrid>
    </>
  )
}

function CorridorMixWidget({
  largestCorridor,
  flush = false,
}: {
  largestCorridor: number
  flush?: boolean
}) {
  return (
    <LatticeListCard
      description="Rolling 30 days, EUR-equivalent sent"
      flush={flush}
      title="Volume by corridor"
    >
      {CORRIDOR_MIX.map((entry) => (
        <LatticeListRow key={entry.route}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm text-[var(--rem-fg)]">{entry.route}</span>
              {entry.status !== "LIVE" ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CHIP.pilot}`}>
                  Pilot
                </span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
                {formatCompactMoney(entry.volume, "EUR")}
              </span>
              <span className="text-xs tabular-nums text-[var(--rem-muted)]">
                {entry.share}%
              </span>
            </span>
          </div>
          <GradientBar
            animated
            widthPct={largestCorridor > 0 ? (entry.volume / largestCorridor) * 100 : 0}
          />
        </LatticeListRow>
      ))}
    </LatticeListCard>
  )
}

function CostCompareWidget({
  extraPerBase,
  worstCost,
  flush = false,
}: {
  extraPerBase: number
  worstCost: number
  flush?: boolean
}) {
  return (
    <LatticeListCard flush={flush} title="Cost comparison with competitors">
      {COST_BENCHMARKS.map((benchmark) => (
        <LatticeListRow key={benchmark.channel}>
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`truncate text-sm ${
                benchmark.isRail
                  ? "font-medium text-[var(--rem-fg)]"
                  : "text-[var(--rem-muted)]"
              }`}
            >
              {benchmark.channel}{" "}
              <span className="font-normal text-[var(--rem-muted)]">
                ({benchmark.settlement.toLowerCase()})
              </span>
            </span>
            <span className="text-sm font-medium tabular-nums text-[var(--rem-fg)]">
              {formatPercent(benchmark.costPct)}
            </span>
          </div>
          <GradientBar
            animated
            tone={benchmark.isRail ? 1 : 4}
            widthPct={worstCost > 0 ? (benchmark.costPct / worstCost) * 100 : 0}
          />
        </LatticeListRow>
      ))}
      <LatticeListRow>
        <p className="text-sm text-[var(--rem-fg)]">
          <span className="font-medium tabular-nums">{formatMoney(extraPerBase, "EUR")}</span>{" "}
          more reaches the recipient on every {formatMoney(COMPARISON_BASE, "EUR")} sent,
          compared with bank rails.
        </p>
      </LatticeListRow>
    </LatticeListCard>
  )
}

function RemittancesTrioRow({
  extraPerBase,
  largestCorridor,
  worstCost,
}: {
  extraPerBase: number
  largestCorridor: number
  worstCost: number
}) {
  const { cols, stacked } = useLatticeGrid()
  const [a, b, c] = stacked ? [cols, cols, cols] : splitAcross(cols, 3)

  return (
    <>
      <LatticeCell cols={a} minRows={CORRIDOR_ROWS}>
        <CorridorMixWidget largestCorridor={largestCorridor} />
      </LatticeCell>
      <LatticeCell cols={b} minRows={COST_COMPARE_ROWS}>
        <CostCompareWidget extraPerBase={extraPerBase} worstCost={worstCost} />
      </LatticeCell>
      <LatticeCell cols={c} minRows={WIDGET_MIN_ROWS}>
        <SpendChart />
      </LatticeCell>
    </>
  )
}

function RemittancesPairRow() {
  const { cols, stacked } = useLatticeGrid()
  const transferCols = stacked ? cols : TRANSFERS_COLS
  const chartCols = stacked ? cols : cols - TRANSFERS_COLS

  return (
    <>
      <LatticeCell cols={chartCols} minRows={CHART_MIN_ROWS}>
        <Widget
          description="Monthly EUR-equivalent volume, last 12 months"
          legend={
            <div className="flex items-center gap-3 text-xs text-[var(--rem-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-1)]" />
                Sent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-3)]" />
                Delivered
              </span>
            </div>
          }
          title="Sent vs delivered"
        >
          <DualLineChart
            aKey="sent"
            bKey="delivered"
            formatY={(value) => formatCompactMoney(value * 1000, "EUR")}
            series={VOLUME_TREND}
          />
        </Widget>
      </LatticeCell>
      <LatticeCell cols={transferCols} minRows={TRANSFERS_ROWS}>
        <TransfersMonthWidget />
      </LatticeCell>
    </>
  )
}

function RemittancesOverview() {
  const deliverySeries = DELIVERY_TREND.map((point) => point.seconds)
  const { extraPerBase, largestCorridor, worstCost } = remittanceCompare()
  return (
    <>
      <DashboardGrid
        className={LATTICE_SPACE.block}
        dense
        minCols={KPI_MIN_COLS}
      >
        <LatticeCell cols={4} minRows={KPI_MIN_ROWS} rows={3}>
          <KpiTile
            caption="vs previous month"
            series={CARDS_KPIS.activeCardsTrend}
            title="Active cards"
            value={CARDS_KPIS.activeCards}
          />
        </LatticeCell>
        <LatticeCell cols={4} minRows={KPI_MIN_ROWS} rows={3}>
          <KpiTile
            caption="Held against card balances"
            series={CARDS_KPIS.custodyTrend}
            title="USDC in custody"
            value={formatCompactMoney(CARDS_KPIS.usdcInCustodyAmount, "USD")}
          />
        </LatticeCell>
        <LatticeCell cols={4} minRows={KPI_MIN_ROWS} rows={3}>
          <KpiTile
            caption="Average of last 1000 transactions"
            lowerIsBetter
            series={deliverySeries}
            title="Median delivery"
            value={KPIS.medianDelivery}
          />
        </LatticeCell>
        <LatticeCell cols={4} minRows={KPI_MIN_ROWS} rows={3}>
          <KpiTile
            caption="Fiat and USDC legs combined"
            series={CARDS_KPIS.volumeTrend}
            title="30-day spend volume"
            value={formatCompactMoney(CARDS_KPIS.volume30DayAmount, "USD")}
          />
        </LatticeCell>
        <LatticeCell cols={4} minRows={KPI_MIN_ROWS} rows={3}>
          <KpiTile
            caption="Fee plus FX spread, blended"
            lowerIsBetter
            series={COST_TREND}
            title="All-in cost"
            value={KPIS.avgCost}
          />
        </LatticeCell>
        <LatticeCell cols={4} minRows={KPI_MIN_ROWS} rows={3}>
          <KpiTile
            badge={
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CHIP.success}`}>
                Collected
              </span>
            }
            caption="Network fee collections · monthly close"
            series={CARDS_KPIS.feesTrend}
            title="Collected fees"
            value={formatCompactMoney(CARDS_KPIS.collectedFees, "USD")}
          />
        </LatticeCell>
      </DashboardGrid>
      <DashboardGrid minCols={KPI_MIN_COLS}>
        <LatticeCell cols="full" minRows={RAIL_MIN_ROWS}>
          <RailFlow />
        </LatticeCell>
      </DashboardGrid>
      <DashboardGrid dense minCols={KPI_MIN_COLS}>
        <RemittancesTrioRow
          extraPerBase={extraPerBase}
          largestCorridor={largestCorridor}
          worstCost={worstCost}
        />
      </DashboardGrid>
      <DashboardGrid dense minCols={PAIR_MIN_COLS}>
        <RemittancesPairRow />
      </DashboardGrid>
    </>
  )
}

/**
 * Mixed remittances / cards / assets dashboard. Widgets sit on the
 * full-bleed lattice (tracks still start on a column line).
 */
export function LandingNewRemittancesDashboard() {
  return <CloudWidgetGrid />
}
