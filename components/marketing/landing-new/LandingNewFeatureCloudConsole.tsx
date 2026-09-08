"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState, type CSSProperties } from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"

const HOLD_MS = 2800
const RESTART_MS = 700
const LINE_PX = 13

const TERMINAL_STYLE_LIGHT = {
  "--terminal-editor-bg": "transparent",
  "--terminal-fg": "#2c2824",
  "--terminal-dim": "#8a847c",
  "--terminal-dimmer": "#b0aaa2",
  "--terminal-white": "#1c1814",
  "--terminal-green": "#3d7a3a",
  "--terminal-teal": "#1a7f79",
} as const

const TERMINAL_STYLE_DARK = {
  "--terminal-editor-bg": "transparent",
  "--terminal-fg": "#e8e4dc",
  "--terminal-dim": "#9a948c",
  "--terminal-dimmer": "#6e6860",
  "--terminal-white": "#f5f2ee",
  "--terminal-green": "#6fbf6a",
  "--terminal-teal": "#4db8b0",
} as const

const MONO: CSSProperties = {
  fontFamily:
    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  WebkitFontSmoothing: "antialiased",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.01em",
}

type LogEntry =
  | { id: string; kind: "cmd"; tool: string; arg: string }
  | { id: string; kind: "kv"; key: string; value: string }
  | { id: string; kind: "status"; extra: string; tag: string }

type Deploy = {
  title: string
  lines: readonly LogEntry[]
}

const DEPLOYS: readonly Deploy[] = [
  {
    title: "aws/eu-west-1",
    lines: [
      { id: "a1", kind: "cmd", tool: "apply", arg: "modules/ryle" },
      { id: "a2", kind: "cmd", tool: "attach", arg: "vpc-0a31" },
      { id: "a3", kind: "cmd", tool: "wrap", arg: "kms/customer" },
      { id: "a4", kind: "kv", key: "admin", value: "you" },
      { id: "a5", kind: "kv", key: "data", value: "you" },
      { id: "a6", kind: "kv", key: "keys", value: "customer-managed" },
      { id: "a7", kind: "status", extra: "apply complete", tag: "[running]" },
    ],
  },
  {
    title: "gcp/europe-west1",
    lines: [
      { id: "g1", kind: "cmd", tool: "apply", arg: "modules/ryle" },
      { id: "g2", kind: "cmd", tool: "attach", arg: "vpc-core" },
      { id: "g3", kind: "cmd", tool: "wrap", arg: "kms/customer" },
      { id: "g4", kind: "kv", key: "admin", value: "you" },
      { id: "g5", kind: "kv", key: "data", value: "you" },
      { id: "g6", kind: "kv", key: "keys", value: "customer-managed" },
      { id: "g7", kind: "status", extra: "apply complete", tag: "[running]" },
    ],
  },
  {
    title: "azure/westeurope",
    lines: [
      { id: "z1", kind: "cmd", tool: "apply", arg: "modules/ryle" },
      { id: "z2", kind: "cmd", tool: "attach", arg: "vnet-prod" },
      { id: "z3", kind: "cmd", tool: "wrap", arg: "keyvault/cmk" },
      { id: "z4", kind: "kv", key: "admin", value: "you" },
      { id: "z5", kind: "kv", key: "data", value: "you" },
      { id: "z6", kind: "kv", key: "keys", value: "customer-managed" },
      { id: "z7", kind: "status", extra: "apply complete", tag: "[running]" },
    ],
  },
]

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function gapBefore(entry: LogEntry) {
  switch (entry.kind) {
    case "cmd":
      return randBetween(280, 620)
    case "kv":
      return randBetween(180, 380)
    case "status":
      return randBetween(420, 720)
  }
}

function CmdRow({ tool, arg }: { tool: string; arg: string }) {
  return (
    <div className="flex items-baseline gap-1.5" style={{ height: LINE_PX }}>
      <span className="text-[9px]" style={{ ...MONO, color: "var(--terminal-teal)" }}>
        ▸ {tool}
      </span>
      <span
        className="min-w-0 truncate text-[9px]"
        style={{ ...MONO, color: "var(--terminal-dim)" }}
      >
        {arg}
      </span>
    </div>
  )
}

function KvRow({ keyName, value }: { keyName: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5" style={{ height: LINE_PX }}>
      <span
        className="w-10 shrink-0 text-[9px]"
        style={{ ...MONO, color: "var(--terminal-dimmer)" }}
      >
        {keyName}
      </span>
      <span
        className="min-w-0 truncate text-[9px]"
        style={{ ...MONO, color: "var(--terminal-white)" }}
      >
        {value}
      </span>
    </div>
  )
}

function StatusRow({ extra, tag }: { extra: string; tag: string }) {
  return (
    <div
      className="flex items-baseline justify-between"
      style={{ height: LINE_PX }}
    >
      <span className="truncate text-[9px]" style={{ ...MONO, color: "var(--terminal-dim)" }}>
        {extra}
      </span>
      <span
        className="shrink-0 text-[9px]"
        style={{ ...MONO, color: "var(--terminal-green)" }}
      >
        {tag}
      </span>
    </div>
  )
}

function LogItem({ entry }: { entry: LogEntry }) {
  switch (entry.kind) {
    case "cmd":
      return <CmdRow tool={entry.tool} arg={entry.arg} />
    case "kv":
      return <KvRow keyName={entry.key} value={entry.value} />
    case "status":
      return <StatusRow extra={entry.extra} tag={entry.tag} />
  }
}

/**
 * Quiet apply log for the cloud-deploy card: terraform-style steps
 * landing in the customer's AWS, GCP, or Azure account.
 */
export function LandingNewFeatureCloudConsole({
  className = "",
}: {
  className?: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const isDark = useMarketingTheme()?.isDark ?? false
  const [deployIndex, setDeployIndex] = useState(0)
  const [count, setCount] = useState(1)

  const deploy = DEPLOYS[deployIndex]
  const lineCount = deploy.lines.length

  useEffect(() => {
    if (reduceMotion) {
      setCount(lineCount)
      return
    }

    setCount(1)
    const timers: number[] = []
    let elapsed = 0
    for (let index = 1; index < lineCount; index += 1) {
      elapsed += gapBefore(deploy.lines[index])
      const nextCount = index + 1
      timers.push(window.setTimeout(() => setCount(nextCount), elapsed))
    }
    timers.push(
      window.setTimeout(
        () => setDeployIndex((current) => (current + 1) % DEPLOYS.length),
        elapsed + HOLD_MS + RESTART_MS,
      ),
    )

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [deploy, lineCount, reduceMotion])

  const visible = deploy.lines.slice(0, reduceMotion ? lineCount : count)

  return (
    <div
      className={`relative h-full min-h-0 w-full overflow-hidden ${className}`}
      aria-label="Apply log deploying Ryle into your cloud"
      style={isDark ? TERMINAL_STYLE_DARK : TERMINAL_STYLE_LIGHT}
    >
      <div
        className="flex h-full flex-col overflow-hidden font-mono text-[9px] leading-none"
        style={{
          background: "var(--terminal-editor-bg)",
          color: "var(--terminal-fg)",
        }}
      >
        <div
          className="flex h-6 shrink-0 items-center text-[9px]"
          style={{ ...MONO, color: "var(--terminal-dim)" }}
        >
          {deploy.title}
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {visible.map((entry) => (
            <motion.div
              key={`${deploy.title}-${entry.id}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: "linear" }}
              style={{ height: LINE_PX }}
            >
              <LogItem entry={entry} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
