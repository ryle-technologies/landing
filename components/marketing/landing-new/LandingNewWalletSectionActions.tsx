"use client"

import React from "react"
import { AnimatePresence, motion, type MotionValue } from "motion/react"
import { LuPlay } from "react-icons/lu"
import { useWalletDemoStore, type WalletDemoAutoplayAction } from "@/lib/walletDemo/store"

const CHIP_BUTTON_CLASS =
  "relative shrink-0 transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

/** Play-control slot; collapses so the chip shortens with the exit. */
const ICON_SLOT_PX = 18
const PLAY_TO_LABEL_GAP_PX = 10
/** Play-control circle the progress stroke traces. */
const PLAY_CIRCLE_PX = 16
/** Gap between the circle edge and the progress ring, and the ring's stroke. */
const RING_GAP_PX = 1.5
const RING_STROKE_PX = 2.5
const RING_COLOR = "#FF7A1A"
const RING_TRACK = "color-mix(in srgb, var(--foreground) 16%, transparent)"

const PLAY_EASE = [0.22, 1, 0.36, 1] as const
const PLAY_EXIT_DURATION = 0.3
/** Pause after the outgoing play is gone, before the next one scales up. */
const PLAY_HANDOFF_GAP = 0.18
const PLAY_SLOT_TRANSITION = { duration: PLAY_EXIT_DURATION, ease: PLAY_EASE }
const PLAY_ICON_ENTER_TRANSITION = { duration: 0.34, ease: PLAY_EASE }
const PLAY_ENTER_TRANSITION = {
  ...PLAY_ICON_ENTER_TRANSITION,
  delay: PLAY_EXIT_DURATION + PLAY_HANDOFF_GAP,
}
const PLAY_ICON_EXIT_TRANSITION = { duration: PLAY_EXIT_DURATION, ease: PLAY_EASE }

/**
 * Orange progress ring traced around the play circle while the scripted demo
 * walks through that action. `progress` is 0..1 and drawn per frame.
 */
function PlayProgressRing({ progress }: { progress: MotionValue<number> }) {
  const pad = RING_GAP_PX + RING_STROKE_PX
  const box = PLAY_CIRCLE_PX + pad * 2
  const r = PLAY_CIRCLE_PX / 2 + RING_GAP_PX + RING_STROKE_PX / 2
  const c = box / 2
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute overflow-visible"
      style={{ left: -pad, top: -pad, width: box, height: box }}
      viewBox={`0 0 ${box} ${box}`}
    >
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={RING_TRACK}
        strokeWidth={RING_STROKE_PX}
      />
      <motion.circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={RING_COLOR}
        strokeWidth={RING_STROKE_PX}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ pathLength: progress }}
      />
    </svg>
  )
}

function ActionChip({
  label,
  onPress,
  disabled,
  autoplayActive,
}: {
  label: string
  /** Omit for a display-only chip that ignores the pointer. */
  onPress?: () => void
  disabled?: boolean
  autoplayActive: boolean
}) {
  const progress = useWalletDemoStore((s) => s.autoplayProgress)
  const interactive = Boolean(onPress) && !disabled
  const [hovered, setHovered] = React.useState(false)
  const showPlay = autoplayActive || (hovered && interactive)
  /** Scene handoff waits; hover should pop the icon immediately. */
  const enterTransition = autoplayActive ? PLAY_ENTER_TRANSITION : PLAY_ICON_ENTER_TRANSITION
  return (
    <button
      type="button"
      onClick={interactive ? onPress : undefined}
      onPointerEnter={interactive ? () => setHovered(true) : undefined}
      onPointerLeave={interactive ? () => setHovered(false) : undefined}
      tabIndex={interactive ? undefined : -1}
      aria-disabled={interactive ? undefined : true}
      className={`${CHIP_BUTTON_CLASS}${disabled ? " opacity-35" : ""}${interactive ? " cursor-pointer" : " pointer-events-none"}`}
    >
      <div
        className={autoplayActive ? CHIP_ACTIVE_SURFACE_CLASS : CHIP_IDLE_SURFACE_CLASS}
        style={autoplayActive ? LANDING_CHIP_SURFACE_STYLE : undefined}
      >
        <AnimatePresence initial={false}>
          {showPlay ? (
            <motion.span
              key="play"
              className="relative flex shrink-0 items-center justify-center overflow-visible"
              style={{ height: ICON_SLOT_PX }}
              initial={{ width: 0, marginRight: 0 }}
              animate={{
                width: ICON_SLOT_PX,
                marginRight: PLAY_TO_LABEL_GAP_PX,
                transition: enterTransition,
              }}
              exit={{
                width: 0,
                marginRight: 0,
                transition: PLAY_SLOT_TRANSITION,
              }}
            >
              <motion.span
                className="relative flex items-center justify-center rounded-full bg-foreground/8"
                style={{ width: PLAY_CIRCLE_PX, height: PLAY_CIRCLE_PX }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: enterTransition,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  transition: PLAY_ICON_EXIT_TRANSITION,
                }}
              >
                {autoplayActive ? <PlayProgressRing progress={progress} /> : null}
                <LuPlay
                  className="ml-px block shrink-0"
                  size={8}
                  fill="currentColor"
                  aria-hidden
                />
              </motion.span>
            </motion.span>
          ) : null}
        </AnimatePresence>
        <span className="whitespace-nowrap text-[17px] font-medium leading-none tracking-[-0.01em]">
          {label}
        </span>
      </div>
    </button>
  )
}

const CHIP_IDLE_SURFACE_CLASS =
  "flex min-h-11 flex-row items-center rounded-2xl px-3 py-2.5 text-left text-foreground [background-clip:padding-box] [corner-shape:squircle] [transform:translateZ(0)] bg-[color-mix(in_srgb,var(--foreground)_7%,var(--marketing-surface))]"

const CHIP_ACTIVE_SURFACE_CLASS =
  "flex min-h-11 flex-row items-center rounded-2xl border border-transparent bg-surface px-3 py-2.5 text-left text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.075)] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] [corner-shape:squircle] [transform:translateZ(0)]"

const LANDING_CHIP_SURFACE_STYLE = {
  backgroundImage:
    "linear-gradient(var(--surface), var(--surface)), linear-gradient(to bottom, transparent, var(--border))",
} as const

/**
 * Wallet quick actions for the product-section copy column. Each chip restarts
 * the scripted demo on the right from a fresh homepage on that scene.
 */
export function LandingNewWalletSectionActions() {
  const activeAccountKind = useWalletDemoStore((s) => s.activeAccountKind)
  const requestAutoplay = useWalletDemoStore((s) => s.requestAutoplay)
  const autoplayAction = useWalletDemoStore((s) => s.autoplayAction)

  const isCrypto = activeAccountKind === "crypto"

  const actions: {
    id: string
    label: string
    scene?: WalletDemoAutoplayAction
    disabled?: boolean
  }[] = [
    { id: "send", label: "Send", scene: "send" },
    { id: "receive", label: "Receive", scene: "receive" },
    { id: "swap", label: "Swap", scene: "swap", disabled: isCrypto },
    { id: "request", label: "Request", scene: "request" },
    { id: "pay", label: "Pay", scene: "pay" },
  ]

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3" data-wallet-demo-controls>
      {actions.map(({ id, label, scene, disabled }) => (
        <ActionChip
          key={id}
          label={label}
          onPress={scene ? () => requestAutoplay(scene) : undefined}
          disabled={disabled}
          autoplayActive={autoplayAction === id}
        />
      ))}
    </div>
  )
}
