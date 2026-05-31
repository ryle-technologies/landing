"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useId, useLayoutEffect, useRef, useState } from "react"
import {
  ALPHA_WEB_HERO_ASCII_MAX_CH,
  alphaWebHeroAsciiHalf,
} from "@/components/beta/alphaWebHeroAscii"
import { useLandingScrollItemEntered } from "@/components/marketing/landing/LandingHomeScrollFadeItem"

const MONO_EM_RATIO = 0.58
const MIN_PX = 3.5
/** Upper cap (px); must allow {@link DELAUNAY_STRIP_FONT_SCALE} × fit size on large viewports. */
const MAX_PX = 44
/**
 * Multiplier vs. the width/height–fitted “strip” font size so the hub graph reads
 * much larger in the pillar column.
 */
const DELAUNAY_STRIP_FONT_SCALE = 2.5
const SVG_NUMBER_DECIMALS = 4

const TOP_HALF_LINE_COUNT = alphaWebHeroAsciiHalf("top").ascii.split("\n").length
const heightPlaceholder = Array(TOP_HALF_LINE_COUNT).fill("\u00a0").join("\n")
const GRAPH_WIDTH = 100
const GRAPH_HEIGHT =
  (TOP_HALF_LINE_COUNT * 1.03 * GRAPH_WIDTH) /
  (ALPHA_WEB_HERO_ASCII_MAX_CH * MONO_EM_RATIO)
type GraphPoint = [number, number]

/** Scale strokes and nodes from the tighter viewBox dimension so layout stays balanced. */
const LAYOUT_UNIT = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT)
/** Inset from viewBox edges — ring + nodes stop just inside this margin. */
const GRAPH_EDGE_INSET = LAYOUT_UNIT * 0.022
/** Headroom for radius / angle / tangential wobble vs. the inset box. */
const RING_OUTWARD_SAFETY = 1.22

/** White hub ring (dominant node). */
const HUB_RADIUS = LAYOUT_UNIT * 0.078
/** Inner dot inside the hub ring. */
const HUB_INNER_RADIUS = LAYOUT_UNIT * 0.044
const SATELLITE_RADIUS = LAYOUT_UNIT * 0.028
const SPOKE_STROKE_WIDTH = LAYOUT_UNIT * 0.0042
const HUB_RING_STROKE_WIDTH = LAYOUT_UNIT * 0.0034

/** Centered so the orbit can use horizontal and vertical span symmetrically. */
const MAIN_HUB: GraphPoint = [GRAPH_WIDTH * 0.5, GRAPH_HEIGHT * 0.5]

const SATELLITE_COUNT = 20

type OrbitRadii = { hubR: number; satR: number; inset: number }

/**
 * Satellites in a loose ring around the hub, sized to nearly fill the viewBox
 * (respecting inset + wobble). Deterministic wobble keeps the ring organic, not CAD.
 */
function buildOrbitSatellites(
  hub: GraphPoint,
  count: number,
  radii: OrbitRadii
): GraphPoint[] {
  const [cx, cy] = hub
  const { hubR, satR, inset } = radii
  const maxRHoriz =
    (Math.min(cx, GRAPH_WIDTH - cx) - hubR - satR - inset) / RING_OUTWARD_SAFETY
  const maxRVert =
    (Math.min(cy, GRAPH_HEIGHT - cy) - hubR - satR - inset) /
    RING_OUTWARD_SAFETY
  const meanR = Math.max(
    LAYOUT_UNIT * 0.06,
    Math.min(maxRHoriz, maxRVert)
  )
  const out: GraphPoint[] = []

  for (let i = 0; i < count; i += 1) {
    const t = i / count
    const angleBase = t * Math.PI * 2 - Math.PI / 2
    const spacingWobble =
      Math.sin(i * 2.17 + 0.41) * 0.13 + Math.cos(i * 1.09 + 0.15) * 0.08
    const angle = angleBase + spacingWobble

    const radiusWobble =
      1 +
      0.12 * Math.sin(i * 1.53 + 0.22) +
      0.09 * Math.cos(i * 2.31 - 0.08)
    const radius = meanR * radiusWobble

    let x = cx + Math.cos(angle) * radius
    let y = cy + Math.sin(angle) * radius

    const tangential =
      (Math.sin(i * 2.91 + 0.7) * 0.42 + Math.cos(i * 1.47) * 0.28) * meanR * 0.038
    x += -Math.sin(angle) * tangential
    y += Math.cos(angle) * tangential

    out.push([x, y])
  }
  return out
}

const orbitRadii: OrbitRadii = {
  hubR: HUB_RADIUS,
  satR: SATELLITE_RADIUS,
  inset: GRAPH_EDGE_INSET,
}

const orbitSatellites = buildOrbitSatellites(
  MAIN_HUB,
  SATELLITE_COUNT,
  orbitRadii
)

export function formatSvgNumberForHydration(value: number) {
  return Number(value.toFixed(SVG_NUMBER_DECIMALS)).toString()
}

const HUB_SHADOW_DY = formatSvgNumberForHydration(LAYOUT_UNIT * 0.0024)
const HUB_SHADOW_STDDEV = formatSvgNumberForHydration(LAYOUT_UNIT * 0.0055)
const SPOKE_STROKE_WIDTH_STR = formatSvgNumberForHydration(SPOKE_STROKE_WIDTH)
const HUB_RING_STROKE_WIDTH_STR = formatSvgNumberForHydration(
  HUB_RING_STROKE_WIDTH
)

/** [main hub, …orbit satellites] */
const points: GraphPoint[] = [MAIN_HUB, ...orbitSatellites]

const nodeRadii = points.map((_, index) => {
  if (index === 0) return HUB_RADIUS
  return SATELLITE_RADIUS
})

/** Every satellite connects to the single hub at index 0. */
const spokeEdges: readonly (readonly [number, number])[] = Array.from(
  { length: points.length - 1 },
  (_, k): [number, number] => [0, k + 1]
)

const satelliteIndices = Array.from(
  { length: points.length - 1 },
  (_, k) => k + 1
)

const motionEase = [0.16, 1, 0.3, 1] as const
const STAGGER_S = 0.052
const LINE_DURATION_S = 0.42
const DOT_DURATION_S = 0.38
const HUB_DURATION_S = 0.4
const DOT_AFTER_LINE_PROGRESS = 0.72
const HUB_INNER_PULSE_DURATION_S = 0.5
/** Small pause after the block enters view so the first hub animation is visible. */
const IN_VIEW_START_DELAY_S = 0.22

/** Curved segment trimmed so strokes meet circle rims instead of running underneath dots. */
function rimCurvedSegmentPath(
  from: GraphPoint,
  rFrom: number,
  to: GraphPoint,
  rTo: number,
  curve: number
): string {
  const [x0, y0] = from
  const [x1, y1] = to
  const dx = x1 - x0
  const dy = y1 - y0
  const distance = Math.hypot(dx, dy)
  const unitX = distance === 0 ? 0 : dx / distance
  const unitY = distance === 0 ? 0 : dy / distance

  return curvedSegmentPath(
    [x0 + unitX * rFrom, y0 + unitY * rFrom],
    [x1 - unitX * rTo, y1 - unitY * rTo],
    curve
  )
}

function curvedSegmentPath(from: GraphPoint, to: GraphPoint, curve = 0.1) {
  const [x1, y1] = from
  const [x2, y2] = to
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.hypot(dx, dy)
  const normalX = distance === 0 ? 0 : -dy / distance
  const normalY = distance === 0 ? 0 : dx / distance
  const direction = x1 * 13 + y1 * 17 > x2 * 13 + y2 * 17 ? 1 : -1
  const bend = Math.min(distance * curve, LAYOUT_UNIT * 0.048) * direction

  return `M${formatSvgNumberForHydration(x1)},${formatSvgNumberForHydration(y1)} Q${formatSvgNumberForHydration(mx + normalX * bend)},${formatSvgNumberForHydration(my + normalY * bend)} ${formatSvgNumberForHydration(x2)},${formatSvgNumberForHydration(y2)}`
}

/**
 * Single hub-and-spoke graph for the public-blockchains pillar: one central node
 * with satellites. Same vertical footprint as the former ASCII strip.
 */
export function LandingHomeDelaunayGraph() {
  const hubShadowFilterId = useId().replace(/:/g, "")
  const blockRef = useRef<HTMLDivElement>(null)
  const [fontPx, setFontPx] = useState(MIN_PX)
  const reduceMotion = useReducedMotion()
  const sequenceItemEntered = useLandingScrollItemEntered()
  const isInView = useInView(blockRef, {
    margin: "-28% 0px -28% 0px",
    once: false,
  })
  const shouldShow = reduceMotion || (sequenceItemEntered ?? isInView)

  useLayoutEffect(() => {
    const el = blockRef.current
    if (!el) return

    const apply = () => {
      const self = el.getBoundingClientRect()
      const parent = el.parentElement?.getBoundingClientRect()
      /**
       * `h-full` on this node often resolves to the intrinsic `<pre>` height, not the
       * pillar row — so we also read the flex wrapper (parent) when it is larger.
       */
      const effW = Math.max(self.width, parent?.width ?? 0)
      const effH = Math.max(self.height, parent?.height ?? 0)
      if (effW < 8 || effH < 8) return
      const fromWidth = effW / (ALPHA_WEB_HERO_ASCII_MAX_CH * MONO_EM_RATIO)
      const fromHeight = effH / (TOP_HALF_LINE_COUNT * 1.03)
      const base = Math.min(fromWidth, fromHeight)
      const scaled = base * DELAUNAY_STRIP_FONT_SCALE
      const next = Math.max(MIN_PX, Math.min(MAX_PX, scaled))
      setFontPx(next)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    if (el.parentElement) ro.observe(el.parentElement)
    /** Framer height:auto can settle one frame late — re-run after layout. */
    const raf = requestAnimationFrame(() => apply())
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  const staggeredDelays = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) =>
      reduceMotion ? 0 : start + i * STAGGER_S
    )

  const maxDelay = (delays: readonly number[]) =>
    delays.length === 0 ? 0 : Math.max(...delays)

  const lineDotDelay = (lineDelay: number) =>
    reduceMotion ? 0 : lineDelay + LINE_DURATION_S * DOT_AFTER_LINE_PROGRESS

  const delayHub = reduceMotion ? 0 : IN_VIEW_START_DELAY_S
  const delaySpokes = staggeredDelays(
    delayHub + HUB_DURATION_S * 0.65,
    spokeEdges.length
  )
  const delaySats = delaySpokes.map(lineDotDelay)
  const delayHubInnerPulse =
    reduceMotion ? 0 : maxDelay(delaySats) + DOT_DURATION_S * 0.72 + 0.14

  const lineTransition = reduceMotion
    ? () => ({ duration: 0 })
    : (delay: number) =>
        shouldShow
          ? { duration: LINE_DURATION_S, delay, ease: motionEase }
          : { duration: 0 }
  const dotTransition = (delay: number) =>
    reduceMotion
      ? { duration: 0 }
      : shouldShow
        ? { duration: DOT_DURATION_S, delay, ease: motionEase }
        : { duration: 0 }
  const hubTransition = (delay: number) =>
    reduceMotion
      ? { duration: 0 }
      : shouldShow
        ? { duration: HUB_DURATION_S, delay, ease: motionEase }
        : { duration: 0 }
  const innerHubTransition = (delay: number) => {
    if (reduceMotion || !shouldShow) return { duration: 0 }

    const pulseStart = Math.max(delay + HUB_DURATION_S, delayHubInnerPulse)
    const totalDuration =
      pulseStart - delay + HUB_INNER_PULSE_DURATION_S
    const entranceEnd = HUB_DURATION_S / totalDuration
    const pulseStartAt = (pulseStart - delay) / totalDuration
    const collapseAt =
      (pulseStart - delay + HUB_INNER_PULSE_DURATION_S * 0.45) /
      totalDuration

    return {
      duration: totalDuration,
      delay,
      ease: motionEase,
      times: [0, entranceEnd, pulseStartAt, collapseAt, 1],
    }
  }

  const renderHub = (index: number, delay: number, keyPrefix: string) => {
    const [x, y] = points[index]
    const hubMotion = {
      opacity: shouldShow ? 1 : 0,
      scale: shouldShow ? 1 : 0,
    }
    const innerHubMotion =
      shouldShow ?
        {
          opacity: [0, 1, 1, 0.58, 1],
          scale: [0, 1, 1, 0.32, 1],
        }
      : {
          opacity: 0,
          scale: 0,
        }
    const hubInitial = {
      opacity: reduceMotion ? 1 : 0,
      scale: reduceMotion ? 1 : 0,
    }
    const hubStyle = {
      transformBox: "fill-box",
      transformOrigin: "center center",
    } as const

    return (
      <>
        <motion.circle
          key={`${keyPrefix}-ring`}
          cx={formatSvgNumberForHydration(x)}
          cy={formatSvgNumberForHydration(y)}
          r={formatSvgNumberForHydration(nodeRadii[index])}
          fill="var(--marketing-surface)"
          className="stroke-[color-mix(in_srgb,var(--foreground)_20%,var(--marketing-surface))]"
          strokeWidth={HUB_RING_STROKE_WIDTH_STR}
          initial={hubInitial}
          animate={hubMotion}
          transition={hubTransition(delay)}
          style={hubStyle}
        />
        <motion.circle
          key={`${keyPrefix}-inner`}
          cx={formatSvgNumberForHydration(x)}
          cy={formatSvgNumberForHydration(y)}
          r={formatSvgNumberForHydration(HUB_INNER_RADIUS)}
          className="fill-[color-mix(in_srgb,var(--muted)_40%,var(--marketing-surface))]"
          filter={`url(#${hubShadowFilterId})`}
          initial={hubInitial}
          animate={innerHubMotion}
          transition={innerHubTransition(delay)}
          style={hubStyle}
        />
      </>
    )
  }

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 max-w-none" ref={blockRef}>
      <pre
        aria-hidden
        className="m-0 w-full min-w-0 max-w-full overflow-hidden whitespace-pre p-0 font-mono leading-[1.03] text-transparent [letter-spacing:0] [tab-size:1] pointer-events-none select-none"
        style={{ fontSize: `${fontPx}px` }}
      >
        {heightPlaceholder}
      </pre>
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${GRAPH_WIDTH} ${formatSvgNumberForHydration(GRAPH_HEIGHT)}`}
      >
        <defs>
          <filter
            id={hubShadowFilterId}
            x="-55%"
            y="-55%"
            width="210%"
            height="210%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              dx="0"
              dy={HUB_SHADOW_DY}
              stdDeviation={HUB_SHADOW_STDDEV}
              floodOpacity="0.055"
            />
          </filter>
        </defs>
        <g
          className="stroke-[color-mix(in_srgb,var(--foreground)_20%,var(--marketing-surface))]"
          strokeWidth={SPOKE_STROKE_WIDTH_STR}
        >
          {spokeEdges.map(([from, to], i) => (
            <motion.path
              key={`hub-${from}-${to}`}
              d={rimCurvedSegmentPath(
                points[from],
                nodeRadii[from],
                points[to],
                nodeRadii[to],
                0.06
              )}
              fill="none"
              pathLength={1}
              strokeLinecap="round"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              animate={{ pathLength: shouldShow ? 1 : 0 }}
              transition={lineTransition(delaySpokes[i])}
            />
          ))}
        </g>
        <g className="fill-[color-mix(in_srgb,var(--muted)_30%,var(--marketing-surface))]">
          {satelliteIndices.map((index, i) => {
            const [x, y] = points[index]
            const r = nodeRadii[index]
            return (
              <motion.circle
                key={`sat-${index}`}
                cx={formatSvgNumberForHydration(x)}
                cy={formatSvgNumberForHydration(y)}
                r={formatSvgNumberForHydration(r)}
                strokeWidth={0}
                initial={{
                  opacity: reduceMotion ? 1 : 0,
                  scale: reduceMotion ? 1 : 0,
                }}
                animate={{
                  opacity: shouldShow ? 1 : 0,
                  scale: shouldShow ? 1 : 0,
                }}
                transition={dotTransition(delaySats[i])}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center center",
                }}
              />
            )
          })}
        </g>
        {renderHub(0, delayHub, "hub")}
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[11%] max-w-[4.5rem] bg-[var(--marketing-surface)] transition-colors duration-500 ease-out"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, rgb(0 0 0 / 0.72), black)",
          maskImage:
            "linear-gradient(to right, transparent, rgb(0 0 0 / 0.72), black)",
        }}
      />
    </div>
  )
}
