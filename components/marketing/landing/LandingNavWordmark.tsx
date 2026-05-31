import { landingNavWordmarkTypeClassName } from "@/lib/landingNavWordmark"

type LandingNavWordmarkProps = {
  className?: string
}

/**
 * Ryle wordmark: δ (muted) + “Ryle” (foreground/90) — shared by nav and closing block.
 */
export function LandingNavWordmark({ className = "" }: LandingNavWordmarkProps) {
  return (
    <span
      aria-hidden
      className={[
        "inline-flex shrink-0 items-baseline gap-1.5 self-baseline sm:gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={[landingNavWordmarkTypeClassName, "text-muted"].join(" ")}>
        δ
      </span>
      <span className={landingNavWordmarkTypeClassName}>Ryle</span>
    </span>
  )
}
