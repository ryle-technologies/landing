"use client"

import {
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useReducedMotion } from "motion/react"
import {
  SHAPE_MOTION,
  faceCentroid,
  faceNormal,
  getShapeFaceOn,
  getUseCaseEdgeRoles,
  getUseCaseSilhouette,
  getUseCaseSolid,
  rotateVec,
  SILHOUETTE_EXTENT,
  type LandingNewUseCaseShapeKind,
  type UseCaseSilhouette,
} from "@/lib/landingNewUseCaseSolids"

export type { LandingNewUseCaseShapeKind }

/** One lattice cell — 2D plates sit in this box and never grow past it. */
const SIZE = 60
const FOCAL = 3.8
const SCALE = (SIZE / 2 - 1.4) / SILHOUETTE_EXTENT
/** Idle plate and 3D solid share this scale so the form does not swell. */
const PLATE_SCALE = 0.5
/** Solids live in a ~1-radius ball; plates are fitted to SILHOUETTE_EXTENT. */
const PROJECT_SCALE = SCALE * PLATE_SCALE * SILHOUETTE_EXTENT
const LIGHT = normalizeLight(-0.38, 0.78, 0.52)
/** Face-on: grow the form out of the 2D plate. */
const SHAPE_MS = 980
/** Then turn, and sketch the sides that the turn reveals. */
const SIDES_MS = 1100
const LIFT_MS = 720
const TOTAL_DRAW_MS = SHAPE_MS + SIDES_MS
/** Rainbow starts cooling after the last strokes land, then drains to ink. */
const COOL_START_MS = TOTAL_DRAW_MS * 0.88
const COOL_MS = 820
/** 3D settles back to the 2D plate before the tile collapses. */
export const USE_CASE_SHAPE_REVERT_MS = 520

type Projected = { x: number; y: number; z: number }

let clock = 0
let lastStamp = 0
let raf = 0
let running = false
const listeners = new Set<() => void>()

function loop(now: number) {
  if (!running) return
  if (lastStamp === 0) lastStamp = now
  clock += now - lastStamp
  lastStamp = now
  listeners.forEach((fn) => fn())
  raf = requestAnimationFrame(loop)
}

function startClock() {
  if (running) return
  running = true
  lastStamp = 0
  raf = requestAnimationFrame(loop)
}

function stopClock() {
  running = false
  lastStamp = 0
  cancelAnimationFrame(raf)
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  if (typeof document === "undefined" || document.visibilityState === "visible") {
    startClock()
  }
  return () => {
    listeners.delete(onStoreChange)
    if (listeners.size === 0) stopClock()
  }
}

function noopSubscribe() {
  return () => {}
}

function getSnapshot() {
  return clock
}

function getServerSnapshot() {
  return 0
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopClock()
    else if (listeners.size > 0) startClock()
  })
}

function normalizeLight(x: number, y: number, z: number) {
  const l = Math.hypot(x, y, z) || 1
  return [x / l, y / l, z / l] as const
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function smooth01(from: number, to: number, value: number) {
  const t = clamp01((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

function screen(x: number, y: number) {
  return { x: SIZE / 2 + x * SCALE, y: SIZE / 2 - y * SCALE }
}

function SilhouetteMark({
  silhouette,
  heat,
  time,
  live,
  scale = 1,
}: {
  silhouette: UseCaseSilhouette
  heat: number
  time: number
  /** Stronger stroke while the 3D form is growing out of this plate. */
  live?: boolean
  /** Same scale as the 3D solid — the plate does not grow when live. */
  scale?: number
}) {
  const ink = live ? 0.78 : 0.52
  const hue = (time * 0.42) % 360
  const base = {
    fill: "currentColor" as const,
    fillOpacity: live ? 0.07 : 0.05,
    stroke: "currentColor",
    strokeOpacity: ink,
    strokeWidth: 1.35,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  }
  const glow =
    heat > 0.02
      ? {
          ...base,
          fill: "none" as const,
          fillOpacity: 0,
          stroke: hsl(hue, 92 * (0.35 + 0.65 * heat), 56),
          strokeOpacity: ink * heat,
          strokeWidth: 1.35 + 0.55 * heat,
        }
      : null

  const wrap = (nodes: ReactNode) => (
    <g transform={`translate(${SIZE / 2} ${SIZE / 2}) scale(${scale}) translate(${-SIZE / 2} ${-SIZE / 2})`}>
      {nodes}
    </g>
  )

  if (silhouette.type === "circle") {
    const c = screen(0, 0)
    const r = silhouette.r * SCALE
    return wrap(
      <g>
        <circle cx={c.x} cy={c.y} r={r} {...base} fill="none" fillOpacity={0} />
        {glow ? <circle cx={c.x} cy={c.y} r={r} {...glow} /> : null}
      </g>,
    )
  }

  if (silhouette.type === "ring") {
    const c = screen(0, 0)
    const outer = silhouette.outer * SCALE
    const inner = silhouette.inner * SCALE
    return wrap(
      <g>
        <circle cx={c.x} cy={c.y} r={outer} {...base} fill="none" fillOpacity={0} />
        <circle cx={c.x} cy={c.y} r={inner} {...base} fill="none" fillOpacity={0} />
        {glow ? (
          <>
            <circle cx={c.x} cy={c.y} r={outer} {...glow} />
            <circle cx={c.x} cy={c.y} r={inner} {...glow} />
          </>
        ) : null}
      </g>,
    )
  }

  const points = silhouette.points.map(([x, y]) => {
    const p = screen(x, y)
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
  }).join(" ")
  return wrap(
    <g>
      <polygon points={points} {...base} />
      {glow ? <polygon points={points} {...glow} /> : null}
    </g>,
  )
}

function project(v: readonly [number, number, number]): Projected {
  const s = FOCAL / (FOCAL + v[2])
  return {
    x: SIZE / 2 + v[0] * s * PROJECT_SCALE,
    y: SIZE / 2 - v[1] * s * PROJECT_SCALE,
    z: v[2],
  }
}

function pointsAttr(pts: readonly Projected[]) {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
}

type FaceDraw = {
  key: string
  points: string
  z: number
  fill: number
}

type EdgeDraw = {
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
  length: number
  drawn: number
  opacity: number
  hue: number
  z: number
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`
}

function strokeProgress(count: number, index: number, t: number) {
  if (t <= 0 || count <= 0) return 0
  if (t >= 1) return 1
  const last = Math.max(1, count - 1)
  const edgeDur = Math.min(0.35, Math.max(0.1, 2.15 / count))
  const start = (index / last) * (1 - edgeDur)
  return easeOutCubic(clamp01((t - start) / edgeDur))
}

function projectSolid(
  kind: LandingNewUseCaseShapeKind,
  time: number,
  frozen: boolean,
  shapeT: number,
  sidesT: number,
  rotating: boolean,
  spinAge: number,
  heat: number,
): { faces: FaceDraw[]; edges: EdgeDraw[]; bob: number; lift: number } {
  const solid = getUseCaseSolid(kind)
  const motion = SHAPE_MOTION[kind]
  const faceOn = getShapeFaceOn(kind)
  const lift = frozen ? 1 : rotating ? easeOutCubic(clamp01(spinAge / LIFT_MS)) : 0
  const live = !frozen && rotating
  const rx =
    faceOn.restX +
    (motion.restX - faceOn.restX) * lift +
    (live ? motion.tilt * Math.sin(spinAge * 0.0007 + motion.phase) : 0)
  const ry =
    faceOn.restY + (motion.restY - faceOn.restY) * lift + (live ? spinAge * motion.spin : 0)
  const rz =
    faceOn.restZ +
    (motion.restZ - faceOn.restZ) * lift +
    (live ? motion.roll * Math.sin(spinAge * 0.00048 + motion.phase * 1.3) : 0)
  const bob = 0

  const fillFade = easeOutCubic(lift)
  // Keep the 2D plate at z=0 while face-on so new strokes grow out of it
  // instead of sitting on a farther face and reading as a pop.
  let plateZ = 0
  let plateMin = Infinity
  const faceOnVerts = solid.vertices.map((v) => rotateVec(v, faceOn.restX, faceOn.restY, faceOn.restZ))
  for (const face of solid.faces) {
    const z = faceCentroid(faceOnVerts, face)[2]
    if (z >= plateMin) continue
    plateMin = z
    plateZ = z
  }
  const zShift = (1 - lift) * plateZ
  const rotated = solid.vertices.map((v) => {
    const r = rotateVec(v, rx, ry, rz)
    return [r[0], r[1], r[2] - zShift] as const
  })
  const raw = rotated.map(project)
  let cx = 0
  let cy = 0
  for (const point of raw) {
    cx += point.x
    cy += point.y
  }
  const count = raw.length || 1
  const dx = SIZE / 2 - cx / count
  const dy = SIZE / 2 - cy / count
  const projected = raw.map((point) => ({
    ...point,
    x: point.x + dx,
    y: point.y + dy,
  }))

  const faces: FaceDraw[] = solid.faces.map((face, index) => {
    const n = faceNormal(rotated, face)
    const mid = faceCentroid(rotated, face)
    const facing = n[2]
    const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])
    const frontness = smooth01(-0.28, 0.32, facing)
    const frontFill = 0.09 + lit * 0.26
    return {
      key: `${kind}-f-${index}`,
      points: pointsAttr(face.map((i) => projected[i]!)),
      z: mid[2],
      fill: fillFade * (0.022 + (frontFill - 0.022) * frontness),
    }
  })
  faces.sort((a, b) => a.z - b.z)

  const roles = getUseCaseEdgeRoles(kind)
  let shapeIndex = 0
  let sideIndex = 0
  const shapeCount = roles.filter((item) => item.role === "shape").length
  const sideCount = roles.filter((item) => item.role === "side").length
  const edges: EdgeDraw[] = roles.map((item, index) => {
    const [i0, i1] = item.edge
    const a = projected[i0]!
    const b = projected[i1]!
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    let drawn = 0
    if (item.role === "silhouette") {
      drawn = frozen || rotating ? 1 : 0
    } else if (item.role === "shape") {
      drawn = frozen ? 1 : strokeProgress(shapeCount, shapeIndex, shapeT)
      shapeIndex += 1
    } else {
      drawn = frozen ? 1 : strokeProgress(sideCount, sideIndex, sidesT)
      sideIndex += 1
    }
    const za = rotated[i0]![2]
    const zb = rotated[i1]![2]
    const depth = (za + zb) / 2
    const frontness = 1 - smooth01(-0.18, 0.42, depth)
    const hue = ((index / (roles.length || 1)) * 300 + time * (0.08 + 0.32 * heat) + motion.phase * 40) % 360
    return {
      key: `${kind}-e-${i0}-${i1}`,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      length,
      drawn,
      opacity: drawn * (0.28 + 0.5 * frontness),
      hue,
      z: depth,
    }
  })
  edges.sort((a, b) => a.z - b.z)

  return { faces, edges, bob, lift }
}

type ShapePhase =
  | { mode: "idle" }
  | { mode: "draw"; bornAt: number }
  | {
      mode: "retract"
      startedAt: number
      fromShape: number
      fromSides: number
      fromSpinAge: number
    }

function drawProgress(age: number, frozen: boolean) {
  if (frozen) return { shapeT: 1, sidesT: 1, rotating: true, spinAge: 0 }
  const shapeT = clamp01(age / SHAPE_MS)
  const sidesT = clamp01((age - SHAPE_MS) / SIDES_MS)
  const rotating = age >= SHAPE_MS
  return {
    shapeT,
    sidesT,
    rotating,
    spinAge: rotating ? age - SHAPE_MS : 0,
  }
}

/**
 * Idle tiles keep the 2D plate. Once the card is live the solid sketches
 * out of that plate; when live ends it settles back to 2D before collapse.
 */
export function LandingNewUseCaseShape({
  kind,
  active = false,
  className,
}: {
  kind: LandingNewUseCaseShapeKind
  /** True only while the expanded card is showcasing — not during grow/collapse. */
  active?: boolean
  className?: string
}) {
  const shadowId = useId().replace(/:/g, "")
  const reduceMotion = useReducedMotion() ?? false
  const [phase, setPhase] = useState<ShapePhase>({ mode: "idle" })
  const live = phase.mode !== "idle"
  const time = useSyncExternalStore(
    reduceMotion || !live ? noopSubscribe : subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  useLayoutEffect(() => {
    if (active) {
      setPhase({ mode: "draw", bornAt: getSnapshot() })
      return
    }
    if (reduceMotion) {
      setPhase({ mode: "idle" })
      return
    }
    setPhase((prev) => {
      if (prev.mode !== "draw") return { mode: "idle" }
      const progress = drawProgress(Math.max(0, getSnapshot() - prev.bornAt), reduceMotion)
      if (progress.shapeT < 0.02 && progress.sidesT < 0.02) return { mode: "idle" }
      return {
        mode: "retract",
        startedAt: getSnapshot(),
        fromShape: progress.shapeT,
        fromSides: progress.sidesT,
        fromSpinAge: progress.spinAge,
      }
    })
  }, [active, reduceMotion])

  useLayoutEffect(() => {
    if (phase.mode !== "retract") return
    if (clamp01((time - phase.startedAt) / USE_CASE_SHAPE_REVERT_MS) < 1) return
    setPhase({ mode: "idle" })
  }, [phase, time])

  let shapeT = 0
  let sidesT = 0
  let rotating = false
  let spinAge = 0
  let heat = 0
  if (phase.mode === "draw") {
    const progress = drawProgress(Math.max(0, time - phase.bornAt), reduceMotion)
    shapeT = progress.shapeT
    sidesT = progress.sidesT
    rotating = progress.rotating
    spinAge = progress.spinAge
    heat = reduceMotion
      ? 0
      : 1 - easeOutCubic(clamp01((time - phase.bornAt - COOL_START_MS) / COOL_MS))
  } else if (phase.mode === "retract") {
    const t = easeOutCubic(clamp01((time - phase.startedAt) / USE_CASE_SHAPE_REVERT_MS))
    shapeT = phase.fromShape * (1 - t)
    sidesT = phase.fromSides * (1 - t)
    spinAge = phase.fromSpinAge * (1 - t)
    rotating = spinAge > 16
  }
  const revealed = phase.mode !== "idle"

  const silhouette = useMemo(() => getUseCaseSilhouette(kind), [kind])
  const frame = useMemo(
    () =>
      revealed
        ? projectSolid(kind, time, reduceMotion, shapeT, sidesT, rotating, spinAge, heat)
        : null,
    [revealed, kind, reduceMotion, time, shapeT, sidesT, rotating, spinAge, heat],
  )
  const showPlate = !rotating
  const plateScale = PLATE_SCALE
  const lift = frame?.lift ?? 0

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      className={["pointer-events-none block text-foreground", className ?? ""].join(" ")}
      overflow="visible"
    >
      <defs>
        <filter
          id={shadowId}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" />
        </filter>
      </defs>
      {lift > 0.04 ? (
        <ellipse
          cx={SIZE / 2}
          cy={SIZE / 2 + 11}
          rx={8}
          ry={2}
          fill="currentColor"
          fillOpacity={0.14 * lift}
          filter={`url(#${shadowId})`}
        />
      ) : null}
      <g>
        {showPlate ? (
          <SilhouetteMark
            silhouette={silhouette}
            heat={heat}
            time={time}
            live={active}
            scale={plateScale}
          />
        ) : null}
        {frame
          ? frame.faces.map((face) =>
              face.fill < 0.004 ? null : (
                <polygon
                  key={face.key}
                  points={face.points}
                  fill="currentColor"
                  fillOpacity={face.fill}
                  stroke="none"
                />
              ),
            )
          : null}
        {frame
          ? frame.edges.map((edge) => {
              if (edge.drawn < 0.01 || edge.length < 0.4) return null
              const dash = edge.length
              const offset = edge.length * (1 - edge.drawn)
              return (
                <g key={edge.key}>
                  <line
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke="currentColor"
                    strokeOpacity={edge.opacity}
                    strokeWidth={1.35}
                    strokeLinecap="round"
                    strokeDasharray={dash}
                    strokeDashoffset={offset}
                  />
                  {heat > 0.02 ? (
                    <line
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                      stroke={hsl(edge.hue, 92 * (0.35 + 0.65 * heat), 56)}
                      strokeOpacity={edge.opacity * heat}
                      strokeWidth={1.35 + 0.55 * heat}
                      strokeLinecap="round"
                      strokeDasharray={dash}
                      strokeDashoffset={offset}
                    />
                  ) : null}
                </g>
              )
            })
          : null}
      </g>
    </svg>
  )
}
