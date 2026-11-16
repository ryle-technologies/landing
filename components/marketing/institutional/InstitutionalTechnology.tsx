"use client"

import type { ReactNode } from "react"
import { SECTION_IDS, TECHNOLOGY } from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import {
  InstitutionalDisclosureDemo,
  InstitutionalInstrumentRules,
} from "@/components/marketing/institutional/InstitutionalModuleVisuals"
import {
  cardBodyClassName,
  cardTitleClassName,
  displayClassName,
  kickerClassName,
  monoLabelBaseClassName,
  monoLabelClassName,
  sectionLeadClassName,
} from "@/components/marketing/institutional/styles"
import { LandingHomeOrbitNetworkNames } from "@/components/marketing/landing/LandingHomeOrbitNetworkNames"
import { LandingNewFeatureChainSnap } from "@/components/marketing/landing-new/LandingNewFeatureChainSnap"
import { LandingNewFeatureEventConsole } from "@/components/marketing/landing-new/LandingNewFeatureEventConsole"
import { LandingNewWalletShowcase } from "@/components/marketing/landing-new/LandingNewWalletShowcase"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { WalletDemoStoreProvider } from "@/components/marketing/wallet-demo/WalletDemoStoreProvider"
import { LATTICE_SPACE, phoneRowsForCols } from "@/lib/landingLattice"
import { LANDING_FEATURE_SNAP_STAGGER_MS } from "@/lib/landingSnapMotion"

const HEADING_ID = "institutional-technology-heading"
const PLATFORM_HEADING_ID = "institutional-technology-platform"
const WALLET_HEADING_ID = "institutional-technology-wallet"

/**
 * Three layouts off one grid:
 * - bento (`BENTO_MIN_COLS`+): 2×2 modules beside a wallet column;
 * - split (`SPLIT_MIN_COLS`+): 2×2 modules, then wallet copy beside the phone;
 * - stacked: one column.
 */
const SPLIT_MIN_COLS = 10
const BENTO_MIN_COLS = 14

const LABEL_ROWS = 1
const MODULE_ROWS = 6
const MODULE_STACKED_MIN_ROWS = 5
const WALLET_COLS = 4
const PHONE_ROWS = phoneRowsForCols(WALLET_COLS)
/** Bento wallet copy: label + copy + phone = label + two module rows. */
const WALLET_COPY_ROWS = 2 * MODULE_ROWS - PHONE_ROWS

const CARD_MASK = "bg-[var(--marketing-surface)]"

/** Every module visual sits in the same 128px slot, pinned to its bottom. */
const visualSlotClassName = "flex h-32 w-full min-w-0 flex-col justify-end"

function SettlementVisual() {
  return (
    <>
      <div className="min-w-0 overflow-hidden">
        <LandingNewFeatureChainSnap maskClassName={CARD_MASK} />
      </div>
      <LandingHomeOrbitNetworkNames
        snap
        className="mt-4 min-w-0 font-mono text-[10px] uppercase leading-snug tracking-wide text-foreground/40"
      />
    </>
  )
}

const MODULES: readonly {
  key: keyof typeof TECHNOLOGY.modules
  visual: ReactNode
}[] = [
  { key: "issuance", visual: <InstitutionalInstrumentRules /> },
  { key: "settlement", visual: <SettlementVisual /> },
  { key: "privacy", visual: <InstitutionalDisclosureDemo /> },
  {
    key: "operations",
    visual: (
      <LandingNewFeatureEventConsole snapDelayMs={LANDING_FEATURE_SNAP_STAGGER_MS} />
    ),
  },
]

/** One-row cell that names the product the cells below belong to. */
function ProductLabel({
  id,
  name,
  note,
}: {
  id: string
  name: string
  note: string
}) {
  return (
    <div className="flex h-full min-w-0 items-center justify-between gap-4 px-6 md:px-8">
      <h3 id={id} className={`${monoLabelBaseClassName} text-foreground`}>
        {name}
      </h3>
      <span className={monoLabelClassName}>{note}</span>
    </div>
  )
}

function ModuleCard({
  title,
  body,
  visual,
}: {
  title: string
  body: string
  visual: ReactNode
}) {
  return (
    <article className={`flex h-full min-w-0 flex-col ${LATTICE_SPACE.inset}`}>
      <h4 className={cardTitleClassName}>{title}</h4>
      <p className={`${cardBodyClassName} mt-2`}>{body}</p>
      <div className="mt-auto w-full min-w-0 pt-6">
        <div className={visualSlotClassName}>{visual}</div>
      </div>
    </article>
  )
}

function WalletCopy({ compact }: { compact: boolean }) {
  const { wallet } = TECHNOLOGY
  return (
    <div
      className={`flex min-w-0 flex-col ${compact ? "p-6" : LATTICE_SPACE.inset}`}
    >
      <h4
        className={
          compact
            ? "text-left font-serif text-[20px] font-medium leading-[1.25] tracking-[-0.02em] text-foreground"
            : cardTitleClassName
        }
      >
        {wallet.title}
      </h4>
      <p
        className={
          compact
            ? "mt-1.5 text-left text-[14px] font-normal leading-[1.5] text-muted"
            : `${cardBodyClassName} mt-2 max-w-[22rem]`
        }
      >
        {wallet.body}
      </p>
    </div>
  )
}

function TechnologyCells() {
  const { cols, stacked } = useLatticeGrid()
  const bento = cols >= BENTO_MIN_COLS
  const { platform, wallet, modules } = TECHNOLOGY

  // Modules take the columns left of the wallet (bento) or the whole grid.
  const moduleArea = bento ? cols - WALLET_COLS : cols
  const leftCols = Math.ceil(moduleArea / 2)
  const rightCols = moduleArea - leftCols
  const walletStart = cols - WALLET_COLS + 1
  const modulesTop = LABEL_ROWS + 1
  const walletLabelRow = bento ? 1 : modulesTop + 2 * MODULE_ROWS
  const walletTop = walletLabelRow + LABEL_ROWS

  return (
    <>
      <LatticeCell
        cols={moduleArea}
        rows={LABEL_ROWS}
        colStart={1}
        rowStart={1}
      >
        <ProductLabel
          id={PLATFORM_HEADING_ID}
          name={platform.name}
          note={platform.note}
        />
      </LatticeCell>
      {MODULES.map((module, index) => {
        const column = index % 2
        const row = Math.floor(index / 2)
        return (
          <LatticeCell
            key={module.key}
            cols={column === 0 ? leftCols : rightCols}
            rows={stacked ? "auto" : MODULE_ROWS}
            minRows={MODULE_STACKED_MIN_ROWS}
            colStart={column === 0 ? 1 : leftCols + 1}
            rowStart={modulesTop + row * MODULE_ROWS}
          >
            <ModuleCard
              title={modules[module.key].title}
              body={modules[module.key].body}
              visual={module.visual}
            />
          </LatticeCell>
        )
      })}
      <LatticeCell
        cols={bento ? WALLET_COLS : "full"}
        rows={LABEL_ROWS}
        colStart={bento ? walletStart : 1}
        rowStart={walletLabelRow}
      >
        <ProductLabel id={WALLET_HEADING_ID} name={wallet.name} note={wallet.note} />
      </LatticeCell>
      <LatticeCell
        cols={bento ? WALLET_COLS : Math.max(1, cols - WALLET_COLS)}
        rows={stacked ? "auto" : bento ? WALLET_COPY_ROWS : PHONE_ROWS}
        colStart={bento ? walletStart : 1}
        rowStart={walletTop}
        bodyClassName="justify-center"
      >
        <WalletCopy compact={bento} />
      </LatticeCell>
      {stacked ? (
        // A stacked cell is always full width; the nested grid keeps the
        // phone at its own four cells.
        <LatticeCell cols="full" rows={PHONE_ROWS} paper={false} stroke={false}>
          <LatticeGrid minCols={1} className="h-full">
            <LatticeCell
              cols={Math.min(WALLET_COLS, cols)}
              rows={PHONE_ROWS}
              stroke
              paper
            >
              <LandingNewWalletShowcase />
            </LatticeCell>
          </LatticeGrid>
        </LatticeCell>
      ) : (
        <LatticeCell
          cols={WALLET_COLS}
          rows={PHONE_ROWS}
          colStart={walletStart}
          rowStart={bento ? walletTop + WALLET_COPY_ROWS : walletTop}
        >
          <LandingNewWalletShowcase />
        </LatticeCell>
      )}
    </>
  )
}

/**
 * Technology: the four Ryle Platform modules, each with a live panel, beside
 * Ryle Wallet. One stroked grid, so the two products read as one system.
 */
export function InstitutionalTechnology() {
  return (
    <LatticeSection
      id={SECTION_IDS.technology}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTopBottom"
    >
      <LatticePlate fill>
        <p className={kickerClassName}>{TECHNOLOGY.kicker}</p>
        <InstitutionalHeading
          id={HEADING_ID}
          className={`${displayClassName} mt-3 md:mt-4`}
          lines={TECHNOLOGY.titleLines}
          accent={TECHNOLOGY.titleAccent}
        />
        <p className={`${sectionLeadClassName} mt-5 max-w-[34rem] md:mt-6`}>
          {TECHNOLOGY.sub}
        </p>
      </LatticePlate>
      <WalletDemoStoreProvider>
        <LatticeGrid
          className={LATTICE_SPACE.blockTight}
          minCols={SPLIT_MIN_COLS}
          stroke
        >
          <TechnologyCells />
        </LatticeGrid>
      </WalletDemoStoreProvider>
    </LatticeSection>
  )
}
