import { DEFAULT_SITE_DESCRIPTION, getMetadataBaseUrl } from "@/lib/metadata";

/**
 * Sitewide JSON-LD (schema.org) graph: Organization + WebSite.
 *
 * Emitted in {@link file://./../app/layout.tsx} so every marketing page — and
 * the root that AI answer engines hit first — carries entity-level structured
 * data. This is what Google AI Overviews, Perplexity, and similar engines use
 * to understand and attribute "Ryle" as an entity. Kept to claims that are true
 * on every page (no per-page FAQ schema, which belongs on the page rendering
 * the questions).
 */
export function buildStructuredData(): Record<string, unknown> {
  const origin = getMetadataBaseUrl().origin;
  const orgId = `${origin}/#organization`;
  const siteId = `${origin}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Ryle",
        url: origin,
        logo: {
          "@type": "ImageObject",
          url: `${origin}/icons/icon-512.png`,
          width: 512,
          height: 512,
        },
        description: DEFAULT_SITE_DESCRIPTION,
        slogan: "Confidential by default, visible by policy, auditable always.",
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: "Ryle",
        url: origin,
        description: DEFAULT_SITE_DESCRIPTION,
        publisher: { "@id": orgId },
        inLanguage: "en-US",
      },
    ],
  };
}
