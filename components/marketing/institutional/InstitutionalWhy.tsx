"use client"

import { useLayoutEffect, useRef, useState, type RefObject } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { SECTION_IDS, WHY } from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import { displayClassName } from "@/components/marketing/institutional/styles"
import { LatticeCell, LatticeGrid } from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { useMarketingScrollContainer } from "@/components/marketing/MarketingThemeProvider"
import {
  LATTICE_CELL_PX,
  LATTICE_COLUMN_ATTR,
  LATTICE_COLUMN_MAX_COLS,
  LATTICE_SPACE,
  floorCells,
} from "@/lib/landingLattice"

const HEADING_ID = "institutional-why-heading"

/** Sampled from the EY chart: the percentage green. */
const CHART_GREEN = "#2A8A58"
const CHART_BORDER = "rgb(20 18 16 / 0.28)"
/** 1px inside the top/left and 1px outside the right/bottom, so the edge is the lattice line. */
const CHART_STROKE = `inset 1px 1px 0 0 ${CHART_BORDER}, 1px 1px 0 0 ${CHART_BORDER}`
/** Source frame, in the page lattice colour rather than the bar stroke. Drawn inside so it does not cover the neighbouring bar. */
const GRID_STROKE = `inset 1px 0 0 0 var(--lattice-line), inset 0 1px 0 0 var(--lattice-line), inset -1px 0 0 0 var(--lattice-line), inset 0 -1px 0 0 var(--lattice-line)`
/**
 * Same stroke, but the right edge is drawn inside. The chart fills the
 * column, so an outside right line is clipped and the last bar looks open.
 */
const CHART_STROKE_END = `inset 1px 1px 0 0 ${CHART_BORDER}, inset -1px 0 0 0 ${CHART_BORDER}, 0 1px 0 0 ${CHART_BORDER}`

/** Tallest bars. Eight cells — the old 32rem track, which is already a lattice height. */
const CHART_ROWS = 8
/** Short bars. Three cells holds a percentage and a wrapped label; the shortest answer sits one cell under that. */
const MIN_BAR_ROWS = 3
const BAR_COUNT = WHY.survey.rows.length

type SurveyRow = (typeof WHY.survey.rows)[number]

/**
 * Share snapped to whole cells. Anything under the old 0.4 floor shares the
 * 3-cell bar, except the shortest answer, which is one cell under that.
 * 20% is just under a half-cell past the floor, so it steps up to 4.
 */
function barRows(value: number, max: number, min: number) {
  if (value === max) return CHART_ROWS
  if (value === min) return MIN_BAR_ROWS - 1
  const share = value / max
  if (share <= 0.4) return MIN_BAR_ROWS
  return Math.min(CHART_ROWS - 1, Math.max(MIN_BAR_ROWS, Math.ceil(share * CHART_ROWS)))
}

/** Equal bars, in whole cells. A remainder (16 columns → 1 cell) stays empty so the five match. */
function barWidth(columnCols: number) {
  return Math.max(2, Math.floor(columnCols / BAR_COUNT))
}

function useLatticeColumnCols(nodeRef: RefObject<HTMLElement | null>) {
  const [cols, setCols] = useState(LATTICE_COLUMN_MAX_COLS)

  useLayoutEffect(() => {
    const column = nodeRef.current?.closest<HTMLElement>(`[${LATTICE_COLUMN_ATTR}]`)
    if (!column) return
    const apply = () => {
      const next = Math.max(1, floorCells(column.getBoundingClientRect().width + 1))
      setCols((prev) => (prev === next ? prev : next))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(column)
    return () => observer.disconnect()
  }, [nodeRef])

  return cols
}

/** One leftover cell on a 16-column desktop. The source stands in it, on the left. */
function hasSourceColumn(columnCols: number, barCols: number) {
  return columnCols - barCols * BAR_COUNT >= 1
}

function SurveySource() {
  return (
    <a
      href={WHY.survey.sourceHref}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0 flex items-center justify-center px-1.5 text-center text-[11px] leading-snug text-muted underline decoration-foreground/25 underline-offset-[0.25em] [text-orientation:mixed] [writing-mode:vertical-rl] hover:decoration-foreground"
    >
      Source: {WHY.survey.source}
    </a>
  )
}

function SurveyChart({
  play,
  reduceMotion,
  barCols,
  columnCols,
}: {
  play: boolean
  reduceMotion: boolean
  barCols: number
  columnCols: number
}) {
  const { rows } = WHY.survey
  const max = Math.max(...rows.map((row) => row.value))
  const min = Math.min(...rows.map((row) => row.value))
  const chartCols = barCols * BAR_COUNT
  const source = hasSourceColumn(columnCols, barCols)
  const gridCols = chartCols + (source ? 1 : 0)

  return (
    <LatticeGrid
      minCols={gridCols}
      className="w-max"
      style={{ width: gridCols * LATTICE_CELL_PX }}
    >
      {rows.map((row, index) => {
        const rowsHigh = barRows(row.value, max, min)
        return (
          <SurveyColumn
            key={row.label}
            row={row}
            cols={barCols}
            colStart={(source ? 1 : 0) + index * barCols + 1}
            rowsHigh={rowsHigh}
            rowStart={CHART_ROWS - rowsHigh + 1}
            play={play}
            reduceMotion={reduceMotion}
            closeRight={index === rows.length - 1}
          />
        )
      })}
      {source ? (
        <LatticeCell
          cols={1}
          colStart={1}
          rows={CHART_ROWS}
          rowStart={1}
          paper
          bodyClassName="relative"
          style={{ boxShadow: GRID_STROKE }}
        >
          <SurveySource />
        </LatticeCell>
      ) : null}
    </LatticeGrid>
  )
}

function SurveyColumn({
  row,
  cols,
  colStart,
  rowsHigh,
  rowStart,
  play,
  reduceMotion,
  closeRight = false,
}: {
  row: SurveyRow
  cols: number
  colStart: number
  rowsHigh: number
  rowStart: number
  play: boolean
  reduceMotion: boolean
  /** Right edge of the chart. Drawn inside so the column does not clip it. */
  closeRight?: boolean
}) {
  return (
    <LatticeCell
      cols={cols}
      colStart={colStart}
      rows={rowsHigh}
      rowStart={rowStart}
      paper={false}
      bodyClassName="relative"
    >
      <motion.div
        className={`absolute inset-x-0 bottom-0 flex flex-col justify-between bg-gradient-to-t from-white to-[var(--marketing-surface)] px-3 text-left sm:px-4 ${
          rowsHigh <= MIN_BAR_ROWS ? "pt-3 pb-3 sm:pt-3 sm:pb-4" : "pt-4 pb-5 sm:pt-5 sm:pb-6"
        }`}
        style={{ boxShadow: closeRight ? CHART_STROKE_END : CHART_STROKE }}
        initial={false}
        animate={{ height: reduceMotion || play ? "100%" : "18%" }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <p
          className={`self-end font-sans leading-none font-medium tracking-tight tabular-nums ${
            rowsHigh <= MIN_BAR_ROWS
              ? "text-[clamp(20px,2.2vw,32px)]"
              : "text-[clamp(28px,3.4vw,52px)]"
          }`}
          style={{ color: CHART_GREEN }}
        >
          {row.value}%
        </p>
        <p className="text-left font-serif text-[13px] leading-snug text-foreground sm:text-[15px] md:text-[16px]">
          {row.label}
        </p>
      </motion.div>
    </LatticeCell>
  )
}

/**
 * Why Ryle: how institutions plan to tokenize, as the EY stepped chart.
 * Five columns share a baseline; height follows the share.
 */
export function InstitutionalWhy() {
  const ref = useRef<HTMLElement>(null)
  const scrollContainerRef = useMarketingScrollContainer()
  const reduceMotion = useReducedMotion() ?? false
  const play = useInView(ref, {
    root: scrollContainerRef ?? undefined,
    amount: 0.35,
    once: true,
  })
  const columnCols = useLatticeColumnCols(ref)
  const barCols = barWidth(columnCols)

  return (
    <LatticeSection
      id={SECTION_IDS.whyRyle}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTopBottom"
      pad={false}
      className={`pt-16 ${LATTICE_SPACE.sectionBottom}`}
    >
      <LatticePlate fill flushLeft>
        <InstitutionalHeading
          id={HEADING_ID}
          className={`${displayClassName} mt-3 md:mt-4`}
          lines={WHY.titleLines}
        />
      </LatticePlate>
      <figure ref={ref} className={LATTICE_SPACE.blockTight}>
        <div className="max-w-full overflow-x-auto">
          <SurveyChart
            play={play}
            reduceMotion={reduceMotion}
            barCols={barCols}
            columnCols={columnCols}
          />
        </div>
        {hasSourceColumn(columnCols, barCols) ? null : (
          <figcaption className="mt-4 max-w-[36rem] text-left text-[12px] leading-snug text-muted">
            Source:{" "}
            <a
              href={WHY.survey.sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-foreground/25 underline-offset-2 hover:decoration-foreground"
            >
              {WHY.survey.source}
            </a>
          </figcaption>
        )}
      </figure>
    </LatticeSection>
  )
}
