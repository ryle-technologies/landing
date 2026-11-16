"use client"

import { ISSUANCE, SECTION_IDS } from "@/components/marketing/institutional/content"
import { InstitutionalHeading } from "@/components/marketing/institutional/InstitutionalHeading"
import { displayClassName } from "@/components/marketing/institutional/styles"
import { LandingNewLatticeCtaCell } from "@/components/marketing/landing-new/LandingNewLatticeCta"
import {
  LandingNewFeatureCardsCarousel,
  useIsMobileFeatureCarousel,
} from "@/components/marketing/landing-new/LandingNewFeatureCardsCarousel"
import { LatticePlate } from "@/components/marketing/landing-new/lattice/LatticePlate"
import { LatticeSection } from "@/components/marketing/landing-new/lattice/LatticeSection"
import { LATTICE_SPACE } from "@/lib/landingLattice"

const HEADING_ID = "institutional-issuance-heading"

/** Upright serif, a step smaller than the section card titles. Body stays sans. */
const benefitTitleClassName =
  "text-left font-serif text-[18px] font-medium leading-snug tracking-[-0.02em] text-foreground transition-colors duration-500 ease-out sm:text-[20px]"

const benefitBodyClassName =
  "mt-2 text-left text-[14px] font-normal leading-[1.5] text-muted transition-colors duration-500 ease-out sm:text-[15px]"

/** Phone cards are about four cells tall before the carousel measures them. */
const BENEFIT_CARD_MIN_ROWS = 4
/** Same width as a modular-platform card, so the next card peeks by one cell. */
const BENEFIT_CARD_COLS = 5

function BenefitCard({ title, body }: { title: string; body: string }) {
  return (
    <article
      className={`flex h-full min-w-0 flex-col items-start justify-start text-left ${LATTICE_SPACE.inset}`}
    >
      <h3 className={benefitTitleClassName}>{title}</h3>
      <p className={benefitBodyClassName}>{body}</p>
    </article>
  )
}

/**
 * Ryle Issuance on the home: why an institution tokenizes with Ryle, then
 * the properties of the issued asset, in the same sliding cards as
 * "A modular platform" on Client Services.
 */
export function InstitutionalIssuance() {
  const isMobile = useIsMobileFeatureCarousel()
  const cta = (
    <LandingNewLatticeCtaCell
      label={ISSUANCE.cta.label}
      href={ISSUANCE.cta.href}
    />
  )

  return (
    <LatticeSection
      id={SECTION_IDS.issuance}
      aria-labelledby={HEADING_ID}
      grid
      gridMask="fadeTopBottom"
      pad={false}
      className={`${LATTICE_SPACE.sectionTop} pb-16`}
    >
      <LatticePlate fill flushLeft>
        <InstitutionalHeading
          id={HEADING_ID}
          className={displayClassName}
          lines={ISSUANCE.titleLines}
          accent={ISSUANCE.titleAccent}
          end="?"
          accentUnderline={false}
        />
      </LatticePlate>
      <LandingNewFeatureCardsCarousel
        ariaLabel="Why tokenize with Ryle"
        prevLabel="Previous reason"
        nextLabel="Next reason"
        blockTight={false}
        rounded
        chevronPosition={isMobile ? "above" : "below"}
        belowStart={isMobile ? undefined : cta}
        cardCols={BENEFIT_CARD_COLS}
        minRows={BENEFIT_CARD_MIN_ROWS}
        items={ISSUANCE.benefits.map((benefit) => (
          <BenefitCard
            key={benefit.title}
            title={benefit.title}
            body={benefit.body}
          />
        ))}
      />
      {isMobile ? cta : null}
    </LatticeSection>
  )
}
