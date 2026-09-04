import type { Metadata } from "next";
import type { Viewport } from "next";
import { cookies } from "next/headers";
import {
  buildRootMetadata,
  DEFAULT_SITE_DESCRIPTION,
} from "@/lib/metadata";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import {
  isMarketingThemeDark,
  MARKETING_THEME_COOKIE,
} from "@/lib/marketingTheme";

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
export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCookie = (await cookies()).get(MARKETING_THEME_COOKIE)?.value;

  return (
    <MarketingThemeProvider initialIsDark={isMarketingThemeDark(themeCookie)}>
      {children}
    </MarketingThemeProvider>
  );
}
