import {
  landingFooterSitemapContentClassName,
  landingFooterSitemapMaxWidthClass,
} from "@/lib/landingLayout"
import {
  FOOTER_DOCS_COLUMNS,
  landingMarketingCtaAnchorProps,
  type FooterNavColumn,
  type FooterNavLink,
} from "@/lib/siteNav"

const footerLinkClassName =
  "text-[15px] font-normal leading-snug tracking-[-0.01em] text-muted underline-offset-2 transition-colors duration-500 ease-out hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

const footerHeadingClassName =
  "text-xs font-medium tracking-[-0.01em] text-muted/65 transition-colors duration-500 ease-out"

function FooterNavAnchor({ link }: { link: FooterNavLink }) {
  const externalProps =
    link.external === true ? landingMarketingCtaAnchorProps(link.href) : {}

  return (
    <a href={link.href} className={footerLinkClassName} {...externalProps}>
      {link.label}
    </a>
  )
}

export function FooterSitemapColumn({
  column,
  className = "",
}: {
  column: FooterNavColumn
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className}`.trim()}>
      {column.headingHref ? (
        <a
          href={column.headingHref}
          className={`${footerHeadingClassName} hover:text-foreground`}
        >
          {column.heading}
        </a>
      ) : (
        <p className={footerHeadingClassName}>{column.heading}</p>
      )}
      <ul className="mt-3 flex flex-col gap-2.5">
        {column.links.map((link) => (
          <li key={link.href}>
            <FooterNavAnchor link={link} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Curated docs sitemap grid for the landing footer closing block. */
export function LandingFooterSitemap({
  contentClassName = landingFooterSitemapContentClassName,
  innerClassName = landingFooterSitemapMaxWidthClass,
}: {
  /** Outer column (defaults to the marketing column + gutters). */
  contentClassName?: string
  /** Inner width cap (defaults to `max-w-4xl`). */
  innerClassName?: string
} = {}) {
  return (
    <div className="w-full pb-18 pt-24 sm:pb-22 sm:pt-28">
      <nav aria-label="Footer" className="w-full">
      <div className={contentClassName}>
        <div className={`w-full min-w-0 ${innerClassName}`}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
            {FOOTER_DOCS_COLUMNS.map((column) => (
              <FooterSitemapColumn key={column.heading} column={column} />
            ))}
          </div>
        </div>
      </div>
      </nav>
    </div>
  )
}
