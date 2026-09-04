import type { ReactNode } from "react"
import { landingHeroTitleClassName } from "@/lib/landingHeroTypography"
import { landingSuiteProductCardInnerPadClass } from "@/lib/landingLayout"

const sectionTitleClassName = `relative text-left text-muted transition-colors duration-500 ease-out ${landingHeroTitleClassName}`

const sectionTitleLeadClassName = "text-muted text-[18px] sm:text-[28px]"

const suiteProductBlockShellClass =
  "relative overflow-hidden border-0 bg-[var(--marketing-surface)] md:border md:border-border"

const tileInnerClass = `relative z-10 flex min-w-0 flex-col ${landingSuiteProductCardInnerPadClass}`

const tileLabelClassName =
  "font-mono text-xs uppercase leading-snug tracking-wide text-muted transition-colors duration-500 ease-out"

const tileTitleClassName =
  "text-left text-base font-normal leading-6 text-foreground transition-colors duration-500 ease-out sm:leading-7"

const tileBodyClassName =
  "mt-3 text-left font-serif text-xl font-medium italic leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out min-[640px]:text-[22px] lg:text-[24px]"

const footerLineClassName =
  "mt-8 text-left text-base font-normal leading-6 text-muted transition-colors duration-500 ease-out sm:mt-10 sm:leading-7"

export type LandingNewSimpleTile = {
  label?: string
  title: string
  body: string
}

type LandingNewSimpleTilesProps = {
  headingId: string
  headingLead?: string
  headingRest?: string
  /** Replaces the default lead/rest heading. */
  heading?: ReactNode
  tiles: readonly LandingNewSimpleTile[]
  footerLine?: string
  className?: string
}

/**
 * Simple heading + responsive tile grid for the repositioned landing sections.
 */
export function LandingNewSimpleTiles({
  headingId,
  headingLead,
  headingRest,
  heading,
  tiles,
  footerLine,
  className,
}: LandingNewSimpleTilesProps) {
  const gridClassName =
    tiles.length === 4
      ? "mt-16 grid min-w-0 grid-cols-1 gap-px bg-border sm:mt-20 md:grid-cols-2 lg:grid-cols-4"
      : "mt-16 grid min-w-0 grid-cols-1 gap-px bg-border sm:mt-20 md:grid-cols-3"

  return (
    <section
      aria-labelledby={headingId}
      className={
        className ??
        "relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
      }
    >
      {heading ?? (
        <h2 id={headingId} className={sectionTitleClassName}>
          {headingRest ? (
            <>
              <span className={sectionTitleLeadClassName}>{headingLead}</span>
              <br />
              <span className="text-foreground">{headingRest}</span>
            </>
          ) : (
            <span className="text-foreground">{headingLead}</span>
          )}
        </h2>
      )}
      <div className={gridClassName}>
        {tiles.map((tile) => (
          <div key={`${tile.label ?? ""}-${tile.title}`} className={suiteProductBlockShellClass}>
            <div className={tileInnerClass}>
              {tile.label ? (
                <p className={tileLabelClassName}>{tile.label}</p>
              ) : null}
              <h3
                className={tile.label ? `mt-3 ${tileTitleClassName}` : tileTitleClassName}
              >
                {tile.title}
              </h3>
              <p className={`min-w-0 ${tileBodyClassName}`}>{tile.body}</p>
            </div>
          </div>
        ))}
      </div>
      {footerLine ? <p className={footerLineClassName}>{footerLine}</p> : null}
    </section>
  )
}
