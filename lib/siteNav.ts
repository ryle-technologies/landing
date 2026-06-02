/** Primary marketing pill label (hero, suite, footer, top nav). */
export const LANDING_MARKETING_CTA_LABEL = "Request demo" as const

/** Demo booking URL for {@link LANDING_MARKETING_CTA_LABEL}. */
export const LANDING_MARKETING_CONTACT_HREF =
  "https://calendly.com/martin-ryle/30min" as const

/** Anchor props for external marketing CTAs (Calendly opens in a new tab). */
export function landingMarketingCtaAnchorProps(
  href: string = LANDING_MARKETING_CONTACT_HREF,
): { target: "_blank"; rel: "noopener noreferrer" } | Record<string, never> {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { target: "_blank", rel: "noopener noreferrer" }
  }
  return {}
}

/** Landing footer link — X (Twitter). */
export const LANDING_MARKETING_X_HREF = "https://x.com/__ryle" as const

/** Docs site base path (proxied via Next.js rewrites). */
export const DOCS_BASE_HREF = "/docs" as const

/**
 * Docs links must use a plain `<a href={DOCS_BASE_HREF}>`, not `next/link`.
 * Client-side routing would target the marketing app; `/docs` is rewritten to Mintlify.
 */

/** Marketing docs link label (nav, suite block, closing CTA). */
export const LANDING_DOCS_CTA_LABEL = "Read our documentation" as const

export type FooterNavLink = {
  label: string
  href: string
  external?: boolean
}

export type FooterNavColumn = {
  heading: string
  headingHref?: string
  links: FooterNavLink[]
}

/** Footer sitemap row 1 — Knowledge Base, Use cases, Products (3 columns). */
export const FOOTER_DOCS_COLUMNS_PRIMARY: FooterNavColumn[] = [
  {
    heading: "Knowledge Base",
    headingHref: DOCS_BASE_HREF,
    links: [
      {
        label: "What are confidential digital assets",
        href: `${DOCS_BASE_HREF}/what-are-confidential-digital-assets`,
      },
      {
        label: "How confidential assets work",
        href: `${DOCS_BASE_HREF}/concepts/how-confidential-assets-work`,
      },
      {
        label: "Selective disclosure",
        href: `${DOCS_BASE_HREF}/concepts/selective-disclosure`,
      },
      {
        label: "Confidential accounts",
        href: `${DOCS_BASE_HREF}/concepts/confidential-accounts`,
      },
    ],
  },
  {
    heading: "Use cases",
    headingHref: `${DOCS_BASE_HREF}/use-cases/treasury`,
    links: [
      {
        label: "Treasury",
        href: `${DOCS_BASE_HREF}/use-cases/treasury`,
      },
      {
        label: "Stablecoins",
        href: `${DOCS_BASE_HREF}/use-cases/stablecoins`,
      },
      {
        label: "B2B settlement",
        href: `${DOCS_BASE_HREF}/use-cases/b2b-settlement`,
      },
      {
        label: "AI agents",
        href: `${DOCS_BASE_HREF}/use-cases/ai-agents`,
      },
      {
        label: "Tokenization platforms",
        href: `${DOCS_BASE_HREF}/use-cases/tokenization-platforms`,
      },
    ],
  },
  {
    heading: "Products",
    headingHref: `${DOCS_BASE_HREF}/products/issuance`,
    links: [
      {
        label: "Issuance",
        href: `${DOCS_BASE_HREF}/products/issuance`,
      },
      {
        label: "Confidential payments",
        href: `${DOCS_BASE_HREF}/products/confidential-payments`,
      },
      {
        label: "Accounts & wallets",
        href: `${DOCS_BASE_HREF}/products/accounts-and-wallets`,
      },
      {
        label: "Compliance & disclosure",
        href: `${DOCS_BASE_HREF}/products/compliance-and-disclosure`,
      },
    ],
  },
]

/** Footer sitemap row 2 — Company, Build. */
export const FOOTER_DOCS_COLUMNS_SECONDARY: FooterNavColumn[] = [
  {
    heading: "Company",
    links: [
      {
        label: "Documentation",
        href: DOCS_BASE_HREF,
      },
      {
        label: "Frequently asked questions",
        href: `${DOCS_BASE_HREF}/reference/faq`,
      },
      {
        label: "Glossary",
        href: `${DOCS_BASE_HREF}/reference/glossary`,
      },
    ],
  },
  {
    heading: "Build",
    headingHref: `${DOCS_BASE_HREF}/build/console`,
    links: [
      {
        label: "Console",
        href: `${DOCS_BASE_HREF}/build/console`,
      },
      {
        label: "APIs & webhooks",
        href: `${DOCS_BASE_HREF}/build/apis`,
      },
      {
        label: "White-label wallet",
        href: `${DOCS_BASE_HREF}/build/white-label-wallet`,
      },
    ],
  },
]

/** All footer sitemap columns (primary then secondary). */
export const FOOTER_DOCS_COLUMNS: FooterNavColumn[] = [
  ...FOOTER_DOCS_COLUMNS_PRIMARY,
  ...FOOTER_DOCS_COLUMNS_SECONDARY,
]

/** In-app routes that belong to the "Alpha test" shell (pilot). */
export function isWalletShellPath(pathname: string): boolean {
  if (pathname === "/app" || pathname.startsWith("/app/")) return true;
  return false;
}

/** Pilot / wallet entry URL (Join Alpha). Override with `NEXT_PUBLIC_ALPHA_TEST_URL`. */
export function getAlphaTestHref(): string {
  return process.env.NEXT_PUBLIC_ALPHA_TEST_URL?.trim() || "/app";
}

/** True when the pilot shell should read as current for the Join Alpha control. */
export function isAlphaShellNavActive(pathname: string): boolean {
  const alphaHref = getAlphaTestHref();
  return pathname === alphaHref || isWalletShellPath(pathname);
}
