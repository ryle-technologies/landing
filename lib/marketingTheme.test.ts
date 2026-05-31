import { describe, expect, it } from "vitest";
import { isMarketingThemeDark } from "@/lib/marketingTheme";

describe("isMarketingThemeDark", () => {
  it("returns true only for the dark cookie value", () => {
    expect(isMarketingThemeDark("dark")).toBe(true);
    expect(isMarketingThemeDark("light")).toBe(false);
    expect(isMarketingThemeDark(undefined)).toBe(false);
    expect(isMarketingThemeDark(null)).toBe(false);
  });
});
