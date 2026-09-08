"use client"

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { animate, motion } from "motion/react"
import { LATTICE_CELL_PX, LATTICE_COLUMN_ATTR } from "@/lib/landingLattice"

type MiniPose = { x: number; y: number }

const EASE = [0.22, 1, 0.36, 1] as const

const FADE_OUT_S = 0.12
const SHRINK_H_S = 0.2
const SHRINK_W_S = 0.16
const EXPAND_W_S = 0.16
const EXPAND_H_S = 0.2
const FADE_IN_S = 0.14
const WAVE_STAGGER_MS = 45

const OUT_ITEM_MS = (FADE_OUT_S + SHRINK_H_S + SHRINK_W_S) * 1000
const IN_ITEM_MS = (EXPAND_W_S + EXPAND_H_S + FADE_IN_S) * 1000

type CloudAnchor = "t" | "b" | "l" | "r" | "tl" | "tr" | "bl" | "br"

const EMPTY_NUMBERS = new Set<number>()
const EMPTY_STAGGER = new Map<number, number>()
const EMPTY_ANCHORS = new Map<number, CloudAnchor>()
const EMPTY_HANDOFF = new Map<number, MiniPose>()

/** Where the 64×64 block sits in the cell. Rotates so cards do not always pin top-left. */
const ANCHOR_SETS: readonly (readonly CloudAnchor[])[] = [
  ["t", "r", "bl", "l", "br", "b", "tl", "tr"],
  ["br", "l", "t", "b", "tr", "r", "bl", "tl"],
  ["l", "br", "r", "tl", "t", "bl", "tr", "b"],
  ["tr", "b", "tl", "r", "l", "t", "br", "bl"],
  ["b", "tl", "r", "br", "t", "l", "tr", "bl"],
]

function anchorMap(list: readonly CloudAnchor[]) {
  return new Map(list.map((anchor, index) => [index, anchor] as const))
}

function snapCells(px: number) {
  return Math.max(0, Math.round(px / LATTICE_CELL_PX) * LATTICE_CELL_PX)
}

/** Top-left of the 64×64 block, snapped so every edge sits on a cell line. */
function miniOrigin(anchor: CloudAnchor, fullW: number, fullH: number) {
  const width = snapCells(fullW)
  const height = snapCells(fullH)
  const maxX = Math.max(0, width - LATTICE_CELL_PX)
  const maxY = Math.max(0, height - LATTICE_CELL_PX)
  const midX = snapCells(maxX / 2)
  const midY = snapCells(maxY / 2)
  switch (anchor) {
    case "t":
      return { x: midX, y: 0 }
    case "b":
      return { x: midX, y: maxY }
    case "l":
      return { x: 0, y: midY }
    case "r":
      return { x: maxX, y: midY }
    case "tr":
      return { x: maxX, y: 0 }
    case "bl":
      return { x: 0, y: maxY }
    case "br":
      return { x: maxX, y: maxY }
    default:
      return { x: 0, y: 0 }
  }
}

function readHandoff() {
  const map = new Map<number, MiniPose>()
  const boxes = document.querySelectorAll<HTMLElement>("[data-cloud-morph]")
  const column = boxes[0]?.closest(`[${LATTICE_COLUMN_ATTR}]`)
  if (!column) return map
  const origin = column.getBoundingClientRect()
  for (const box of boxes) {
    const index = Number(box.dataset.cloudMorph)
    if (!Number.isFinite(index)) continue
    const rect = box.getBoundingClientRect()
    map.set(index, { x: rect.left - origin.left, y: rect.top - origin.top })
  }
  return map
}

/** Place the 64×64 at the outgoing block's world pose, snapped to the cell. */
function handoffOrigin(
  wrap: HTMLElement,
  handoff: MiniPose | undefined,
  fallback: MiniPose,
) {
  if (!handoff) return fallback
  const column = wrap.closest(`[${LATTICE_COLUMN_ATTR}]`)
  if (!column) return fallback
  const origin = column.getBoundingClientRect()
  const wrapRect = wrap.getBoundingClientRect()
  return {
    x: snapCells(handoff.x - (wrapRect.left - origin.left)),
    y: snapCells(handoff.y - (wrapRect.top - origin.top)),
  }
}

function placeBox(
  box: HTMLElement,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  box.style.right = "auto"
  box.style.bottom = "auto"
  box.style.transform = "none"
  box.style.left = `${left}px`
  box.style.top = `${top}px`
  box.style.width = `${width}px`
  box.style.height = `${height}px`
}

/** One or two cards at a time so the masonry breathes without a full collapse. */
const AMBIENT_GROUPS: readonly (readonly number[])[] = [
  [0, 5],
  [2],
  [1, 6],
  [3, 7],
  [4],
  [0, 2],
  [1, 5],
  [7],
  [3],
  [6, 4],
]

const AMBIENT_GAPS_MS = [2800, 3600, 2400, 4200, 3000] as const
const AMBIENT_HOLD_S = 0.18
const AMBIENT_FIRST_MS = 2200
const SHIFT_MS = 420
const SHIFT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const CLOUD_SHIFT_ATTR = "data-cloud-shift"
const PACK_INDICES = [0, 1, 2, 3, 4, 5, 6, 7] as const

type MorphKind = "idle" | "ambient"
type MorphMode = "idle" | "out" | "in"

const SLOT_COUNT = 8

function fillSlots<T>(value: T): T[] {
  return Array.from({ length: SLOT_COUNT }, () => value)
}

function nextGroup<T>(step: number, visuals: readonly T[], target: T) {
  const stale = PACK_INDICES.filter((index) => visuals[index] !== target)
  const authored = AMBIENT_GROUPS[step % AMBIENT_GROUPS.length]
  if (stale.length === 0) return authored
  const overlap = authored.filter((index) => stale.includes(index))
  if (overlap.length > 0) return overlap
  if (stale.length === 1) return stale
  const start = step % stale.length
  return [stale[start], stale[(start + 1) % stale.length]]
}

type CloudMorphApi = {
  kind: MorphKind
  mode: MorphMode
  active: ReadonlySet<number>
  done: ReadonlySet<number>
  participating: ReadonlySet<number>
  staggerMs: ReadonlyMap<number, number>
  anchors: ReadonlyMap<number, CloudAnchor>
  handoff: ReadonlyMap<number, MiniPose>
}

const CloudMorphContext = createContext<CloudMorphApi>({
  kind: "idle",
  mode: "idle",
  active: EMPTY_NUMBERS,
  done: EMPTY_NUMBERS,
  participating: EMPTY_NUMBERS,
  staggerMs: EMPTY_STAGGER,
  anchors: EMPTY_ANCHORS,
  handoff: EMPTY_HANDOFF,
})

export function useCloudMorphBusy() {
  return false
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function waveWait(baseMs: number, wave: readonly number[]) {
  return baseMs + Math.max(0, wave.length - 1) * WAVE_STAGGER_MS + 40
}

function staggerMap(wave: readonly number[]) {
  return new Map(wave.map((index, order) => [index, order * WAVE_STAGGER_MS]))
}

function readShiftRects() {
  const map = new Map<number, MiniPose>()
  for (const node of document.querySelectorAll<HTMLElement>(`[${CLOUD_SHIFT_ATTR}]`)) {
    const index = Number(node.getAttribute(CLOUD_SHIFT_ATTR))
    if (!Number.isFinite(index)) continue
    const rect = node.getBoundingClientRect()
    map.set(index, { x: rect.left, y: rect.top })
  }
  return map
}

function playNeighborShift(
  first: ReadonlyMap<number, MiniPose>,
  skip: ReadonlySet<number>,
) {
  const movers: HTMLElement[] = []
  for (const node of document.querySelectorAll<HTMLElement>(`[${CLOUD_SHIFT_ATTR}]`)) {
    const index = Number(node.getAttribute(CLOUD_SHIFT_ATTR))
    node.style.transition = "none"
    node.style.transform = "none"
    if (!Number.isFinite(index) || skip.has(index)) continue
    const prev = first.get(index)
    if (!prev) continue
    const last = node.getBoundingClientRect()
    const dx = prev.x - last.left
    const dy = prev.y - last.top
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
    node.style.transform = `translate(${dx}px, ${dy}px)`
    movers.push(node)
  }
  if (movers.length === 0) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (const node of movers) {
        node.style.transition = `transform ${SHIFT_MS}ms ${SHIFT_EASE}`
        node.style.transform = "none"
      }
    })
  })
}

function sectionInView() {
  if (typeof document === "undefined" || document.hidden) return false
  const node = document.querySelector("[data-cloud-morph]")
  if (!node) return false
  const rect = node.getBoundingClientRect()
  return rect.bottom > 96 && rect.top < window.innerHeight - 64
}

/**
 * Each card morphs on its own clock. The chip is only a target — a slot
 * picks up that pack the next time it collapses and expands.
 */
export function CloudMorphRoot<T>({
  product,
  children,
}: {
  product: T
  children: (visuals: readonly T[]) => ReactNode
}) {
  const [visuals, setVisuals] = useState<T[]>(() => fillSlots(product))
  const [kind, setKind] = useState<MorphKind>("idle")
  const [mode, setMode] = useState<MorphMode>("idle")
  const [active, setActive] = useState<ReadonlySet<number>>(EMPTY_NUMBERS)
  const [done, setDone] = useState<ReadonlySet<number>>(EMPTY_NUMBERS)
  const [participating, setParticipating] = useState<ReadonlySet<number>>(EMPTY_NUMBERS)
  const [staggerMs, setStaggerMs] = useState<ReadonlyMap<number, number>>(EMPTY_STAGGER)
  const [anchors, setAnchors] = useState<ReadonlyMap<number, CloudAnchor>>(EMPTY_ANCHORS)
  const [handoff, setHandoff] = useState<ReadonlyMap<number, MiniPose>>(EMPTY_HANDOFF)
  const [layoutEpoch, setLayoutEpoch] = useState(0)
  const visualsRef = useRef(visuals)
  visualsRef.current = visuals
  const productRef = useRef(product)
  productRef.current = product
  const generationRef = useRef(0)
  const ambientRef = useRef(0)
  const firstRectsRef = useRef<ReadonlyMap<number, MiniPose>>(EMPTY_HANDOFF)
  const participatingRef = useRef<ReadonlySet<number>>(EMPTY_NUMBERS)
  participatingRef.current = participating

  useEffect(() => {
    let cancelled = false

    const reset = () => {
      setKind("idle")
      setMode("idle")
      setActive(EMPTY_NUMBERS)
      setDone(EMPTY_NUMBERS)
      setParticipating(EMPTY_NUMBERS)
      setStaggerMs(EMPTY_STAGGER)
      setAnchors(EMPTY_ANCHORS)
      setHandoff(EMPTY_HANDOFF)
    }

    const playWaves = async (
      waves: readonly (readonly number[])[],
      itemMs: number,
    ) => {
      const finished = new Set<number>()
      for (const wave of waves) {
        if (cancelled) return
        setStaggerMs(staggerMap(wave))
        setActive(new Set(wave))
        await wait(waveWait(itemMs, wave))
        if (cancelled) return
        for (const index of wave) finished.add(index)
        setDone(new Set(finished))
        setActive(EMPTY_NUMBERS)
      }
    }

    const playCycle = async (indices: readonly number[]) => {
      const generation = generationRef.current
      generationRef.current = generation + 1
      const pins = anchorMap(ANCHOR_SETS[generation % ANCHOR_SETS.length])

      setKind("ambient")
      setParticipating(new Set(indices))
      setMode("out")
      setAnchors(pins)
      setHandoff(EMPTY_HANDOFF)
      setDone(EMPTY_NUMBERS)
      await playWaves([indices], OUT_ITEM_MS)
      if (cancelled) return
      await wait(AMBIENT_HOLD_S * 1000)
      if (cancelled) return
      const target = productRef.current
      firstRectsRef.current = readShiftRects()
      setHandoff(readHandoff())
      setVisuals((prev) => {
        const next = [...prev]
        for (const index of indices) next[index] = target
        return next
      })
      setLayoutEpoch((epoch) => epoch + 1)
      setMode("in")
      setActive(EMPTY_NUMBERS)
      setDone(EMPTY_NUMBERS)
      setStaggerMs(EMPTY_STAGGER)
      await wait(16)
      if (cancelled) return
      await playWaves([indices], IN_ITEM_MS)
      if (cancelled) return
      reset()
    }

    const loop = async () => {
      await wait(AMBIENT_FIRST_MS)
      while (!cancelled) {
        if (!sectionInView()) {
          await wait(800)
          continue
        }
        const step = ambientRef.current
        ambientRef.current += 1
        const group = nextGroup(step, visualsRef.current, productRef.current)
        await playCycle(group)
        if (cancelled) return
        const gap = AMBIENT_GAPS_MS[step % AMBIENT_GAPS_MS.length]
        await wait(gap)
      }
    }

    void loop()
    return () => {
      cancelled = true
      reset()
    }
  }, [])

  useLayoutEffect(() => {
    if (layoutEpoch === 0) return
    playNeighborShift(firstRectsRef.current, participatingRef.current)
  }, [layoutEpoch])

  return (
    <CloudMorphContext.Provider
      value={{ kind, mode, active, done, participating, staggerMs, anchors, handoff }}
    >
      {children(visuals)}
    </CloudMorphContext.Provider>
  )
}

/**
 * Visual card inside a lattice cell. Collapse parks a 64×64 on the lattice;
 * the next pack may reflow. The paper stays at that block, then grows into
 * the new cell.
 */
export function CloudMorphCard({
  index,
  children,
}: {
  index: number
  children: ReactNode
}) {
  const { kind, mode, active, done, participating, staggerMs, anchors, handoff } =
    useContext(CloudMorphContext)
  const wrapRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const fullRef = useRef({ w: LATTICE_CELL_PX, h: LATTICE_CELL_PX })
  const inCycle = participating.has(index)
  const live = kind !== "idle" && inCycle
  const isActive = live && active.has(index)
  const isDone = live && done.has(index)
  const anchor = live ? (anchors.get(index) ?? "tl") : "tl"
  const startsMini = live && mode === "in" && !isDone
  const pose = handoff.get(index)
  const [contentOpacity, setContentOpacity] = useState(startsMini ? 0 : 1)

  const measureFull = () => {
    const node = wrapRef.current
    if (!node) return fullRef.current
    const rect = node.getBoundingClientRect()
    if (rect.width > 1 && rect.height > 1) {
      fullRef.current = { w: snapCells(rect.width), h: snapCells(rect.height) }
    }
    return fullRef.current
  }

  const pinOrigin = () => {
    const full = measureFull()
    const fallback = miniOrigin(anchor, full.w, full.h)
    if (mode !== "in") return fallback
    const wrap = wrapRef.current
    return wrap ? handoffOrigin(wrap, pose, fallback) : fallback
  }

  useLayoutEffect(() => {
    const node = wrapRef.current
    if (!node) return
    measureFull()
    const observer = new ResizeObserver(() => {
      measureFull()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return
    const full = measureFull()
    if (startsMini) {
      const origin = pinOrigin()
      placeBox(box, origin.x, origin.y, LATTICE_CELL_PX, LATTICE_CELL_PX)
      return
    }
    placeBox(box, 0, 0, full.w, full.h)
  }, [anchor, pose, startsMini])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const full = fullRef.current
    const origin = pinOrigin()

    if (!live || mode === "idle") {
      placeBox(box, 0, 0, full.w, full.h)
      setContentOpacity(1)
      return
    }

    if (isActive) return

    if (mode === "out") {
      if (isDone) {
        placeBox(box, origin.x, origin.y, LATTICE_CELL_PX, LATTICE_CELL_PX)
        setContentOpacity(0)
      } else {
        placeBox(box, 0, 0, full.w, full.h)
        setContentOpacity(1)
      }
      return
    }

    if (isDone) {
      placeBox(box, 0, 0, full.w, full.h)
      setContentOpacity(1)
    } else {
      placeBox(box, origin.x, origin.y, LATTICE_CELL_PX, LATTICE_CELL_PX)
      setContentOpacity(0)
    }
  }, [anchor, isActive, isDone, live, mode, pose])

  useEffect(() => {
    const box = boxRef.current
    if (!box || !isActive) return
    const controls: { stop: () => void }[] = []
    let live = true
    const delay = staggerMs.get(index) ?? 0
    const origin = pinOrigin()

    const play = async () => {
      if (delay) await wait(delay)
      if (!live) return
      if (mode === "out") {
        setContentOpacity(0)
        await wait(FADE_OUT_S * 1000)
        if (!live) return
        controls.push(
          animate(
            box,
            { height: LATTICE_CELL_PX, top: origin.y },
            { duration: SHRINK_H_S, ease: EASE },
          ),
        )
        await wait(SHRINK_H_S * 1000)
        if (!live) return
        controls.push(
          animate(
            box,
            { width: LATTICE_CELL_PX, left: origin.x },
            { duration: SHRINK_W_S, ease: EASE },
          ),
        )
        return
      }
      if (mode === "in") {
        const next = measureFull()
        const start = pinOrigin()
        placeBox(box, start.x, start.y, LATTICE_CELL_PX, LATTICE_CELL_PX)
        setContentOpacity(0)
        await wait(16)
        if (!live) return
        controls.push(
          animate(box, { width: next.w, left: 0 }, { duration: EXPAND_W_S, ease: EASE }),
        )
        await wait(EXPAND_W_S * 1000)
        if (!live) return
        controls.push(
          animate(box, { height: next.h, top: 0 }, { duration: EXPAND_H_S, ease: EASE }),
        )
        await wait(EXPAND_H_S * 1000)
        if (!live) return
        setContentOpacity(1)
      }
    }

    void play()
    return () => {
      live = false
      for (const control of controls) control.stop()
    }
  }, [anchor, index, isActive, mode, pose, staggerMs])

  return (
    <div ref={wrapRef} className="relative h-full min-h-0 w-full min-w-0 overflow-visible">
      <div
        ref={boxRef}
        data-cloud-morph={index}
        className={`absolute overflow-hidden rounded-2xl ${
          live
            ? "pointer-events-none z-30 bg-[var(--rem-card)] shadow-[inset_0_0_0_1px_var(--rem-border)]"
            : "bg-transparent"
        }`}
      >
        <motion.div
          className="h-full min-h-0 w-full"
          initial={false}
          animate={{ opacity: contentOpacity }}
          transition={{ duration: FADE_OUT_S, ease: "linear" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
