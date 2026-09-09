import type { MetadataRoute } from "next";
import { BRAND_THEME_LIGHT } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ryle",
    short_name: "Ryle",
    description:
      "Modular financial infrastructure for companies: stablecoins, wallets, cross-border payments and cards, live in weeks. Runs in your cloud. Private by default.",
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
