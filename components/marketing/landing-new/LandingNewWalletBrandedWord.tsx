import { Allura } from "next/font/google"

const brandedScript = Allura({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

type LandingNewWalletBrandedWordProps = {
  className?: string
}

/**
 * Wallet title accent — Google Fonts cursive. Allura ships Regular only;
 * spacing is tuned so the gap above and below matches the title lines.
 */
export function LandingNewWalletBrandedWord({
  className = "",
}: LandingNewWalletBrandedWordProps) {
  return (
    <span
      aria-hidden
      className={`${brandedScript.className} mt-[0.30em] mb-[0.06em] block w-max max-w-full font-normal text-[1.35em] leading-[0.72] tracking-normal text-[#FF7A1A] ${className}`}
    >
      branded
    </span>
  )
}
