import type { MetadataRoute } from "next";
import { getMetadataBaseUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getMetadataBaseUrl().origin;
  const lastModified = new Date();

  return [
    {
      url: `${origin}/`,
      lastModified,
    },
  ];
}
