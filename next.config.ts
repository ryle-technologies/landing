import type { NextConfig } from "next";

/** Production CSP for the public marketing site (no Privy/Supabase/wallet RPC). */
function contentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https:",
    "worker-src 'self' blob:",
  ].join("; ");
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? "0.0.0",
    NEXT_PUBLIC_APP_COMMIT:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
  },
  outputFileTracingRoot: import.meta.dirname,
  async redirects() {
    return [
      { source: "/landing", destination: "/", permanent: true },
      { source: "/landing/:path*", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    // Serve the Mintlify content hub under ryle.sh/docs by proxying to the
    // Mintlify deployment. Override the origin with DOCS_PROXY_ORIGIN.
    // Scoped to /docs only so the marketing app and existing redirects are
    // untouched.
    const docsOrigin = (
      process.env.DOCS_PROXY_ORIGIN ?? "https://ryle.mintlify.dev"
    ).replace(/\/+$/, "");
    return [
      { source: "/docs", destination: `${docsOrigin}/docs` },
      { source: "/docs/:path*", destination: `${docsOrigin}/docs/:path*` },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        // Apply the marketing-site CSP to every path EXCEPT /docs, whose
        // proxied Mintlify assets need their own (looser) headers to render.
        source: "/((?!docs).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
