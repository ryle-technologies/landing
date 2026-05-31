"use client"

import { useId, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Minus, Plus } from "lucide-react"
import { LandingHomeBanksConsole } from "@/components/marketing/landing/LandingHomeBanksConsole"
import { LandingHomeDelaunayGraph } from "@/components/marketing/landing/LandingHomeDelaunayGraph"
import { LandingHomeStablecoinsHeatmap } from "@/components/marketing/landing/LandingHomeStablecoinsHeatmap"

export type LandingHomePillarRecapTabItem =
  | {
      title: string
      /**
       * Single expanded panel: one prose block (no multi-row grid or pillar visual).
       */
      simpleExpandedBody: string | readonly string[]
    }
  | {
      title: string
      /**
       * Expanded panel copy — five strings: lead paragraph (row 1); serif inset +
       * two supporting paragraphs (row 2 right); closing paragraph (row 3).
       */
      body: readonly [string, string, string, string, string]
      /**
       * Optional serif inset headline above the lead paragraph (grid row 1),
       * same typography as {@link recapPillarInsetTitleClass} / `body[1]`.
       */
      openingInsetTitle?: string
      /**
       * Optional serif inset headline above the closing paragraph (grid row 3),
       * same typography as {@link recapPillarInsetTitleClass} / `body[1]`.
       */
      closingInsetTitle?: string
    }

const recapTitleClass =
  "text-left font-serif text-[clamp(1.25rem,3.2vw,1.65rem)] font-normal italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-2xl lg:text-3xl"

const recapBodyClass =
  "text-left text-lg font-normal leading-8 text-muted transition-colors duration-500 ease-out sm:leading-8"

/** Pillar grid, right column: serif inset / inner section titles (opening, problem stack, closing). */
const recapPillarInsetTitleClass =
  "text-left font-serif text-xl font-normal italic leading-snug tracking-[-0.03em] text-foreground transition-colors duration-500 ease-out sm:text-2xl min-[1080px]:text-[1.75rem]"

/** Vertical stack between detached pillar rows. */
const recapPillarStackGapClass =
  "flex flex-col gap-y-20 sm:gap-y-24 min-[1080px]:gap-y-32"

/** Row 1: lead column ~70%, remainder ~30%; extra space above opening copy. */
const recapPillarRow1GridClass =
  "grid grid-cols-[7fr_3fr] items-stretch gap-x-6 sm:gap-x-8 min-[1080px]:gap-x-10 pt-2 sm:pt-3 min-[1080px]:pt-4"

/** Row 2: visual ~30%, inset copy ~70%. */
const recapPillarRow2GridClass =
  "grid grid-cols-[3fr_7fr] items-stretch gap-x-6 sm:gap-x-8 min-[1080px]:gap-x-10"

/** Row 3: closing column ~70%, remainder ~30% (same ratio as row 1). */
const recapPillarRow3GridClass =
  "grid grid-cols-[7fr_3fr] items-stretch gap-x-6 sm:gap-x-8 min-[1080px]:gap-x-10"

/** Row 2 left: visual strip — horizontal inset only. */
const recapPillarVisualShellClass =
  "flex h-full min-h-0 min-w-0 w-full flex-col px-1 sm:px-2"

/** Inner: grow to row height, then center the strip/graph in that box. */
const recapPillarVisualInnerClass =
  "flex min-h-0 w-full flex-1 flex-col items-center justify-center"

const rowPaddingClass = "pl-0 pr-5 sm:pr-6 min-[1080px]:pr-8"

/**
 * Expanded panel copy — standard inset below 1080px; ~120px right gutter on desktop.
 * `!` on the desktop rule so it wins over `sm:pr-6` in the generated stylesheet order.
 */
const panelPaddingClass =
  "pl-0 pr-5 sm:pr-6 min-[1080px]:!pr-[120px]"

const titleRowYPaddingClass = "pt-[24px] pb-3 sm:pb-4"

function PillarVisual({ index }: { index: number }) {
  if (index === 0) return <LandingHomeDelaunayGraph />
  if (index === 1) return <LandingHomeStablecoinsHeatmap />
  return <LandingHomeBanksConsole />
}

/** Border strokes on the block (top, bottom, right). */
function BorderFrame() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px bg-gradient-to-r from-transparent to-border"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-px bg-gradient-to-r from-transparent to-border"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-px bg-border"
      />
    </>
  )
}

/**
 * Pillar recap: each row has a title and a plus/minus control; click expands or
 * collapses copy. Full pillars use a three-row grid plus a visual; a pillar may
 * instead use `simpleExpandedBody` for a single prose block.
 */
export function LandingHomePillarRecapTabs({
  items,
}: {
  items: readonly [
    LandingHomePillarRecapTabItem,
    LandingHomePillarRecapTabItem,
    LandingHomePillarRecapTabItem,
  ]
}) {
  const reactId = useId().replace(/:/g, "")
  const reduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])

  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const }

  function toggle(index: number) {
    setExpanded((prev) => {
      const next: [boolean, boolean, boolean] = [...prev] as [
        boolean,
        boolean,
        boolean,
      ]
      next[index] = !next[index]
      return next
    })
  }

  return (
    <div className="relative w-full min-w-0">
      <BorderFrame />
      <div className="relative z-0 flex w-full min-w-0 flex-col divide-y divide-border/50">
        {items.map((item, index) => {
          const isOpen = expanded[index]
          const headerId = `landing-pillar-recap-h-${reactId}-${index}`
          const panelId = `landing-pillar-recap-p-${reactId}-${index}`

          return (
            <div key={item.title} className="min-w-0">
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className={`${rowPaddingClass} ${titleRowYPaddingClass} flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-transparent text-left outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/25`}
              >
                <span className={recapTitleClass}>{item.title}</span>
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--marketing-fab-bg)] text-[var(--marketing-fab-fg)] transition-opacity duration-200 ease-out hover:opacity-90"
                >
                  {isOpen ?
                    <Minus className="size-3.5" strokeWidth={2.25} />
                  : <Plus className="size-3.5" strokeWidth={2.25} />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ?
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={motionTransition}
                    className="overflow-hidden"
                  >
                    <div className={`${panelPaddingClass} flex flex-col pb-[24px]`}>
                      {"simpleExpandedBody" in item ?
                        <div
                          className={`${recapBodyClass} max-w-none space-y-4 pt-1 sm:pt-2`}
                        >
                          {(Array.isArray(item.simpleExpandedBody) ?
                            item.simpleExpandedBody
                          : [item.simpleExpandedBody]
                          ).map((paragraph) => (
                            <p key={paragraph} className="max-w-none">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      : <div className={`${recapBodyClass} ${recapPillarStackGapClass}`}>
                          <div className={recapPillarRow1GridClass}>
                            <div className="flex min-w-0 flex-col space-y-4">
                              {item.openingInsetTitle ?
                                <p className={recapPillarInsetTitleClass}>
                                  {item.openingInsetTitle}
                                </p>
                              : null}
                              <p>{item.body[0]}</p>
                            </div>
                            <div aria-hidden className="min-w-0" />
                          </div>
                          <div className={recapPillarRow2GridClass}>
                            <div className={recapPillarVisualShellClass}>
                              <div className={recapPillarVisualInnerClass}>
                                <PillarVisual index={index} />
                              </div>
                            </div>
                            <div className="flex min-h-0 min-w-0 flex-col space-y-4">
                              <p className={recapPillarInsetTitleClass}>
                                {item.body[1]}
                              </p>
                              <p>{item.body[2]}</p>
                              <p>{item.body[3]}</p>
                            </div>
                          </div>
                          <div className={recapPillarRow3GridClass}>
                            <div className="flex min-w-0 flex-col space-y-4">
                              {item.closingInsetTitle ?
                                <p className={recapPillarInsetTitleClass}>
                                  {item.closingInsetTitle}
                                </p>
                              : null}
                              <p>{item.body[4]}</p>
                            </div>
                            <div aria-hidden className="min-w-0" />
                          </div>
                        </div>
                      }
                    </div>
                  </motion.div>
                : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
