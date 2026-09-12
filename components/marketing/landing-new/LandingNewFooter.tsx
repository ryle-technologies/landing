"use client"

import type { ReactNode } from "react"
import { LandingFooterRights } from "@/components/marketing/landing/LandingHomeBuildingNewBlock"
import { LandingFooterMarquee } from "@/components/marketing/landing/LandingFooterMarquee"
import { FooterSitemapColumn } from "@/components/marketing/landing/LandingFooterSitemap"
import {
  LatticeCell,
  LatticeGrid,
  useLatticeGrid,
} from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { landingViewportBleedClassName } from "@/lib/landingLayout"
import { LATTICE_SPACE } from "@/lib/landingLattice"
import { FOOTER_DOCS_COLUMNS } from "@/lib/siteNav"

const CELL_PAD =
  "px-4 py-3 md:p-8 [&_ul]:mt-2 [&_ul]:gap-2 md:[&_ul]:mt-3 md:[&_ul]:gap-2.5"

/** Same 5-cell cards as the platform feature row when two fit. */
const FOOTER_CARD_COLS = 5
/** Two columns of 2 cells; 5-cell mobile stays two-up instead of stacking. */
const FOOTER_ROW_MIN_COLS = 4
const FOOTER_CARD_MIN_ROWS = 5
/** Phone two-up: hug the link list instead of matching the 5-row desktop cards. */
const FOOTER_CARD_MIN_ROWS_COMPACT = 3

const FOOTER_MARQUEE_WORDS = ["Issue", "Move", "Lend", "Yours"] as const

function splitAcross(cols: number, parts: number) {
  const base = Math.floor(cols / parts)
  const rem = cols % parts
  return Array.from({ length: parts }, (_, i) => base + (i < rem ? 1 : 0))
}

function footerCardCols(avail: number, index: number) {
  if (avail >= FOOTER_CARD_COLS * 2) return FOOTER_CARD_COLS
  return splitAcross(avail, 2)[index % 2] ?? FOOTER_CARD_COLS
}

function FooterCard({ index, children }: { index: number; children: ReactNode }) {
  const { cols } = useLatticeGrid()
  const cardCols = footerCardCols(cols, index)
  const colStart = index === 0 && cols >= FOOTER_CARD_COLS * 3 + 1 ? 2 : undefined
  const compact = cols < FOOTER_CARD_COLS * 2
  const minRows = compact ? FOOTER_CARD_MIN_ROWS_COMPACT : FOOTER_CARD_MIN_ROWS

  return (
    <LatticeCell cols={cardCols} minRows={minRows} colStart={colStart}>
      {children}
    </LatticeCell>
  )
}

/**
 * Closing sitemap on the lattice: each nav group is a stroked cell, same
 * rhythm as the "One backend" feature cards.
 */
export function LandingNewFooter() {
  return (
    <LatticeSection
      as="footer"
      aria-label="Footer"
      grid
      gridMask="pageEnd"
      pad={false}
      snap={false}
      className={LATTICE_SPACE.sectionTop}
    >
      <nav
        aria-label="Site"
        className={`${landingViewportBleedClassName} md:left-auto md:w-full md:max-w-none md:translate-x-0`}
      >
        <LatticeGrid
          minCols={FOOTER_ROW_MIN_COLS}
          stroke
          className="max-md:![grid-template-columns:repeat(auto-fill,minmax(64px,1fr))]"
        >
          {FOOTER_DOCS_COLUMNS.map((column, index) => (
            <FooterCard key={column.heading} index={index}>
              <FooterSitemapColumn column={column} className={CELL_PAD} />
            </FooterCard>
          ))}
          <FooterCard index={FOOTER_DOCS_COLUMNS.length}>
            <LandingFooterRights orientation="stack" className={CELL_PAD} />
          </FooterCard>
        </LatticeGrid>
      </nav>
      <LandingFooterMarquee
        words={FOOTER_MARQUEE_WORDS}
        size="display"
        className={`${landingViewportBleedClassName} ${LATTICE_SPACE.blockTight}`}
      />
    </LatticeSection>
  )
}
