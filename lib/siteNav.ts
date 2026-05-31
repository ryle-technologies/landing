/** Primary marketing pill label (hero, suite, footer, top nav). */
export const LANDING_MARKETING_CTA_LABEL = "Request demo" as const

/** Demo booking URL for {@link LANDING_MARKETING_CTA_LABEL}. */
export const LANDING_MARKETING_CONTACT_HREF =
  "https://calendly.com/martin-ryle/30min" as const

/** Anchor props for external marketing CTAs (Calendly opens in a new tab). */
export function landingMarketingCtaAnchorProps(
  href: string = LANDING_MARKETING_CONTACT_HREF,
): { target: "_blank"; rel: "noopener noreferrer" } | Record<string, never> {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { target: "_blank", rel: "noopener noreferrer" }
  }
  return {}
}

/** Landing footer link — X (Twitter). */
export const LANDING_MARKETING_X_HREF = "https://x.com/__ryle" as const

/** In-app routes that belong to the "Alpha test" shell (pilot). */
export function isWalletShellPath(pathname: string): boolean {
  if (pathname === "/app" || pathname.startsWith("/app/")) return true;
  return false;
}

/** Pilot / wallet entry URL (Join Alpha). Override with `NEXT_PUBLIC_ALPHA_TEST_URL`. */
export function getAlphaTestHref(): string {
  return process.env.NEXT_PUBLIC_ALPHA_TEST_URL?.trim() || "/app";
}

/** True when the pilot shell should read as current for the Join Alpha control. */
export function isAlphaShellNavActive(pathname: string): boolean {
  const alphaHref = getAlphaTestHref();
  return pathname === alphaHref || isWalletShellPath(pathname);
}
