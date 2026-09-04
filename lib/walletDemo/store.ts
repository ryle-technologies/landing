import { createContext, useContext } from "react"
import { motionValue, type MotionValue } from "motion/react"
import { useStore } from "zustand"
import { createStore, type StoreApi } from "zustand/vanilla"
import {
  DEMO_CRYPTO_HOLDINGS,
  DEMO_EUR_PER_USD,
  DEMO_PAY_REQUEST,
  DEMO_SEED_BALANCES,
  buildSeedTransactions,
} from "@/lib/walletDemo/data"
import {
  currencySymbolForKind,
  formatCents,
  parseAmountToCents,
} from "@/lib/walletDemo/format"
import type {
  AccountKind,
  CardPayAsset,
  Contact,
  CryptoHolding,
  Transaction,
} from "@/lib/walletDemo/types"

export type SendStep = "recipient" | "amount"
export type SendMode = "transfer" | "convert"
export type ConvertEntryPoint = "home" | "recipient"
export type ReceiveView = "closed" | "menu" | "qr" | "handle" | "wallet"
export type RequestStep = "amount" | "reason"

export type FeedbackStatus = "pending" | "success" | "error" | "info"

export interface FeedbackItem {
  id: string
  status: FeedbackStatus
  message: string
  durationMs: number | null
  dismissible: boolean
}

interface SendState {
  isOpen: boolean
  step: SendStep
  mode: SendMode
  amount: string
  recipient: Contact | null
  /** Account active when the sheet opened; governs currency + balance. */
  sourceAccountKind: AccountKind
  /** Convert: destination account. */
  targetAccountKind: AccountKind
  convertEntryPoint: ConvertEntryPoint
  pending: boolean
}

interface RequestState {
  isOpen: boolean
  step: RequestStep
  amount: string
  reason: string
  /** Set when WhatsApp / QR / Copy “creates” the shareable link. */
  created: boolean
  showQr: boolean
}

export const PERSONAL_KINDS: readonly AccountKind[] = [
  "euros",
  "dolares",
  "crypto",
]

const SEND_STEP_ORDER: SendStep[] = ["recipient", "amount"]

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Pending pill → success pill (matches the wallet's demo execution). */
const EXECUTION_SETTLE_MS = 2000
/** Hold the previous balance briefly after success, then slide to the new value. */
const BALANCE_REFRESH_HOLD_MS = 1500
/** Transfers: the new activity row lands this long after the balance has debited. */
const TRANSFER_ROW_DELAY_MS = 1000

function fakeHash(): string {
  let out = "0x"
  for (let i = 0; i < 64; i++) {
    out += Math.floor(Math.random() * 16).toString(16)
  }
  return out
}

const INITIAL_SEND: SendState = {
  isOpen: false,
  step: "recipient",
  mode: "transfer",
  amount: "",
  recipient: null,
  sourceAccountKind: "euros",
  targetAccountKind: "dolares",
  convertEntryPoint: "recipient",
  pending: false,
}

const INITIAL_REQUEST: RequestState = {
  isOpen: false,
  step: "amount",
  amount: "",
  reason: "",
  created: false,
  showQr: false,
}

const REQUEST_STEP_ORDER: RequestStep[] = ["amount", "reason"]

/** Home actions the scripted product-section cursor can walk through. */
export type WalletDemoAutoplayAction = "send" | "receive" | "swap" | "request" | "pay"

export interface WalletDemoState {
  // ── Accounts / switcher ────────────────────────────────────────────────
  activeAccountKind: AccountKind
  switcherOpen: boolean
  /** Frozen rows for the open popup so they don't re-label during the exit animation. */
  popupOtherRows: readonly AccountKind[] | null
  toggleSwitcher: () => void
  closeSwitcher: () => void
  setPersonalAccount: (kind: AccountKind) => void

  // ── Balances ──────────────────────────────────────────────────────────
  balancesCents: Record<Exclude<AccountKind, "crypto">, number>
  cryptoHoldings: CryptoHolding[]
  /** Balance of `kind` in cents (crypto → € portfolio value). */
  balanceCentsFor: (kind: AccountKind) => number

  // ── Activity ──────────────────────────────────────────────────────────
  transactions: Transaction[]

  // ── Send / convert ────────────────────────────────────────────────────
  send: SendState
  openSend: () => void
  closeSend: () => void
  setSendStep: (step: SendStep) => void
  setSendAmount: (amount: string) => void
  setSendRecipient: (recipient: Contact) => void
  startConvert: (params: {
    source: AccountKind
    target: AccountKind
    entryPoint?: ConvertEntryPoint
  }) => void
  sendNext: () => void
  sendBack: () => void
  executeTransfer: () => Promise<void>
  executeConvert: () => Promise<void>

  // ── Receive ───────────────────────────────────────────────────────────
  receiveView: ReceiveView
  openReceiveMenu: () => void
  goToReceive: (view: Exclude<ReceiveView, "closed">) => void
  closeReceive: () => void

  // ── Shield ────────────────────────────────────────────────────────────
  shieldOpen: boolean
  shieldAmount: string
  shieldPending: boolean
  openShield: () => void
  closeShield: () => void
  setShieldAmount: (amount: string) => void
  executeShield: () => Promise<void>

  // ── Create request (home Request chip) ───────────────────────────────
  request: RequestState
  openRequest: () => void
  closeRequest: () => void
  setRequestAmount: (amount: string) => void
  setRequestReason: (reason: string) => void
  requestNext: () => void
  requestBack: () => void
  markRequestCreated: () => void
  toggleRequestQr: () => void

  // ── Pay request (opened request link) ─────────────────────────────────
  payRequestOpen: boolean
  openPayRequest: () => void
  closePayRequest: () => void
  executePayRequest: () => Promise<void>

  // ── QR scan ───────────────────────────────────────────────────────────
  qrScanOpen: boolean
  openQrScan: () => void
  closeQrScan: () => void

  // ── Card ──────────────────────────────────────────────────────────────
  cardSheetOpen: boolean
  cardPayAsset: CardPayAsset
  cardPayWithOpen: boolean
  openCardSheet: () => void
  closeCardSheet: () => void
  setCardPayAsset: (asset: CardPayAsset) => void
  setCardPayWithOpen: (open: boolean) => void

  // ── Feedback toast ────────────────────────────────────────────────────
  feedback: FeedbackItem | null
  showPendingFeedback: (message: string) => string
  resolveFeedback: (status: "success" | "error", message: string) => void
  showEphemeralFeedback: (
    message: string,
    status?: "info" | "success" | "error",
  ) => void
  dismissFeedback: () => void

  // ── Scripted autoplay (product-section demo) ───────────────────────────
  /** Home action the scripted cursor is currently walking through, if any. */
  autoplayAction: WalletDemoAutoplayAction | null
  /** 0..1 progress of the current scripted run; a motion value so UI can trace it per frame. */
  autoplayProgress: MotionValue<number>
  setAutoplayAction: (action: WalletDemoAutoplayAction | null) => void
  /** Scene the user asked the scripted cursor to run next (consumed by autoplay). */
  autoplayRequest: WalletDemoAutoplayAction | null
  /**
   * Ask autoplay to run `action` from a fresh homepage. Passing a scene
   * reseeds the wallet immediately so the phone and chips update on the click.
   * Pass `null` to consume a pending request without touching wallet state.
   */
  requestAutoplay: (action: WalletDemoAutoplayAction | null) => void

  /** Bumped by `reset()` so in-flight async flows can bail instead of landing on fresh state. */
  epoch: number

  /** Restore seed data (used when the demo unmounts/remounts). */
  reset: () => void
}

export type WalletDemoStore = StoreApi<WalletDemoState>

/** Pacing of the mock transfer execution, swipe → activity row (read by the autoplay driver). */
export const WALLET_DEMO_EXECUTION_MS =
  EXECUTION_SETTLE_MS + BALANCE_REFRESH_HOLD_MS + TRANSFER_ROW_DELAY_MS

/** Convert: swipe → confirmed legs + balance slide (no extra activity-row beat). */
export const WALLET_DEMO_CONVERT_MS = EXECUTION_SETTLE_MS + BALANCE_REFRESH_HOLD_MS

/** Pay request: tap Pay → activity row (same settle + balance + row beats as a transfer). */
export const WALLET_DEMO_PAY_MS = WALLET_DEMO_EXECUTION_MS

/**
 * Each mounted wallet gets its own store so the hero demo and the product
 * section demo don't mirror each other's state.
 */
export const WalletDemoStoreContext = createContext<WalletDemoStore | null>(null)

export function useWalletDemoStoreApi(): WalletDemoStore {
  const store = useContext(WalletDemoStoreContext)
  if (!store) {
    throw new Error("useWalletDemoStore must be used inside a WalletDemoStoreProvider")
  }
  return store
}

export function useWalletDemoStore<T>(selector: (state: WalletDemoState) => T): T {
  return useStore(useWalletDemoStoreApi(), selector)
}

export function createWalletDemoStore(): WalletDemoStore {
  return createStore<WalletDemoState>((set, get) => ({
  activeAccountKind: "euros",
  switcherOpen: false,
  popupOtherRows: null,
  toggleSwitcher: () =>
    set((s) => {
      if (s.switcherOpen) return { switcherOpen: false, popupOtherRows: null }
      return {
        switcherOpen: true,
        popupOtherRows: PERSONAL_KINDS.filter((k) => k !== s.activeAccountKind),
      }
    }),
  closeSwitcher: () => set({ switcherOpen: false, popupOtherRows: null }),
  setPersonalAccount: (kind) => set({ activeAccountKind: kind }),

  balancesCents: { ...DEMO_SEED_BALANCES },
  cryptoHoldings: DEMO_CRYPTO_HOLDINGS.map((h) => ({ ...h })),
  balanceCentsFor: (kind) => {
    const s = get()
    if (kind === "crypto") {
      const total = s.cryptoHoldings.reduce((sum, h) => sum + h.valueEur, 0)
      return Math.floor(total * 100)
    }
    return s.balancesCents[kind]
  },

  transactions: buildSeedTransactions(),

  send: { ...INITIAL_SEND },
  openSend: () =>
    set((s) => ({
      send: {
        ...INITIAL_SEND,
        isOpen: true,
        step: "recipient",
        sourceAccountKind: s.activeAccountKind,
      },
      request: { ...INITIAL_REQUEST },
    })),
  closeSend: () => set((s) => ({ send: { ...s.send, isOpen: false } })),
  setSendStep: (step) => set((s) => ({ send: { ...s.send, step } })),
  setSendAmount: (amount) => set((s) => ({ send: { ...s.send, amount } })),
  setSendRecipient: (recipient) =>
    set((s) => ({ send: { ...s.send, recipient, mode: "transfer" } })),
  startConvert: ({ source, target, entryPoint = "recipient" }) =>
    set(() => ({
      send: {
        ...INITIAL_SEND,
        isOpen: true,
        mode: "convert",
        step: "amount",
        sourceAccountKind: source,
        targetAccountKind: target,
        convertEntryPoint: entryPoint,
      },
    })),
  sendNext: () =>
    set((s) => {
      if (s.send.mode === "convert") return {}
      const idx = SEND_STEP_ORDER.indexOf(s.send.step)
      if (idx < SEND_STEP_ORDER.length - 1) {
        return { send: { ...s.send, step: SEND_STEP_ORDER[idx + 1] } }
      }
      return {}
    }),
  sendBack: () =>
    set((s) => {
      const { step, mode, convertEntryPoint } = s.send
      if (mode === "convert" && step === "amount") {
        if (convertEntryPoint === "home") {
          return { send: { ...s.send, isOpen: false } }
        }
        return {
          send: { ...s.send, step: "recipient", mode: "transfer", amount: "" },
        }
      }
      const idx = SEND_STEP_ORDER.indexOf(step)
      if (idx > 0) {
        return { send: { ...s.send, step: SEND_STEP_ORDER[idx - 1] } }
      }
      return { send: { ...s.send, isOpen: false } }
    }),

  executeTransfer: async () => {
    const s = get()
    const { amount, recipient, sourceAccountKind, pending } = s.send
    if (pending || !recipient) return
    const cents = parseAmountToCents(amount)
    if (cents <= 0 || cents > s.balanceCentsFor(sourceAccountKind)) return

    // The sheet closes immediately and a pending pill appears; success lands
    // after ~2s, the balance is held briefly before it slides to the new
    // value, and the confirmed activity row drops in a beat after that.
    const tx: Transaction = {
      id: uid(),
      account: sourceAccountKind,
      kind: "transfer",
      direction: "out",
      amountCents: cents,
      counterpartyName: recipient.name,
      counterpartyTag: recipient.tag,
      counterpartyAvatarUrl: recipient.avatarUrl,
      occurredAt: new Date().toISOString(),
      status: "confirmed",
      txHash: fakeHash(),
    }

    set((st) => ({
      send: { ...INITIAL_SEND, sourceAccountKind: st.activeAccountKind },
    }))
    get().showPendingFeedback("Sending")

    // A `reset()` mid-flight abandons the remaining stages.
    const epoch = get().epoch
    const stale = () => get().epoch !== epoch

    await sleep(EXECUTION_SETTLE_MS)
    if (stale()) return
    get().resolveFeedback("success", "Sent")

    await sleep(BALANCE_REFRESH_HOLD_MS)
    if (stale()) return
    set((st) => ({
      balancesCents: debitBalances(st, sourceAccountKind, cents),
      cryptoHoldings: debitCrypto(st, sourceAccountKind, cents),
    }))

    await sleep(TRANSFER_ROW_DELAY_MS)
    if (stale()) return
    set((st) => ({ transactions: [tx, ...st.transactions] }))
  },

  executeConvert: async () => {
    const s = get()
    const { amount, sourceAccountKind, targetAccountKind, pending } = s.send
    if (pending) return
    if (sourceAccountKind === "crypto" || targetAccountKind === "crypto") return
    const cents = parseAmountToCents(amount)
    if (cents <= 0 || cents > s.balanceCentsFor(sourceAccountKind)) return

    const outCents = convertCents(cents, sourceAccountKind, targetAccountKind)

    const srcSymbol = currencySymbolForKind(sourceAccountKind)
    const dstSymbol = currencySymbolForKind(targetAccountKind)
    const phrase = `You exchanged ${srcSymbol}${formatCents(cents).display} for ${dstSymbol}${formatCents(outCents).display}`
    const now = new Date().toISOString()
    const sharedHash = fakeHash()
    const outId = uid()
    const inId = uid()
    const legs: Transaction[] = [
      {
        id: inId,
        account: targetAccountKind,
        kind: "exchange",
        direction: "in",
        amountCents: outCents,
        counterpartyName: `Your ${sourceAccountKind === "euros" ? "Euros" : "Dollars"} account`,
        occurredAt: now,
        status: "pending",
        txHash: sharedHash,
        exchangePhrase: phrase,
      },
      {
        id: outId,
        account: sourceAccountKind,
        kind: "exchange",
        direction: "out",
        amountCents: cents,
        counterpartyName: `Your ${targetAccountKind === "euros" ? "Euros" : "Dollars"} account`,
        occurredAt: now,
        status: "pending",
        txHash: sharedHash,
        exchangePhrase: phrase,
      },
    ]

    set((st) => ({
      transactions: [...legs, ...st.transactions],
      send: { ...INITIAL_SEND, sourceAccountKind: st.activeAccountKind },
    }))
    get().showPendingFeedback("Exchanging")

    const epoch = get().epoch
    const stale = () => get().epoch !== epoch

    await sleep(EXECUTION_SETTLE_MS)
    if (stale()) return
    set((st) => ({
      transactions: st.transactions.map((t) =>
        t.id === outId || t.id === inId ? { ...t, status: "confirmed" } : t,
      ),
    }))
    get().resolveFeedback("success", phrase)

    await sleep(BALANCE_REFRESH_HOLD_MS)
    if (stale()) return
    set((st) => ({
      balancesCents: {
        ...st.balancesCents,
        [sourceAccountKind]: st.balancesCents[sourceAccountKind] - cents,
        [targetAccountKind]: st.balancesCents[targetAccountKind] + outCents,
      },
    }))
  },

  receiveView: "closed",
  openReceiveMenu: () => set({ receiveView: "menu", request: { ...INITIAL_REQUEST } }),
  goToReceive: (view) => set({ receiveView: view }),
  closeReceive: () => set({ receiveView: "closed" }),

  request: { ...INITIAL_REQUEST },
  openRequest: () =>
    set({
      request: { ...INITIAL_REQUEST, isOpen: true },
      receiveView: "closed",
      payRequestOpen: false,
      qrScanOpen: false,
    }),
  closeRequest: () => set({ request: { ...INITIAL_REQUEST } }),
  setRequestAmount: (amount) => set((s) => ({ request: { ...s.request, amount } })),
  setRequestReason: (reason) => set((s) => ({ request: { ...s.request, reason } })),
  requestNext: () =>
    set((s) => {
      const idx = REQUEST_STEP_ORDER.indexOf(s.request.step)
      if (idx < REQUEST_STEP_ORDER.length - 1) {
        return { request: { ...s.request, step: REQUEST_STEP_ORDER[idx + 1] } }
      }
      return {}
    }),
  requestBack: () =>
    set((s) => {
      const idx = REQUEST_STEP_ORDER.indexOf(s.request.step)
      if (idx > 0) {
        return { request: { ...s.request, step: REQUEST_STEP_ORDER[idx - 1] } }
      }
      return { request: { ...INITIAL_REQUEST } }
    }),
  markRequestCreated: () =>
    set((s) => {
      if (!s.request.reason.trim() || parseAmountToCents(s.request.amount) <= 0) return {}
      return { request: { ...s.request, created: true } }
    }),
  toggleRequestQr: () =>
    set((s) => {
      if (!s.request.reason.trim() || parseAmountToCents(s.request.amount) <= 0) return {}
      return {
        request: {
          ...s.request,
          created: true,
          showQr: !s.request.showQr,
        },
      }
    }),

  shieldOpen: false,
  shieldAmount: "",
  shieldPending: false,
  openShield: () => set({ shieldOpen: true, shieldAmount: "" }),
  closeShield: () => set({ shieldOpen: false, shieldAmount: "", shieldPending: false }),
  setShieldAmount: (amount) => set({ shieldAmount: amount }),
  executeShield: async () => {
    const { shieldAmount, activeAccountKind, balancesCents } = get()
    if (activeAccountKind === "crypto") return
    const cents = parseAmountToCents(shieldAmount)
    if (cents <= 0 || cents > balancesCents[activeAccountKind]) return

    set({ shieldPending: true })
    get().showPendingFeedback("Shielding funds")
    await sleep(1500)
    set((st) => ({
      shieldPending: false,
      shieldOpen: false,
      shieldAmount: "",
      balancesCents: {
        ...st.balancesCents,
        [activeAccountKind]: st.balancesCents[activeAccountKind] - cents,
      },
      transactions: [
        {
          id: uid(),
          account: activeAccountKind,
          kind: "transfer",
          direction: "out",
          amountCents: cents,
          counterpartyName: "Private balance",
          occurredAt: new Date().toISOString(),
          status: "confirmed",
          txHash: fakeHash(),
        },
        ...st.transactions,
      ],
    }))
    get().resolveFeedback("success", "Funds shielded")
  },

  payRequestOpen: false,
  openPayRequest: () =>
    set({
      payRequestOpen: true,
      receiveView: "closed",
      qrScanOpen: false,
      request: { ...INITIAL_REQUEST },
    }),
  closePayRequest: () => set({ payRequestOpen: false }),
  executePayRequest: async () => {
    const s = get()
    if (!s.payRequestOpen) return
    const cents = DEMO_PAY_REQUEST.amountCents
    const sourceAccountKind: AccountKind = "euros"
    if (cents <= 0 || cents > s.balanceCentsFor(sourceAccountKind)) return

    const creator = DEMO_PAY_REQUEST.creator
    const tx: Transaction = {
      id: uid(),
      account: sourceAccountKind,
      kind: "transfer",
      direction: "out",
      amountCents: cents,
      counterpartyName: creator.name,
      counterpartyTag: creator.tag,
      counterpartyAvatarUrl: creator.avatarUrl,
      occurredAt: new Date().toISOString(),
      status: "confirmed",
      txHash: fakeHash(),
    }

    set({ payRequestOpen: false })
    get().showPendingFeedback("Paying")

    const epoch = get().epoch
    const stale = () => get().epoch !== epoch

    await sleep(EXECUTION_SETTLE_MS)
    if (stale()) return
    get().resolveFeedback("success", "Paid")

    await sleep(BALANCE_REFRESH_HOLD_MS)
    if (stale()) return
    set((st) => ({
      balancesCents: debitBalances(st, sourceAccountKind, cents),
      cryptoHoldings: debitCrypto(st, sourceAccountKind, cents),
    }))

    await sleep(TRANSFER_ROW_DELAY_MS)
    if (stale()) return
    set((st) => ({ transactions: [tx, ...st.transactions] }))
  },

  qrScanOpen: false,
  openQrScan: () => set({ qrScanOpen: true }),
  closeQrScan: () => set({ qrScanOpen: false }),

  cardSheetOpen: false,
  cardPayAsset: "usdc",
  cardPayWithOpen: false,
  openCardSheet: () => set({ cardSheetOpen: true }),
  closeCardSheet: () => set({ cardSheetOpen: false, cardPayWithOpen: false }),
  setCardPayAsset: (asset) => set({ cardPayAsset: asset }),
  setCardPayWithOpen: (open) => set({ cardPayWithOpen: open }),

  feedback: null,
  showPendingFeedback: (message) => {
    const id = uid()
    set({
      feedback: { id, status: "pending", message, durationMs: null, dismissible: false },
    })
    return id
  },
  resolveFeedback: (status, message) =>
    set({
      feedback: {
        id: uid(),
        status,
        message,
        durationMs: status === "success" ? 5200 : 7200,
        dismissible: status === "error",
      },
    }),
  showEphemeralFeedback: (message, status = "info") =>
    set({
      feedback: {
        id: uid(),
        status,
        message,
        durationMs: status === "info" ? 2200 : 5200,
        dismissible: false,
      },
    }),
  dismissFeedback: () => set({ feedback: null }),

  autoplayAction: null,
  autoplayProgress: motionValue(0),
  setAutoplayAction: (action) => set({ autoplayAction: action }),
  autoplayRequest: null,
  requestAutoplay: (action) => {
    if (!action) {
      set({ autoplayRequest: null })
      return
    }
    get().autoplayProgress.set(0)
    set((st) => ({
      ...seededWalletPatch(st.epoch + 1),
      autoplayRequest: action,
      autoplayAction: action,
    }))
  },

  epoch: 0,

  reset: () => set((st) => seededWalletPatch(st.epoch + 1)),
  }))
}

/** Homepage seed. Shared by `reset` and a chip-driven autoplay restart. */
function seededWalletPatch(epoch: number) {
  return {
    epoch,
    activeAccountKind: "euros" as const,
    switcherOpen: false,
    popupOtherRows: null,
    balancesCents: { ...DEMO_SEED_BALANCES },
    cryptoHoldings: DEMO_CRYPTO_HOLDINGS.map((h) => ({ ...h })),
    transactions: buildSeedTransactions(),
    send: { ...INITIAL_SEND },
    receiveView: "closed" as const,
    request: { ...INITIAL_REQUEST },
    payRequestOpen: false,
    shieldOpen: false,
    shieldAmount: "",
    shieldPending: false,
    qrScanOpen: false,
    cardSheetOpen: false,
    cardPayWithOpen: false,
    feedback: null,
  }
}

function convertCents(
  cents: number,
  source: AccountKind,
  target: AccountKind,
): number {
  if (source === "dolares" && target === "euros") {
    return Math.floor(cents * DEMO_EUR_PER_USD)
  }
  if (source === "euros" && target === "dolares") {
    return Math.floor(cents / DEMO_EUR_PER_USD)
  }
  return cents
}

function debitBalances(
  st: WalletDemoState,
  kind: AccountKind,
  cents: number,
): WalletDemoState["balancesCents"] {
  if (kind === "crypto") return st.balancesCents
  return { ...st.balancesCents, [kind]: st.balancesCents[kind] - cents }
}

/** Crypto sends are priced in €; debit EURC first, then USDC, then BTC. */
function debitCrypto(
  st: WalletDemoState,
  kind: AccountKind,
  cents: number,
): CryptoHolding[] {
  if (kind !== "crypto") return st.cryptoHoldings
  let remainingEur = cents / 100
  const order: CryptoHolding["ticker"][] = ["EURC", "USDC", "BTC"]
  const next = st.cryptoHoldings.map((h) => ({ ...h }))
  for (const ticker of order) {
    if (remainingEur <= 0) break
    const h = next.find((x) => x.ticker === ticker)
    if (!h || h.valueEur <= 0) continue
    const take = Math.min(remainingEur, h.valueEur)
    const ratio = take / h.valueEur
    h.balance = Math.max(0, h.balance - h.balance * ratio)
    h.valueEur = Math.floor((h.valueEur - take) * 100) / 100
    remainingEur -= take
  }
  return next
}

/** Convert rate display for the convert step: `1 US$ ≈ €0.87`. */
export function convertRateLine(source: AccountKind, target: AccountKind): string {
  if (source === "dolares" && target === "euros") {
    return `1 US$ ≈ €${DEMO_EUR_PER_USD.toFixed(2)}`
  }
  if (source === "euros" && target === "dolares") {
    return `1 € ≈ US$${(1 / DEMO_EUR_PER_USD).toFixed(2)}`
  }
  return ""
}

export { convertCents }
