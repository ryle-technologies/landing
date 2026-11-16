import type { LandingNewUseCaseShapeKind } from "@/lib/landingNewUseCaseSolids"
import {
  CLIENT_SERVICES_HREF,
  LANDING_MARKETING_CONTACT_HREF,
} from "@/lib/siteNav"

/**
 * Copy for the institutional home (`/`) and the About page (`/about`). Source
 * and rationale: `docs/briefs/ryle-web-institucional-verticales-y-copy.md`.
 *
 * Section ids double as the anchors in `HOME_SECTION_HREFS` (`lib/siteNav.ts`).
 */
export const SECTION_IDS = {
  whatWeDo: "what-we-do",
  issuance: "issuance",
  solutions: "solutions",
  technology: "technology",
  clientServices: "client-services",
  whyRyle: "why-ryle",
  contact: "contact",
} as const

/** Section ids on `/about`. */
export const ABOUT_SECTION_IDS = {
  team: "team",
} as const

/**
 * The firm's mission, split so the opening clause can lead a paragraph
 * (`/about` hero) or run on as one sentence (Why Ryle on the home).
 */
export const MISSION = {
  lead: "Our mission is to modernize financial infrastructure",
  body: "so that assets and operations become programmable, interoperable and confidential, while institutions keep control and a full record of every operation.",
} as const

/* ─── Hero ──────────────────────────────────────────────────────────────── */

export const HERO = {
  titleLines: ["Digital assets and", "financial infrastructure", "for the"],
  titleAccent: "internet economy",
  lead: "Ryle connects institutional finance with decentralized technology.",
  body: "We structure tokenized assets with the institutions that issue them, and run the infrastructure that issues, settles and distributes them.",
  primaryCta: { label: "Talk to us", href: LANDING_MARKETING_CONTACT_HREF },
} as const

/* ─── What we do ────────────────────────────────────────────────────────── */

export type Vertical = {
  index: string
  name: string
  descriptor: string
  audience: string
  body: string
  cta: { label: string; href: string }
}

export const WHAT_WE_DO = {
  titleLines: [
    "For institutions that issue assets.",
    "For companies that build products with them.",
  ],
  verticals: [
    {
      index: "01",
      name: "Ryle Issuance",
      descriptor: "Asset tokenization",
      audience: "For issuers, asset managers and financial institutions.",
      body: "We design the instrument with you, build the infrastructure that issues and records it, connect it to payments and distribution, and support its operation.",
      cta: {
        label: "Talk to us",
        href: LANDING_MARKETING_CONTACT_HREF,
      },
    },
    {
      index: "02",
      name: "Ryle Client Services",
      descriptor: "Digital-asset products for companies",
      audience: "For fintechs, corporates and brands.",
      body: "Your own stablecoin, wallet, cross-border payments or card program, integrated into the product you already run.",
      cta: { label: "Explore Client Services", href: CLIENT_SERVICES_HREF },
    },
  ] satisfies readonly Vertical[],
} as const

/* ─── Ryle Issuance ─────────────────────────────────────────────────────── */

export const ISSUANCE = {
  titleLines: ["Why tokenize"],
  titleAccent: "with Ryle",
  benefits: [
    {
      title: "Instant Settlements.",
      body: "Transfers and trades settle upon execution. Ownership passes at the moment of the transaction, without an intervening delay.",
      shape: "cube",
    },
    {
      title: "Automated Regulation.",
      body: "Jurisdictional limits and transfer restrictions are enforced by the instrument at the point of transfer.",
      shape: "tetrahedron",
    },
    {
      title: "Access to new segments and markets.",
      body: "The instrument can be offered to investor segments and markets outside the institution's current distribution.",
      shape: "sphere",
    },
    {
      title: "Real-Time Shareholder Data.",
      body: "The register of holders and the record of holder activity are maintained continuously, rather than refreshed overnight.",
      shape: "torus",
    },
    {
      title: "Enhanced Liquidity Access.",
      body: "Holders may borrow against the asset, lend it, transfer it between one another, or trade it on a licensed market, within the terms of the instrument.",
      shape: "slab",
    },
    {
      title: "Flexible Customization.",
      body: "Voting rights, dividend preferences, and the other terms of a share class are defined on the instrument and applied to every holding.",
      shape: "hexPrism",
    },
  ],
  cta: { label: "Discuss an asset", href: LANDING_MARKETING_CONTACT_HREF },
} as const

/* ─── Solutions ─────────────────────────────────────────────────────────── */

export type SolutionFamily = {
  index: string
  title: string
  body: string
  shape: LandingNewUseCaseShapeKind
}

export const SOLUTIONS = {
  titleLines: ["What you can build"],
  titleAccent: "with Ryle",
  sub: "Turn assets into instruments you can invest in, finance with, and operate.",
  families: [
    {
      index: "01",
      title: "Investment and markets",
      body: "Turn assets into instruments that can be invested in and transferred.",
      shape: "octahedron",
    },
    {
      index: "02",
      title: "Financing and collateral",
      body: "Use the value of an asset to access credit and liquidity.",
      shape: "slab",
    },
    {
      index: "03",
      title: "Payments and distribution",
      body: "Connect assets to customers, merchants and payment systems.",
      shape: "torus",
    },
    {
      index: "04",
      title: "Traceability and certification",
      body: "Verify origin, ownership, movements and compliance.",
      shape: "hexPrism",
    },
    {
      index: "05",
      title: "Financial automation",
      body: "Program rules, yields, settlements and operations.",
      shape: "icosahedron",
    },
  ] satisfies readonly SolutionFamily[],
} as const

/* ─── Technology ────────────────────────────────────────────────────────── */

export const TECHNOLOGY = {
  kicker: "Technology",
  titleLines: ["One infrastructure to", "issue, manage and", "operate"],
  titleAccent: "digital assets",
  sub: "Institutional control, privacy and compliance are built into every operation.",
  platform: {
    name: "Ryle Platform",
    note: "Four modules",
  },
  modules: {
    issuance: {
      title: "Issuance and management.",
      body: "Tokenized assets, stablecoins and the rules they operate under.",
    },
    settlement: {
      title: "Settlement and integration.",
      body: "Transfers, reconciliation, APIs and connectivity across networks.",
    },
    privacy: {
      title: "Privacy and control.",
      body: "Permissions, policies and selective disclosure of information.",
    },
    operations: {
      title: "Operations and oversight.",
      body: "An institutional console with monitoring, traceability and audit.",
    },
  },
  wallet: {
    name: "Ryle Wallet",
    note: "White-label",
    title: "Distribution under your brand.",
    body: "A wallet for your end customers, with no seed phrases and no gas to manage.",
  },
} as const

/* ─── Client Services ───────────────────────────────────────────────────── */

export const CLIENT_SERVICES = {
  kicker: "Ryle Client Services",
  titleLines: ["The same infrastructure,"],
  titleAccent: "inside your product",
  body: "Companies work with our Client Services team to launch their own stablecoin, wallet, cross-border payments or card program. We integrate the platform into the product you already run, so you go live in weeks without building the infrastructure yourself.",
  cta: { label: "Explore Client Services", href: CLIENT_SERVICES_HREF },
  /** Labels from the Client Services use-case pool shown as a preview. */
  previewLabels: [
    "Your own stablecoin",
    "Wallet inside your app",
    "Cross-border payments",
    "Your own card",
    "Supplier payments",
    "Payroll in stablecoin",
    "Marketplace payouts",
    "Loyalty and cashback",
    "Multi-entity treasury",
    "Wallets for AI agents",
    "Partner wallets",
  ],
} as const

/* ─── Why Ryle ──────────────────────────────────────────────────────────── */

export const WHY = {
  kicker: "Why Ryle",
  titleLines: ["How will institutions tokenize assets?"],
  /**
   * EY-Parthenon 2024, p. 28. Column height follows the share, with a floor
   * so the shortest answer still holds its label.
   */
  survey: {
    rows: [
      { label: "Partnering with a digital-native or tokenization firm", value: 46 },
      { label: "Partnering with a consortium or traditional finance firms", value: 46 },
      { label: "Building infrastructure in-house", value: 20 },
      { label: "Acquiring a tokenization startup", value: 16 },
      { label: "No plans to tokenize assets", value: 12 },
    ],
    source: "How Institutional Investors Plan to Approach Digital Assets in 2024, EY, May 2024.",
    sourceHref:
      "https://www.ey.com/content/dam/ey-unified-site/ey-com/en-us/insights/financial-services/documents/ey-gaining-ground-how-institutional-investors-plan-to-approach-digital-assets-in-2024.pdf",
  },
} as const

/* ─── About (`/about`) ──────────────────────────────────────────────────── */

export const ABOUT = {
  hero: {
    kicker: "About Ryle",
    // The accent never wraps, so it stays one word to fit a phone column.
    titleLines: ["Ryle connects", "institutional finance with", "decentralized"],
    titleAccent: "technology",
    mission: MISSION,
  },
  team: {
    kicker: "Team",
    titleLines: ["Founded by the team that led", "product and blockchain"],
    titleAccent: "at Agrotoken",
    sub: "Before Ryle, our founders took commodity tokenization at Agrotoken from concept to regional expansion, and worked at OKX, Booking.com, Rootstock and National Bank of Canada.",
    founders: [
      {
        initials: "MC",
        name: "Martín Mateo Cerón",
        role: "Co-founder and CEO",
        summary:
          "Product and technology leader with 15 years in fintech, digital assets and global platforms.",
        career: [
          {
            org: "OKX",
            detail:
              "Led strategic products at one of the world's largest digital-asset exchanges, from Singapore.",
          },
          {
            org: "Agrotoken",
            detail:
              "Chief Product Officer and founding team. Led the product from concept to regional expansion and built teams of up to 80 people.",
          },
          {
            org: "Booking.com",
            detail: "Pricing and loyalty, in the Netherlands.",
          },
        ],
      },
      {
        initials: "DG",
        name: "Diego Grasso",
        role: "Co-founder and CTO",
        summary:
          "Systems engineer specialized in blockchain infrastructure, DLT and financial platforms.",
        career: [
          {
            org: "Agrotoken",
            detail:
              "Head of Blockchain. Responsible for the architecture and infrastructure used to tokenize real-world assets.",
          },
          {
            org: "National Bank of Canada",
            detail: "Technology architecture and banking systems.",
          },
          {
            org: "Rootstock",
            detail: "Bitcoin-based financial infrastructure.",
          },
        ],
      },
    ],
  },
  offices: {
    entity: "Ryle Technologies",
    locations: [
      {
        city: "Amsterdam",
        country: "The Netherlands",
        timeZone: "Europe/Amsterdam",
      },
      {
        city: "Montevideo",
        country: "Uruguay",
        timeZone: "America/Montevideo",
      },
    ],
  },
} as const

/* ─── Closing ───────────────────────────────────────────────────────────── */

export const CLOSING = {
  titleLines: ["Let's"],
  titleAccent: "build",
  sub: "Create your own assets, connect with new institutions and open new markets with Ryle.",
  cta: { label: "Talk to us", href: LANDING_MARKETING_CONTACT_HREF },
  marqueeWords: ["Structure", "Issue", "Settle", "Distribute"],
} as const
