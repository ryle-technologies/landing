import { landingNavWordmarkTypeClassName } from "@/lib/landingNavWordmark"

type LandingNavWordmarkProps = {
  className?: string
  /** Serif type ramp; defaults to nav size. */
  typeClassName?: string
}

/**
 * Ryle wordmark: δ (muted) + “Ryle” (foreground/90) — shared by nav and closing block.
 */
export function LandingNavWordmark({
  className = "",
  typeClassName = landingNavWordmarkTypeClassName,
}: LandingNavWordmarkProps) {
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
      <span className={[typeClassName, "text-muted"].join(" ")}>
        δ
      </span>
      <span className={typeClassName}>Ryle</span>
    </span>
  )
}
