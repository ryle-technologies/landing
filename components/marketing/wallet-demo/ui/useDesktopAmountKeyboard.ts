"use client"

import { useEffect } from "react"

/** Desktop convenience: physical keyboard drives the amount numpad while the step is mounted. */
export function useDesktopAmountKeyboard({
  handleKey,
  onEnter,
  enterEnabled = false,
}: {
  handleKey: (key: string) => void
  onEnter?: () => void
  enterEnabled?: boolean
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault()
        handleKey(event.key)
        return
      }
      if (event.key === "." || event.key === ",") {
        event.preventDefault()
        handleKey(".")
        return
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault()
        handleKey("⌫")
        return
      }
      if (event.key === "Enter" && enterEnabled && onEnter) {
        event.preventDefault()
        onEnter()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enterEnabled, handleKey, onEnter])
}
