/** Tighter stagger + shorter segments than `TextEffect` defaults (~1×). */
export const HERO_TEXT_SPEED_REVEAL = 1.55
export const HERO_TEXT_SPEED_SEGMENT = 1.4
export const HERO_WORD_STAGGER_S = 0.05 / HERO_TEXT_SPEED_REVEAL

export const HERO_LETTER_STAGGER_S = 0.045
export const HERO_LETTER_DURATION_S = 0.4
export const HERO_UNDERLINE_PAUSE_S = 0.12
export const HERO_UNDERLINE_DURATION_S = 0.5
export const HERO_UNDERLINE_EASE = [0.22, 1, 0.36, 1] as const
/** Rainbow on the first word before it morphs to the next. */
export const HERO_FIRST_RAINBOW_S = 1
/** Hold each rotating word before morphing to the next. */
export const HERO_ROTATING_WORD_HOLD_MS = 3000
/** Subtitle, CTA, and supported networks start this long after the h1 reveal. */
export const HERO_AFTER_HEADLINE_S = 0.5

export function landingHeroPrefixEnterDelayS(prefix: string): number {
  return prefix.trim().split(/\s+/).filter(Boolean).length * HERO_WORD_STAGGER_S
}

export function landingHeroLettersDoneS(
  prefix: string,
  word: string,
  options: { includeEnterDelay?: boolean } = {},
): number {
  const enterDelay =
    options.includeEnterDelay === false
      ? 0
      : landingHeroPrefixEnterDelayS(prefix)
  const letterCount = Array.from(word).length
  return (
    enterDelay +
    Math.max(0, letterCount - 1) * HERO_LETTER_STAGGER_S +
    HERO_LETTER_DURATION_S
  )
}

export function landingHeroIntroDelays(prefix: string, firstWord: string) {
  const enterDelay = landingHeroPrefixEnterDelayS(prefix)
  const lettersDone = landingHeroLettersDoneS(prefix, firstWord)
  const underlineStart = lettersDone + HERO_UNDERLINE_PAUSE_S
  const underlineDone = underlineStart + HERO_UNDERLINE_DURATION_S
  const firstMorph = underlineDone + HERO_FIRST_RAINBOW_S
  const afterHeadline = underlineDone + HERO_AFTER_HEADLINE_S
  const subline = afterHeadline
  const cta = afterHeadline

  return {
    enterDelay,
    lettersDone,
    underlineStart,
    underlineDone,
    firstMorph,
    subline,
    cta,
  }
}
