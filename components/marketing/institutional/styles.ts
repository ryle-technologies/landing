/**
 * Type ramp for the institutional home. Same faces and tracking as the
 * Client Services landing (`components/marketing/landing-new`): mono kickers,
 * tight sans display, serif card titles, muted body.
 */

export const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted"

/** Hero and section display. Two or three lines across the 16-cell column. */
export const displayClassName =
  "font-sans text-[clamp(36px,7.4vw,76px)] leading-none tracking-tighter text-foreground"

/** Display for longer statements (two sentences, four-line wraps). */
export const displayLongClassName =
  "font-sans text-[clamp(32px,6vw,60px)] leading-[1.02] tracking-tighter text-foreground"

/**
 * Paragraph under the homepage h1, and under each section heading on that
 * page. One size, leading and tracking so the subtitles match.
 */
export const heroLeadClassName =
  "text-left text-[clamp(18px,2.1vw,22px)] font-normal leading-[1.35] tracking-[-0.02em] text-muted"

/** Paragraph under a section heading outside the homepage. */
export const sectionLeadClassName =
  "text-pretty text-left text-[16px] font-normal leading-[1.5] tracking-[-0.01em] text-muted sm:text-[17px]"

export const cardTitleClassName =
  "text-left font-serif text-[22px] font-medium leading-snug tracking-[-0.02em] text-foreground sm:text-[24px]"

export const cardBodyClassName =
  "text-left text-[14px] font-normal leading-[1.5] text-muted sm:text-[15px]"

/** Small mono label without a colour, for labels that set their own. */
export const monoLabelBaseClassName =
  "font-mono text-[11px] uppercase leading-snug tracking-wide"

/** Small mono label inside a cell (indices, table terms, sources). */
export const monoLabelClassName = `${monoLabelBaseClassName} text-muted-light`

/** Mono console rows inside module visuals. */
export const consoleRowClassName =
  "font-mono text-[10px] uppercase leading-none tracking-wide"
