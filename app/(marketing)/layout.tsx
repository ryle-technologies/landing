import type { Metadata } from "next";
import type { Viewport } from "next";
import {
  buildRootMetadata,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
} from "@/lib/metadata";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";

/** Marketing routes inherit root metadata; reaffirm canonical for `/`. */
export const metadata: Metadata = {
  ...buildRootMetadata(),
  title: {
    absolute: DEFAULT_SITE_TITLE,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * `globals.css` sets `body` to `display: flex` + `justify-content: center` +
 * `align-items: center` for the phone-frame shell. Marketing pages are not
 * wrapped by `DeskShell`, so without this wrapper the route would shrink-wrap
 * and sit in the middle of the viewport.
 *
 * The full-bleed wrapper lives in `MarketingThemeProvider` (client component).
 * Marketing is light-only for now; the wrapper still isolates tokens from the
 * wallet/app theme on `<html>`.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MarketingThemeProvider>{children}</MarketingThemeProvider>;
}
