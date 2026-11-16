import type { Metadata } from "next"
import { LandingNewHero } from "@/components/marketing/landing-new/LandingNewHero"
import {
  CLIENT_SERVICES_DESCRIPTION,
  CLIENT_SERVICES_TITLE,
} from "@/lib/metadata"
import { CLIENT_SERVICES_HREF } from "@/lib/siteNav"

export const metadata: Metadata = {
  title: { absolute: CLIENT_SERVICES_TITLE },
  description: CLIENT_SERVICES_DESCRIPTION,
  alternates: { canonical: CLIENT_SERVICES_HREF },
}

/** Ryle Client Services: the product landing that used to be `/`. */
export default function ClientServicesPage() {
  return <LandingNewHero />
}
