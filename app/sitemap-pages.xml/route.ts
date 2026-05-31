import { getMetadataBaseUrl } from "@/lib/metadata";

/** Marketing pages sitemap (referenced by the /sitemap.xml index). */
export function GET(): Response {
  const origin = getMetadataBaseUrl().origin;
  const lastmod = new Date().toISOString();

  const urls = [`${origin}/`];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
