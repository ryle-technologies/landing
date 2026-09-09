"use client"

import type { ReactNode } from "react"

interface AvatarProps {
  name: string
  /** Rendered inside the tile instead of initials when `src` is unset. */
  tileIcon?: ReactNode
  /** Photo URL; when set, image is shown instead of icon/initial. */
  src?: string
  alt?: string
  shape?: "default" | "circle"
  filled?: boolean
  ghost?: boolean
  ghostFill?: "surface" | "background"
  ghostEdge?: "default" | "soft"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  border?: boolean
  ringBackground?: boolean
  initials?: string
  /** Slightly darker than page background, no shadow or ring (inline lists). */
  plain?: boolean
  className?: string
}

function initialsFromName(name: string): string {
  const t = name.trim()
  if (!t) return "?"
  return (t.startsWith("@") ? t.charAt(1) : t.charAt(0)).toUpperCase()
}

export function Avatar({
  name,
  tileIcon,
  src,
  alt,
  shape = "default",
  filled = false,
  ghost = false,
  ghostFill = "surface",
  ghostEdge = "default",
  size = "md",
  border = false,
  ringBackground = false,
  initials: initialsOverride,
  plain = false,
  className = "",
}: AvatarProps) {
  const trimmedOverride = initialsOverride?.trim() ?? ""
  const initial =
    trimmedOverride.length > 0 ? trimmedOverride : initialsFromName(name)
  const dim =
    size === "xs"
      ? "w-6 h-6 text-[11px]"
      : size === "sm"
        ? "w-8 h-8 text-sm"
        : size === "lg"
          ? "w-10 h-10 text-[15px]"
          : size === "xl"
            ? "w-14 h-14 text-[18px]"
            : "w-9 h-9 text-[14px]"
  const radius =
    size === "xs" ? 6 : size === "sm" ? 8 : size === "lg" ? 14 : size === "xl" ? 20 : 11
  const isCircle = shape === "circle"
  const radiusCss = isCircle ? "9999px" : `${radius}px`
  const bg = plain
    ? "bg-avatar-bg text-foreground"
    : ghost
      ? ghostFill === "background"
        ? "bg-background text-foreground"
        : "bg-surface text-foreground"
      : filled
        ? "bg-foreground text-background"
        : "bg-avatar-bg text-muted"
  const borderClass = [
    border && !plain ? "ring-1 ring-border-strong" : "",
    ringBackground && !plain ? "ring-2 ring-background" : "",
  ]
    .filter(Boolean)
    .join(" ")

  const showImage = src != null && src.length > 0
  const useAvatarBgGradient = !showImage && !ghost && !filled && tileIcon == null

  const shadowStyle =
    showImage && ghost
      ? { borderRadius: radiusCss, boxShadow: "none" }
      : plain || !ghost
        ? {
            borderRadius: radiusCss,
            backgroundImage: useAvatarBgGradient
              ? "var(--avatar-bg-gradient)"
              : undefined,
          }
        : {
            borderRadius: radiusCss,
            boxShadow:
              ghostEdge === "soft"
                ? "var(--avatar-ghost-edge-soft)"
                : "var(--card-shadow)",
          }

  const roundedClass = isCircle ? "overflow-hidden rounded-full" : "overflow-hidden"
  const tileBg = showImage
    ? ghost
      ? ghostFill === "background"
        ? "bg-background"
        : "bg-surface"
      : "bg-muted"
    : bg

  return (
    <div
      className={`${dim} ${tileBg} ${borderClass} ${roundedClass} flex items-center justify-center shrink-0 font-medium ${className}`.trim()}
      style={shadowStyle}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- small local preset avatar
        <img
          src={src}
          alt={alt ?? name}
          className="avatar-photo h-full w-full object-cover"
          draggable={false}
        />
      ) : tileIcon != null ? (
        tileIcon
      ) : (
        <span className="font-medium leading-none">{initial}</span>
      )}
    </div>
  )
}
