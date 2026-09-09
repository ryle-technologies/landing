"use client"

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react"
import { LATTICE_COLUMN_ATTR } from "@/lib/landingLattice"

/** Same attr `LatticeCell` stamps when `shiftIndex` is set. */
export const LATTICE_SHIFT_ATTR = "data-cloud-shift"

export type LatticeShiftPose = { x: number; y: number }

const SHIFT_MS = 420
const SHIFT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SHIFT_AXIS_EPS = 1
const EMPTY_SKIP: ReadonlySet<number> = new Set()

type TimerRef = { current: number }

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function shiftRoot(root: ParentNode) {
  return root.querySelectorAll<HTMLElement>(`[${LATTICE_SHIFT_ATTR}]`)
}

export function readLatticeShiftRects(root: ParentNode) {
  const map = new Map<number, LatticeShiftPose>()
  for (const node of shiftRoot(root)) {
    const index = Number(node.getAttribute(LATTICE_SHIFT_ATTR))
    if (!Number.isFinite(index)) continue
    const rect = node.getBoundingClientRect()
    map.set(index, { x: rect.left, y: rect.top })
  }
  return map
}

/**
 * FLIP neighbors onto their new lattice cells: invert, then slide sideways
 * first and only then top/bottom — never a diagonal jump.
 * Returns rest poses (post-layout, pre-invert) for the next capture.
 */
export function playLatticeShift(
  first: ReadonlyMap<number, LatticeShiftPose>,
  {
    root,
    skip = EMPTY_SKIP,
    timerRef,
  }: {
    root: ParentNode
    skip?: ReadonlySet<number>
    timerRef: TimerRef
  },
) {
  window.clearTimeout(timerRef.current)
  const movers: { node: HTMLElement; dx: number; dy: number }[] = []
  const rest = new Map<number, LatticeShiftPose>()

  for (const node of shiftRoot(root)) {
    const index = Number(node.getAttribute(LATTICE_SHIFT_ATTR))
    node.style.transition = "none"
    node.style.transform = "none"
    if (!Number.isFinite(index)) continue
    const last = node.getBoundingClientRect()
    rest.set(index, { x: last.left, y: last.top })
    if (skip.has(index) || prefersReducedMotion()) continue
    const prev = first.get(index)
    if (!prev) continue
    const dx = prev.x - last.left
    const dy = prev.y - last.top
    if (Math.abs(dx) < SHIFT_AXIS_EPS && Math.abs(dy) < SHIFT_AXIS_EPS) continue
    node.style.transform = `translate(${dx}px, ${dy}px)`
    movers.push({ node, dx, dy })
  }

  if (movers.length === 0) return rest

  const slide = (transform: (mover: (typeof movers)[number]) => string) => {
    for (const mover of movers) {
      mover.node.style.transition = `transform ${SHIFT_MS}ms ${SHIFT_EASE}`
      mover.node.style.transform = transform(mover)
    }
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const bent = movers.filter(
        ({ dx, dy }) =>
          Math.abs(dx) >= SHIFT_AXIS_EPS && Math.abs(dy) >= SHIFT_AXIS_EPS,
      )
      slide(({ dx, dy }) =>
        Math.abs(dx) >= SHIFT_AXIS_EPS && Math.abs(dy) >= SHIFT_AXIS_EPS
          ? `translate(0px, ${dy}px)`
          : "none",
      )
      if (bent.length === 0) return
      timerRef.current = window.setTimeout(() => {
        for (const { node } of bent) {
          node.style.transform = "none"
        }
      }, SHIFT_MS)
    })
  })

  return rest
}

/**
 * Capture poses before a React reflow, then play the Cloud-style axis shift
 * after layout. Also watches the lattice column so a wrap above the grid
 * slides tiles the same way a window resize does.
 */
export function useLatticeNeighborShift(rootRef: RefObject<HTMLElement | null>) {
  const firstRef = useRef<ReadonlyMap<number, LatticeShiftPose>>(new Map())
  const skipRef = useRef<ReadonlySet<number>>(EMPTY_SKIP)
  const timerRef = useRef(0)

  const read = useCallback(() => {
    const root = rootRef.current
    return root ? readLatticeShiftRects(root) : new Map()
  }, [rootRef])

  const play = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    firstRef.current = playLatticeShift(firstRef.current, {
      root,
      skip: skipRef.current,
      timerRef,
    })
    skipRef.current = EMPTY_SKIP
  }, [rootRef])

  const capture = useCallback(
    (skip?: Iterable<number>) => {
      skipRef.current = skip ? new Set(skip) : EMPTY_SKIP
      firstRef.current = read()
    },
    [read],
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    firstRef.current = read()

    let frame = 0
    let primed = false
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        if (!primed) {
          primed = true
          firstRef.current = read()
          return
        }
        skipRef.current = EMPTY_SKIP
        play()
      })
    }

    const column = root.closest(`[${LATTICE_COLUMN_ATTR}]`)
    const observer = new ResizeObserver(schedule)
    observer.observe(root)
    if (column) observer.observe(column)
    window.addEventListener("resize", schedule)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timerRef.current)
      observer.disconnect()
      window.removeEventListener("resize", schedule)
    }
  }, [play, read, rootRef])

  return { capture, play }
}
