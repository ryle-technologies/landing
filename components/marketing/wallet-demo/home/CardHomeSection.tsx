"use client"

import { useEffect, useRef, type RefObject } from "react"
import { LuChevronRight } from "react-icons/lu"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import { AccountCardFace } from "@/components/marketing/wallet-demo/home/AccountCardFace"
import { SECTION_LABEL_CLASS } from "@/components/marketing/wallet-demo/ui/primitives"
import { useWalletDemoStore } from "@/lib/walletDemo/store"

const CARD_SCALE_MIN = 0.85
const CARD_SCALE_MAX = 1

/** Maps card position inside the home scrollport → scale (0.85 → 1). */
function useHomeCardScrollScale(
  cardRef: RefObject<HTMLElement | null>,
  scrollRootRef: RefObject<HTMLElement | null> | undefined,
  enabled: boolean,
) {
  const scale = useMotionValue(enabled ? CARD_SCALE_MIN : CARD_SCALE_MAX)
  const smooth = useSpring(scale, { stiffness: 280, damping: 36, mass: 0.6 })

  useEffect(() => {
    if (!enabled) {
      scale.set(CARD_SCALE_MAX)
      return
    }
    const card = cardRef.current
    const root = scrollRootRef?.current
    if (!card || !root) return

    const update = () => {
      const rootRect = root.getBoundingClientRect()
      const top = card.getBoundingClientRect().top
      const height = card.offsetHeight
      const start = rootRect.bottom
      const end = rootRect.bottom - height
      const span = start - end
      if (span <= 0) {
        scale.set(CARD_SCALE_MAX)
        return
      }
      const t = (start - top) / span
      const clamped = Math.min(1, Math.max(0, t))
      scale.set(CARD_SCALE_MIN + clamped * (CARD_SCALE_MAX - CARD_SCALE_MIN))
    }

    update()
    root.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    const ro = new ResizeObserver(update)
    ro.observe(root)
    ro.observe(card)
    return () => {
      root.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      ro.disconnect()
    }
  }, [cardRef, enabled, scale, scrollRootRef])

  return smooth
}

/** Home card block under Activity: card face + sheet CTA. */
export function CardHomeSection({
  scrollRootRef,
}: {
  scrollRootRef?: RefObject<HTMLDivElement | null>
}) {
  const openCardSheet = useWalletDemoStore((s) => s.openCardSheet)
  const payAsset = useWalletDemoStore((s) => s.cardPayAsset)
  const cardRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const scale = useHomeCardScrollScale(cardRef, scrollRootRef, reduceMotion !== true)

  return (
    <section className="mt-6 w-full min-w-0 shrink-0" aria-labelledby="wallet-demo-card-heading">
      <button
        type="button"
        onClick={openCardSheet}
        className="w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl bg-surface pt-4 text-left [corner-shape:squircle] transition-opacity active:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <div className="mb-4 flex min-w-0 items-center justify-between gap-3 px-6">
          <h2 id="wallet-demo-card-heading" className={`shrink-0 ${SECTION_LABEL_CLASS}`}>
            Your card
          </h2>
          <span
            className={`flex min-w-0 max-w-[65%] shrink items-center justify-end gap-0.5 ${SECTION_LABEL_CLASS}`}
            aria-hidden
          >
            <span className="min-w-0 truncate text-right">View activity and settings</span>
            <LuChevronRight size={14} strokeWidth={1.75} className="shrink-0 text-muted" />
          </span>
        </div>

        <div ref={cardRef} className="w-full min-w-0">
          <motion.div
            style={reduceMotion === true ? undefined : { scale, transformOrigin: "center center" }}
            className="pointer-events-none w-full min-w-0 will-change-transform"
          >
            <AccountCardFace size="home" payAsset={payAsset} />
          </motion.div>
        </div>
      </button>
    </section>
  )
}
