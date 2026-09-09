"use client"

import { useLayoutEffect, useState } from "react"
import { cellsPx } from "@/lib/landingLattice"

/**
 * High-water mark for a masonry at this column count. Expand / collapse /
 * swap can raise the floor; they cannot lower it. Resets when `cols` changes
 * so a narrow layout cannot inherit a desktop or worst-case reservation.
 */
export function useLatticeHeightLock(cols: number, minRows: number) {
  const [floor, setFloor] = useState({ cols, rows: minRows })

  useLayoutEffect(() => {
    setFloor((prev) => {
      if (prev.cols !== cols) return { cols, rows: minRows }
      if (minRows > prev.rows) return { cols, rows: minRows }
      return prev
    })
  }, [cols, minRows])

  const rows = floor.cols === cols ? Math.max(floor.rows, minRows) : minRows
  return cellsPx(rows)
}
