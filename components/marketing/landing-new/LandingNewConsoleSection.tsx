"use client"

import { LandingNewPillarsHeading } from "@/components/marketing/landing-new/LandingNewPillarsHeading"
import { LandingNewWalletAssetKicker } from "@/components/marketing/landing-new/LandingNewWalletAssetKicker"
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

const WALLET_HEADING_PREFIX = "Deploy your own"
const WALLET_HEADING_ACCENT = "wallet in minutes"

const WALLET_CONTENT = {
  subtitle:
    "Give customers a place to hold, send, and receive. Fully branded, inside the app they already use.",
} as const

const kickerClassName =
  "font-mono text-xs uppercase tracking-wide text-muted transition-colors duration-500 ease-out"

const sectionSubtitleClassName =
  "max-w-[28rem] text-left text-[15px] font-normal leading-relaxed text-muted transition-colors duration-500 ease-out sm:text-[16px]"

type LandingNewConsoleSectionProps = {
  headingId?: string
}

/** Copy sits this many lattice rows below the phone's top edge. */
const WALLET_COPY_ROW_START = 3
/** Below this many columns the wallet stacks: copy, then phone. */
const WALLET_MIN_COLS = 12
/** Stacked phone: 4 cells inside the column. The first cell is the action spine. */
const WALLET_STACKED_PHONE_COLS = 4
const WALLET_STACKED_RAIL_COLS = 1

/**
 * Copy | phone. The phone is an exact 6×13 lattice rectangle at the top of
 * the section; the copy takes every remaining column and starts two rows
 * down. Below 12 columns (viewport < 800px) the device is 4 cells, with
 * the action chips in the first cell as a 90° spine at the top.
 */
function WalletCells({ headingId }: { headingId: string }) {
  const { cols, stacked } = useLatticeGrid()
  const phoneCols = stacked
    ? Math.min(WALLET_STACKED_PHONE_COLS, cols)
    : Math.min(LATTICE_PHONE_COLS, cols)
  const phoneRows = phoneRowsForCols(phoneCols)
  const copyCols = Math.max(1, cols - Math.ceil(phoneCols))

  const copy = (
    <LatticeCell
      cols={copyCols}
      rows={stacked ? "auto" : phoneRows - (WALLET_COPY_ROW_START - 1)}
      rowStart={WALLET_COPY_ROW_START}
      bodyClassName="justify-center"
    >
      <div className={`flex min-w-0 flex-col ${LATTICE_SPACE.inset}`}>
        <LandingNewWalletAssetKicker className={kickerClassName} />
        <div className="mt-3">
          <LandingNewPillarsHeading
            headingId={headingId}
            prefix={WALLET_HEADING_PREFIX}
            accent={WALLET_HEADING_ACCENT}
          />
        </div>
        <p className={`mt-5 ${sectionSubtitleClassName}`}>{WALLET_CONTENT.subtitle}</p>
        {stacked ? null : <LandingNewWalletSectionActions />}
      </div>
    </LatticeCell>
  )

  if (stacked) {
    return (
      <>
        {copy}
        <LatticeCell cols="full" rows={phoneRows} paper={false} stroke={false}>
          <LatticeGrid minCols={1} className="h-full">
            <LatticeCell
              cols={WALLET_STACKED_RAIL_COLS}
              rows={phoneRows}
              paper={false}
              stroke={false}
              bodyClassName="items-center justify-start"
            >
              <LandingNewWalletSectionActions variant="spine" />
            </LatticeCell>
            <LatticeCell
              cols={Math.min(WALLET_STACKED_PHONE_COLS, Math.max(1, cols - WALLET_STACKED_RAIL_COLS))}
              rows={phoneRows}
              stroke
              paper
            >
              <LandingNewWalletShowcase />
            </LatticeCell>
          </LatticeGrid>
        </LatticeCell>
      </>
    )
  }

  return (
    <>
      <LatticeCell
        cols={phoneCols}
        rows={phoneRows}
        rowStart={1}
        colStart={copyCols + 1}
      >
        <LandingNewWalletShowcase />
      </LatticeCell>
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
