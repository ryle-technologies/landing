const FOOTER_MARQUEE_WORDS = ["Instant", "Private", "Verifiable"] as const;

const FOOTER_MARQUEE_REPEATS = Array.from({ length: 4 }, (_, index) => index);

const footerStatementClassName =
  "select-none whitespace-nowrap font-serif font-normal italic leading-[0.78] tracking-normal text-[color-mix(in_srgb,var(--muted)_32%,var(--marketing-surface))] transition-colors duration-500 ease-out";

const sizeClassName = {
  default: "text-[clamp(3.05rem,10.7vw,5.25rem)]",
  display:
    "text-[clamp(4.5rem,22vw,16rem)] md:text-[clamp(7rem,26vw,16rem)]",
} as const;

const frameClassName = {
  default: "h-[clamp(6.2rem,19vw,10.5rem)]",
  display:
    "h-[clamp(5.25rem,18vw,13.5rem)] md:h-[clamp(7.5rem,22vw,13.5rem)]",
} as const;

const cropClassName = {
  default: "translate-y-[20%]",
  display: "translate-y-[6%]",
} as const;

const maskBgClass = "bg-[var(--marketing-surface)]";

type LandingFooterMarqueeProps = {
  className?: string;
  /** Marquee words (defaults to Instant / Private / Verifiable). */
  words?: readonly string[];
  /** `display` is the closing statement on `/`. Defaults keep `/old-landing` unchanged. */
  size?: keyof typeof sizeClassName;
  /** Sit the words on the container's bottom edge (no downward crop). */
  flush?: boolean;
};

/** Marketing site footer: infinite horizontal marquee (Instant / Private / Verifiable). */
export function LandingFooterMarquee({
  className = "",
  words = FOOTER_MARQUEE_WORDS,
  size = "default",
  flush = false,
}: LandingFooterMarqueeProps) {
  return (
    <section
      aria-hidden="true"
      className={
        `relative overflow-hidden pl-[max(0rem,env(safe-area-inset-left))] pr-[max(0rem,env(safe-area-inset-right))] ${frameClassName[size]} ${className}`.trim()
      }
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 ${maskBgClass} transition-colors duration-500 ease-out sm:w-24`}
        style={{
          WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          maskImage: "linear-gradient(to right, black, transparent)",
        }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 ${maskBgClass} transition-colors duration-500 ease-out sm:w-24`}
        style={{
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          maskImage: "linear-gradient(to left, black, transparent)",
        }}
      />
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 overflow-hidden ${flush ? "" : cropClassName[size]}`.trim()}
      >
        <div
          className={`${footerStatementClassName} ${sizeClassName[size]} landing-footer-marquee flex w-max animate-[landing-footer-marquee_54s_linear_infinite] items-baseline motion-reduce:animate-none`}
        >
          {[0, 1].map((trackIndex) => (
            <span
              key={trackIndex}
              className="flex shrink-0 items-baseline gap-[0.34em] pr-[0.34em]"
            >
              {FOOTER_MARQUEE_REPEATS.flatMap((repeatIndex) =>
                words.map((word) => (
                  <span key={`${trackIndex}-${repeatIndex}-${word}`}>{word}</span>
                )),
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
