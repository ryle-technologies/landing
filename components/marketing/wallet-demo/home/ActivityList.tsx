"use client"

import React, { useMemo, useState } from "react"
import { motion } from "motion/react"
import { LuCheck, LuChevronDown, LuClockArrowDown, LuCopy } from "react-icons/lu"
import { Avatar } from "@/components/marketing/wallet-demo/ui/Avatar"
import { BottomSheet } from "@/components/marketing/wallet-demo/ui/BottomSheet"
import {
  DISCOVERED_ROW_STAGGER_S,
  DiscoveredIntersectionRow,
  MOVEMENT_ACTION_ICONS,
  MOVEMENT_LIST_AMOUNT_CLASS,
  MOVEMENT_LIST_ROW_BUTTON_CLASS,
  MOVEMENT_LIST_ROW_SECONDARY_CLASS,
  MOVEMENT_LIST_ROW_TITLE_CLASS,
} from "@/components/marketing/wallet-demo/ui/primitives"
import {
  currencySymbolForKind,
  formatCents,
  formatDetailDate,
  formatListDate,
  shortenHash,
} from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"
import type { Transaction } from "@/lib/walletDemo/types"

type RowIconKind = "currencyExchange" | "transferOut" | "transferIn"

const ROW_ICON: Record<RowIconKind, React.ElementType> = {
  currencyExchange: MOVEMENT_ACTION_ICONS.swap,
  transferOut: MOVEMENT_ACTION_ICONS.send,
  transferIn: MOVEMENT_ACTION_ICONS.receive,
}

function rowIconKind(tx: Transaction): RowIconKind {
  if (tx.kind === "exchange") return "currencyExchange"
  return tx.direction === "in" ? "transferIn" : "transferOut"
}

function kindLabel(tx: Transaction): string {
  return tx.kind === "exchange" ? "Exchange" : "Transfer"
}

function statusLabel(tx: Transaction): string | null {
  if (tx.status === "pending") return "In progress"
  if (tx.status === "failed") return "Error"
  return null
}

function signedAmount(tx: Transaction): string {
  const symbol = currencySymbolForKind(tx.account)
  // Matches the wallet: incoming is unsigned, outgoing uses a true minus (U+2212).
  const sign = tx.direction === "in" ? "" : "\u2212"
  return `${sign}${symbol}${formatCents(tx.amountCents).display}`
}

/** Avatar with optional photo, swap tile icon, or transfer direction badge. */
export function HistoryAvatar({
  name,
  kind,
  avatarUrl,
}: {
  name: string
  kind: RowIconKind
  avatarUrl?: string | null
}) {
  if (kind === "currencyExchange") {
    const MainIcon = ROW_ICON.currencyExchange
    return (
      <Avatar
        name={name}
        size="lg"
        plain
        tileIcon={
          <MainIcon size={14} strokeWidth={1.75} className="shrink-0 text-foreground" aria-hidden />
        }
        className="!h-[39px] !w-[39px] !text-[14px]"
      />
    )
  }

  const BadgeIcon = ROW_ICON[kind]
  return (
    <div className="relative shrink-0">
      <Avatar
        name={name}
        src={avatarUrl?.trim() ? avatarUrl.trim() : undefined}
        size="lg"
        plain
        className="!h-[39px] !w-[39px] !text-[14px]"
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 flex h-[17px] w-[17px] translate-x-[3px] translate-y-[3px] items-center justify-center rounded-full bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        aria-hidden
      >
        <BadgeIcon size={11} strokeWidth={2.25} className="shrink-0" />
      </span>
    </div>
  )
}

function DetailRow({ label, display }: { label: string; display: React.ReactNode }) {
  const value =
    typeof display === "string" ? (
      <span className="font-medium text-foreground">{display}</span>
    ) : (
      display
    )
  return (
    <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-baseline gap-4">
      <span className="min-w-0 truncate text-[14px] font-normal leading-snug text-muted">{label}</span>
      <div className="min-w-0 text-right text-[15px] leading-snug">{value}</div>
    </div>
  )
}

function TransactionDetailSheet({
  tx,
  onClose,
}: {
  tx: Transaction | null
  onClose: () => void
}) {
  // Tracks which tx was copied so switching rows resets the check mark without an effect.
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null)
  const copied = tx != null && copiedTxId === tx.id

  const copyTxId = () => {
    if (!tx) return
    const id = tx.id
    void navigator.clipboard?.writeText(tx.txHash).then(
      () => {
        setCopiedTxId(id)
        window.setTimeout(() => setCopiedTxId((cur) => (cur === id ? null : cur)), 2200)
      },
      () => {},
    )
  }

  const iconKind = tx ? rowIconKind(tx) : "transferIn"
  const isExchange = tx?.kind === "exchange"
  const primaryText = tx
    ? isExchange
      ? (tx.exchangePhrase ?? kindLabel(tx))
      : `${tx.direction === "in" ? "From" : "To"} ${tx.counterpartyTag ?? tx.counterpartyName}`
    : ""

  return (
    <BottomSheet
      isOpen={Boolean(tx)}
      onClose={onClose}
      height="auto"
      sheetClassName="max-h-[min(760px,88%)]"
      fullWidth
    >
      {tx ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
            <section className="flex flex-col items-center pt-8 text-center">
              <div className="flex justify-center">
                <HistoryAvatar
                  name={tx.counterpartyName}
                  kind={iconKind}
                  avatarUrl={isExchange ? undefined : tx.counterpartyAvatarUrl}
                />
              </div>
              <p className="mt-4 max-w-full px-2 text-[16px] font-medium leading-snug tracking-[-0.01em] text-foreground text-balance">
                {primaryText}
              </p>
              <p className="mt-2 max-w-full px-1 text-center text-[15px] font-normal leading-snug text-muted text-balance">
                {kindLabel(tx)}
              </p>
              <p
                className={
                  tx.status === "failed"
                    ? "mt-10 text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-red-600"
                    : "quote-shimmer-text quote-shimmer-text--emphasized mt-10 text-center text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums"
                }
              >
                {signedAmount(tx)}
              </p>
              <p className="mb-8 mt-2 max-w-full px-2 text-center text-sm text-muted">
                {formatDetailDate(tx.occurredAt)}
              </p>
            </section>

            <div className="mt-7 flex flex-col gap-3.5 text-left">
              {tx.status !== "confirmed" ? (
                <DetailRow
                  label="Status"
                  display={
                    <span
                      className={
                        tx.status === "failed" ? "font-medium text-red-600" : "font-medium text-muted"
                      }
                    >
                      {statusLabel(tx)}
                    </span>
                  }
                />
              ) : null}
              <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-baseline gap-4">
                <span className="min-w-0 truncate text-[14px] font-normal leading-snug text-muted">
                  Identifier
                </span>
                <div className="flex min-w-0 items-baseline justify-end gap-1.5">
                  <span
                    title={tx.txHash}
                    className="min-w-0 truncate text-right text-[14px] font-normal leading-snug tabular-nums text-muted"
                  >
                    {shortenHash(tx.txHash)}
                  </span>
                  <button
                    type="button"
                    onClick={copyTxId}
                    aria-label={copied ? "Copied" : "Copy identifier"}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5 leading-none text-muted transition-colors hover:bg-muted/30 hover:text-foreground active:opacity-90"
                  >
                    {copied ? (
                      <LuCheck size={14} strokeWidth={2} className="shrink-0" aria-hidden />
                    ) : (
                      <LuCopy size={14} strokeWidth={2} className="shrink-0" aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  )
}

const ROW_ENTER_TRANSITION = { type: "spring", stiffness: 420, damping: 34 } as const

function ActivityRow({
  tx,
  isNew,
  initialExpanded,
  scrollRootRef,
  revealDelay,
  className,
  style,
  children,
}: {
  tx: Transaction
  isNew: boolean
  initialExpanded: boolean
  scrollRootRef?: React.RefObject<Element | null>
  revealDelay: number
  className: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  // Fresh transfers: fade/slide in at the top. Existing rows stay put.
  if (isNew) {
    return (
      <motion.div
        key={tx.id}
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ROW_ENTER_TRANSITION}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    )
  }

  // Product demo: every seed row is visible immediately (no scroll reveal).
  if (initialExpanded) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <DiscoveredIntersectionRow
      scrollRootRef={scrollRootRef}
      revealDelay={revealDelay}
      className={className}
      style={style}
    >
      {children}
    </DiscoveredIntersectionRow>
  )
}

/**
 * Paginated Activity list for the active account, with a detail sheet.
 * Mount with `key={activeAccountKind}` so pagination resets per account.
 */
export function ActivityList({
  pageSize = 3,
  maxItems,
  initialExpanded = false,
  scrollRootRef,
}: {
  pageSize?: number
  /** Hard cap — no pagination or "Load more" when set. */
  maxItems?: number
  /** Start with every row shown (no "Load more"). */
  initialExpanded?: boolean
  scrollRootRef?: React.RefObject<Element | null>
}) {
  const activeAccountKind = useWalletDemoStore((s) => s.activeAccountKind)
  const transactions = useWalletDemoStore((s) => s.transactions)
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [pages, setPages] = useState(initialExpanded ? Number.MAX_SAFE_INTEGER : 1)
  const [loadingMore, setLoadingMore] = useState(false)

  const rows = useMemo(
    () => transactions.filter((tx) => tx.account === activeAccountKind),
    [transactions, activeAccountKind],
  )
  // Ids present when this list mounted — only later additions animate in.
  const [baselineIds] = useState(() => new Set(rows.map((tx) => tx.id)))
  const visible = maxItems != null ? rows.slice(0, maxItems) : rows.slice(0, pages * pageSize)
  const hasMore = maxItems == null && rows.length > visible.length
  const selectedTx = rows.find((tx) => tx.id === selectedTxId) ?? null

  const loadMore = () => {
    if (loadingMore) return
    setLoadingMore(true)
    window.setTimeout(() => {
      setPages((p) => p + 1)
      setLoadingMore(false)
    }, 420)
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-3 py-1.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-avatar-bg text-muted">
          <LuClockArrowDown size={16} strokeWidth={1.75} aria-hidden />
        </span>
        <span className="text-[16px] font-medium tracking-[-0.01em] text-muted">
          No activity yet
        </span>
      </div>
    )
  }

  return (
    <>
      {visible.map((tx, i) => {
        const iconKind = rowIconKind(tx)
        const isExchange = tx.kind === "exchange"
        const primaryLine = isExchange
          ? tx.counterpartyName
          : (tx.counterpartyTag ?? tx.counterpartyName)
        const occurredLine = formatListDate(tx.occurredAt)
        const statusLbl = statusLabel(tx)
        const isFadedTail = hasMore && i === visible.length - 1
        const fadeMask =
          "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.92) 12%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0.2) 72%, rgba(0,0,0,0.06) 88%, transparent 100%)"
        return (
          <ActivityRow
            key={tx.id}
            tx={tx}
            isNew={!baselineIds.has(tx.id)}
            initialExpanded={initialExpanded}
            scrollRootRef={scrollRootRef}
            revealDelay={i < pageSize ? i * DISCOVERED_ROW_STAGGER_S : 0}
            className={isFadedTail ? "relative mb-1" : "mb-8"}
            style={
              isFadedTail
                ? { maskImage: fadeMask, WebkitMaskImage: fadeMask }
                : undefined
            }
          >
            <button
              type="button"
              onClick={() => setSelectedTxId(tx.id)}
              className={MOVEMENT_LIST_ROW_BUTTON_CLASS}
            >
              <HistoryAvatar
                name={tx.counterpartyName}
                kind={iconKind}
                avatarUrl={isExchange ? undefined : tx.counterpartyAvatarUrl}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
                <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>{primaryLine}</span>
                <span className={MOVEMENT_LIST_ROW_SECONDARY_CLASS}>
                  {kindLabel(tx)}
                  <span className="mx-1.5 select-none text-muted" aria-hidden>
                    ·
                  </span>
                  {occurredLine}
                  {statusLbl ? (
                    <>
                      <span className="mx-1.5 select-none text-muted" aria-hidden>
                        ·
                      </span>
                      <span className={tx.status === "failed" ? "font-normal text-red-600" : "text-muted"}>
                        {statusLbl}
                      </span>
                    </>
                  ) : null}
                </span>
              </div>
              <span
                className={`${MOVEMENT_LIST_AMOUNT_CLASS}${tx.status === "failed" ? " text-red-600" : ""}`}
              >
                {signedAmount(tx)}
              </span>
            </button>
          </ActivityRow>
        )
      })}
      <TransactionDetailSheet tx={selectedTx} onClose={() => setSelectedTxId(null)} />
      {hasMore ? (
        <div className="flex w-full justify-center pb-1 pt-0">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-[13px] font-medium tracking-[-0.01em] text-muted transition-opacity hover:text-foreground active:opacity-70 disabled:opacity-60 focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {loadingMore ? "Loading…" : "Load more"}
            <LuChevronDown className="block shrink-0" size={14} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  )
}
