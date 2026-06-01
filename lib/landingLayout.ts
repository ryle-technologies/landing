/**
 * Shared layout for `/landing/home` and the desktop shell top nav so widths stay aligned.
 *
 * Native `max-w-5xl` (64rem → 1024px at 16px root).
 */
export const landingContentMaxWidthClass = "max-w-5xl"

/** Footer docs sitemap — narrower than main marketing column width. */
export const landingFooterSitemapMaxWidthClass = "max-w-4xl"

export const landingColumnHorizontalPadClass =
  "px-6 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]"

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

/** Stable `id` on the home suite three-column grid (anchors, deep links). */
export const LANDING_HOME_SUITE_PRODUCTS_GRID_ID =
  "landing-home-suite-products-grid"

/**
 * Radial dot grid with a soft bottom fade — same treatment as the supported-networks
 * orbit card (`LandingHomeHero` orbit section).
 */
export const landingMarketingDotGridLayerClassName =
  "pointer-events-none absolute inset-0 z-0 rounded-md [background-image:radial-gradient(circle_at_center,color-mix(in_oklab,var(--foreground)_16%,transparent)_0.5px,transparent_0.5px)] [background-size:8px_8px] [mask-image:linear-gradient(to_bottom,transparent,black)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%]"

/**
 * Same dot pattern as {@link landingMarketingDotGridLayerClassName}, but the mask
 * fades out toward the **right** (visible on the left).
 */
export const landingMarketingDotGridLayerFadeRightClassName =
  "pointer-events-none absolute inset-0 z-0 rounded-md [background-image:radial-gradient(circle_at_center,color-mix(in_oklab,var(--foreground)_16%,transparent)_0.5px,transparent_0.5px)] [background-size:8px_8px] [mask-image:linear-gradient(to_right,black,transparent)] [-webkit-mask-image:linear-gradient(to_right,black,transparent)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%]"

/** Suite “Confidential Assets”: dot grid across the full panel (no mask). */
export const landingSuiteProductAssetsDotBackgroundClassName =
  "pointer-events-none absolute inset-0 z-0 rounded-md [background-image:radial-gradient(circle_at_center,color-mix(in_oklab,var(--foreground)_14%,transparent)_0.5px,transparent_0.5px)] [background-size:8px_8px]"

/** Suite “Confidential Accounts”: full gradient tint, whole layer at ~20% opacity. */
export const landingSuiteProductAccountsGradientBackgroundClassName =
  "pointer-events-none absolute inset-0 z-0 rounded-md bg-gradient-to-br from-foreground via-muted to-muted-light opacity-20"

/** Suite “Selective Disclosure”: 45° line hatch (no solid fill). */
export const landingSuiteProductDisclosureLinesBackgroundClassName =
  "pointer-events-none absolute inset-0 z-0 rounded-md [background-image:repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_oklab,var(--foreground)_10%,transparent)_10px,color-mix(in_oklab,var(--foreground)_10%,transparent)_11px)]"

/**
 * Same 45° line hatch as {@link landingSuiteProductDisclosureLinesBackgroundClassName},
 * with a horizontal mask that fades out toward the **left** (stronger on the right).
 */
export const landingMarketingLineHatchFadeLeftClassName =
  "pointer-events-none absolute inset-0 z-0 rounded-md [background-image:repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_oklab,var(--foreground)_10%,transparent)_10px,color-mix(in_oklab,var(--foreground)_10%,transparent)_11px)] [mask-image:linear-gradient(to_left,black,transparent)] [-webkit-mask-image:linear-gradient(to_left,black,transparent)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%]"

/**
 * Vertical offset (px) for `position: sticky` blocks in the marketing scroll root
 * so they pin **below** the fixed home nav (`LandingHomeStickyNav` + `LandingTopNav`).
 * Tune if nav padding or wordmark size changes; ~nav row + `py-4` / `sm:py-5` shell.
 */
export const landingMarketingStickyTopOffsetPx = 80
