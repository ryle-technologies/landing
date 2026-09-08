/**
 * The new-landing 64px lattice.
 *
 * One rule: every box edge that should read as "on the grid" sits on a
 * multiple of {@link LATTICE_CELL_PX} measured from the **content column's
 * left edge** (x) and the **lattice root's top** (y).
 *
 * - The column (`.landing-lattice-column`, see `globals.css`) is always an
 *   integer number of cells wide and centred, so its left edge is a lattice
 *   line by construction. The line canvas paints from that edge, so nothing
 *   has to snap horizontally — size and offset things in cells.
 * - Vertically, `LatticeSection` rounds its own height up to whole cells, so
 *   every section top is a line as long as the sections above are sections.
 *   Inside a section, use `LatticePlate` / `LatticeGrid` / `LatticeCell` (they
 *   round themselves) and margins/paddings from {@link LATTICE_SPACE}.
 *
 * Full write-up: `components/marketing/landing-new/lattice/README.md`.
 */

export const LATTICE_CELL_PX = 64

/** Content column caps at 16 cells (1024px). */
export const LATTICE_COLUMN_MAX_COLS = 16

/** Attribute on the element whose top is lattice row 0 (`<main>`). */
export const LATTICE_ROOT_ATTR = "data-lattice-root"

/** Attribute on every content column; its left edge is lattice column 0. */
export const LATTICE_COLUMN_ATTR = "data-lattice-column"

export const latticeColumnClassName = "landing-lattice-column"

/**
 * Vertical spacing that stays on the lattice. Only whole cells:
 * `16` → 64px (1 cell), `32` → 128px (2 cells), `48` → 192px, `64` → 256px.
 * Half-cell (`8` → 32px) is fine *inside* a cell (copy inset) but never
 * between blocks.
 */
export const LATTICE_SPACE = {
  /** Section padding: 1 cell on small screens, 2 from `md`. */
  sectionY: "py-16 md:py-32",
  sectionTop: "pt-16 md:pt-32",
  sectionBottom: "pb-16 md:pb-32",
  /** Gap between a heading plate and the block below it. */
  block: "mt-16 md:mt-32",
  /** Copy inset inside a cell: half a cell from `md`, a little tighter on a 5-cell column. */
  inset: "p-6 md:p-8",
  /**
   * Copy inset inside a heading plate. Display type is 72px+ so on a 5-cell
   * mobile column the copy sits on the column edge; half a cell from `md`.
   */
  plateInset: "py-4 md:p-8",
} as const

/** 1px lattice line colour — mirrored in `--lattice-line` (globals.css). */
export const LATTICE_LINE_LIGHT = "rgba(232, 228, 223, 0.88)"
export const LATTICE_LINE_DARK = "rgba(58, 55, 51, 0.92)"

/**
 * Stroke for a cell that sits on the lattice: 1px inside its top/left edge
 * and 1px outside its right/bottom edge, so neighbouring cells share one
 * pixel row/column and coincide with the canvas lines (drawn at `n + 0.5`).
 */
export const latticeCellStrokeClassName =
  "[box-shadow:inset_1px_1px_0_0_var(--lattice-line),1px_1px_0_0_var(--lattice-line)]"

export function cellsPx(cells: number) {
  return cells * LATTICE_CELL_PX
}

/** Smallest whole number of cells that covers `px`. */
export function ceilCells(px: number, min = 1) {
  return Math.max(min, Math.ceil((px - 0.01) / LATTICE_CELL_PX))
}

export function floorCells(px: number) {
  return Math.floor((px + 0.01) / LATTICE_CELL_PX)
}

/** `px` rounded up to the next lattice line. */
export function ceilToLattice(px: number) {
  return cellsPx(ceilCells(px, 0))
}

export function latticeMod(px: number) {
  const cell = LATTICE_CELL_PX
  return ((px % cell) + cell) % cell
}

/** Lattice-line-fitting portrait phone sizes closest to 390×844. */
export const LATTICE_PHONE_COLS = 6
export const LATTICE_PHONE_ROWS = 13
/** Phone rows for a narrower cell so the 390×844 frame still fits by width. */
export function phoneRowsForCols(cols: number) {
  if (cols >= LATTICE_PHONE_COLS) return LATTICE_PHONE_ROWS
  return ceilCells(cellsPx(cols) * (844 / 390))
}

/* ─── Tromino field ─────────────────────────────────────────────────────── */

/**
 * One tromino-hole field shared by every canvas on the page, addressed in
 * world cells relative to the column's left edge and the root's top. Local
 * per-canvas fields would make the maze jump at every section seam.
 */
export const LATTICE_WORLD_SEED = 0x4a7e1d3
export const LATTICE_WORLD_COLS = 96
export const LATTICE_WORLD_ROWS = 512
/** World column of the content column's left edge (room for wide viewports). */
export const LATTICE_WORLD_COL_OFFSET = 40

let latticeWorld: boolean[][] | null = null

/** Whether world cell `(col, row)` is part of the lattice (`false` = hole). */
export function latticeWorldCell(col: number, row: number) {
  if (!latticeWorld) {
    latticeWorld = buildLatticeField(
      LATTICE_WORLD_COLS,
      LATTICE_WORLD_ROWS,
      LATTICE_WORLD_SEED,
    )
  }
  if (col < 0 || row < 0 || col >= LATTICE_WORLD_COLS || row >= LATTICE_WORLD_ROWS) {
    return true
  }
  return latticeWorld[row][col]
}

/** I-tromino (3 in a row) and L-tromino (2 in a row + one adjacent). */
const TROMINOES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1]],
  [[1, 0], [0, 1], [1, 1]],
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
export function buildLatticeField(
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
