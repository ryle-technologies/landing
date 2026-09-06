import { LandingNewConsoleShowcase } from "@/components/marketing/landing-new/LandingNewConsoleShowcase"
import { LandingNewHeroGrid } from "@/components/marketing/landing-new/LandingNewHeroGrid"
import { LandingNewWalletAssetKicker } from "@/components/marketing/landing-new/LandingNewWalletAssetKicker"
import { LandingNewWalletGridFrame } from "@/components/marketing/landing-new/LandingNewWalletGridFrame"
import { LandingNewWalletSectionActions } from "@/components/marketing/landing-new/LandingNewWalletSectionActions"
import { LandingNewWalletShowcase } from "@/components/marketing/landing-new/LandingNewWalletShowcase"
import { WalletDemoStoreProvider } from "@/components/marketing/wallet-demo/WalletDemoStoreProvider"
import {
  landingHeroPrimaryCtaClassName,
  landingHeroTitleClassName,
  landingMarketingOutlineCtaClassName,
} from "@/lib/landingHeroTypography"
import {
  DOCS_BASE_HREF,
  LANDING_MARKETING_CONTACT_HREF,
  LANDING_MARKETING_CTA_LABEL,
  landingMarketingCtaAnchorProps,
} from "@/lib/siteNav"

const CONSOLE_DOCS_HREF = `${DOCS_BASE_HREF}/build/console`

const CONSOLE_CONTENT = {
  kicker: "For operators",
  title: "Manage your program.",
  titleMuted: "From our AI-powered Console.",
  subtitle:
    "Operate, monitor, and scale your business with real-time visibility and full control. No operational overhead.",
  secondaryCta: { label: "See the Console", href: CONSOLE_DOCS_HREF },
  stats: [
    { value: "4", label: "Modules in the stack" },
    { value: "T+0", label: "Settlement" },
    { value: "3", label: "Ways to run it" },
  ],
} as const

const WALLET_CONTENT = {
  kicker: "Ryle Wallet supports",
  title: "Deploy your wallet that",
  titleLineTwo: "makes all, make sense.",
  subtitle:
    "Give customers a place to hold, send, and receive — fully branded, no separate app required. Placeholder copy for the wallet surface.",
  stats: [
    { value: "100%", label: "Your branding" },
    { value: "0", label: "Separate apps" },
    { value: "API", label: "Ready to embed" },
  ],
} as const

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const sectionTitleClassName = `relative text-left text-foreground transition-colors duration-500 ease-out ${landingHeroTitleClassName}`

const walletTitleClassName =
  "relative text-left font-sans text-[clamp(48px,7.5vw,70px)] leading-none tracking-tighter text-foreground transition-colors duration-500 ease-out"

const sectionSubtitleClassName =
  "max-w-[28rem] text-left text-[15px] font-normal leading-relaxed text-muted transition-colors duration-500 ease-out sm:text-[16px]"

type LandingNewConsoleSectionProps = {
  headingId?: string
  variant?: "console" | "wallet"
}

/**
 * Two-column Console / wallet section. The wallet variant sits on the same
 * 60px lattice as the feature band; the phone fills the right cell.
 */
export function LandingNewConsoleSection({
  headingId = "landing-new-console-heading",
  variant = "console",
}: LandingNewConsoleSectionProps = {}) {
  if (variant === "wallet") {
    return (
      <section
        aria-labelledby={headingId}
        className="relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
      >
        <div
          aria-hidden
          data-wallet-grid-origin
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)]"
        >
          <LandingNewHeroGrid />
        </div>
        <WalletDemoStoreProvider>
          <LandingNewWalletGridFrame>
            <div className="flex h-full min-w-0 flex-col justify-center p-6 sm:p-8">
              <LandingNewWalletAssetKicker
                prefix={WALLET_CONTENT.kicker}
                className={kickerClassName}
              />
              <h2 id={headingId} className={`mt-3 ${walletTitleClassName}`}>
                {WALLET_CONTENT.title}
                <br />
                {WALLET_CONTENT.titleLineTwo}
              </h2>
              <p className={`mt-5 ${sectionSubtitleClassName}`}>
                {WALLET_CONTENT.subtitle}
              </p>
              <LandingNewWalletSectionActions />
              <dl className="mt-10 flex flex-row items-start gap-6">
                {WALLET_CONTENT.stats.map((stat) => (
                  <div key={stat.label} className="min-w-0 flex-1">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
                      {stat.value}
                    </dd>
                    <p className="mt-1 text-[12px] leading-snug text-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </dl>
            </div>
            <LandingNewWalletShowcase />
          </LandingNewWalletGridFrame>
        </WalletDemoStoreProvider>
      </section>
    )
  }

  return (
    <section
      aria-labelledby={headingId}
      className="relative z-10 py-16 sm:py-24 md:py-32 min-[1080px]:py-36"
    >
      <div className="grid min-w-0 items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="min-w-0">
          <p className={kickerClassName}>{CONSOLE_CONTENT.kicker}</p>
          <h2 id={headingId} className={`mt-3 ${sectionTitleClassName}`}>
            {CONSOLE_CONTENT.title}
            <br />
            <span className="text-muted">{CONSOLE_CONTENT.titleMuted}</span>
          </h2>
          <p className={`mt-5 ${sectionSubtitleClassName}`}>
            {CONSOLE_CONTENT.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <a
              href={LANDING_MARKETING_CONTACT_HREF}
              className={landingHeroPrimaryCtaClassName}
              {...landingMarketingCtaAnchorProps(LANDING_MARKETING_CONTACT_HREF)}
            >
              {LANDING_MARKETING_CTA_LABEL}
            </a>
            <a
              href={CONSOLE_CONTENT.secondaryCta.href}
              className={landingMarketingOutlineCtaClassName}
              {...landingMarketingCtaAnchorProps(CONSOLE_CONTENT.secondaryCta.href)}
            >
              {CONSOLE_CONTENT.secondaryCta.label}
            </a>
          </div>
          <dl className="mt-10 flex flex-row items-start gap-6">
            {CONSOLE_CONTENT.stats.map((stat) => (
              <div key={stat.label} className="min-w-0 flex-1">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
                  {stat.value}
                </dd>
                <p className="mt-1 text-[12px] leading-snug text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>
        <LandingNewConsoleShowcase />
      </div>
    </section>
  )
}
