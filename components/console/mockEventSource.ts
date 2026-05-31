"use client"

import { useEffect, useRef, useState } from "react"
import type { FeedEvent, FeedEventStatus, HttpMethod } from "./types"

/** Oldest rows drop when a new one would exceed this count (FIFO cap). */
const MAX_EVENTS = 10
const INITIAL_EVENT_SEED = 15_527
const INITIAL_EVENT_TS = 1_704_067_200_000

const ASSETS = ["XUY", "USDC"] as const
const NETWORKS = ["base-sepolia", "base"] as const

type RandomSource = () => number
type ClockSource = () => number

function seededRandom(seed: number): RandomSource {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rid(prefix: string, len = 8, random: RandomSource = Math.random): string {
  const chars = "0123456789abcdef"
  let out = ""
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(random() * chars.length)]
  }
  return `${prefix}_${out}`
}

function shortHash(random: RandomSource = Math.random): string {
  const chars = "0123456789abcdef"
  let head = ""
  let tail = ""
  for (let i = 0; i < 4; i++) head += chars[Math.floor(random() * chars.length)]
  for (let i = 0; i < 4; i++) tail += chars[Math.floor(random() * chars.length)]
  return `0x${head}…${tail}`
}

function pick<T>(arr: readonly T[], random: RandomSource = Math.random): T {
  return arr[Math.floor(random() * arr.length)]
}

function amount(random: RandomSource = Math.random): string {
  const n = (random() * 480 + 5).toFixed(2)
  return n
}

function eventIdSuffix(input: string): string {
  let h = 2_166_136_261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16_777_619)
  }
  return Math.abs(h).toString(36)
}

function makeEvent(
  type: string,
  summary: string,
  opts: {
    status?: FeedEventStatus
    detail?: Record<string, unknown>
    method?: HttpMethod
  } = {},
  clock: ClockSource = Date.now,
): FeedEvent {
  const ts = clock()
  return {
    id: `${ts}-${eventIdSuffix(`${type}:${summary}:${opts.method ?? ""}`)}`,
    ts,
    method: opts.method,
    type,
    summary,
    status: opts.status ?? "ok",
    detail: opts.detail,
  }
}

/**
 * A realistic payment flow — the kind of cascade a real backend would emit
 * when one user pays another. Returns a list of events with the relative
 * delay (ms) before each one fires, so the caller can schedule them.
 */
function paymentFlow(
  random: RandomSource = Math.random,
  clock: ClockSource = Date.now,
): { delay: number; build: () => FeedEvent }[] {
  const pmt = rid("pmt", 8, random)
  const wlt = rid("wlt", 6, random)
  const hash = shortHash(random)
  const asset = pick(ASSETS, random)
  const amt = amount(random)
  const network = pick(NETWORKS, random)
  const block = 18_400_000 + Math.floor(random() * 100_000)

  return [
    {
      delay: 0,
      build: () =>
        makeEvent("payment.created", `${pmt} · ${asset} ${amt}`, {
          method: "POST",
          detail: { id: pmt, asset, amount: amt, from: wlt },
        }, clock),
    },
    {
      delay: 550,
      build: () =>
        makeEvent("policy.checked", `${wlt} · whitelist ok`, {
          method: "GET",
          detail: { wallet: wlt, policy: "WhitelistPolicy", result: "allow" },
        }, clock),
    },
    {
      delay: 1150,
      build: () =>
        makeEvent("relayer.sponsored", `${wlt} · gas sponsored`, {
          method: "POST",
          detail: { wallet: wlt, network },
        }, clock),
    },
    {
      delay: 1800,
      build: () =>
        makeEvent("tx.submitted", `${hash} · ${network}`, {
          status: "pending",
          detail: { hash, network },
        }, clock),
    },
    {
      delay: 5000 + random() * 1200,
      build: () =>
        makeEvent("tx.confirmed", `${hash} · block ${block}`, {
          detail: { hash, network, block },
        }, clock),
    },
    {
      delay: 6500 + random() * 1000,
      build: () =>
        makeEvent("payment.completed", `${pmt}`, {
          method: "PATCH",
          detail: { id: pmt },
        }, clock),
    },
    {
      delay: 7200 + random() * 1000,
      build: () =>
        makeEvent("webhook.delivered", `${rid("evt", 6, random)} → 200`, {
          method: "POST",
          detail: { status: 200 },
        }, clock),
    },
  ]
}

function swapFlow(
  random: RandomSource = Math.random,
  clock: ClockSource = Date.now,
): { delay: number; build: () => FeedEvent }[] {
  const swp = rid("swp", 8, random)
  const hash = shortHash(random)
  const block = 18_400_000 + Math.floor(random() * 100_000)
  const dir = random() > 0.5 ? "XUY → USDC" : "USDC → XUY"
  const amt = amount(random)
  return [
    {
      delay: 0,
      build: () =>
        makeEvent("swap.quoted", `${dir} · ${amt}`, {
          method: "GET",
          detail: { id: swp, direction: dir, amount: amt },
        }, clock),
    },
    {
      delay: 650,
      build: () =>
        makeEvent("swap.executed", `${swp} · ${dir}`, {
          method: "POST",
          detail: { id: swp, direction: dir },
        }, clock),
    },
    {
      delay: 1200,
      build: () =>
        makeEvent("tx.submitted", `${hash}`, {
          status: "pending",
          detail: { hash },
        }, clock),
    },
    {
      delay: 4200 + random() * 1200,
      build: () =>
        makeEvent("tx.confirmed", `${hash} · block ${block}`, {
          detail: { hash, block },
        }, clock),
    },
  ]
}

/**
 * Pre-populate the console to the FIFO cap so the first paint already shows a full log
 * (marketing hero + desk shell). One payment cascade, then random one-offs to 10 rows.
 */
function createInitialEvents(): FeedEvent[] {
  const random = seededRandom(INITIAL_EVENT_SEED)
  const clock = () => INITIAL_EVENT_TS
  const initial: FeedEvent[] = []
  for (const step of paymentFlow(random, clock)) {
    initial.push(step.build())
  }
  while (initial.length < MAX_EVENTS) {
    initial.push(singleEvent(random, clock))
  }
  return initial.slice(0, MAX_EVENTS)
}

function singleEvent(
  random: RandomSource = Math.random,
  clock: ClockSource = Date.now,
): FeedEvent {
  const variants: Array<() => FeedEvent> = [
    () =>
      makeEvent("auth.session.started", `${rid("usr", 6, random)}`, {
        method: "POST",
      }, clock),
    () =>
      makeEvent("wallet.created", `${rid("wlt", 6, random)}`, {
        method: "POST",
        detail: { network: pick(NETWORKS, random) },
      }, clock),
    () =>
      makeEvent("request.created", `${rid("req", 6, random)} · ${pick(ASSETS, random)} ${amount(random)}`, {
        method: "POST",
      }, clock),
    () =>
      makeEvent("request.paid", `${rid("req", 6, random)}`, {
        method: "POST",
      }, clock),
    () =>
      makeEvent("transfer", `${shortHash(random)} · ${pick(ASSETS, random)} ${amount(random)}`, {
        detail: { network: pick(NETWORKS, random) },
      }, clock),
    () =>
      makeEvent("mint", `XUY · ${amount(random)}`, {
        detail: { collateral: "USDC" },
      }, clock),
    () =>
      makeEvent("policy.checked", `${rid("wlt", 6, random)} · whitelist ok`, {
        method: "GET",
      }, clock),
    () =>
      makeEvent("webhook.failed", `${rid("evt", 6, random)} → 503`, {
        method: "POST",
        status: "failed",
        detail: { status: 503, retry: true },
      }, clock),
  ]
  return pick(variants, random)()
}

/** Shape returned by `useMockEventStream` — what the event console consumes. */
export type MockEventStreamControls = {
  events: FeedEvent[]
  paused: boolean
  pause: () => void
  resume: () => void
  clear: () => void
}

export type UseMockEventStreamOptions = {
  /**
   * When `false`, only the initial full log is shown; no new rows are scheduled (e.g. marketing hero marquee).
   * @default true
   */
  append?: boolean
}

/**
 * Mock event stream. Mimics realistic backend cadence (slowed for marketing / readability):
 *  - starts with a full row list (10) so the panel is never empty on first paint
 *  - with `append: true` (default): one-off events every ~4.5–7.5s, occasional bursts, FIFO cap
 *  - with `append: false`: fixed initial log only
 *
 * Replace this hook with one that subscribes to SSE/WebSocket later — the
 * `MockEventStreamControls` is the contract the console depends on.
 */
export function useMockEventStream(
  options: UseMockEventStreamOptions = {},
): MockEventStreamControls {
  const { append = true } = options
  const [events, setEvents] = useState<FeedEvent[]>(createInitialEvents)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(paused)
  const queueRef = useRef<FeedEvent[]>([])

  useEffect(() => {
    pausedRef.current = paused
    if (!paused && queueRef.current.length > 0) {
      const flushed = queueRef.current
      queueRef.current = []
      setEvents((prev) => capped([...prev, ...flushed]))
    }
  }, [paused])

  useEffect(() => {
    if (!append) return
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const push = (e: FeedEvent) => {
      if (cancelled) return
      if (pausedRef.current) {
        queueRef.current.push(e)
        return
      }
      setEvents((prev) => capped([...prev, e]))
    }

    const fireBurst = (steps: { delay: number; build: () => FeedEvent }[]) => {
      for (const step of steps) {
        const t = setTimeout(() => push(step.build()), step.delay)
        timeouts.push(t)
      }
    }

    const tick = () => {
      if (cancelled) return
      const roll = Math.random()
      if (roll < 0.18) {
        fireBurst(paymentFlow())
      } else if (roll < 0.28) {
        fireBurst(swapFlow())
      } else {
        push(singleEvent())
      }
      const next = 4500 + Math.random() * 3000
      const t = setTimeout(tick, next)
      timeouts.push(t)
    }

    // Initial rows come from createInitialEvents; only schedule ongoing stream.
    const seed = setTimeout(tick, 5000)
    timeouts.push(seed)

    return () => {
      cancelled = true
      for (const t of timeouts) clearTimeout(t)
    }
  }, [append])

  return {
    events,
    paused,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    clear: () => {
      queueRef.current = []
      setEvents([])
    },
  }
}

function capped(arr: FeedEvent[]): FeedEvent[] {
  if (arr.length <= MAX_EVENTS) return arr
  return arr.slice(arr.length - MAX_EVENTS)
}
