"use client"

import React from "react"
import { motion } from "motion/react"
import {
  LuArrowDownLeft,
  LuArrowUpDown,
  LuArrowUpRight,
  LuCircleFadingPlus,
  LuQrCode,
  LuShield,
} from "react-icons/lu"

// ─── Shared icons ────────────────────────────────────────────────────────────

/** Lucide icons for wallet intents (home chips + activity row badges). */
export const MOVEMENT_ACTION_ICONS = {
  send: LuArrowUpRight,
  receive: LuArrowDownLeft,
  pay: LuQrCode,
  swap: LuArrowUpDown,
  request: LuCircleFadingPlus,
  shield: LuShield,
} as const

export function ArrowLeft({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="13" y1="8" x2="3" y2="8" />
      <polyline points="7 4 3 8 7 12" />
    </svg>
  )
}

export function XIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="12" y2="12" />
      <line x1="12" y1="2" x2="2" y2="12" />
    </svg>
  )
}

export function CopyIcon({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="8" height="8" rx="1" />
      <path d="M2 10V2h8" />
    </svg>
  )
}

// ─── List row typography (Activity + Send recipient rows) ────────────────────

export const MOVEMENT_LIST_ROW_TITLE_CLASS =
  "text-[15px] font-normal leading-[1.4] tracking-[-0.01em] text-foreground"

export const MOVEMENT_LIST_ROW_SECONDARY_CLASS =
  "text-sm leading-snug tracking-[-0.01em] font-normal text-muted"

export const MOVEMENT_LIST_AMOUNT_CLASS =
  "text-[16px] leading-[1.4] tracking-[-0.01em] font-medium tabular-nums text-foreground shrink-0 text-right"

export const MOVEMENT_LIST_ROW_BUTTON_CLASS =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl text-left transition-[opacity,transform] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

export const MOVEMENT_LIST_AVATAR_CLASS = "!h-[39px] !w-[39px] !text-[14px]"

export const MOVEMENT_LIST_ROW_LEADING_SLOT_CLASS =
  "flex h-[39px] w-[39px] shrink-0 items-center justify-center"

/** Section label above lists (Activity, Favorites, Your card…). */
export const SECTION_LABEL_CLASS =
  "min-w-0 text-[13px] font-medium leading-snug tracking-[-0.01em] text-muted"

// ─── Home action chip chrome ─────────────────────────────────────────────────

export const HOME_ACTION_CHIP_SURFACE_STYLE = {
  backgroundImage:
    "linear-gradient(var(--surface), var(--surface)), var(--home-action-chip-stroke)",
} as const

export const HOME_SEND_SEARCH_SHELL_CLASS =
  "flex min-h-12 w-full flex-row items-center gap-2.5 rounded-2xl border border-transparent px-4 py-3 text-left font-normal text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle] [transform:translateZ(0)]"

export const HOME_SEND_SEARCH_INPUT_CLASS =
  "min-h-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] font-normal leading-snug tracking-[-0.01em] text-foreground outline-none placeholder:font-normal placeholder:text-muted-light"

export const HOME_HERO_ICON_SIZE_PX = 22

export const HOME_HERO_ICON_BUTTON_CLASS =
  "shrink-0 cursor-pointer rounded-xl py-2.5 pl-2.5 pr-0 text-foreground transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

// ─── Spinner ─────────────────────────────────────────────────────────────────

type SpinnerSize = "sm" | "md" | "lg"
type SpinnerTone = "default" | "onDark"

const SPINNER_SIZE: Record<SpinnerSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-9 w-9",
}

const SPINNER_TONE: Record<SpinnerTone, string> = {
  default: "border-2 border-border-strong border-t-foreground",
  onDark: "border-2 border-white/30 border-t-white",
}

export function Spinner({
  size = "md",
  tone = "default",
  className = "",
}: {
  size?: SpinnerSize
  tone?: SpinnerTone
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 animate-spin rounded-full ${SPINNER_SIZE[size]} ${SPINNER_TONE[tone]} ${className}`.trim()}
    />
  )
}

// ─── NumPad ──────────────────────────────────────────────────────────────────

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
] as const

export function NumPad({
  onKey,
  className,
  bold = false,
}: {
  onKey: (key: string) => void
  className?: string
  bold?: boolean
}) {
  return (
    <div className={`grid grid-cols-3 gap-y-1 px-0 ${className ?? "pt-9"}`}>
      {KEYS.map((row, r) =>
        row.map((key) => (
          <button
            key={`${r}-${key}`}
            type="button"
            data-demo-key={key}
            onClick={() => onKey(key)}
            className="flex h-14 cursor-pointer items-center justify-center rounded-2xl transition-colors active:bg-background"
          >
            {key === "⌫" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={bold ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="13" y2="14" />
                <line x1="13" y1="9" x2="18" y2="14" />
              </svg>
            ) : (
              <span
                className={`text-[18px] tracking-[-0.02em] text-foreground ${bold ? "font-bold" : "font-medium"}`}
              >
                {key}
              </span>
            )}
          </button>
        )),
      )}
    </div>
  )
}

// ─── Skeleton row ────────────────────────────────────────────────────────────

export function TransactionRowSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`mb-8 flex items-center gap-3 ${className}`.trim()} aria-hidden>
      <div className="h-[39px] w-[39px] shrink-0 animate-pulse rounded-full bg-muted/25" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-[15px] w-32 animate-pulse rounded bg-muted/25" />
        <div className="h-[13px] w-20 animate-pulse rounded bg-muted/20" />
      </div>
      <div className="h-[15px] w-16 animate-pulse rounded bg-muted/25" />
    </div>
  )
}

// ─── Discovered row (spring reveal on intersection) ─────────────────────────

/** Seconds per row stagger. */
export const DISCOVERED_ROW_STAGGER_S = 0.055

export function DiscoveredIntersectionRow({
  scrollRootRef,
  revealDelay = 0,
  className = "",
  style,
  children,
}: {
  scrollRootRef?: React.RefObject<Element | null>
  revealDelay?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const rowRef = React.useRef<HTMLDivElement>(null)
  const [discovered, setDiscovered] = React.useState(false)

  React.useEffect(() => {
    if (discovered) return
    const node = rowRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDiscovered(true)
          observer.disconnect()
        }
      },
      { root: scrollRootRef?.current ?? null, threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [discovered, scrollRootRef])

  return (
    <motion.div
      ref={rowRef}
      className={className}
      initial={false}
      animate={{ opacity: discovered ? 1 : 0.3, scale: discovered ? 1 : 0.9 }}
      transition={{ type: "spring", stiffness: 420, damping: 34, delay: revealDelay }}
      style={{ transformOrigin: "center center", ...style }}
    >
      {children}
    </motion.div>
  )
}

// ─── Confirm CTA (amount steps) ──────────────────────────────────────────────

const CONFIRM_BUTTON_BASE_CLASS =
  "flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-center text-[16px] font-medium leading-snug tracking-[-0.01em] transition-[opacity,background-color,color] active:opacity-90 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [corner-shape:squircle] [transform:translateZ(0)]"

export const READY_BLUE_GRADIENT =
  "linear-gradient(135deg, #33A9FF 0%, #0095FF 48%, #0086E8 100%)"

export function ConfirmAmountButton({
  label,
  disabled,
  pending,
  onPress,
  hintMessage,
  blockingMessage,
}: {
  label: string
  disabled: boolean
  pending: boolean
  onPress: () => void | Promise<void>
  hintMessage?: string | null
  blockingMessage?: string | null
}) {
  const isError = Boolean(blockingMessage)
  const isHint = !isError && Boolean(hintMessage)
  const isReady = !isError && !isHint
  const buttonLabel = isError ? blockingMessage! : isHint ? hintMessage! : label

  const toneClass = isError
    ? "bg-[#FF3B30] text-white focus-visible:outline-[#FF3B30] disabled:opacity-100"
    : isHint
      ? "bg-surface-tint text-muted focus-visible:outline-muted disabled:opacity-100"
      : "text-white focus-visible:outline-[#0095FF] disabled:opacity-40"

  return (
    <div className="flex w-full flex-col items-center px-6">
      <button
        type="button"
        disabled={disabled || pending || isError || isHint}
        onClick={() => void onPress()}
        aria-busy={pending}
        className={`${CONFIRM_BUTTON_BASE_CLASS} ${toneClass}`}
        style={isReady ? { backgroundImage: READY_BLUE_GRADIENT } : undefined}
      >
        {pending && isReady ? (
          <Spinner size="md" tone="onDark" />
        ) : (
          <span className="max-w-full">{buttonLabel}</span>
        )}
      </button>
    </div>
  )
}
