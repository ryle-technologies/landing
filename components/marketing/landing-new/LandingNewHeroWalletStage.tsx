import { WalletDemo } from "@/components/marketing/wallet-demo/WalletDemo"

/**
 * Hero visual: the interactive wallet demo on a soft "desk" panel. Height
 * tracks the viewport so the phone reads at a natural size on every screen.
 */
export function LandingNewHeroWalletStage() {
  return (
    <section
      aria-label="Interactive wallet demo"
      className="relative w-full min-w-0 overflow-hidden rounded-[28px] border border-border bg-surface-tint transition-colors duration-500 ease-out"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, var(--hero-skin-tint) 14%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex w-full items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="h-[min(78svh,760px)] w-full min-h-[520px]">
          <WalletDemo />
        </div>
      </div>
    </section>
  )
}
