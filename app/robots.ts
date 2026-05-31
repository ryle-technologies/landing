import type { MetadataRoute } from "next";
import { getMetadataBaseUrl, isProductionIndexing } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const origin = getMetadataBaseUrl().origin;

  if (!isProductionIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${origin}/sitemap.xml`,
    };
  }

  // AI/LLM crawlers and answer engines. Listed explicitly so GEO traffic is
  // never lost to an accidental future tightening of the wildcard rule.
  const aiAgents = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Amazonbot",
    "Bytespider",
    "CCBot",
    "cohere-ai",
    "Meta-ExternalAgent",
    "DuckAssistBot",
    "Diffbot",
    "Timpibot",
    "YouBot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: aiAgents,
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: getMetadataBaseUrl().host,
  };
}
