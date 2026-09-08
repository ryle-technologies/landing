# The new-landing lattice

Layout system for `/new-landing`. Every visible box edge that should read as
"on the grid" sits on a multiple of 64px. This document explains the model, the
four primitives, and the rules that keep new content aligned without any
per-component snapping code.

Code: `lib/landingLattice.ts` (constants, helpers, tromino field) and
`components/marketing/landing-new/lattice/` (primitives).

## Mental model

Two anchors, nothing else:

- **x origin — the content column.** `.landing-lattice-column` (`app/globals.css`)
  is always a whole number of cells wide and centred:
  `width: min(64rem, round(down, 100% - 2rem, 4rem))`. Cap is 16 cells (1024px),
  minimum gutter 16px. Its left edge *is* lattice column 0, so anything sized in
  cells inside it lands on a line with no measurement.
- **y origin — the lattice root.** `<main data-lattice-root>` in
  `LandingNewHero.tsx` is row 0. Every direct child is a `LatticeSection`, which
  pads its own height up to the next 64px line, so each section top is a row line.

The canvas (`LatticeCanvas`) reads both anchors and paints from them. Tromino
holes come from one shared world field (`latticeWorldCell`) addressed in world
cells, so the canvases in adjacent sections are windows onto the same grid and
never jump at a seam.

Column widths by viewport: 1280+ → 16 cells · 1024 → 15 · 768 → 11 · 390 → 5.

## Primitives

### `LatticeSection`

Full-width wrapper. Paints the canvas behind itself (optional mask), hosts the
column, and adds a spacer so its total height is a cell multiple.

| Prop | Default | Notes |
| --- | --- | --- |
| `grid` | `true` | Paint the lattice canvas. |
| `gridMask` | `"solid"` | `solid` · `fadeTop` · `fadeBottom` · `fadeBoth` · `hero` · or a `linear-gradient(...)` string. |
| `contentFade` | — | `bottom` washes the last six cells so cards and lattice dissolve into the page. |
| `pad` | `true` | Applies `LATTICE_SPACE.sectionY` (`py-16 md:py-32`). Set `false` and pass your own cell-multiple padding via `className`. |
| `snap` | `true` | Round height up to whole cells. |
| `as` | `"section"` | `section` · `div` · `header` · `footer`. |
| `columnClassName` | — | Extra classes on the column. |

### `LatticePlate`

Paper plate for copy that sits directly on the lattice (headings, stats).
Shrink-wraps its content, then rounds width and height **up** to whole cells.
Surface is inset 1px top/left so the lattice stroke stays the frame.
`inset` (default `true`) applies `LATTICE_SPACE.plateInset` (`py-4 md:p-8`).

### `LatticeGrid` / `LatticeCell`

A CSS grid whose tracks are the lattice: `repeat(auto-fill, 64px)` columns and
64px implicit rows. Cells declare their size in cells.

`LatticeGrid` props:

| Prop | Default | Notes |
| --- | --- | --- |
| `minCols` | `16` | Columns the layout needs. With fewer available, every cell spans full width and `colStart`/`rowStart` are ignored. This is the stacking contract — not a Tailwind breakpoint. |
| `indent` | `0` | Push the first row right by N cells when there is room (`minCols + indent`). Cell opts in with `indent`. |
| `stroke` | `false` | Draw the 1px lattice stroke on every cell. |
| `paper` | `= stroke` | Paint the surface under cells so tromino holes never punch a frame. |
| `equalRows` | `false` | All `rows="auto"` cells share the tallest span (one bottom line per row). Off while stacked. |
| `dense` | `false` | `grid-auto-flow: dense` — later cells pack into holes left by shorter neighbors. |

`LatticeCell` props:

| Prop | Default | Notes |
| --- | --- | --- |
| `cols` | `"full"` | Width in cells, clamped to what is available. |
| `rows` | `"auto"` | Height in cells, or measure the content and round up. |
| `minRows` | `1` | Floor for `"auto"`; also the SSR height, so set it close to the real size to avoid a jump. |
| `colStart` / `rowStart` | — | 1-based, desktop only. |
| `bodyClassName` | — | Classes on the body — a `flex flex-col h-full` that fills the cell, so `mt-auto` / `flex-1` / `h-full` work inside. |

Inside a grid, `useLatticeGrid()` exposes `{ cols, stacked }` for layouts that
depend on the live column count (e.g. wallet: phone is 6 cells, copy is
`cols - 6`).

## Adding a section

```tsx
import { LatticeCell, LatticeGrid } from "@/components/marketing/landing-new/lattice/LatticeGrid"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

<LatticeSection aria-labelledby="pricing-heading" grid gridMask="fadeBoth">
  <LatticePlate>
    <p className={kickerClassName}>Pricing</p>
    <h2 id="pricing-heading" className={`${titleClassName} mt-3`}>…</h2>
  </LatticePlate>
  <LatticeGrid className={LATTICE_SPACE.block} minCols={15} stroke equalRows>
    <LatticeCell cols={5} minRows={5}><Card className={LATTICE_SPACE.inset} /></LatticeCell>
    <LatticeCell cols={5} minRows={5}><Card className={LATTICE_SPACE.inset} /></LatticeCell>
    <LatticeCell cols={5} minRows={5}><Card className={LATTICE_SPACE.inset} /></LatticeCell>
  </LatticeGrid>
</LatticeSection>
```

Drop it anywhere between the existing sections in `LandingNewLowerSections.tsx`.
Nothing else needs to change: the column width, section top, plate edges, and
cell edges are all on lines by construction.

## Rules

1. **Every direct child of `<main>` is a `LatticeSection`.** One plain `<div>`
   with an arbitrary height shifts every section below it off the rows. (The
   sticky nav's 25dvh sentinel is absolutely positioned for exactly this reason
   — `sentinelInFlow={false}`.)
2. **Spacing between blocks only from `LATTICE_SPACE`.** `sectionY`, `sectionTop`,
   `sectionBottom`, `block` are whole cells. `mt-10`, `py-24`, `gap-6` between
   lattice boxes break the rhythm. Spacing *inside* a cell or plate is free.
3. **Size in cells, never in pixels or fractions.** `cols={5}`, not
   `md:grid-cols-3` or `w-[320px]`. If a layout needs a specific count, say so
   with `minCols` and let the grid stack below it.
4. **Full-bleed content inside a section** (the carousels) uses
   `landingViewportBleedClassName` and reads its left inset from the enclosing
   `[data-lattice-column]` — see `columnInset()` in `LandingNewProductsCarousel.tsx`.
   Don't hard-code column widths or gutters.
5. **Strokes use `latticeCellStrokeClassName`:** 1px inside the top/left edge,
   1px outside the right/bottom edge. Adjacent cells share one pixel and coincide
   with the canvas lines (drawn at `n + 0.5`). Don't add borders or rings. Put
   the class on a `pointer-events-none absolute inset-0` overlay *above* the
   content (as `LatticeCell` and the carousel tiles do) — an inset shadow on the
   wrapper is painted under any child that has its own background.
6. **Copy inset:** `LATTICE_SPACE.inset` (`p-6 md:p-8`) inside cells;
   `LatticePlate` handles its own. Display type is 72px+ so plates have no
   horizontal inset on the 5-cell mobile column.
7. **Don't put the lattice on `/`.** The shared components
   (`LandingHomeHeroPinContent`, `LandingHomeStickyNav`,
   `LandingHomeBuildingNewBlock`, `LandingFooterSitemap`) take opt-in props
   (`headlinePlate`, `sentinelInFlow`, `sitemapInColumn`, `contentClassName`)
   whose defaults keep the original landing unchanged.
8. **Motion stays on the lattice.** A card may tween between sizes, but every
   rest pose (full cell or the 64×64 block) has edges ≡ 0 (mod 64) from the
   cell origin. Pin the mini block with snapped `top`/`left` in cell multiples
   — never `left: 50%` / `translate(-50%)`, which lands on a half-cell when
   leftover cells are odd.

## Checking alignment

Headless check: load `/new-landing`, take the first `[data-lattice-column]`'s
`left` and `[data-lattice-root]`'s `top` as origins, and assert that every
`LatticeSection` top/bottom, plate rect, `[style*="grid-column"]` cell rect, and
`.landing-new-use-case-card` rect is `≡ 0 (mod 64)` on each side. Do this at
1440, 1280, 1024, 768 and 390. A quick visual: overlay a 64px
`repeating-linear-gradient` positioned at `columnLeft % 64` — no grey page line
should peek out from under it.

If the dev server keeps serving old CSS after editing `globals.css`, clear the
Turbopack cache: stop `pnpm dev`, `rm -rf .next/dev`, start again.
