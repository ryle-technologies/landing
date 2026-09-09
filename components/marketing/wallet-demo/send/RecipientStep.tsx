"use client"

import { type RefObject, useLayoutEffect, useMemo, useRef, useState } from "react"
import { LuChevronRight, LuWallet } from "react-icons/lu"
import { AccountAvatar } from "@/components/marketing/wallet-demo/home/AccountAvatar"
import { Avatar } from "@/components/marketing/wallet-demo/ui/Avatar"
import {
  DISCOVERED_ROW_STAGGER_S,
  DiscoveredIntersectionRow,
  HOME_ACTION_CHIP_SURFACE_STYLE,
  HOME_SEND_SEARCH_INPUT_CLASS,
  HOME_SEND_SEARCH_SHELL_CLASS,
  MOVEMENT_LIST_AVATAR_CLASS,
  MOVEMENT_LIST_ROW_BUTTON_CLASS,
  MOVEMENT_LIST_ROW_LEADING_SLOT_CLASS,
  MOVEMENT_LIST_ROW_SECONDARY_CLASS,
  MOVEMENT_LIST_ROW_TITLE_CLASS,
  SECTION_LABEL_CLASS,
} from "@/components/marketing/wallet-demo/ui/primitives"
import {
  DEMO_EXTERNAL_WALLETS,
  DEMO_FAVORITES,
  DEMO_PROFILE,
  DEMO_RECENT,
} from "@/lib/walletDemo/data"
import { sendRowTitleForKind, shortenAddress } from "@/lib/walletDemo/format"
import { useWalletDemoStore } from "@/lib/walletDemo/store"
import type { AccountKind, Contact } from "@/lib/walletDemo/types"

const SEND_LIST_ROW_BUTTON_CLASS = `${MOVEMENT_LIST_ROW_BUTTON_CLASS} py-2.5 active:opacity-70`
const RECENT_MAX = 5

function ContactRow({
  contact,
  onPick,
  discoveredRow,
}: {
  contact: Contact
  onPick: (c: Contact) => void
  discoveredRow?: { scrollRootRef?: RefObject<Element | null>; index: number }
}) {
  const revealDelay =
    discoveredRow && discoveredRow.index < RECENT_MAX
      ? discoveredRow.index * DISCOVERED_ROW_STAGGER_S
      : 0

  const button = (
    <button
      type="button"
      onClick={() => onPick(contact)}
      aria-label={contact.tag ? `Send to ${contact.name}, ${contact.tag}` : `Send to ${contact.name}`}
      className={SEND_LIST_ROW_BUTTON_CLASS}
    >
      <Avatar
        name={contact.name}
        src={contact.avatarUrl?.trim() ? contact.avatarUrl.trim() : undefined}
        size="lg"
        plain
        className={MOVEMENT_LIST_AVATAR_CLASS}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
        <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} truncate`}>{contact.name}</span>
        {contact.tag ? (
          <span className={`${MOVEMENT_LIST_ROW_SECONDARY_CLASS} truncate`}>{contact.tag}</span>
        ) : null}
      </div>
      <LuChevronRight size={16} className="shrink-0 self-center text-muted-light" strokeWidth={1.75} aria-hidden />
    </button>
  )

  if (discoveredRow) {
    return (
      <DiscoveredIntersectionRow scrollRootRef={discoveredRow.scrollRootRef} revealDelay={revealDelay}>
        {button}
      </DiscoveredIntersectionRow>
    )
  }
  return <div>{button}</div>
}

function ActionRow({
  label,
  subtitle,
  icon: Icon,
  onClick,
}: {
  label: string
  subtitle?: string
  icon: typeof LuWallet
  onClick: () => void
}) {
  return (
    <div>
      <button type="button" onClick={onClick} className={SEND_LIST_ROW_BUTTON_CLASS}>
        <span className={`${MOVEMENT_LIST_ROW_LEADING_SLOT_CLASS} text-muted`}>
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
          <span className={MOVEMENT_LIST_ROW_TITLE_CLASS}>{label}</span>
          {subtitle ? <span className={MOVEMENT_LIST_ROW_SECONDARY_CLASS}>{subtitle}</span> : null}
        </div>
        <LuChevronRight size={16} className="shrink-0 self-center text-muted-light" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}

function AccountRow({
  kind,
  subtitle,
  onClick,
  disabled = false,
}: {
  kind: AccountKind
  subtitle: string
  onClick?: () => void
  disabled?: boolean
}) {
  const title = sendRowTitleForKind(kind)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${SEND_LIST_ROW_BUTTON_CLASS}${disabled ? " opacity-40" : ""}`}
      aria-label={`${title}. ${subtitle}`}
    >
      <AccountAvatar kind={kind} displayName={DEMO_PROFILE.displayName} />
      <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
        <span className={`${MOVEMENT_LIST_ROW_TITLE_CLASS} min-w-0 truncate`}>{title}</span>
        <span className={`${MOVEMENT_LIST_ROW_SECONDARY_CLASS} min-w-0 truncate`}>{subtitle}</span>
      </div>
      <LuChevronRight size={16} className="shrink-0 self-center text-muted-light" strokeWidth={1.75} aria-hidden />
    </button>
  )
}

/** Send step 1: search, "My accounts" (convert), favorites, recent. */
export function RecipientStep({ scrollRootRef }: { scrollRootRef?: RefObject<Element | null> }) {
  const sourceKind = useWalletDemoStore((s) => s.send.sourceAccountKind)
  const setRecipient = useWalletDemoStore((s) => s.setSendRecipient)
  const startConvert = useWalletDemoStore((s) => s.startConvert)
  const next = useWalletDemoStore((s) => s.sendNext)

  const [query, setQuery] = useState("")
  const [snapshotMinHeight, setSnapshotMinHeight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const trimmed = query.trim()
  const looksLikeAddress = /^0x[0-9a-fA-F]{40}$/.test(trimmed)
  const isSearching = trimmed.length > 0 && !looksLikeAddress

  const otherKind: AccountKind = sourceKind === "dolares" ? "euros" : "dolares"
  const isCrypto = sourceKind === "crypto"

  const favoriteIds = useMemo(() => new Set(DEMO_FAVORITES.map((c) => c.id)), [])
  const recent = useMemo(() => DEMO_RECENT.filter((c) => !favoriteIds.has(c.id)), [favoriteIds])

  const filtered = useMemo(() => {
    if (!isSearching) return []
    const q = trimmed.toLowerCase().replace(/^@/, "")
    return [...DEMO_FAVORITES, ...recent].filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.tag ?? "").toLowerCase().replace(/^@/, "").includes(q),
    )
  }, [isSearching, recent, trimmed])

  const pickContact = (contact: Contact) => {
    setQuery("")
    setRecipient(contact)
    next()
  }

  const confirmAddress = () => {
    if (!looksLikeAddress) return
    pickContact({
      id: `address:${trimmed.toLowerCase()}`,
      name: shortenAddress(trimmed),
      wallet: trimmed,
    })
  }

  useLayoutEffect(() => {
    if (looksLikeAddress || isSearching) return
    const el = rootRef.current
    if (!el) return
    const h = el.getBoundingClientRect().height
    setSnapshotMinHeight((prev) => (h > prev ? h : prev))
  }, [looksLikeAddress, isSearching, query])

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-1 px-6 pb-28 pt-2"
      style={
        (looksLikeAddress || isSearching) && snapshotMinHeight > 0
          ? { minHeight: snapshotMinHeight }
          : undefined
      }
    >
      <div className={HOME_SEND_SEARCH_SHELL_CLASS} style={HOME_ACTION_CHIP_SURFACE_STYLE}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or contact"
          className={HOME_SEND_SEARCH_INPUT_CLASS}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {looksLikeAddress ? (
        <div className="pt-2">
          <ActionRow
            label="Send to this recipient"
            subtitle={shortenAddress(trimmed)}
            icon={LuWallet}
            onClick={confirmAddress}
          />
        </div>
      ) : isSearching ? (
        <div className="pt-4">
          {filtered.length > 0 ? (
            <>
              <p className={`${SECTION_LABEL_CLASS} mb-2`}>Results</p>
              {filtered.map((contact, i) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onPick={pickContact}
                  discoveredRow={{ scrollRootRef, index: i }}
                />
              ))}
            </>
          ) : (
            <p className="py-2 text-base text-muted">No results for &ldquo;{trimmed}&rdquo;.</p>
          )}
        </div>
      ) : (
        <>
          {!isCrypto ? (
            <>
              <p className={`${SECTION_LABEL_CLASS} mb-2 mt-8`}>My accounts</p>
              <div className="flex flex-col gap-0">
                <AccountRow
                  kind={otherKind}
                  subtitle="Exchange"
                  onClick={() => startConvert({ source: sourceKind, target: otherKind })}
                />
                <AccountRow kind="crypto" subtitle="Coming soon" disabled />
              </div>
            </>
          ) : null}

          <p className={`${SECTION_LABEL_CLASS} mb-2 mt-6`}>Favorites</p>
          <div className="flex flex-col gap-0" data-demo-target="favorites">
            {DEMO_FAVORITES.map((contact, i) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onPick={pickContact}
                discoveredRow={{ scrollRootRef, index: i }}
              />
            ))}
          </div>

          {isCrypto ? (
            <>
              <p className={`${SECTION_LABEL_CLASS} mb-2 mt-6`}>External wallets</p>
              <div className="flex flex-col gap-0">
                {DEMO_EXTERNAL_WALLETS.map((wallet) => (
                  <ActionRow
                    key={wallet.id}
                    label={wallet.name}
                    subtitle={shortenAddress(wallet.wallet)}
                    icon={LuWallet}
                    onClick={() => pickContact(wallet)}
                  />
                ))}
              </div>
            </>
          ) : null}

          {recent.length > 0 ? (
            <>
              <p className={`${SECTION_LABEL_CLASS} mb-2 mt-6`}>Recent</p>
              {recent.map((contact, i) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onPick={pickContact}
                  discoveredRow={{ scrollRootRef, index: i }}
                />
              ))}
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
