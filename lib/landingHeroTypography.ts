/** Serif styles for the hero subline / lead (muted color applied where used). */
export const landingHeroHeadlineClassName =
  "font-serif font-normal italic leading-snug tracking-[-0.03em] text-[32px]"

/** Serif styles for the hero `h1` (narrower base size than section titles). */
export const landingHeroH1ClassName =
  "font-serif font-normal italic leading-snug tracking-normal text-[28px] sm:text-[36px]"

/** Serif styles for section titles (e.g. building-new) matching hero scale from `sm`. */
export const landingHeroTitleClassName =
  "font-serif font-normal italic leading-snug tracking-[-0.03em] text-[22px] sm:text-[36px]"

/**
 * Wallet login splash headline — fixed scale at all breakpoints (no growth on large viewports).
 */
export const loginSplashBuildingTitleClassName =
  "font-serif font-normal italic leading-snug tracking-[-0.03em] text-[27px] text-foreground"

/**
 * Login splash top row — δur · Beta … shared serif scale (δur and badge use the same size).
 */
export const loginSplashWordmarkRowTextClassName =
  "font-serif text-[1.375rem] font-normal italic leading-none tracking-[-0.04em] text-muted transition-colors duration-500 ease-out";

/** Standalone δur wordmark — same scale as {@link loginSplashWordmarkRowTextClassName} + `select-none`. */
export const loginSplashDeltaMarkClassName =
  `${loginSplashWordmarkRowTextClassName} select-none`;

/** Splash subtitle under the headline — serif to match title, muted; fixed scale everywhere. */
export const loginSplashSubtitleClassName =
  "font-serif font-normal italic leading-snug tracking-[-0.025em] text-[18px] text-muted"

/** Primary filled pill (marketing “Build on Sur”, wallet Google CTA). */
export const landingHeroPrimaryCtaClassName =
  "inline-flex items-center justify-center rounded-full bg-foreground px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-[-0.01em] text-background transition-opacity duration-500 ease-out hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

/**
 * Outline pill on marketing suite product cards — border/text follow the
 * marketing light/dark wrapper (`MarketingThemeProvider`).
 */
export const landingMarketingOutlineCtaClassName =
  "inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-2.5 py-1.5 text-[13px] font-semibold leading-none tracking-[-0.01em] text-foreground transition-[border-color,opacity,color] duration-500 ease-out hover:border-foreground/45 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
