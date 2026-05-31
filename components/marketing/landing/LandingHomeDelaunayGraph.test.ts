import { describe, expect, it } from "vitest"
import { formatSvgNumberForHydration } from "./LandingHomeDelaunayGraph"

describe("formatSvgNumberForHydration", () => {
  it("rounds SVG floats to stable hydration-safe strings", () => {
    expect(formatSvgNumberForHydration(0.22680637136812254)).toBe("0.2268")
    expect(formatSvgNumberForHydration(49.55234252009541)).toBe("49.5523")
  })

  it("strips redundant trailing zeroes", () => {
    expect(formatSvgNumberForHydration(1)).toBe("1")
    expect(formatSvgNumberForHydration(12.3)).toBe("12.3")
  })
})
