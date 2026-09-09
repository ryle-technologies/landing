export type LatticePackPiece = {
  cols: number
  rows: number
  /** 1-based, like `LatticeCell`. Both required to pin. */
  colStart?: number
  rowStart?: number
}

/**
 * Dense row-major pack — same search order as `grid-auto-flow: dense`.
 * Pinned pieces (`colStart` + `rowStart`) occupy first so auto pieces fill holes.
 */
export function packDenseRows(
  pieces: readonly LatticePackPiece[],
  avail: number,
) {
  const width = Math.max(1, avail)
  const occupied: boolean[][] = []

  const taken = (row: number, col: number) => occupied[row]?.[col] === true

  const fits = (row: number, col: number, cols: number, rows: number) => {
    if (col + cols > width) return false
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (taken(row + y, col + x)) return false
      }
    }
    return true
  }

  const place = (row: number, col: number, cols: number, rows: number) => {
    for (let y = 0; y < rows; y++) {
      if (!occupied[row + y]) occupied[row + y] = Array(width).fill(false)
      for (let x = 0; x < cols; x++) occupied[row + y][col + x] = true
    }
  }

  const placeAuto = (cols: number, rows: number) => {
    for (let row = 0; ; row++) {
      for (let col = 0; col <= width - cols; col++) {
        if (!fits(row, col, cols, rows)) continue
        place(row, col, cols, rows)
        return
      }
    }
  }

  for (const piece of pieces) {
    if (piece.rows < 1) continue
    const cols = Math.min(Math.max(1, piece.cols), width)
    const rows = piece.rows
    const colStart = piece.colStart
    const rowStart = piece.rowStart
    if (colStart != null && rowStart != null) {
      place(Math.max(0, rowStart - 1), Math.max(0, colStart - 1), cols, rows)
      continue
    }
    placeAuto(cols, rows)
  }

  return occupied.length
}
