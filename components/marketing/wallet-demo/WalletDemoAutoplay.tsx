"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react"
import { WalletDemoPortal, useWalletDemoShell } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import {
  WALLET_DEMO_CONVERT_MS,
  WALLET_DEMO_EXECUTION_MS,
  WALLET_DEMO_PAY_MS,
  useWalletDemoStoreApi,
  type WalletDemoAutoplayAction,
} from "@/lib/walletDemo/store"

/** Digits the scripted user types on the send amount step. */
const AMOUNT_KEYS = ["2", "5", "0"]
const AMOUNT_CENTS = 250_00
/** Digits typed on the swap amount step. */
const SWAP_KEYS = ["3", "0", "0"]
const SWAP_CENTS = 300_00
/** Amount + reason the Request scene types (private-wallet create flow). */
const REQUEST_KEYS = ["3", "3"]
const REQUEST_REASON = "Dinner last night"

const START_DELAY_MS = 1400
/** How long the user has to leave the phone alone before autoplay resumes. */
const IDLE_AFTER_USER_MS = 8000
/** Only run while at least this much of the phone is on screen. */
const MIN_VISIBLE_RATIO = 0.35

/** Give enter animations time to mount a target before giving up on the run. */
const TARGET_TIMEOUT_MS = 1500
/** Convert quote fetch after the last digit (see ConvertAmountStep). */
const QUOTE_TIMEOUT_MS = 2800
/** Drag length as a fraction of the phone height (confirm threshold is 0.5). */
const SWIPE_DISTANCE_RATIO = 0.64
const SWIPE_DURATION_MS = 640

/** Receive scene: how long the scripted user lingers on each open sheet. */
const DWELL_MS = 2000
/** Let a bottom sheet spring in / out before the cursor moves on. */
const SHEET_OPEN_MS = 700
const SHEET_CLOSE_MS = 520

const MOVE_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Must match PLAY_EXIT_DURATION + PLAY_HANDOFF_GAP on the chips: the ring
 * clock starts when the next play control actually appears.
 */
const PLAY_HANDOFF_MS = 480

/**
 * Visible-ring budget (after the play handoff). Kept long so a slow cursor
 * or quote wait never finishes the sweep before the last beat.
 */
const SCENE_DURATION_MS: Record<WalletDemoAutoplayAction, number> = {
  send: 18_000,
  receive: 23_000,
  swap: 21_000,
  request: 16_000,
  pay: 12_000,
}

class AutoplayCancelled extends Error {}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Scripted "user" for the product-section wallet. Five scenes, looped:
 *
 * 1. Send — cursor enters the phone, opens Send, picks the first favourite,
 *    types 250, swipes to confirm and waits for the transfer to settle.
 * 2. Receive — opens Receive → "To your username", dwells, closes; opens
 *    Receive → "From another wallet", dwells, taps its QR button, dwells, closes.
 * 3. Swap — cursor stays on the phone after Receive, taps Swap, types 300,
 *    waits for the quote, dwells, swipes to exchange and waits for the legs.
 * 4. Request — taps Request, types €33, Continues, names it “Dinner last
 *    night”, taps WhatsApp; the sheet closes and the scene ends.
 * 5. Pay — a request link “opens” (Sofía / Friday dinner / €74), cursor taps
 *    Send transfer, then Paying → Paid and a new activity row.
 *
 * The chip ring is a live linear 0→1 clock for the scene (starts when the
 * play control appears), finishing on the last beat. The next scene starts
 * immediately, cursor still on the phone.
 *
 * Pauses while the phone is off screen and (optionally) yields to real
 * interaction, resuming after the phone has been idle a while.
 */
export function WalletDemoAutoplay({ yieldToUser = true }: { yieldToUser?: boolean }) {
  const shell = useWalletDemoShell()
  const store = useWalletDemoStoreApi()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [clickId, setClickId] = useState(0)

  useEffect(() => {
    if (!shell) return
    if (typeof window === "undefined") return

    let disposed = false
    let runId = 0
    let lastUserInteraction = 0
    let inView = false
    /** Cursor is on the phone from a scene that just finished — next one resumes. */
    let onStage = false
    let activeAnimations: { stop: () => void }[] = []

    const progress = store.getState().autoplayProgress
    let progressAnimation: { stop: () => void } | null = null
    let progressRaf = 0
    let progressRunning = false
    let progressT0 = 0
    let progressDuration = 1
    let progressAction: WalletDemoAutoplayAction | null = null
    const lastVisibleMs: Partial<Record<WalletDemoAutoplayAction, number>> = {}

    const mark = (value: number, ms: number) => {
      progressAnimation?.stop()
      progressAnimation = animate(progress, value, { duration: ms / 1000, ease: "linear" })
    }

    const stopProgressClock = () => {
      progressRunning = false
      if (progressRaf) cancelAnimationFrame(progressRaf)
      progressRaf = 0
      progressAnimation?.stop()
      progressAnimation = null
    }

    const durationFor = (action: WalletDemoAutoplayAction) => {
      const learned = lastVisibleMs[action]
      const base = SCENE_DURATION_MS[action]
      return learned ? Math.max(base, Math.round(learned * 1.1)) : base
    }

    /**
     * Linear 0→1 on a live clock. Holds the previous scene at 1 until the
     * next play control appears, then sweeps. If the scene overruns, the
     * ring keeps creeping instead of sitting at 1.
     */
    const startLinearProgress = (action: WalletDemoAutoplayAction) => {
      stopProgressClock()
      progressAction = action
      const holdFull = progress.get() >= 0.5
      progressT0 = performance.now() + PLAY_HANDOFF_MS
      progressDuration = durationFor(action)
      progressRunning = true
      const tick = (now: number) => {
        if (!progressRunning) return
        if (now < progressT0) {
          if (holdFull) progress.set(1)
          progressRaf = requestAnimationFrame(tick)
          return
        }
        const elapsed = now - progressT0
        let p = elapsed / progressDuration
        if (p >= 0.985) {
          const extra = elapsed - progressDuration * 0.985
          p = 0.985 + 0.012 * (1 - Math.exp(-extra / 2800))
        }
        progress.set(Math.min(p, 0.997))
        progressRaf = requestAnimationFrame(tick)
      }
      progressRaf = requestAnimationFrame(tick)
    }

    const finishLinearProgress = async (id: number) => {
      if (progressAction && progressT0) {
        lastVisibleMs[progressAction] = performance.now() - progressT0
      }
      stopProgressClock()
      const current = progress.get()
      if (current >= 0.995) {
        progress.set(1)
        return
      }
      mark(1, 200)
      await wait(200, id)
    }

    const clearProgress = (preserveAction = false) => {
      stopProgressClock()
      if (!preserveAction) store.getState().setAutoplayAction(null)
      progress.set(0)
    }

    // `animate().stop()` never settles `finished`, so anything awaiting a
    // cursor move races it against this signal instead of hanging.
    let cancelWaiters = new Set<() => void>()
    const untilCancelled = () => {
      let release = () => {}
      const promise = new Promise<void>((resolve) => {
        release = resolve
        cancelWaiters.add(resolve)
      })
      return { promise, dispose: () => cancelWaiters.delete(release) }
    }

    const cancelRun = (preserveAction = false) => {
      runId++
      for (const a of activeAnimations) a.stop()
      activeAnimations = []
      for (const release of cancelWaiters) release()
      cancelWaiters = new Set()
      clearProgress(preserveAction)
      setPressed(false)
      setVisible(false)
      onStage = false
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= MIN_VISIBLE_RATIO
        if (!inView) cancelRun()
      },
      { threshold: [0, MIN_VISIBLE_RATIO, 1] },
    )
    io.observe(shell)

    // A real pointer on the phone (or the chips beside it) hands control to
    // the user. Synthetic `.click()` calls never fire pointerdown, so the
    // script doesn't trip itself.
    const onPointerDown = (event: PointerEvent) => {
      if (!yieldToUser) return
      if (!event.isTrusted) return
      const target = event.target
      if (!(target instanceof Element)) return
      if (shell.contains(target) || target.closest("[data-wallet-demo-controls]")) {
        lastUserInteraction = Date.now()
        cancelRun()
      }
    }
    if (yieldToUser) document.addEventListener("pointerdown", onPointerDown, true)

    const check = (id: number) => {
      if (disposed || id !== runId) throw new AutoplayCancelled()
    }
    const wait = async (ms: number, id: number) => {
      await sleep(ms)
      check(id)
    }

    /** Centre of `el` in the phone's unscaled coordinate space. */
    const pointFor = (el: Element) => {
      const r = el.getBoundingClientRect()
      const s = shell.getBoundingClientRect()
      const scale = s.width / (shell.offsetWidth || 1) || 1
      return {
        x: (r.left + r.width / 2 - s.left) / scale,
        y: (r.top + r.height / 2 - s.top) / scale,
      }
    }

    const moveTo = async (pt: { x: number; y: number }, id: number) => {
      const dist = Math.hypot(pt.x - x.get(), pt.y - y.get())
      const duration = Math.min(0.95, Math.max(0.32, dist / 720))
      const ax = animate(x, pt.x, { duration, ease: MOVE_EASE })
      const ay = animate(y, pt.y, { duration, ease: MOVE_EASE })
      activeAnimations = [ax, ay]
      const cancelled = untilCancelled()
      try {
        await Promise.race([Promise.all([ax.finished, ay.finished]), cancelled.promise])
      } finally {
        cancelled.dispose()
      }
      activeAnimations = []
      check(id)
    }

    const click = async (el: HTMLElement, id: number) => {
      setPressed(true)
      setClickId((n) => n + 1)
      await wait(120, id)
      setPressed(false)
      el.click()
      await wait(120, id)
    }

    /** Finds a target, polling briefly so enter animations have time to mount it. */
    const target = async (selector: string, id: number, timeoutMs = TARGET_TIMEOUT_MS) => {
      const deadline = performance.now() + timeoutMs
      for (;;) {
        const el = shell.querySelector<HTMLElement>(selector)
        if (el) return el
        if (performance.now() > deadline) throw new AutoplayCancelled()
        await wait(50, id)
      }
    }

    const moveAndClick = async (selector: string, settleMs: number, id: number) => {
      const el = await target(selector, id)
      const scroller = el.closest(".overflow-x-auto")
      if (scroller instanceof HTMLElement) {
        const er = el.getBoundingClientRect()
        const sr = scroller.getBoundingClientRect()
        scroller.scrollLeft += er.left + er.width / 2 - (sr.left + sr.width / 2)
      }
      await wait(40, id)
      await moveTo(pointFor(el), id)
      await wait(settleMs, id)
      await click(el, id)
    }

    /** Wait until a leftover sheet target has unmounted (or the timeout elapses). */
    const waitUntilGone = async (selector: string, id: number, timeoutMs = 1200) => {
      const deadline = performance.now() + timeoutMs
      while (shell.querySelector(selector)) {
        if (performance.now() > deadline) return
        await wait(50, id)
      }
    }

    /**
     * Presses the slide-up handle and drags it past its confirm threshold,
     * feeding the component real pointer events (scaled into screen space) so
     * the sheet lifts and blurs exactly like a finger would make it.
     */
    const swipeUp = async (el: HTMLElement, id: number) => {
      const start = pointFor(el)
      const rect = el.getBoundingClientRect()
      const clientX = rect.left + rect.width / 2
      const clientY0 = rect.top + rect.height / 2
      const scale = shell.getBoundingClientRect().height / (shell.offsetHeight || 1) || 1
      const distance = shell.offsetHeight * SWIPE_DISTANCE_RATIO

      const fire = (type: "pointerdown" | "pointermove" | "pointerup", clientY: number) =>
        el.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
            button: 0,
            buttons: type === "pointerup" ? 0 : 1,
            clientX,
            clientY,
          }),
        )

      setPressed(true)
      setClickId((n) => n + 1)
      fire("pointerdown", clientY0)
      await wait(160, id)

      const t0 = performance.now()
      await new Promise<void>((resolve) => {
        const frame = (now: number) => {
          if (disposed || id !== runId) return resolve()
          const p = Math.min(1, (now - t0) / SWIPE_DURATION_MS)
          const eased = 1 - Math.pow(1 - p, 3)
          const dy = -distance * eased
          y.set(start.y + dy)
          fire("pointermove", clientY0 + dy * scale)
          if (p < 1) requestAnimationFrame(frame)
          else resolve()
        }
        requestAnimationFrame(frame)
      })
      check(id)
      fire("pointerup", clientY0 - distance * scale)
      setPressed(false)
    }

    const needsReset = () => {
      const s = store.getState()
      return (
        s.send.isOpen ||
        s.receiveView !== "closed" ||
        s.request.isOpen ||
        s.payRequestOpen ||
        s.shieldOpen ||
        s.qrScanOpen ||
        s.cardSheetOpen ||
        s.switcherOpen ||
        s.activeAccountKind !== "euros" ||
        s.balanceCentsFor("euros") < Math.max(AMOUNT_CENTS, SWAP_CENTS)
      )
    }

    /** Where the cursor parks between scenes: just outside the phone's right edge. */
    const offstagePoint = () => ({ x: shell.offsetWidth + 48, y: shell.offsetHeight * 0.58 })

    /**
     * Start a scene's chip ring. By default the cursor teleports offstage so
     * it can slide in; `resume` keeps it where the last scene left it.
     */
    const enter = async (
      action: WalletDemoAutoplayAction,
      id: number,
      { resume = false }: { resume?: boolean } = {},
    ) => {
      if (!resume) {
        const offstage = offstagePoint()
        x.set(offstage.x)
        y.set(offstage.y)
      }
      setVisible(true)
      store.getState().setAutoplayAction(action)
      onStage = true
      await wait(resume ? 80 : 60, id)
    }

    /** Begin a scene, resuming the cursor when the previous one just finished. */
    const begin = async (
      action: WalletDemoAutoplayAction,
      id: number,
      forceReset: boolean,
    ) => {
      const didReset = forceReset || needsReset()
      if (didReset) await resetWallet(id)
      await enter(action, id, { resume: onStage && !didReset })
      startLinearProgress(action)
    }

    /** Back to a fresh homepage before a scene starts. */
    const resetWallet = async (id: number) => {
      if (needsReset()) store.getState().reset()
      check(id)
    }

    const runSend = async (id: number, forceReset = false) => {
      await begin("send", id, forceReset)

      // 1. Send
      await moveAndClick('[data-demo-target="action-send"]', 220, id)
      await wait(780, id)

      // 2. First favourite (Sofía)
      await moveAndClick('[data-demo-target="favorites"] button', 200, id)
      await wait(700, id)

      // 3. Amount
      for (const key of AMOUNT_KEYS) {
        await moveAndClick(`[data-demo-key="${key}"]`, 90, id)
        await wait(110, id)
      }
      await wait(380, id)

      // 4. Swipe up to send
      const handle = await target('[data-demo-target="swipe-confirm"]', id)
      await moveTo(pointFor(handle), id)
      await wait(300, id)
      await swipeUp(handle, id)
      await wait(560, id)

      // Toast → balance slide → activity row.
      await wait(WALLET_DEMO_EXECUTION_MS, id)
      await finishLinearProgress(id)
    }

    const runReceive = async (id: number, forceReset = false) => {
      if (!forceReset && store.getState().receiveView !== "closed") {
        store.getState().closeReceive()
        await wait(500, id)
      }
      await begin("receive", id, forceReset)

      // 1. Receive → menu
      await moveAndClick('[data-demo-target="action-receive"]', 220, id)
      await wait(SHEET_OPEN_MS, id)

      // 2. To your username; dwell so the handle can be read.
      await moveAndClick('[data-demo-target="receive-handle"]', 200, id)
      await wait(SHEET_OPEN_MS, id)
      await wait(DWELL_MS, id)

      // 3. Close it
      await moveAndClick('[data-demo-target="close-receive-handle"]', 160, id)
      await wait(SHEET_CLOSE_MS, id)

      // 4. Receive again → menu
      await moveAndClick('[data-demo-target="action-receive"]', 220, id)
      await wait(SHEET_OPEN_MS, id)

      // 5. From another wallet; dwell on the address.
      await moveAndClick('[data-demo-target="receive-wallet"]', 200, id)
      await wait(SHEET_OPEN_MS, id)
      await wait(DWELL_MS, id)

      // 6. QR code from the address card; dwell, then close.
      await moveAndClick('[data-demo-target="receive-wallet-qr"]', 180, id)
      await wait(SHEET_OPEN_MS, id)
      await wait(DWELL_MS, id)
      await moveAndClick('[data-demo-target="close-receive-qr"]', 160, id)
      store.getState().closeReceive()
      await waitUntilGone('[data-demo-target="close-receive-qr"]', id)
      await waitUntilGone('[data-demo-target="close-receive-wallet"]', id)
      await finishLinearProgress(id)
    }

    const runSwap = async (id: number, forceReset = false) => {
      store.getState().closeReceive()
      await begin("swap", id, forceReset)

      // 1. Swap → convert sheet
      await moveAndClick('[data-demo-target="action-swap"]', 280, id)
      await wait(SHEET_OPEN_MS, id)

      // 2. Amount
      for (const key of SWAP_KEYS) {
        await moveAndClick(`[data-demo-key="${key}"]`, 90, id)
        await wait(110, id)
      }

      // 3. Wait for the quote to land, then dwell so the rate can be read.
      await target('[data-demo-quote="ready"]', id, QUOTE_TIMEOUT_MS)
      await wait(DWELL_MS, id)

      // 4. Swipe up to exchange
      const handle = await target('[data-demo-target="swipe-confirm"]', id)
      await moveTo(pointFor(handle), id)
      await wait(300, id)
      await swipeUp(handle, id)
      await wait(560, id)

      await wait(WALLET_DEMO_CONVERT_MS, id)
      await finishLinearProgress(id)
    }

    const runRequest = async (id: number, forceReset = false) => {
      if (!forceReset && store.getState().request.isOpen) {
        store.getState().closeRequest()
        await wait(SHEET_CLOSE_MS, id)
      }
      await begin("request", id, forceReset)

      await moveAndClick('[data-demo-target="action-request"]', 220, id)
      await wait(SHEET_OPEN_MS, id)

      for (const key of REQUEST_KEYS) {
        await moveAndClick(`[data-demo-key="${key}"]`, 90, id)
        await wait(110, id)
      }
      await wait(280, id)
      await moveAndClick('[data-demo-target="request-continue"]', 200, id)
      await wait(SHEET_OPEN_MS, id)

      const reasonField = await target('[data-demo-target="request-reason"]', id)
      await moveTo(pointFor(reasonField), id)
      await wait(160, id)
      reasonField.focus()
      for (const ch of REQUEST_REASON) {
        store.getState().setRequestReason(store.getState().request.reason + ch)
        await wait(48, id)
      }
      await wait(380, id)

      await moveAndClick('[data-demo-target="request-whatsapp"]', 200, id)
      await waitUntilGone('[data-demo-target="close-request"]', id)
      await wait(SHEET_CLOSE_MS, id)
      await finishLinearProgress(id)
    }

    const runPay = async (id: number, forceReset = false) => {
      if (!forceReset && store.getState().payRequestOpen) {
        store.getState().closePayRequest()
        await wait(SHEET_CLOSE_MS, id)
      }
      await begin("pay", id, forceReset)

      // Request link “opens”: the pay sheet lands with Sofía’s €74 dinner request.
      store.getState().openPayRequest()
      await wait(SHEET_OPEN_MS, id)

      // Dwell so the amount and creator can be read, then tap Send transfer.
      await wait(DWELL_MS, id)
      await moveAndClick('[data-demo-target="pay-request-confirm"]', 220, id)
      await wait(560, id)

      await wait(WALLET_DEMO_PAY_MS, id)
      await finishLinearProgress(id)
    }

    const SCENES: WalletDemoAutoplayAction[] = ["send", "receive", "swap", "request", "pay"]
    const runScene = (scene: WalletDemoAutoplayAction, id: number, forceReset: boolean) => {
      if (scene === "send") return runSend(id, forceReset)
      if (scene === "receive") return runReceive(id, forceReset)
      if (scene === "swap") return runSwap(id, forceReset)
      if (scene === "request") return runRequest(id, forceReset)
      return runPay(id, forceReset)
    }

    // A chip press beside the phone asks for a specific scene: the current run
    // is cut short and the wallet restarts from the homepage on that scene.
    let requested: WalletDemoAutoplayAction | null = null
    const unsubscribeRequests = store.subscribe((state) => {
      const request = state.autoplayRequest
      if (!request) return
      store.getState().requestAutoplay(null)
      requested = request
      lastUserInteraction = 0
      // Chip already flipped `autoplayAction` and reseeded the homepage.
      cancelRun(true)
    })

    const loop = async () => {
      await sleep(START_DELAY_MS)
      let sceneIndex = 0
      while (!disposed) {
        const userIdle = !yieldToUser || Date.now() - lastUserInteraction >= IDLE_AFTER_USER_MS
        if (!inView || document.visibilityState !== "visible" || !userIdle) {
          await sleep(400)
          continue
        }
        const request = requested
        requested = null
        if (request) sceneIndex = SCENES.indexOf(request)
        const scene = SCENES[sceneIndex]
        const id = ++runId
        try {
          await runScene(scene, id, request !== null)
          sceneIndex = (sceneIndex + 1) % SCENES.length
        } catch (error) {
          const switching = error instanceof AutoplayCancelled && requested !== null
          if (!switching) {
            clearProgress()
            setVisible(false)
          }
          if (!(error instanceof AutoplayCancelled)) {
            // Keep the loop alive; retry the same scene on the next pass.
            await sleep(900)
            continue
          }
          // A fresh request should start right away; other cancels breathe first.
          if (!requested) await sleep(900)
        }
      }
    }

    void loop()

    return () => {
      disposed = true
      cancelRun()
      unsubscribeRequests()
      io.disconnect()
      if (yieldToUser) document.removeEventListener("pointerdown", onPointerDown, true)
    }
  }, [shell, store, x, y, yieldToUser])

  return (
    <WalletDemoPortal>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-[300]"
        style={{ x, y }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {/* Click ripple: a ring that expands out from the dot. */}
        <AnimatePresence>
          {clickId > 0 ? (
            <motion.span
              key={clickId}
              className="absolute -left-5 -top-5 h-10 w-10 rounded-full border-2 border-foreground/40"
              initial={{ scale: 0.3, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ) : null}
        </AnimatePresence>
        {/* The cursor: a soft touch-style dot centred on the hotspot. */}
        <motion.span
          className="absolute -left-3 -top-3 block h-6 w-6 rounded-full border-2 border-white bg-foreground/55 shadow-[0_1px_2px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.18)]"
          animate={{ scale: pressed ? 0.7 : 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 30 }}
        />
      </motion.div>
    </WalletDemoPortal>
  )
}
