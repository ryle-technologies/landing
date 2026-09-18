"use client"

import { useEffect, useState } from "react"

/**
 * `document.visibilityState === "visible"`. Starts `true` to match SSR;
 * the first client effect syncs if the page loaded in the background.
 */
export function usePageVisible() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible")
    sync()
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [])

  return visible
}
