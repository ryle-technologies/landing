import type { Metadata } from "next";
import { LandingHomeHero } from "@/components/marketing/landing/LandingHomeHero";
import { buildRootMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildRootMetadata(),
  alternates: {
    canonical: "/old-landing",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OldLandingPage() {
  return <LandingHomeHero />;
}
