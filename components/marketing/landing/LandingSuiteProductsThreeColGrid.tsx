import type { ReactNode } from "react"
import {
  LANDING_HOME_SUITE_PRODUCTS_GRID_ID,
  landingMarketingDotGridLayerClassName,
  landingMarketingLineHatchFadeLeftClassName,
} from "@/lib/landingLayout"

type LandingSuiteProductsThreeColGridProps = {
  assetsColumn: ReactNode
  accountsColumn: ReactNode
  disclosureColumn: ReactNode
  /**
   * Suite panel at **row 3 / col 1** (desktop): policy / permissions card above the
   * developers wide block.
   */
  policyColumn?: ReactNode
  /**
   * Fourth suite panel: from `md+`, single 1/3-width square at **row 1 / col 3**
   * (top-right corner of the grid, opposite assets). Stacks below assets on small screens.
   */
  networksSuiteColumn?: ReactNode
  /**
   * Fifth suite panel: from `md+`, **2/3-width** block at **row 4 / cols 1–2**
   * (bottom-left, under the staircase). Stacks last on small screens.
   */
  developersColumn?: ReactNode
}

/**
 * Suite grid. On `md+`, real CSS grid with **3 equal columns** and **4 rows** —
 * a diagonal staircase, a square in the top-right, and a wide block in the
 * bottom-left:
 *  – Row 1 / Col 1 → assets
 *  – Row 1 / Col 2 → decorative dot field (desktop only)
 *  – Row 1 / Col 3 → networks (optional)
 *  – Row 2 / Col 1 → decorative 45° hatch (desktop only; fade right→left)
 *  – Row 2 / Col 2 → accounts
 *  – Row 3 / Col 1 → policy (optional)
 *  – Row 3 / Col 3 → disclosure
 *  – Row 4 / Cols 1–2 → developers (optional)
 *
 * Below `md` the cards stack in source order (assets, row 1 / col 2 hidden, networks,
 * accounts, policy, disclosure, developers) with horizontal dividers.
 */
export function LandingSuiteProductsThreeColGrid({
  assetsColumn,
  accountsColumn,
  disclosureColumn,
  policyColumn,
  networksSuiteColumn,
  developersColumn,
}: LandingSuiteProductsThreeColGridProps) {
  return (
    <div
      id={LANDING_HOME_SUITE_PRODUCTS_GRID_ID}
      className="mt-24 flex min-w-0 flex-col divide-y divide-border sm:mt-28 md:grid md:grid-cols-3 md:items-stretch md:gap-0 md:divide-y-0 lg:mt-32"
    >
      <div className="min-w-0 md:col-start-1 md:row-start-1 md:flex md:h-full md:min-h-0 md:flex-col">
        {assetsColumn}
      </div>
      <div
        aria-hidden
        className="hidden min-w-0 bg-[var(--marketing-surface)] md:col-start-2 md:row-start-1 md:block md:h-full md:min-h-0 md:relative md:overflow-hidden md:rounded-md"
      >
        <span aria-hidden className={landingMarketingDotGridLayerClassName} />
      </div>
      {networksSuiteColumn ? (
        <div className="min-w-0 md:col-start-3 md:row-start-1 md:flex md:h-full md:min-h-0 md:flex-col">
          {networksSuiteColumn}
        </div>
      ) : null}
      <div
        aria-hidden
        className="hidden min-w-0 bg-[var(--marketing-surface)] md:col-start-1 md:row-start-2 md:block md:h-full md:min-h-0 md:self-stretch md:relative md:overflow-hidden md:rounded-md"
      >
        <span className={landingMarketingLineHatchFadeLeftClassName} />
      </div>
      <div className="min-w-0 md:col-start-2 md:row-start-2">
        {accountsColumn}
      </div>
      {policyColumn ? (
        <div className="min-w-0 md:col-start-1 md:row-start-3 md:flex md:h-full md:min-h-0 md:flex-col">
          {policyColumn}
        </div>
      ) : null}
      <div className="min-w-0 md:col-start-3 md:row-start-3">
        {disclosureColumn}
      </div>
      {developersColumn ? (
        <div className="min-w-0 md:col-span-2 md:col-start-1 md:row-start-4">
          {developersColumn}
        </div>
      ) : null}
    </div>
  )
}
