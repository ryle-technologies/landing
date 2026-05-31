/** Cookie + `localStorage` key for the isolated marketing light/dark theme. */
export const MARKETING_THEME_STORAGE_KEY = "marketing-theme";

const MARKETING_THEME_COOKIE = MARKETING_THEME_STORAGE_KEY;

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function isMarketingThemeDark(
  value: string | undefined | null,
): boolean {
  return value === "dark";
}

/** Persist marketing theme for SSR on the next navigation (client only). */
export function writeMarketingThemeCookie(isDark: boolean): void {
  if (typeof document === "undefined") return;
  const value = isDark ? "dark" : "light";
  document.cookie = `${MARKETING_THEME_COOKIE}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

export function readMarketingThemeFromLocalStorage(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(MARKETING_THEME_STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return null;
  } catch {
    return null;
  }
}
