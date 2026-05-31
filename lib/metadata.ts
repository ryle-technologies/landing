import type { Metadata } from "next";
import { resolvePublicOrigin } from "@/lib/resolvePublicOrigin";
import { normalizeListenHostOrigin } from "@/lib/siteUrl";

/** Matches `--foreground` / icon background in `app/globals.css`. */
export const BRAND_THEME_DARK = "#141210";
/** Matches `--page-backdrop` (desk surround). */
export const BRAND_THEME_LIGHT = "#F5F2EE";

/**
 * Absolute origin for `metadataBase`, Open Graph URLs, sitemap, and robots host.
 * Never empty — required so OG images resolve to absolute URLs during build/SSR.
 *
 * Uses {@link resolvePublicOrigin} (preview → deployment host; production →
 * `NEXT_PUBLIC_SITE_URL` or `VERCEL_PROJECT_PRODUCTION_URL`) → localhost fallback.
 */
export function getMetadataBaseUrl(): URL {
  const resolved = resolvePublicOrigin();
  if (resolved) {
    return new URL(`${resolved}/`);
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    const withScheme = /^https?:\/\//i.test(vercelProd)
      ? vercelProd
      : `https://${vercelProd}`;
    const origin = normalizeListenHostOrigin(
      withScheme.replace(/\/+$/, ""),
    );
    return new URL(`${origin}/`);
  }

  return new URL("http://localhost:3000/");
}

/** Only production deployments should be indexed (matches `app/robots.ts`). */
export function isProductionIndexing(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function googleVerificationTokens(): string[] | undefined {
  const raw = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  if (!raw) return undefined;
  const tokens = raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return tokens.length ? tokens : undefined;
}

/** Default meta description (≤155 chars for SERP snippets). */
export const DEFAULT_SITE_DESCRIPTION =
  "Bring assets onchain without exposing sensitive activity — launch and operate confidential digital assets for enterprises.";

/** Alt text for the static default share card (`app/opengraph-image.png`). */
export const DEFAULT_OG_IMAGE_ALT =
  "Ryle — confidential digital assets for companies: launch and operate private onchain assets.";

/**
 * Shared root metadata merged in [`app/layout.tsx`](app/layout.tsx) with `icons`.
 */
export function buildRootMetadata(): Metadata {
  const metadataBase = getMetadataBaseUrl();
  const googleTokens = googleVerificationTokens();
  const shareImage = {
    url: "/opengraph-image.png",
    width: 1200,
    height: 630,
    alt: DEFAULT_OG_IMAGE_ALT,
  };

  return {
    metadataBase,
    alternates: {
      canonical: "/",
    },
    title: {
      default: "Ryle · Confidential Digital Assets for Companies",
      template: "%s · Ryle",
    },
    description: DEFAULT_SITE_DESCRIPTION,
    applicationName: "Ryle",
    robots: isProductionIndexing()
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Ryle",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [{ url: "/twitter-image.png", alt: DEFAULT_OG_IMAGE_ALT }],
    },
    appleWebApp: {
      capable: true,
      title: "Ryle",
      statusBarStyle: "default",
    },
    ...(googleTokens?.length
      ? { verification: { google: googleTokens } }
      : {}),
  };
}
