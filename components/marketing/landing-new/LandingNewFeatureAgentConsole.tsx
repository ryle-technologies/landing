"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState, type CSSProperties } from "react"
import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider"

const WINDOW_TITLE = "projects/main"

const HOLD_MS = 2800
const RESTART_MS = 600
const VISIBLE_LINES = 8
const LINE_PX = 13
const LOG_H = LINE_PX * VISIBLE_LINES

const TERMINAL_STYLE_LIGHT = {
  "--terminal-editor-bg": "transparent",
  "--terminal-border": "rgba(28,24,20,0.1)",
  "--terminal-fg": "#2c2824",
  "--terminal-dim": "#8a847c",
  "--terminal-dimmer": "#b0aaa2",
  "--terminal-vdim": "#c8c2ba",
  "--terminal-white": "#1c1814",
  "--terminal-purple": "#6f4db8",
  "--terminal-green": "#3d7a3a",
  "--terminal-teal": "#1a7f79",
  "--terminal-blue": "#3d5aaa",
  "--terminal-blue-bright": "#3553a3",
  "--terminal-diff-gutter": "#9a9590",
  "--terminal-diff-text": "#2c2824",
  "--terminal-diff-insert-fg": "#2f6b32",
  "--terminal-diff-insert-bg": "#e4efe0",
  "--terminal-diff-delete-fg": "#c23b4e",
  "--terminal-diff-delete-bg": "#f6e2e4",
  "--terminal-panel": "rgba(28,24,20,0.045)",
} as CSSProperties

const TERMINAL_STYLE_DARK = {
  "--terminal-editor-bg": "transparent",
  "--terminal-border": "rgba(245,242,238,0.1)",
  "--terminal-fg": "#e8e4dc",
  "--terminal-dim": "#9a948c",
  "--terminal-dimmer": "#6e6860",
  "--terminal-vdim": "#5a544e",
  "--terminal-white": "#f5f2ee",
  "--terminal-purple": "#a78bfa",
  "--terminal-green": "#6fbf6a",
  "--terminal-teal": "#4db8b0",
  "--terminal-blue": "#7b93d4",
  "--terminal-blue-bright": "#8aa0dc",
  "--terminal-diff-gutter": "#6e6860",
  "--terminal-diff-text": "#e8e4dc",
  "--terminal-diff-insert-fg": "#7dce82",
  "--terminal-diff-insert-bg": "#1c3320",
  "--terminal-diff-delete-fg": "#e87a86",
  "--terminal-diff-delete-bg": "#3a1c20",
  "--terminal-panel": "rgba(245,242,238,0.06)",
} as CSSProperties

const MONO: CSSProperties = {
  fontFamily:
    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  WebkitFontSmoothing: "antialiased",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.01em",
}

type LogEntry =
  | { id: string; kind: "thought"; text: string }
  | { id: string; kind: "edit"; file: string }
  | { id: string; kind: "code"; lineNo: number; variant: "ctx" | "add" | "del"; text: string }
  | { id: string; kind: "prompt"; text: string }
  | { id: string; kind: "thinking" }
  | { id: string; kind: "cmd"; tool: string; arg: string; meta: string }
  | {
      id: string
      kind: "status"
      label: string
      extra: string
      tag: string
      tone: "done" | "run"
    }

const LOG: readonly LogEntry[] = [
  { id: "t1", kind: "thought", text: "Thought for 4.1s" },
  { id: "e1", kind: "edit", file: "src/middleware/auth.ts" },
  {
    id: "c42",
    kind: "code",
    lineNo: 42,
    variant: "ctx",
    text: "export async function handler(req) {",
  },
  {
    id: "c43",
    kind: "code",
    lineNo: 43,
    variant: "add",
    text: "  const token = extractBearer(req);",
  },
  {
    id: "c44",
    kind: "code",
    lineNo: 44,
    variant: "add",
    text: "  if (!token) return unauthorized();",
  },
  {
    id: "c47",
    kind: "code",
    lineNo: 47,
    variant: "del",
    text: "    const session = await getSession(req);",
  },
  {
    id: "c48",
    kind: "code",
    lineNo: 48,
    variant: "add",
    text: "    req.user = payload;",
  },
  { id: "p1", kind: "prompt", text: "Add rate limiting to all API routes." },
  { id: "th1", kind: "thinking" },
  {
    id: "g1",
    kind: "cmd",
    tool: "grep",
    arg: '"rateLimit" src/',
    meta: "no matches",
  },
  {
    id: "r1",
    kind: "cmd",
    tool: "read_file",
    arg: "src/api/routes.ts",
    meta: "42 lines",
  },
  {
    id: "s1",
    kind: "status",
    label: "Scan route handlers",
    extra: "explore",
    tag: "[done]",
    tone: "done",
  },
  { id: "t2", kind: "thought", text: "Thought for 2.8s" },
  { id: "e2", kind: "edit", file: "src/api/routes.ts" },
  {
    id: "c14",
    kind: "code",
    lineNo: 14,
    variant: "ctx",
    text: "export async function handler(req) {",
  },
  {
    id: "c15",
    kind: "code",
    lineNo: 15,
    variant: "add",
    text: "  await rateLimit(req, { max: 100 });",
  },
  {
    id: "c33d",
    kind: "code",
    lineNo: 33,
    variant: "del",
    text: "  if (!data.name) throw Error;",
  },
  {
    id: "c33a",
    kind: "code",
    lineNo: 33,
    variant: "add",
    text: "  return schema.parse(data);",
  },
  { id: "p2", kind: "prompt", text: "Migrate auth from sessions to JWT." },
  { id: "th2", kind: "thinking" },
  {
    id: "r2",
    kind: "cmd",
    tool: "read_file",
    arg: "src/middleware/auth.ts",
    meta: "68 lines",
  },
  {
    id: "g2",
    kind: "cmd",
    tool: "grep",
    arg: '"session" src/',
    meta: "4 matches",
  },
  {
    id: "r3",
    kind: "cmd",
    tool: "read_file",
    arg: "src/lib/jwt.ts",
    meta: "42 lines",
  },
  {
    id: "s2",
    kind: "status",
    label: "Audit auth middleware",
    extra: "explore",
    tag: "[running]",
    tone: "run",
  },
]

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Delay before revealing this entry — jittered so the log does not tick in lockstep. */
function gapBefore(entry: LogEntry) {
  switch (entry.kind) {
    case "thought":
    case "thinking":
      return randBetween(640, 1280)
    case "prompt":
      return randBetween(720, 1400)
    case "code":
      return randBetween(140, 380)
    case "cmd":
      return randBetween(240, 620)
    case "status":
      return randBetween(380, 820)
    default:
      return randBetween(320, 780)
  }
}

function ThinkingDots() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((current) => (current + 1) % 2)
    }, 180)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      aria-hidden
      className="inline-grid grid-cols-2 grid-rows-3 gap-px"
      style={{ verticalAlign: "middle", lineHeight: 0 }}
    >
      {Array.from({ length: 6 }, (_, index) => {
        const lit = phase === 0 ? index < 3 : index >= 3
        return (
          <span
            key={index}
            className="size-0.5 rounded-full"
            style={{
              background: lit ? "var(--terminal-purple)" : "transparent",
            }}
          />
        )
      })}
    </span>
  )
}

function ThoughtRow({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ height: LINE_PX }}
    >
      <span
        className="inline-flex items-center text-[8px]"
        style={{ ...MONO, color: "var(--terminal-purple)" }}
      >
        ◆
      </span>
      <span className="text-[9px]" style={{ ...MONO, color: "var(--terminal-dim)" }}>
        {text}
      </span>
    </div>
  )
}

function EditRow({ file }: { file: string }) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ height: LINE_PX }}
    >
      <span
        className="inline-flex w-2 shrink-0 items-center text-[8px]"
        style={{ ...MONO, color: "var(--terminal-purple)" }}
      >
        ◆
      </span>
      <span
        className="text-[9px] font-bold"
        style={{ ...MONO, color: "var(--terminal-white)" }}
      >
        Edit
      </span>
      <span
        className="min-w-0 truncate text-[9px]"
        style={{ ...MONO, color: "var(--terminal-green)" }}
      >
        {file}
      </span>
    </div>
  )
}

function CodeRow({
  lineNo,
  variant,
  text,
}: {
  lineNo: number
  variant: "ctx" | "add" | "del"
  text: string
}) {
  const insert = variant === "add"
  const remove = variant === "del"
  return (
    <div className="flex items-stretch" style={{ height: LINE_PX }}>
      <span
        className="w-4 shrink-0 pr-1.5 text-left text-[9px]"
        style={{
          ...MONO,
          lineHeight: `${LINE_PX}px`,
          color: insert
            ? "var(--terminal-diff-insert-fg)"
            : remove
              ? "var(--terminal-diff-delete-fg)"
              : "var(--terminal-diff-gutter)",
        }}
      >
        {lineNo}
      </span>
      <div
        className="min-w-0 flex-1 overflow-hidden"
        style={{
          background: insert
            ? "var(--terminal-diff-insert-bg)"
            : remove
              ? "var(--terminal-diff-delete-bg)"
              : "none",
        }}
      >
        <span
          className="block truncate text-[9px] whitespace-pre"
          style={{
            ...MONO,
            lineHeight: `${LINE_PX}px`,
            color: "var(--terminal-diff-text)",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  )
}

function PromptRow({ text }: { text: string }) {
  return (
    <div style={{ height: LINE_PX }}>
      <div
        className="flex h-full items-center gap-1.5 rounded-[2px]"
        style={{
          background: "var(--terminal-panel)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <span
          className="text-[9px]"
          style={{ ...MONO, color: "var(--terminal-blue)" }}
        >
          ❯
        </span>
        <span
          className="min-w-0 truncate text-[9px]"
          style={{ ...MONO, color: "var(--terminal-white)" }}
        >
          {text}
        </span>
      </div>
    </div>
  )
}

function ThinkingRow() {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ height: LINE_PX }}
    >
      <ThinkingDots />
      <span className="text-[9px]" style={{ ...MONO, color: "var(--terminal-dim)" }}>
        Thinking...
      </span>
    </div>
  )
}

function CmdRow({
  tool,
  arg,
  meta,
}: {
  tool: string
  arg: string
  meta: string
}) {
  return (
    <div
      className="flex items-baseline gap-1.5"
      style={{ height: LINE_PX }}
    >
      <span className="text-[9px]" style={{ ...MONO, color: "var(--terminal-teal)" }}>
        ▸ {tool}
      </span>
      <span className="min-w-0 truncate text-[9px]" style={{ ...MONO, color: "var(--terminal-dim)" }}>
        {arg}
      </span>
      <span className="shrink-0 text-[9px]" style={{ ...MONO, color: "var(--terminal-dimmer)" }}>
        {meta}
      </span>
    </div>
  )
}

function StatusRow({
  label,
  extra,
  tag,
  tone,
}: {
  label: string
  extra: string
  tag: string
  tone: "done" | "run"
}) {
  const accent =
    tone === "done" ? "var(--terminal-green)" : "var(--terminal-blue-bright)"
  return (
    <div
      className="flex items-baseline justify-between"
      style={{ height: LINE_PX }}
    >
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="text-[9px]" style={{ ...MONO, color: accent }}>
          |
        </span>
        <span className="truncate text-[9px]" style={{ ...MONO, color: "var(--terminal-dim)" }}>
          {label}
        </span>
        <span className="text-[9px]" style={{ ...MONO, color: "var(--terminal-dimmer)" }}>
          {extra}
        </span>
      </div>
      <span className="shrink-0 text-[9px]" style={{ ...MONO, color: accent }}>
        {tag}
      </span>
    </div>
  )
}

function LogItem({ entry }: { entry: LogEntry }) {
  switch (entry.kind) {
    case "thought":
      return <ThoughtRow text={entry.text} />
    case "edit":
      return <EditRow file={entry.file} />
    case "code":
      return (
        <CodeRow lineNo={entry.lineNo} variant={entry.variant} text={entry.text} />
      )
    case "prompt":
      return <PromptRow text={entry.text} />
    case "thinking":
      return <ThinkingRow />
    case "cmd":
      return <CmdRow tool={entry.tool} arg={entry.arg} meta={entry.meta} />
    case "status":
      return (
        <StatusRow
          label={entry.label}
          extra={entry.extra}
          tag={entry.tag}
          tone={entry.tone}
        />
      )
  }
}

/**
 * x.ai-style agent console for the developers card image well.
 * Header stays put; the log is a fixed 6-line viewport and auto-scrolls.
 */
export function LandingNewFeatureAgentConsole({
  className = "",
}: {
  className?: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const isDark = useMarketingTheme()?.isDark ?? false
  const [count, setCount] = useState(VISIBLE_LINES)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (reduceMotion) {
      setCount(LOG.length)
      return
    }

    setCount(VISIBLE_LINES)

    const timers: number[] = []
    let elapsed = 0
    for (let index = VISIBLE_LINES; index < LOG.length; index += 1) {
      elapsed += gapBefore(LOG[index])
      const nextCount = index + 1
      timers.push(window.setTimeout(() => setCount(nextCount), elapsed))
    }
    const growMs = elapsed

    timers.push(window.setTimeout(() => setCount(VISIBLE_LINES), growMs + HOLD_MS))
    timers.push(
      window.setTimeout(
        () => setCycle((current) => current + 1),
        growMs + HOLD_MS + RESTART_MS,
      ),
    )

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [cycle, reduceMotion])

  const visible = (reduceMotion ? LOG : LOG.slice(0, count)).slice(
    -VISIBLE_LINES,
  )

  return (
    <div
      className={`group/card relative h-full min-h-0 w-full overflow-hidden ${className}`}
      aria-label="Agent console installing and editing files"
      style={isDark ? TERMINAL_STYLE_DARK : TERMINAL_STYLE_LIGHT}
    >
      <div
        className="flex h-full flex-col overflow-hidden font-mono text-[9px] leading-none"
        style={{
          background: "var(--terminal-editor-bg)",
          borderColor: "var(--terminal-border)",
          color: "var(--terminal-fg)",
        }}
      >
        <div
          className="flex h-6 shrink-0 items-center text-[9px]"
          style={{ color: "var(--terminal-dim)" }}
        >
          {WINDOW_TITLE}
        </div>

        <div
          className="shrink-0 overflow-hidden"
          style={{ height: LOG_H }}
        >
          {visible.map((entry) => (
            <motion.div
              key={`${cycle}-${entry.id}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "linear" }}
              style={{ height: LINE_PX }}
            >
              <LogItem entry={entry} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div
          className="absolute -inset-[50%] translate-x-[-100%] group-hover/card:translate-x-[100%] group-hover/card:transition-transform group-hover/card:duration-700 group-hover/card:ease-out"
          style={{
            background:
              "linear-gradient(120deg, transparent 0%, transparent 40%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 52%, transparent 60%, transparent 100%)",
          }}
        />
      </div>
    </div>
  )
}
