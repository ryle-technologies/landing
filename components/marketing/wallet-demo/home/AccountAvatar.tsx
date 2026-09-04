"use client"

import { Bitcoin, DollarSign, Euro } from "lucide-react"
import { Avatar } from "@/components/marketing/wallet-demo/ui/Avatar"
import type { AccountKind } from "@/lib/walletDemo/types"

const TILE_ICON_PX = 18

const ICONS = {
  euros: Euro,
  dolares: DollarSign,
  crypto: Bitcoin,
} as const

/** Ghost tile with the account currency icon (home header + switcher rows). */
export function AccountAvatar({
  kind,
  displayName,
}: {
  kind: AccountKind
  displayName: string
}) {
  const Icon = ICONS[kind]
  return (
    <Avatar
      name={displayName}
      size="lg"
      ghost
      ghostFill="surface"
      ghostEdge="soft"
      tileIcon={
        <Icon size={TILE_ICON_PX} strokeWidth={1.75} className="shrink-0" aria-hidden />
      }
    />
  )
}
