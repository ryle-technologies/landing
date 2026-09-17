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

/** Default document title (homepage and fallback). */
export const DEFAULT_SITE_TITLE =
  "Ryle · Issue, move and spend money onchain";

/** Default meta description (≤155 chars for SERP snippets). */
export const DEFAULT_SITE_DESCRIPTION =
  "Modular financial infrastructure for companies: stablecoins, wallets, cross-border payments and cards, live in weeks. Runs in your cloud. Private by default.";

/**
 * Shared root metadata merged in [`app/layout.tsx`](app/layout.tsx) with `icons`.
 *
 * Share images come from the App Router file convention (`app/opengraph-image.png`
 * + `app/twitter-image.png` and their `.alt.txt` siblings). Do not set
 * `openGraph.images` / `twitter.images` here — that would pin crawlers to an
 * unhashed `/opengraph-image.png` URL and keep WhatsApp/Slack on a stale card.
 */
export function buildRootMetadata(): Metadata {
  const metadataBase = getMetadataBaseUrl();
  const googleTokens = googleVerificationTokens();

  return {
    metadataBase,
    alternates: {
      canonical: "/",
    },
    title: {
      default: DEFAULT_SITE_TITLE,
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
    },
    twitter: {
      card: "summary_large_image",
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
