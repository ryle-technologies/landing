"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react"
import { WalletDemoPortal } from "@/components/marketing/wallet-demo/WalletDemoShellContext"
import { Avatar } from "@/components/marketing/wallet-demo/ui/Avatar"
import { ArrowLeft, MOVEMENT_ACTION_ICONS, XIcon } from "@/components/marketing/wallet-demo/ui/primitives"
import { ConvertAmountStep } from "@/components/marketing/wallet-demo/send/ConvertAmountStep"
import { RecipientStep } from "@/components/marketing/wallet-demo/send/RecipientStep"
import { TransferAmountStep } from "@/components/marketing/wallet-demo/send/TransferAmountStep"
import { useWalletDemoStore, type SendStep } from "@/lib/walletDemo/store"

const STEPS: SendStep[] = ["recipient", "amount"]
const SWIPE_THRESHOLD = 50
const SendIntentIcon = MOVEMENT_ACTION_ICONS.send

function useSwipeSteps(onNext: () => void, onBack: () => void) {
  const [direction, setDirection] = useState<1 | -1>(1)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!touchStart.current) return
      const dx = e.changedTouches[0].clientX - touchStart.current.x
      const dy = e.changedTouches[0].clientY - touchStart.current.y
      touchStart.current = null
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) {
        setDirection(1)
        onNext()
      } else {
        setDirection(-1)
        onBack()
      }
    },
  }

  const variants = {
    initial: { opacity: 0, x: direction * 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -24 },
  }

  const navigate = {
    next: () => {
      setDirection(1)
      onNext()
    },
    back: () => {
      setDirection(-1)
      onBack()
    },
  }

  return { handlers, variants, navigate }
}

function StepDots({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === stepIndex ? 20 : 6,
            height: 6,
            background: i <= stepIndex ? "var(--foreground)" : "var(--border-strong)",
          }}
        />
      ))}
    </div>
  )
}

/** Full-frame send / convert flow that scales in over the peeked home. */
export function SendSheet() {
  const isOpen = useWalletDemoStore((s) => s.send.isOpen)
  const step = useWalletDemoStore((s) => s.send.step)
  const mode = useWalletDemoStore((s) => s.send.mode)
  const recipient = useWalletDemoStore((s) => s.send.recipient)
  const convertEntryPoint = useWalletDemoStore((s) => s.send.convertEntryPoint)
  const next = useWalletDemoStore((s) => s.sendNext)
  const back = useWalletDemoStore((s) => s.sendBack)

  const showConvertHeader = mode === "convert" && step === "amount"
  const closeConvertToHome = showConvertHeader && convertEntryPoint === "home"
  const stepIndex = STEPS.indexOf(step)
  const { handlers, variants, navigate } = useSwipeSteps(next, back)
  const sheetScrollRef = useRef<HTMLDivElement | null>(null)

  // Slide-up-to-confirm: the whole step lifts with the drag and the content
  // behind the hint blurs progressively.
  const confirmSheetY = useMotionValue(0)
  const confirmContentProgress = useMotionValue(0)
  const swipeBlurPx = useTransform(confirmContentProgress, [0, 1], [0, 28])
  const swipeBackdropBlur = useTransform(swipeBlurPx, (px) =>
    px < 0.25 ? "none" : `blur(${px}px)`,
  )
  const showAmountSlideBlur = step === "amount"

  useEffect(() => {
    if (!showAmountSlideBlur || !isOpen) {
      confirmSheetY.set(0)
      confirmContentProgress.set(0)
    }
  }, [confirmContentProgress, confirmSheetY, isOpen, showAmountSlideBlur])

  const recipientTitle = recipient?.tag ?? recipient?.name ?? ""

  return (
    <WalletDemoPortal>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="send-flow"
            role="dialog"
            aria-modal="true"
            aria-label={showConvertHeader ? "Exchange" : step === "amount" ? "How much are you sending?" : "Send"}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            style={{ transformOrigin: "center 40%" }}
            className="absolute inset-0 z-[80] flex min-h-0 flex-col"
          >
            <motion.div
              ref={sheetScrollRef}
              style={{ y: confirmSheetY }}
              className="relative flex min-h-0 flex-1 touch-pan-y flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain"
              {...handlers}
            >
              <div className="shrink-0">
                {showConvertHeader ? (
                  <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
                    <button
                      type="button"
                      onClick={navigate.back}
                      aria-label={closeConvertToHome ? "Close" : "Back"}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white"
                    >
                      {closeConvertToHome ? (
                        <XIcon color="var(--foreground)" />
                      ) : (
                        <ArrowLeft color="var(--foreground)" />
                      )}
                    </button>
                    <h2 className="min-w-0 flex-1 truncate text-center text-[17px] font-medium tracking-[-0.01em] text-foreground">
                      Exchange
                    </h2>
                    <StepDots stepIndex={stepIndex} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
                      <button
                        type="button"
                        onClick={navigate.back}
                        aria-label="Back"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/30"
                      >
                        <ArrowLeft color="var(--foreground)" />
                      </button>

                      {step === "amount" ? (
                        <div
                          role="group"
                          className="ml-auto flex min-w-0 max-w-[min(100%,16rem)] flex-nowrap items-center justify-end gap-1.5"
                          aria-label={recipientTitle}
                        >
                          <span className="shrink-0 text-muted-light" aria-hidden>
                            <SendIntentIcon className="block shrink-0" size={18} aria-hidden />
                          </span>
                          <Avatar
                            name={recipient?.name ?? ""}
                            src={recipient?.avatarUrl?.trim() ? recipient.avatarUrl.trim() : undefined}
                            size="xs"
                            plain
                            className="!h-6 !w-6 shrink-0 !text-xs !text-foreground"
                          />
                          <span className="min-w-0 truncate text-base font-medium leading-snug tracking-[-0.01em] text-foreground">
                            {recipientTitle}
                          </span>
                        </div>
                      ) : (
                        <StepDots stepIndex={stepIndex} />
                      )}
                    </div>

                    {step === "recipient" ? (
                      <div className="px-6 pb-4 pt-4">
                        <h2 className="text-left text-[22px] font-medium tracking-[-0.02em] text-foreground">
                          Send
                        </h2>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`${step}-${mode}`}
                    initial={variants.initial}
                    animate={variants.animate}
                    exit={variants.exit}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
                  >
                    {step === "amount" ? (
                      showConvertHeader ? (
                        <ConvertAmountStep
                          sheetY={confirmSheetY}
                          contentProgress={confirmContentProgress}
                        />
                      ) : (
                        <TransferAmountStep
                          sheetY={confirmSheetY}
                          contentProgress={confirmContentProgress}
                        />
                      )
                    ) : (
                      <RecipientStep scrollRootRef={sheetScrollRef} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {showAmountSlideBlur ? (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[20] isolate [transform:translateZ(0)]"
                  style={{
                    backdropFilter: swipeBackdropBlur,
                    WebkitBackdropFilter: swipeBackdropBlur,
                  }}
                />
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WalletDemoPortal>
  )
}
