"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useId, useRef, useState } from "react"
import {
  landingHeroPrimaryCtaClassName,
  landingMarketingOutlineCtaClassName,
} from "@/lib/landingHeroTypography"
import {
  landingMarketingCtaAnchorProps,
  LANDING_MARKETING_CONTACT_HREF,
  SITE_NAV_CTA_LABEL,
  type SiteNavLink,
} from "@/lib/siteNav"

const focusRingClassName =
  "focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"

const inlineLinkClassName = [
  "inline-flex items-center whitespace-nowrap text-[14px] font-medium leading-none tracking-[-0.01em] no-underline",
  "hover:text-foreground",
  focusRingClassName,
].join(" ")

const menuLinkClassName = [
  "flex h-11 items-center rounded-xl px-3 text-[15px] font-medium leading-none tracking-[-0.01em] text-foreground no-underline",
  "hover:bg-foreground/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground",
].join(" ")

const MENU_EASE = [0.22, 1, 0.36, 1] as const

function isCurrentPage(pathname: string, href: string) {
  return !href.includes("#") && pathname === href
}

type LandingSiteNavProps = {
  links: readonly SiteNavLink[]
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

/**
 * Right-hand side of the marketing bars: section links inline from `md`, a
 * "Menu" popover below it, and the contact pill at every width.
 */
export function LandingSiteNav({
  links,
  ctaLabel = SITE_NAV_CTA_LABEL,
  ctaHref = LANDING_MARKETING_CONTACT_HREF,
  className = "",
}: LandingSiteNavProps) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`relative flex shrink-0 items-center gap-x-3 md:gap-x-7 ${className}`}
    >
      <ul className="hidden items-center gap-x-6 md:flex lg:gap-x-7">
        {links.map((link) => {
          const current = isCurrentPage(pathname, link.href)
          return (
            <li key={link.href} className="flex">
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`${inlineLinkClassName} ${
                  current ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`${landingMarketingOutlineCtaClassName} md:hidden`}
      >
        Menu
      </button>
      <a
        href={ctaHref}
        className={landingHeroPrimaryCtaClassName}
        {...landingMarketingCtaAnchorProps(ctaHref)}
      >
        {ctaLabel}
      </a>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            key="menu"
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
            }
            transition={{ duration: 0.18, ease: MENU_EASE }}
            className="absolute top-[calc(100%+0.625rem)] right-0 z-50 w-60 origin-top-right rounded-2xl bg-[var(--surface)] p-2 shadow-[0_12px_32px_rgba(20,18,16,0.12),inset_0_0_0_1px_var(--border)] md:hidden"
          >
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={
                      isCurrentPage(pathname, link.href) ? "page" : undefined
                    }
                    className={menuLinkClassName}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
