"use client"

import { AnimatePresence, motion } from "motion/react"
import { LuX } from "react-icons/lu"
import { WalletDemoPortal } from "@/components/marketing/wallet-demo/WalletDemoShellContext"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  height?: number | "auto"
  sheetClassName?: string
  /** Stacks above another sheet in the same shell. */
  nested?: boolean
  /** Flush to shell edges; top corners only rounded. */
  fullWidth?: boolean
  /** Tags the close button as `close-<demoId>` so the scripted demo can find it. */
  demoId?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  height = 500,
  sheetClassName = "",
  nested = false,
  fullWidth = false,
  demoId,
}: BottomSheetProps) {
  const isAuto = height === "auto"

  return (
    <WalletDemoPortal>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={nested ? "absolute inset-0 z-[120]" : "absolute inset-0 z-[100]"}
              style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              onClick={onClose}
            />

            <motion.div
              key="sheet"
              layout={isAuto}
              initial={isAuto ? { y: "100%" } : { y: height, height }}
              animate={isAuto ? { y: 0 } : { y: 0, height }}
              exit={isAuto ? { y: "100%" } : { y: height }}
              transition={{ type: "spring", stiffness: 500, damping: 42, mass: 0.8 }}
              style={isAuto ? undefined : { height }}
              className={`absolute flex min-h-0 flex-col overflow-hidden bg-surface shadow-[0_-4px_24px_rgba(0,0,0,0.06)] ${
                isAuto ? "max-h-[calc(100%_-_8px)]" : ""
              } ${
                fullWidth
                  ? "inset-x-0 bottom-0 rounded-t-[24px]"
                  : "bottom-4 left-4 right-4 rounded-[24px]"
              } ${nested ? "z-[130]" : "z-[110]"} ${sheetClassName}`.trim()}
            >
              {isAuto ? (
                <button
                  type="button"
                  onClick={onClose}
                  data-demo-target={demoId ? `close-${demoId}` : undefined}
                  className="pointer-events-auto absolute top-[24px] right-[24px] z-20 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-tint text-foreground transition-opacity active:opacity-90"
                  aria-label="Close"
                >
                  <LuX size={18} strokeWidth={2} aria-hidden />
                </button>
              ) : null}

              <div className="flex shrink-0 justify-center pt-2.5 pb-1.5">
                <div className="h-1 w-9 rounded-full bg-border-strong" />
              </div>

              <div
                className={`flex min-h-0 flex-1 flex-col ${
                  isAuto ? "overflow-y-auto overscroll-y-contain" : "overflow-hidden"
                }`}
              >
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </WalletDemoPortal>
  )
}
