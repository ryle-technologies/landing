import { getMetadataBaseUrl } from "@/lib/metadata";

/**
 * Sitemap index. References the marketing pages sitemap and the proxied
 * Mintlify docs sitemap (served under /docs on this domain), so crawlers and
 * AI engines can discover the entire hub from a single root entry point.
 */
export function GET(): Response {
  const origin = getMetadataBaseUrl().origin;
  const lastmod = new Date().toISOString();

  const sitemaps = [
    `${origin}/sitemap-pages.xml`,
    `${origin}/docs/sitemap.xml`,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (loc) =>
      `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
