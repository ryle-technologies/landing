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

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: getMetadataBaseUrl().host,
  };
}
