import type { Metadata } from "next";
import { LandingNewHero } from "@/components/marketing/landing-new/LandingNewHero";
import { buildRootMetadata } from "@/lib/metadata";

const NEW_LANDING_TITLE =
  "Ryle · Financial infrastructure for the digital economy";

const NEW_LANDING_DESCRIPTION =
  "Ryle gives companies a modular stack to issue assets, move money, and run payments and cards onchain — private by design, deployed in your cloud, yours to own.";

export const metadata: Metadata = {
  ...buildRootMetadata(),
  title: NEW_LANDING_TITLE,
  description: NEW_LANDING_DESCRIPTION,
  alternates: {
    canonical: "/new-landing",
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

export default function NewLandingPage() {
  return <LandingNewHero />;
}
