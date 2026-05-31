import { resolvePublicOrigin } from "@/lib/resolvePublicOrigin";

/**
 * Maps `0.0.0.0` to `localhost` so origins work in the browser after OAuth.
 * `next dev --hostname 0.0.0.0` makes `0.0.0.0` a common mistake for `NEXT_PUBLIC_SITE_URL`
 * or the address bar; redirects to `http://0.0.0.0:3000` are unreliable.
 */
export function normalizeListenHostOrigin(origin: string): string {
  if (!origin) return origin;
  try {
    const u = new URL(origin);
    if (u.hostname === "0.0.0.0") u.hostname = "localhost";
    return u.origin;
  } catch {
    return origin;
  }
}

/**
 * Canonical site origin for absolute URLs (OAuth `redirectTo`, share links, QR).
 * Set `NEXT_PUBLIC_SITE_URL` per deployment (e.g. `https://wallet.sur.app`).
 *
 * In **`next dev`** (`NODE_ENV === "development"`), the **active tab** origin wins so
 * OAuth matches the host you opened (e.g. `127.0.0.1` vs `localhost`). Production uses
 * env first, then `window.location.origin` when env is unset.
 */
export function getSiteOrigin(): string {
  if (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    window.location?.origin
  ) {
    return normalizeListenHostOrigin(window.location.origin);
  }

  const resolved = resolvePublicOrigin();
  if (resolved) return resolved;

  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeListenHostOrigin(window.location.origin);
  }
  return "";
}
