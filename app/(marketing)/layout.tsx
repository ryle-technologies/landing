import type { Metadata } from "next";
import type { Viewport } from "next";
import {
  buildRootMetadata,
  DEFAULT_SITE_DESCRIPTION,
} from "@/lib/metadata";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";

/** Marketing routes inherit root metadata; reaffirm canonical for `/`. */
export const metadata: Metadata = {
  ...buildRootMetadata(),
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
 * The full-bleed wrapper + light/dark theme isolation lives in
 * `MarketingThemeProvider` (client component) so that toggling dark mode on
 * `/landing/home` only repaints the marketing surround and never touches the
 * wallet/app theme on `<html>`.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * Landing scroll crossfade is light (hero) → dark (suite onward). Persisted
   * theme prefs apply only via the nav toggle, not SSR/cookie, so hydration
   * matches the hero and scroll can drive the handoff.
   */
  return (
    <MarketingThemeProvider initialIsDark={false}>
      {children}
    </MarketingThemeProvider>
  );
}
