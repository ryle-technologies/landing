import { normalizeListenHostOrigin } from "@/lib/siteUrl";

function originFromHost(host: string): string {
  const trimmed = host.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return normalizeListenHostOrigin(withScheme.replace(/\/+$/, ""));
}

/**
 * Ignore a known bad value on exchange Preview (pointed at another Vercel project).
 * Lets production fall through to `VERCEL_PROJECT_PRODUCTION_URL` (`www.ryle.sh`).
 */
function isStalePublicSiteUrl(url: string): boolean {
  return /private-wallet\.vercel\.app/i.test(url);
}

function readNextPublicSiteUrl(): string {
  const trimmed =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (!trimmed || isStalePublicSiteUrl(trimmed)) return "";
  return normalizeListenHostOrigin(trimmed);
}

/**
 * Canonical origin for metadata, OAuth callbacks, and share links on Vercel.
 *
 * - **Preview**: this deployment’s host (`VERCEL_BRANCH_URL` / `VERCEL_URL`), not a
 *   stale `NEXT_PUBLIC_SITE_URL` from another project.
 * - **Production**: `NEXT_PUBLIC_SITE_URL` when set (e.g. `https://www.ryle.sh`), else
 *   `VERCEL_PROJECT_PRODUCTION_URL`.
 */
export function resolvePublicOrigin(): string {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === "preview") {
    const branch = process.env.VERCEL_BRANCH_URL?.trim();
    if (branch) {
      const origin = originFromHost(branch);
      if (origin) return origin;
    }
    const deployment = process.env.VERCEL_URL?.trim();
    if (deployment) {
      const origin = originFromHost(deployment);
      if (origin) return origin;
    }
  }

  const siteUrl = readNextPublicSiteUrl();
  if (siteUrl) return siteUrl;

  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prodHost && (vercelEnv === "production" || vercelEnv === "preview")) {
    const origin = originFromHost(prodHost);
    if (origin) return origin;
  }

  return "";
}
