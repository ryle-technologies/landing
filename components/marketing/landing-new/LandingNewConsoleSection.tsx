"use client"

import { LandingNewWalletAssetKicker } from "@/components/marketing/landing-new/LandingNewWalletAssetKicker"
import { LandingNewWalletBrandedWord } from "@/components/marketing/landing-new/LandingNewWalletBrandedWord"
import { LandingNewWalletSectionActions } from "@/components/marketing/landing-new/LandingNewWalletSectionActions"
import { LandingNewWalletShowcase } from "@/components/marketing/landing-new/LandingNewWalletShowcase"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { WalletDemoStoreProvider } from "@/components/marketing/wallet-demo/WalletDemoStoreProvider"
import {
  LATTICE_PHONE_COLS,
  LATTICE_SPACE,
  phoneRowsForCols,
} from "@/lib/landingLattice"

const WALLET_CONTENT = {
  title: "Deploy your own",
  titleAccent: "branded",
  titleLineTwo: "wallet in minutes.",
  subtitle:
    "Give customers a place to hold, send, and receive. Fully branded, no separate app required. Placeholder copy for the wallet surface.",
  stats: [
    { value: "100%", label: "Your branding" },
    { value: "0", label: "Separate apps" },
    { value: "API", label: "Ready to embed" },
  ],
} as const

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const walletTitleClassName =
  "relative flex flex-col text-left font-sans text-[clamp(48px,7.5vw,70px)] font-medium leading-none tracking-tighter text-foreground transition-colors duration-500 ease-out"

const sectionSubtitleClassName =
  "max-w-[28rem] text-left text-[15px] font-normal leading-relaxed text-muted transition-colors duration-500 ease-out sm:text-[16px]"

type LandingNewConsoleSectionProps = {
  headingId?: string
}

/** Copy sits this many lattice rows below the phone's top edge. */
const WALLET_COPY_ROW_START = 3
/** Below this many columns the wallet stacks: copy, then phone. */
const WALLET_MIN_COLS = 12

function StatList({ stats }: { stats: ReadonlyArray<{ value: string; label: string }> }) {
  return (
    <dl className="mt-8 flex flex-row items-start gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 flex-1">
          <dt className="sr-only">{stat.label}</dt>
          <dd className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
            {stat.value}
          </dd>
          <p className="mt-1 text-[12px] leading-snug text-muted">{stat.label}</p>
        </div>
      ))}
    </dl>
  )
}

/**
 * Copy | phone. The phone is an exact 6×13 lattice rectangle at the top of
 * the section; the copy takes every remaining column and starts two rows
 * down. Stacked, both go full width (phone capped at 6 cells, centred).
 */
function WalletCells({ headingId }: { headingId: string }) {
  const { cols, stacked } = useLatticeGrid()
  const phoneCols = Math.min(LATTICE_PHONE_COLS, cols)
  const phoneRows = phoneRowsForCols(phoneCols)
  const copyCols = Math.max(1, cols - phoneCols)

  const copy = (
    <LatticeCell
      cols={copyCols}
      rows={stacked ? "auto" : phoneRows - (WALLET_COPY_ROW_START - 1)}
      rowStart={WALLET_COPY_ROW_START}
      bodyClassName="justify-center"
    >
      <div className={`flex min-w-0 flex-col ${LATTICE_SPACE.inset}`}>
        <LandingNewWalletAssetKicker className={kickerClassName} />
        <h2 id={headingId} className={`mt-3 ${walletTitleClassName}`}>
          <span>{WALLET_CONTENT.title}</span>
          <span className="sr-only"> {WALLET_CONTENT.titleAccent} </span>
          <LandingNewWalletBrandedWord />
          <span>{WALLET_CONTENT.titleLineTwo}</span>
        </h2>
        <p className={`mt-5 ${sectionSubtitleClassName}`}>{WALLET_CONTENT.subtitle}</p>
        <LandingNewWalletSectionActions />
        <StatList stats={WALLET_CONTENT.stats} />
      </div>
    </LatticeCell>
  )

  const phone = (
    <LatticeCell
      cols={phoneCols}
      rows={phoneRows}
      rowStart={1}
      colStart={stacked ? undefined : copyCols + 1}
      style={
        stacked && cols > phoneCols
          ? { gridColumn: `${Math.floor((cols - phoneCols) / 2) + 1} / span ${phoneCols}` }
          : undefined
      }
    >
      <LandingNewWalletShowcase />
    </LatticeCell>
  )

  return stacked ? (
    <>
      {copy}
      {phone}
    </>
  ) : (
    <>
      {phone}
      {copy}
    </>
  )
}

/**
 * Wallet section on the lattice: copy beside the phone showcase.
 */
export function LandingNewConsoleSection({
  headingId = "landing-new-wallet-heading",
}: LandingNewConsoleSectionProps = {}) {
  return (
    <LatticeSection
      aria-labelledby={headingId}
      className="z-20"
      grid
      pad={false}
      // Phone top is the section top; the section above supplies the gap.
      columnClassName={LATTICE_SPACE.sectionBottom}
    >
      <WalletDemoStoreProvider>
        <LatticeGrid minCols={WALLET_MIN_COLS} stroke>
          <WalletCells headingId={headingId} />
        </LatticeGrid>
      </WalletDemoStoreProvider>
    </LatticeSection>
  )
}
