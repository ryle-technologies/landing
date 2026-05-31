import type { MetadataRoute } from "next";
import { BRAND_THEME_LIGHT } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ryle",
    short_name: "Ryle",
    description:
      "Bring assets onchain without exposing sensitive activity. Launch digital assets, move value, and manage private operations with infrastructure built for enterprises and companies.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND_THEME_LIGHT,
    theme_color: BRAND_THEME_LIGHT,
    lang: "en-US",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
