/**
 * Shared layout for `/landing/home` and the desktop shell top nav so widths stay aligned.
 *
 * Native `max-w-5xl` (64rem → 1024px at 16px root).
 * Marketing nav bars use {@link landingColumnHorizontalPadClass} only (full viewport width).
 */
export const landingContentMaxWidthClass = "max-w-5xl"

/** Footer docs sitemap — narrower than main marketing column width. */
export const landingFooterSitemapMaxWidthClass = "max-w-4xl"

export const landingColumnHorizontalPadClass =
  "px-6 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]"

/**
 * New-landing full-width bars (top bar, sticky nav): half-cell gutter.
 * Section content lives in the lattice column instead — see `lib/landingLattice.ts`.
 */
export const landingNewColumnHorizontalPadClass =
  "px-8 pl-[max(2rem,env(safe-area-inset-left))] pr-[max(2rem,env(safe-area-inset-right))]"

export const landingColumnPadClass =
  `mx-auto w-full min-w-0 ${landingContentMaxWidthClass} ${landingColumnHorizontalPadClass}`

/**
 * Break out of {@link landingColumnPadClass} to span the full viewport width
 * (backgrounds, dividers). Pair inner content with {@link landingColumnPadClass}
 * or {@link landingFooterSitemapContentClassName} so copy stays aligned.
 */
export const landingViewportBleedClassName =
  "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2"

/** Footer sitemap links — same horizontal inset as the marketing column, narrower max width. */
export const landingFooterSitemapContentClassName =
  `mx-auto w-full min-w-0 ${landingContentMaxWidthClass} ${landingColumnHorizontalPadClass}`

/**
 * Supported-networks panel body (and similar blocks): vertical padding only; horizontal
 * inset comes from {@link landingColumnPadClass} alone unless a child uses a deliberate
 * full-bleed offset (e.g. footer marquee `-mx-6` + matching pl/pr).
 */
export const landingMarketingBlockBodyPadClass = "py-6 px-0 sm:py-7"

/**
 * Suite of products card body: below `md` (stacked columns) use no extra horizontal pad —
 * only {@link landingColumnPadClass}. From `sm`, bump vertical padding; from `md` (three-column
 * row) restore full card `p-7` inset like the original desktop treatment.
 */
export const landingSuiteProductCardInnerPadClass = "py-6 px-0 sm:py-7 md:p-7"

/**
 * Vertical offset (px) for `position: sticky` blocks in the marketing scroll root
 * so they pin **below** the fixed home nav (`LandingHomeStickyNav` + `LandingTopNav`).
 * Tune if nav padding or wordmark size changes; ~nav row + `py-4` / `sm:py-5` shell.
 */
export const landingMarketingStickyTopOffsetPx = 80
