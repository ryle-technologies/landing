/**
 * Layout for the new-landing hero line grid: a 60px x/y lattice (same pitch
 * and 1px rules as the 2,000,000 band) with tromino-shaped holes punched out.
 * The canvas in `LandingNewHeroGrid` paints this.
 */

export const HERO_GRID_CELL_PX = 60

/** 1px lattice colour. */
export const HERO_GRID_LINE_LIGHT = "rgba(232, 228, 223, 0.88)"
export const HERO_GRID_LINE_DARK = "rgba(58, 55, 51, 0.92)"

export const HERO_GRID_ORIGIN_ATTR = "data-hero-grid-origin"

/** Lattice origin for the “Built to live inside” feature band. */
export const FEATURE_GRID_ORIGIN_ATTR = "data-feature-grid-origin"

/** Lattice origin for the wallet section. */
export const WALLET_GRID_ORIGIN_ATTR = "data-wallet-grid-origin"

/** Lattice origin for the pillars / use-case carousel section. */
export const PILLARS_GRID_ORIGIN_ATTR = "data-pillars-grid-origin"

/**
 * Portrait phone sizes that land on the 60px lattice, closest to 390/844.
 * Prefer the first step that fits the available box.
 */
export const WALLET_PHONE_LATTICE_STEPS = [
  { cols: 6, rows: 13 },
  { cols: 5, rows: 11 },
  { cols: 4, rows: 9 },
] as const

/** Largest lattice-aligned phone that fits in `maxWidth` × `maxHeight`. */
export function largestPhoneOnLattice(maxWidth: number, maxHeight = Infinity) {
  const cell = HERO_GRID_CELL_PX
  for (const step of WALLET_PHONE_LATTICE_STEPS) {
    const width = step.cols * cell
    const height = step.rows * cell
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height, cols: step.cols, rows: step.rows }
    }
  }
  const fallback = WALLET_PHONE_LATTICE_STEPS[WALLET_PHONE_LATTICE_STEPS.length - 1]
  return {
    width: fallback.cols * cell,
    height: fallback.rows * cell,
    cols: fallback.cols,
    rows: fallback.rows,
  }
}

export type HeroGridBox = {
  left: number
  top: number
  width: number
  height: number
}

/** Snap a lattice-relative edge to the nearest 60px line. */
export function snapHeroGridLine(originValue: number) {
  return Math.round(originValue / HERO_GRID_CELL_PX) * HERO_GRID_CELL_PX
}

/**
 * Grow or shrink a snapped width so 3 equal columns land on lattice lines.
 * Prefers shrinking so the cluster stays inside the content column.
 */
export function widthOnThreeLatticeColumns(width: number) {
  const cell = HERO_GRID_CELL_PX
  let cols = Math.max(3, Math.round(width / cell))
  const rem = cols % 3
  if (rem !== 0) cols -= rem
  if (cols < 3) cols = 3
  return cols * cell
}

/**
 * Grow a content rect out to the nearest lattice lines (60 / 120 / 180 / …).
 * `rect` and `origin` are viewport coordinates; the result is origin-relative.
 */
export function snapBoxToHeroGrid(
  rect: { left: number; top: number; right: number; bottom: number },
  origin: { left: number; top: number },
  pad = 0,
): HeroGridBox {
  const cell = HERO_GRID_CELL_PX
  const left = rect.left - origin.left - pad
  const top = rect.top - origin.top - pad
  const right = rect.right - origin.left + pad
  const bottom = rect.bottom - origin.top + pad
  const sl = Math.floor(left / cell) * cell
  const st = Math.floor(top / cell) * cell
  const sr = Math.ceil(right / cell) * cell
  const sb = Math.ceil(bottom / cell) * cell
  return {
    left: sl,
    top: st,
    width: Math.max(cell, sr - sl),
    height: Math.max(cell, sb - st),
  }
}

/** I-tromino (3 in a row) and L-tromino (2 in a row + one adjacent). */
const TROMINOES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
  ],
]

const HOLE_FRACTION = 0.16

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** `true` = this cell is part of the lattice. */
export function buildHeroGrid(
  cols: number,
  rows: number,
  seed: number,
): boolean[][] {
  const rng = mulberry32(seed)
  const present: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => true),
  )

  const targetMissing = Math.max(6, Math.round(cols * rows * HOLE_FRACTION))
  let missing = 0
  let attempts = 0
  const maxAttempts = 240

  while (missing < targetMissing && attempts < maxAttempts) {
    attempts += 1
    const shape = TROMINOES[(rng() * TROMINOES.length) | 0]
    const ox = (rng() * cols) | 0
    const oy = (rng() * rows) | 0
    const stamps = shape.map(([dx, dy]) => [ox + dx, oy + dy] as const)
    const fits = stamps.every(
      ([c, r]) => c >= 0 && r >= 0 && c < cols && r < rows && present[r][c],
    )
    if (!fits) continue
    for (const [c, r] of stamps) {
      present[r][c] = false
      missing += 1
    }
  }

  return present
}
