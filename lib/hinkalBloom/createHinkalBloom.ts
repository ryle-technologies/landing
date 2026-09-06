import { BLOOM_GRID } from "@/lib/hinkalBloom/bloomGrid"
import { NODE_LOGOS } from "@/lib/hinkalBloom/nodeLogos"

/**
 * Canvas engine ported from the hinkal.io hero ("Universal Privacy for
 * stablecoins"). Kept structurally close to the original so the two can be
 * diffed; only typing, teardown and an offscreen pause were added.
 *
 * What it does:
 * - Renders the dot-matrix bloom from {@link BLOOM_GRID} with pre-rendered
 *   sprites, a radial vignette and top/bottom fades (cached to a static layer).
 * - Repels cells away from the pointer (eased, following).
 * - Places six wallet-logo "nodes" (3 per side). Hovering one (or the first
 *   auto-fire after `autoDelay`) plays a transaction: amount pill → flies along a
 *   bézier arc with a dashed trail → absorbed into a cream wallet block on the
 *   bloom → blurred `***` pill → flies to a seat on a hidden ellipse → cyan
 *   shield block → drain → fade.
 */

/**
 * Every colour the engine paints. Defaults are the hinkal.io navy-stage palette;
 * `LandingNewPrivacyCard` swaps in Ryle tokens per marketing theme.
 */
export type HinkalPalette = {
  /** Solid matrix cell (`B`) fill and the cross drawn inside it. */
  block: string
  blockInk: string
  /** Anti-aliased edge glyphs (`x`, `9`, `1`, `/`). */
  glyph: string
  /** Accent edge glyphs (`X`, `8`, `i`) and the accent block (`L`) fill. */
  glyphAccent: string
  accentBlock: string
  /** Cell a shielded block has "landed" on (`G`). */
  landedBg: string
  landedFg: string
  /** Amount / `***` speech pill. */
  pill: string
  pillInk: string
  /** Source block (wallet mark) and its glow / trail, rgb triplet for the latter. */
  walletBlock: string
  walletInk: string
  walletGlow: string
  /** Destination block (shield mark) and its glow / trail, rgb triplet for the latter. */
  shield: string
  shieldInk: string
  shieldGlow: string
  /** Halo behind wallet-logo nodes, rgb triplet. */
  nodeGlow: string
  /** Empty lattice square the disc sits on (same size as `block`, no cross). */
  grid: string
}

export const HINKAL_DEFAULT_PALETTE: HinkalPalette = {
  block: "#F2DCB3",
  blockInk: "#14142e",
  glyph: "#DEE1F1",
  glyphAccent: "#8FD9A8",
  accentBlock: "#B8B8FF",
  landedBg: "#1B2C24",
  landedFg: "#A9E3BE",
  pill: "#FBFAF6",
  pillInk: "#14142e",
  walletBlock: "#F2DCB3",
  walletInk: "#14142e",
  walletGlow: "242,220,179",
  shield: "#A5E9F4",
  shieldInk: "#14142e",
  shieldGlow: "165,233,244",
  nodeGlow: "255,255,255",
  grid: "rgba(242,220,179,0.08)",
}

export type HinkalBloomOptions = {
  /** CSS `font-family` list for the pill / glyph text. Defaults to JetBrains Mono. */
  monoFontFamily?: string
  palette?: Partial<HinkalPalette>
}

export type HinkalBloomHandle = {
  destroy: () => void
  /** Swap colours and re-rasterise sprites (theme change). */
  setPalette: (palette: Partial<HinkalPalette>) => void
}

/*
 * Sizes tagged "ref px" are in a reference stage of `refW`×`refH` and scale by
 * `K` (= actual cell size / reference cell size). The reference is the ~520px
 * wide column stage the shape is rendered in on the landing page.
 */
const CFG = {
  refW: 520,
  refH: 620,
  speed: 1.6875,
  ringW: 130,
  ringH: 105,
  /** Ring (shield-block seats) centre, ref px below the shape centre. Centred in the disc. */
  ringY: 0,
  /** Lift the whole shape (and ring) above the stage centre, ref px. */
  shapeShiftY: 0,
  showRing: false,
  seatLift: 10,
  seatNudge: [
    { up: 3, out: 0 },
    { up: 24, out: 0 },
    { up: 30, out: 9 },
  ],
  walletGap: 1.6,
  walletNudge: [
    { up: 0, in: 0 },
    { up: -12, in: 40 },
    { up: 9, in: 0 },
  ],
  background: true,
  /** Fraction of empty lattice squares left undrawn (stable per cell). */
  gridSkip: 0.3,
  repel: true,
  repelRadius: 90,
  repelPush: 18,
  repelEase: 0.18,
  repelFollow: 0.1,
  fadeBottom: 1.4,
  fadeTop: 1.2,
  fadeTopMin: 0.55,
  fadeVignette: 0.35,
  /** Radial vignette centre/scale in shape-bbox units. Centred, gentle falloff. */
  vignetteCx: 0.5,
  vignetteCy: 0.5,
  vignetteSx: 1.15,
  vignetteSy: 1.15,
  /** Max horizontal distance from a wallet node to the shape edge, ref px. */
  nodeReach: 250,
  /** Fraction of the stage's shorter side the grid spans. */
  logoScale: 1.12,
  blockScale: 2.15,
  amountBlur: 3.2,
  tipInset: 2.4,
  bow: 0.26,
  nodeSize: 48,
  hitScale: 2.0,
  nodeGap: 40,
  nodeInset: [16, 0, 8],
  nodeRest: 0,
  nodeClear: 10,
  autoDelay: 1.5,
  tNodeWake: 0.4,
  wiggleDeg: 2.2,
  wiggleBob: 1.6,
  wiggleRate: 0.7666667,
  amounts: ["$2,450.00", "$18,900.00", "$740.00", "$56,200.00", "$1,275.00"],
  tAmountOut: 0.96,
  tHold1: 0.31,
  tFly1: 1.91,
  tAbsorb1: 0.62,
  tShieldedOut: 0.96,
  tHold2: 0.31,
  tFly2: 1.91,
  tAbsorb2: 0.62,
  fadeStart: 0.0,
  shrinkBias: 0.55,
  trailAlpha: 0.9,
  trailWidth: 0.19,
  trailPitch: 0.5,
  trailLife: 1.6,
  tDrain: 1.6,
  blockIn: 0.62,
  tWalletOut: 1.05,
  tDstOut: 1.05,
  tGap: 0.9,
} as const

type Cell = { i: number; j: number; type: string; lv: number }
type Pt = [number, number]
type Node = {
  id: string
  idx: number
  side: 0 | 1
  x: number
  y: number
  wCell: Cell
  dPt: Pt
  wig: number
  wake: number
  hot: boolean
  busy: boolean
  spent: boolean
}
type TrailPt = { x: number; y: number; t: number; leg: 0 | 1 }
type Tx = {
  sx: number
  sy: number
  wx: number
  wy: number
  dx: number
  dy: number
  node: Node
  amount: string
  c1x: number
  c1y: number
  c2x: number
  c2y: number
  phase: number
  p: number
  age: number
  trail: TrailPt[]
}
type Bubble = { cv: HTMLCanvasElement; w: number; h: number; bw: number; bh: number }
type TxState = {
  tx: Tx
  wA: number
  wS: number
  dA: number
  dS: number
  bs: Bubble
  bx: number
  by: number
  bA: number
  bS: number
  tailSide: number
}

const PHASES = [
  "nodeWake",
  "amountOut",
  "hold1",
  "fly1",
  "absorb1",
  "shieldedOut",
  "hold2",
  "fly2",
  "absorb2",
  "drain",
  "dstOut",
  "gap",
] as const
type Phase = (typeof PHASES)[number]
const DUR: Record<Phase, number> = {
  nodeWake: CFG.tNodeWake,
  amountOut: CFG.tAmountOut,
  hold1: CFG.tHold1,
  fly1: CFG.tFly1,
  absorb1: CFG.tAbsorb1,
  shieldedOut: CFG.tShieldedOut,
  hold2: CFG.tHold2,
  fly2: CFG.tFly2,
  absorb2: CFG.tAbsorb2,
  drain: CFG.tDrain,
  dstOut: CFG.tDstOut,
  gap: CFG.tGap,
}
const at = (n: Phase) => PHASES.indexOf(n)

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const smooth = (t: number) => {
  t = clamp(t, 0, 1)
  return t * t * (3 - 2 * t)
}
const backOut = (t: number) => {
  t = clamp(t, 0, 1)
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = (u: number, a: number, b: number) => {
    const v = 1 - u
    return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u
  }
  const dx = (u: number, a: number, b: number) => {
    const v = 1 - u
    return 3 * v * v * a + 6 * v * u * (b - a) + 3 * u * u * (1 - b)
  }
  return (t: number) => {
    t = clamp(t, 0, 1)
    let u = t
    for (let k = 0; k < 6; k++) {
      const e = cx(u, x1, x2) - t
      const d = dx(u, x1, x2)
      if (Math.abs(e) < 1e-5 || d === 0) break
      u -= e / d
    }
    return cx(clamp(u, 0, 1), y1, y2)
  }
}
const springOut = cubicBezier(0.34, 1.56, 0.64, 1.0)
const blockSpring = cubicBezier(0.34, 1.8, 0.64, 1.0)
const flyEase = cubicBezier(0.0, 0.0, 0.58, 1.0)
const bez = (a: number, b: number, c: number, e: number) => {
  const u = 1 - e
  return u * u * a + 2 * u * e * b + e * e * c
}

const VIGNETTE: ReadonlyArray<readonly [number, number]> = [
  [0.18, 1],
  [0.4, 0.88],
  [0.62, 0.44],
  [0.82, 0.14],
  [0.96, 0],
]
function vignetteAt(u: number, v: number) {
  const nx = (u - CFG.vignetteCx) / CFG.vignetteSx
  const ny = (v - CFG.vignetteCy) / CFG.vignetteSy
  const r = Math.hypot(nx, ny)
  if (r <= VIGNETTE[0][0]) return 1
  for (let k = 1; k < VIGNETTE.length; k++) {
    const a = VIGNETTE[k - 1]
    const b = VIGNETTE[k]
    if (r <= b[0]) return a[1] + (b[1] - a[1]) * ((r - a[0]) / (b[0] - a[0]))
  }
  return 0
}

export function createHinkalBloom(
  cv: HTMLCanvasElement,
  options: HinkalBloomOptions = {},
): HinkalBloomHandle {
  const ctx = cv.getContext("2d")
  const host = cv.parentElement
  if (!ctx || !host) return { destroy: () => {}, setPalette: () => {} }

  const MONO = options.monoFontFamily ?? '"JetBrains Mono", monospace'
  let PAL: HinkalPalette = { ...HINKAL_DEFAULT_PALETTE, ...options.palette }
  const COLS = BLOOM_GRID.cols
  const ROWS = BLOOM_GRID.rows

  const logoImgs = NODE_LOGOS.map((L) => {
    const im = new Image()
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(L.svg)
    return im
  })

  let W = 0
  let H = 0
  let DPR = 1
  let P = 0
  let OX = 0
  let OY = 0
  let K = 1
  let cells: Cell[] = []
  const map: Record<string, Cell> = {}
  let sprites: Record<string, HTMLCanvasElement> | null = null
  let gridSprite: HTMLCanvasElement | null = null
  let statik: HTMLCanvasElement | null = null
  let bubbleSprite: Bubble | null = null
  let clearSprites: Record<string, Bubble> = {}
  let nodes: Node[] = []
  let autoT = 0
  let autoFired = false
  let T = 0
  let mouseX = 0
  let mouseY = 0
  let mouseIn = false
  let repX = 0
  let repY = 0
  let repAmt = 0
  let repSeen = false
  let visBB = { i0: 0, i1: 0, j0: 0, j1: 0 }
  let outerCells: Cell[] = []
  const txs: Tx[] = []
  let last = 0
  let raf = 0
  let running = true
  let destroyed = false

  function buildCells() {
    cells = []
    for (const k of Object.keys(map)) delete map[k]
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const type = BLOOM_GRID.types[j][i]
        if (type === "/" || type === " ") continue
        const lv = parseInt(BLOOM_GRID.levels[j][i], 16) / 15
        const c: Cell = { i, j, type, lv }
        cells.push(c)
        map[i + ":" + j] = c
      }
    }
    let i0 = 1e9
    let i1 = -1e9
    let j0 = 1e9
    let j1 = -1e9
    for (const c of cells) {
      if (c.i < i0) i0 = c.i
      if (c.i > i1) i1 = c.i
      if (c.j < j0) j0 = c.j
      if (c.j > j1) j1 = c.j
    }
    visBB = { i0, i1, j0, j1 }
    const B = cells.filter((c) => c.type === "B")
    const vx = (visBB.i0 + visBB.i1) / 2
    const vy = (visBB.j0 + visBB.j1) / 2
    let rmax = 0
    for (const c of B) {
      const r = Math.hypot(c.i - vx, c.j - vy)
      if (r > rmax) rmax = r
    }
    outerCells = B.filter((c) => {
      const r = Math.hypot(c.i - vx, c.j - vy)
      return r > rmax * 0.6 && r < rmax * 0.92
    })
    if (!outerCells.length) outerCells = B.slice()
  }

  function ringSeat(side: 0 | 1, k: number): Pt {
    const a = (side ? 300 + k * 60 : 240 - k * 60 + 360) % 360
    const r = (a * Math.PI) / 180
    const lift = k === 2 ? CFG.seatLift : 0
    const n = CFG.seatNudge[k] ?? { up: 0, out: 0 }
    return [
      W / 2 + ((CFG.ringW / 2) * Math.cos(r) + (side ? n.out : -n.out)) * K,
      CY() + (CFG.ringY + (CFG.ringH / 2) * Math.sin(r) - lift - n.up) * K,
    ]
  }

  /** Vertical centre of the shape in canvas px (stage centre lifted by `shapeShiftY`). */
  const CY = () => H / 2 - CFG.shapeShiftY * K

  const xy = (a: { i: number; j: number }): Pt => [OX + (a.i + 0.5) * P, OY + (a.j + 0.5) * P]

  function makeSprites() {
    if (!P) return
    const dpr = DPR
    const E = Math.ceil(P * 2 * dpr)
    const mk = (draw: (g: CanvasRenderingContext2D) => void) => {
      const s = document.createElement("canvas")
      s.width = E
      s.height = E
      const g = s.getContext("2d")!
      g.scale(dpr, dpr)
      g.translate(E / dpr / 2, E / dpr / 2)
      g.textAlign = "center"
      g.textBaseline = "middle"
      draw(g)
      return s
    }
    const box = P * 0.8
    const rad = Math.max(2, P * 0.13)
    const rr = (g: CanvasRenderingContext2D) => {
      const h = box / 2
      g.beginPath()
      g.moveTo(-h + rad, -h)
      g.arcTo(h, -h, h, h, rad)
      g.arcTo(h, h, -h, h, rad)
      g.arcTo(-h, h, -h, -h, rad)
      g.arcTo(-h, -h, h, -h, rad)
      g.closePath()
    }
    const cross = box * 0.27
    const crossIn = (g: CanvasRenderingContext2D, col: string) => {
      g.strokeStyle = col
      g.lineWidth = Math.max(1.3, P * 0.1)
      g.lineCap = "round"
      g.beginPath()
      g.moveTo(-cross, -cross)
      g.lineTo(cross, cross)
      g.moveTo(cross, -cross)
      g.lineTo(-cross, cross)
      g.stroke()
    }
    const mono = (k: number) => "700 " + P * k + "px " + MONO
    const glyph = (chr: string, color: string, k?: number) =>
      mk((g) => {
        g.fillStyle = color
        g.font = mono(k ?? 0.62)
        g.fillText(chr, 0, P * 0.03)
      })
    const GREEN = PAL.glyphAccent
    const LIGHT = PAL.glyph
    const LAV = PAL.accentBlock
    gridSprite = mk((g) => {
      rr(g)
      g.fillStyle = PAL.grid
      g.fill()
    })
    sprites = {
      B: mk((g) => {
        rr(g)
        g.fillStyle = PAL.block
        g.fill()
        crossIn(g, PAL.blockInk)
      }),
      G: mk((g) => {
        rr(g)
        g.fillStyle = PAL.landedBg
        g.fill()
        g.fillStyle = PAL.landedFg
        g.font = mono(0.62)
        g.fillText("X", 0, P * 0.03)
      }),
      L: mk((g) => {
        rr(g)
        g.fillStyle = LAV
        g.fill()
        g.fillStyle = PAL.blockInk
        g.font = mono(0.66)
        g.fillText("+", 0, P * 0.02)
      }),
      l: glyph("+", LAV, 0.66),
      X: glyph("X", GREEN),
      x: glyph("X", LIGHT),
      "8": glyph("8", GREEN),
      "9": glyph("8", LIGHT),
      i: glyph("1", GREEN),
      "1": glyph("1", LIGHT),
      "/": glyph("/", LIGHT, 0.5),
    }
    makeBubbleSprite()
    makeStatic()
  }

  function makeBubbleSprite() {
    bubbleSprite = makeBubble("***", true)
    clearSprites = {}
    for (const a of CFG.amounts) clearSprites[a] = makeBubble(a, false)
  }

  function makeBubble(text: string, blur: boolean): Bubble {
    const fpx = Math.max(11, P * 0.66)
    const probe = document.createElement("canvas").getContext("2d")!
    probe.font = "700 " + fpx + "px " + MONO
    const glyphs = blur ? text.split("") : null
    const adv = glyphs ? probe.measureText(text[0]).width : 0
    const tw = glyphs ? adv * glyphs.length : probe.measureText(text).width
    const w = tw + fpx * 1.6
    const h = fpx * 2.05
    const pad = Math.ceil((blur ? CFG.amountBlur * K * 3 : 0) + 4)
    const cw = Math.ceil((w + pad * 2) * DPR)
    const ch = Math.ceil((h + pad * 2) * DPR)
    const s = document.createElement("canvas")
    s.width = cw
    s.height = ch
    const g = s.getContext("2d")!
    g.scale(DPR, DPR)
    g.translate(w / 2 + pad, h / 2 + pad)
    const r = h / 2
    g.beginPath()
    g.moveTo(-w / 2 + r, -h / 2)
    g.arcTo(w / 2, -h / 2, w / 2, h / 2, r)
    g.arcTo(w / 2, h / 2, -w / 2, h / 2, r)
    g.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r)
    g.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r)
    g.closePath()
    g.fillStyle = PAL.pill
    g.fill()
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.font = "700 " + fpx + "px " + MONO
    if (blur) {
      try {
        g.filter = "blur(" + CFG.amountBlur * K + "px)"
      } catch {
        // canvas filters unsupported (older Safari): the pill renders unblurred.
      }
    }
    g.fillStyle = PAL.pillInk
    if (glyphs) {
      for (let i = 0; i < glyphs.length; i++) {
        g.fillText(glyphs[i], -tw / 2 + adv * (i + 0.5), fpx * 0.16)
      }
    } else {
      g.fillText(text, 0, fpx * 0.16)
    }
    g.filter = "none"
    return { cv: s, w: w + pad * 2, h: h + pad * 2, bw: w, bh: h }
  }

  function cellFade(c: Cell) {
    const bw = visBB.i1 - visBB.i0 + 1
    const bh = visBB.j1 - visBB.j0 + 1
    const u = (c.i - visBB.i0 + 0.5) / bw
    const v = (c.j - visBB.j0 + 0.5) / bh
    let a = 1 - (1 - vignetteAt(u, v)) * CFG.fadeVignette
    const fb = visBB.j1 - c.j
    if (fb < CFG.fadeBottom) a *= smooth((fb + 0.35) / CFG.fadeBottom)
    const ft = c.j - visBB.j0
    if (ft < CFG.fadeTop) {
      a *= CFG.fadeTopMin + (1 - CFG.fadeTopMin) * smooth((ft + 0.35) / CFG.fadeTop)
    }
    return clamp(a, 0, 1)
  }

  function makeStatic() {
    if (!P || !sprites) return
    const s = document.createElement("canvas")
    s.width = Math.round(W * DPR)
    s.height = Math.round(H * DPR)
    const g = s.getContext("2d")!
    g.setTransform(DPR, 0, 0, DPR, 0, 0)
    g.save()
    clipDisc(g)
    if (CFG.background) drawGrid(g)
    for (const c of cells) {
      if (c.type === "B" && gridSkipped(c.i, c.j)) continue
      const spr = sprites[c.type]
      if (!spr) continue
      g.globalAlpha = clamp(c.type === "/" ? c.lv * 0.55 : c.lv * 1.12, 0, 1) * cellFade(c)
      if (g.globalAlpha < 0.004) continue
      const p = xy(c)
      const sz = P * 2
      g.drawImage(spr, p[0] - sz / 2, p[1] - sz / 2, sz, sz)
    }
    g.restore()
    featherDisc(g)
    g.globalAlpha = 1
    statik = s
  }

  /** Radius of the circular mask, in canvas px — the disc bbox plus a cell of padding. */
  function discRadius() {
    const bw = (visBB.i1 - visBB.i0 + 1) * P
    const bh = (visBB.j1 - visBB.j0 + 1) * P
    return Math.max(bw, bh) * 0.5 + P * 0.35
  }

  function clipDisc(g: CanvasRenderingContext2D) {
    g.beginPath()
    g.arc(W / 2, CY(), discRadius(), 0, Math.PI * 2)
    g.clip()
  }

  /** Soften the last ~12% of the circle so the mask doesn't cut cells as a hard edge. */
  function featherDisc(g: CanvasRenderingContext2D) {
    const r = discRadius()
    const cx = W / 2
    const cy = CY()
    g.save()
    g.globalCompositeOperation = "destination-in"
    const grd = g.createRadialGradient(cx, cy, r * 0.86, cx, cy, r)
    grd.addColorStop(0, "#fff")
    grd.addColorStop(1, "rgba(255,255,255,0)")
    g.fillStyle = grd
    g.fillRect(0, 0, W, H)
    g.restore()
  }

  /** Empty lattice squares (same size as `B`) filling the stage around the disc. */
  function drawGrid(g: CanvasRenderingContext2D) {
    if (!gridSprite || !P) return
    const sz = P * 2
    const i0 = Math.floor(-OX / P) - 1
    const i1 = Math.ceil((W - OX) / P) + 1
    const j0 = Math.floor(-OY / P) - 1
    const j1 = Math.ceil((H - OY) / P) + 1
    g.globalAlpha = 1
    for (let j = j0; j < j1; j++) {
      for (let i = i0; i < i1; i++) {
        if (map[i + ":" + j]) continue
        if (gridSkipped(i, j)) continue
        g.drawImage(gridSprite, OX + (i + 0.5) * P - sz / 2, OY + (j + 0.5) * P - sz / 2, sz, sz)
      }
    }
  }

  function gridSkipped(i: number, j: number) {
    const hsh = ((i * 73856093) ^ (j * 19349663)) >>> 0
    return hsh % 100 < Math.round(CFG.gridSkip * 100)
  }

  function resize() {
    const r = host!.getBoundingClientRect()
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = r.width
    H = r.height
    if (!W || !H) return
    cv.width = Math.round(W * DPR)
    cv.height = Math.round(H * DPR)
    P = Math.min(W / COLS, H / ROWS) * 0.92 * CFG.logoScale
    const PREF = Math.min(CFG.refW / COLS, CFG.refH / ROWS) * 0.92 * CFG.logoScale
    K = P / PREF
    OX = W / 2 - ((visBB.i0 + visBB.i1) / 2 + 0.5) * P
    OY = CY() - ((visBB.j0 + visBB.j1) / 2 + 0.5) * P
    layoutNodes()
    makeSprites()
  }

  function layoutNodes() {
    const S = CFG.nodeSize * K
    const half = S / 2
    const lEdge = OX + visBB.i0 * P
    const rEdge = OX + (visBB.i1 + 1) * P
    const free = Math.min(lEdge, W - rEdge)
    const minGap = half + P * 0.4
    const gap = clamp(
      Math.max(free * 0.5, free - CFG.nodeReach * K),
      minGap,
      Math.max(minGap, free - half - P * 0.2),
    )
    const lx = gap
    const rx = W - gap
    const step = Math.min(S + CFG.nodeGap * K, Math.max(S, H / 2 - half - P * 0.4))
    const cy = CY()
    const prev: Record<string, Node> = {}
    for (const n of nodes) prev[n.id] = n
    nodes = []
    const vx = (visBB.i0 + visBB.i1) / 2
    const wnOf = (k: number) => CFG.walletNudge[k] ?? { up: 0, in: 0 }
    const seatPx = (c: Cell, k: number, s: 0 | 1): Pt => {
      const p = xy(c)
      const wn = wnOf(k)
      return [p[0] + (s ? -wn.in : wn.in) * K, p[1] - wn.up * K]
    }
    const minSep = P * CFG.blockScale * CFG.walletGap
    const leftCand = outerCells.filter((c) => c.i <= vx)
    const leftSeats: Cell[] = []
    const taken: Pt[] = []
    for (let k = 0; k < 3; k++) {
      const tj = (cy + (k - 1) * step - OY) / P - 0.5
      const score = (c: Cell) => Math.abs(c.j - tj) - 0.25 * (vx - c.i)
      let best: Cell | null = null
      let bs = 1e9
      let relaxed: Cell | null = null
      let rs = 1e9
      for (const c of leftCand.length ? leftCand : outerCells) {
        const d = score(c)
        if (d < rs) {
          rs = d
          relaxed = c
        }
        const p = seatPx(c, k, 0)
        if (taken.some((t) => Math.hypot(p[0] - t[0], p[1] - t[1]) < minSep)) continue
        if (d < bs) {
          bs = d
          best = c
        }
      }
      const chosen = (best ?? relaxed)!
      leftSeats.push(chosen)
      taken.push(seatPx(chosen, k, 0))
    }
    for (let s = 0 as 0 | 1; s < 2; s = (s + 1) as 0 | 1) {
      for (let k = 0; k < 3; k++) {
        const id = (s ? "r" : "l") + k
        const idx = s * 3 + k
        const o = prev[id]
        const inset = (CFG.nodeInset[k] ?? 0) * K
        const side = outerCells.filter((c) => (s ? c.i >= vx : c.i <= vx))
        const cand = side.length ? side : outerCells
        let wCell: Cell
        if (s === 0) {
          wCell = leftSeats[k]
        } else {
          const lc = leftSeats[k]
          const ti = 2 * vx - lc.i
          const tj = lc.j
          let best: Cell | null = null
          let bd = 1e9
          for (const c of cand) {
            const d = Math.hypot(c.i - ti, c.j - tj)
            if (d < bd) {
              bd = d
              best = c
            }
          }
          wCell = best ?? lc
        }
        nodes.push({
          id,
          idx,
          side: s,
          x: s ? rx - inset : lx + inset,
          y: cy + (k - 1) * step,
          wCell,
          dPt: ringSeat(s, k),
          wig: idx * 1.7,
          wake: o ? o.wake : 0,
          hot: false,
          busy: o ? o.busy : false,
          spent: o ? o.spent : false,
        })
      }
    }
  }

  function blockPath(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    rad: number,
    squareCorner: number,
  ) {
    const h = s / 2
    const r = [rad, rad, rad, rad]
    if (squareCorner >= 0) r[squareCorner] = 0
    g.beginPath()
    g.moveTo(x - h + r[0], y - h)
    g.lineTo(x + h - r[1], y - h)
    if (r[1]) g.arcTo(x + h, y - h, x + h, y - h + r[1], r[1])
    else g.lineTo(x + h, y - h)
    g.lineTo(x + h, y + h - r[2])
    if (r[2]) g.arcTo(x + h, y + h, x + h - r[2], y + h, r[2])
    else g.lineTo(x + h, y + h)
    g.lineTo(x - h + r[3], y + h)
    if (r[3]) g.arcTo(x - h, y + h, x - h, y + h - r[3], r[3])
    else g.lineTo(x - h, y + h)
    g.lineTo(x - h, y - h + r[0])
    if (r[0]) g.arcTo(x - h, y - h, x - h + r[0], y - h, r[0])
    else g.lineTo(x - h, y - h)
    g.closePath()
  }

  function walletMark(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
    const h = s / 2
    const rad = s * 0.24
    g.save()
    g.beginPath()
    g.moveTo(x - h + rad, y - h)
    g.arcTo(x + h, y - h, x + h, y + h, rad)
    g.arcTo(x + h, y + h, x - h, y + h, rad)
    g.arcTo(x - h, y + h, x - h, y - h, rad)
    g.arcTo(x - h, y - h, x + h, y - h, rad)
    g.closePath()
    g.fillStyle = PAL.walletInk
    g.fill()
    g.globalCompositeOperation = "destination-out"
    g.beginPath()
    g.arc(x + h * 0.74, y, s * 0.21, 0, 6.283)
    g.fill()
    g.restore()
  }

  function shieldMark(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
    const w = s * 0.8
    const hh = s * 0.88
    const top = y - hh / 2
    g.beginPath()
    g.moveTo(x - w / 2, top + hh * 0.1)
    g.quadraticCurveTo(x - w / 2, top, x - w * 0.22, top)
    g.lineTo(x + w * 0.22, top)
    g.quadraticCurveTo(x + w / 2, top, x + w / 2, top + hh * 0.1)
    g.lineTo(x + w / 2, top + hh * 0.52)
    g.quadraticCurveTo(x + w / 2, top + hh * 0.88, x, top + hh)
    g.quadraticCurveTo(x - w / 2, top + hh * 0.88, x - w / 2, top + hh * 0.52)
    g.closePath()
    g.fillStyle = PAL.shieldInk
    g.fill()
    const dw = w * 0.36
    const dh = Math.max(1.6, s * 0.08)
    const my = top + hh * 0.44
    g.fillStyle = PAL.shield
    g.beginPath()
    g.moveTo(x - dw / 2, my - dh / 2)
    g.arcTo(x + dw / 2, my - dh / 2, x + dw / 2, my + dh / 2, dh / 2)
    g.arcTo(x + dw / 2, my + dh / 2, x - dw / 2, my + dh / 2, dh / 2)
    g.arcTo(x - dw / 2, my + dh / 2, x - dw / 2, my - dh / 2, dh / 2)
    g.arcTo(x - dw / 2, my - dh / 2, x + dw / 2, my - dh / 2, dh / 2)
    g.closePath()
    g.fill()
  }

  const tailTip = (bs: Bubble, bS: number, side: number, bx: number, by: number): Pt => [
    bx + side * ((bs.bw * bS) / 2 - bs.bh * bS * 0.1 + bs.bh * bS * 0.42),
    by,
  ]

  function pushTrail(tx: Tx, x: number, y: number, leg: 0 | 1) {
    const n = tx.trail.length
    if (!n || Math.hypot(x - tx.trail[n - 1].x, y - tx.trail[n - 1].y) > P * 0.16) {
      tx.trail.push({ x, y, t: tx.age, leg })
    }
  }

  function newTx(node: Node): Tx {
    const sx = node.x
    const sy = node.y
    const [wx0, wy0] = xy(node.wCell)
    const wn = CFG.walletNudge[node.idx % 3] ?? { up: 0, in: 0 }
    const wx = wx0 + (node.side ? -wn.in : wn.in) * K
    const wy = wy0 - wn.up * K
    const [dx, dy] = node.dPt
    const side = node.side ? 1 : -1
    const arc = (ax: number, ay: number, bx: number, by: number): Pt => {
      const d = Math.hypot(bx - ax, by - ay) || 1
      const nx = -(by - ay) / d
      const ny = (bx - ax) / d
      const bow = d * CFG.bow * side
      return [(ax + bx) / 2 + nx * bow, (ay + by) / 2 + ny * bow]
    }
    const c1 = arc(sx, sy, wx, wy)
    const c2 = arc(wx, wy, dx, dy)
    return {
      sx,
      sy,
      wx,
      wy,
      dx,
      dy,
      node,
      amount: CFG.amounts[(Math.random() * CFG.amounts.length) | 0],
      c1x: c1[0],
      c1y: c1[1],
      c2x: c2[0],
      c2y: c2[1],
      phase: 0,
      p: 0,
      age: 0,
      trail: [],
    }
  }

  function fire(node: Node | null) {
    if (!node || node.busy || node.spent) return
    node.busy = true
    node.spent = true
    txs.push(newTx(node))
  }

  function step(dt: number) {
    T += dt
    if (CFG.repel) {
      const target = mouseIn ? 1 : 0
      const d = dt / Math.max(0.001, CFG.repelEase)
      repAmt = target > repAmt ? Math.min(target, repAmt + d) : Math.max(target, repAmt - d)
      const f = CFG.repelFollow > 0 ? Math.min(1, dt / CFG.repelFollow) : 1
      repX += (mouseX - repX) * f
      repY += (mouseY - repY) * f
    }
    if (!autoFired && nodes.length) {
      autoT += dt
      if (autoT >= CFG.autoDelay) {
        autoFired = true
        fire(nodes[0])
      }
    }
    const d = dt / CFG.tNodeWake
    for (const n of nodes) {
      const target = n.busy || (n.hot && !n.spent) ? 1 : 0
      n.wake = target > n.wake ? Math.min(target, n.wake + d) : Math.max(target, n.wake - d)
    }
    for (let k = txs.length - 1; k >= 0; k--) {
      const tx = txs[k]
      tx.age += dt
      tx.p += dt / (DUR[PHASES[tx.phase]] ?? 0.5)
      while (tx.p >= 1) {
        tx.p -= 1
        tx.phase++
        if (tx.phase >= PHASES.length) {
          tx.node.busy = false
          txs.splice(k, 1)
          break
        }
      }
      if (tx.node.busy && tx.phase >= at("dstOut")) tx.node.busy = false
    }
  }

  function pickNode(mx: number, my: number) {
    const r = (CFG.nodeSize * CFG.hitScale * K) / 2
    for (const n of nodes) if (Math.hypot(mx - n.x, my - n.y) <= r) return n
    return null
  }

  const onPointerMove = (e: PointerEvent) => {
    const b = cv.getBoundingClientRect()
    const mx = e.clientX - b.left
    const my = e.clientY - b.top
    const hit = pickNode(mx, my)
    for (const n of nodes) n.hot = n === hit
    if (hit) fire(hit)
    if (CFG.repel && P) {
      const pad = CFG.repelRadius * K
      mouseX = mx
      mouseY = my
      mouseIn =
        mx > OX + visBB.i0 * P - pad &&
        mx < OX + (visBB.i1 + 1) * P + pad &&
        my > OY + visBB.j0 * P - pad &&
        my < OY + (visBB.j1 + 1) * P + pad
      if (!repSeen) {
        repX = mx
        repY = my
        repSeen = true
      }
    }
  }
  const onPointerLeave = () => {
    for (const n of nodes) n.hot = false
    mouseIn = false
  }

  function drawNodes() {
    if (!nodes.length || !sprites) return
    const NS = CFG.nodeSize * K
    for (const n of nodes) {
      if (n.wake <= 0.002) continue
      const g = CFG.nodeRest + (1 - CFG.nodeRest) * backOut(n.wake)
      const s = NS * g
      const w = 2 * Math.PI * CFG.wiggleRate * T + n.wig
      const rot = ((CFG.wiggleDeg * Math.PI) / 180) * Math.sin(w) * n.wake
      const bob = CFG.wiggleBob * K * Math.sin(w * 0.63 + 1.1) * n.wake
      ctx!.save()
      ctx!.globalAlpha = clamp(n.wake * 1.5, 0, 1)
      ctx!.translate(n.x, n.y + bob)
      ctx!.rotate(rot)
      const L = NODE_LOGOS[n.idx]
      const im = logoImgs[n.idx]
      if (im && im.complete && im.naturalWidth) {
        ctx!.shadowColor = "rgba(" + (PAL.nodeGlow || L.glow) + "," + (0.18 + 0.34 * n.wake) + ")"
        ctx!.shadowBlur = 48 * K * Math.min(1, g)
        ctx!.drawImage(im, -s / 2, -s / 2, s, s)
      }
      ctx!.restore()
    }
    ctx!.globalAlpha = 1
  }

  const repelOn = () => CFG.repel && repAmt > 0.001 && !!sprites

  function drawPattern() {
    if (!sprites || !P) return
    const R = CFG.repelRadius * K
    const push = Math.min(CFG.repelPush * K, R * 0.55) * repAmt
    const sz = P * 2
    for (const c of cells) {
      if (c.type === "B" && gridSkipped(c.i, c.j)) continue
      const spr = sprites[c.type]
      if (!spr) continue
      const p = xy(c)
      let ox = 0
      let oy = 0
      const dx = p[0] - repX
      const dy = p[1] - repY
      const d = Math.hypot(dx, dy)
      if (d < R) {
        const f = smooth(1 - d / R)
        if (d > 0.001) {
          ox = (dx / d) * push * f
          oy = (dy / d) * push * f
        } else {
          oy = -push * f
        }
      }
      ctx!.globalAlpha = clamp(c.type === "/" ? c.lv * 0.55 : c.lv * 1.12, 0, 1) * cellFade(c)
      if (ctx!.globalAlpha < 0.004) continue
      ctx!.drawImage(spr, p[0] + ox - sz / 2, p[1] + oy - sz / 2, sz, sz)
    }
    ctx!.globalAlpha = 1
  }

  function draw() {
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx!.clearRect(0, 0, W, H)
    if (repelOn()) {
      ctx!.save()
      clipDisc(ctx!)
      if (CFG.background) drawGrid(ctx!)
      drawPattern()
      ctx!.restore()
    } else if (statik) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0)
      ctx!.drawImage(statik, 0, 0)
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    if (CFG.showRing) {
      const gx = W / 2
      const gy = CY() + CFG.ringY * K
      ctx!.save()
      ctx!.strokeStyle = "rgba(255,64,160,0.9)"
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.ellipse(gx, gy, (CFG.ringW * K) / 2, (CFG.ringH * K) / 2, 0, 0, 6.283)
      ctx!.stroke()
      ctx!.beginPath()
      ctx!.moveTo(gx - 8, gy)
      ctx!.lineTo(gx + 8, gy)
      ctx!.moveTo(gx, gy - 8)
      ctx!.lineTo(gx, gy + 8)
      ctx!.stroke()
      ctx!.restore()
    }
    if (!txs.length || !bubbleSprite) {
      drawNodes()
      return
    }
    const S = P * CFG.blockScale
    const states = txs.map((tx) => txState(tx, S))
    for (const st of states) drawTrail(st.tx)
    for (const st of states) drawBubble(st)
    drawNodes()
    for (const st of states) drawBlocks(st, S)
    ctx!.globalAlpha = 1
  }

  const popIn = (w: number) => {
    w = clamp(w, 0, 1)
    return { a: 1, s: blockSpring(w) }
  }

  function txState(tx: Tx, S: number): TxState {
    const idx = tx.phase
    const p = tx.p
    let wA = 0
    let wS = 1
    if (idx === at("fly1")) {
      if (p > 0.3) {
        const k = popIn((p - 0.3) / CFG.blockIn)
        wA = k.a
        wS = k.s
      }
    } else if (idx > at("fly1") && idx < at("fly2")) {
      wA = 1
    } else if (idx === at("fly2")) {
      const w = 1 - (p * CFG.tFly2) / CFG.tWalletOut
      if (w > 0) {
        const k = popIn(w)
        wA = k.a
        wS = k.s
      }
    }
    let dA = 0
    let dS = 1
    if (idx === at("fly2")) {
      if (p > 0.3) {
        const k = popIn((p - 0.3) / CFG.blockIn)
        dA = k.a
        dS = k.s
      }
    } else if (idx > at("fly2") && idx < at("dstOut")) {
      dA = 1
    } else if (idx === at("dstOut")) {
      const k = popIn(1 - p)
      dA = k.a
      dS = k.s
    }
    const bubble = bubbleSprite!
    const clearBs = clearSprites[tx.amount] ?? bubble
    const tipReach = (sp: Bubble, sc: number) => sp.bw * sc * 0.5 + sp.bh * sc * 0.32
    const clearOf = (half: number, sp: Bubble, sc: number) =>
      half + CFG.nodeClear * K + tipReach(sp, sc)
    const off = (sp: Bubble) => clearOf(S / 2, sp, 1)
    const offLogo = (sp: Bubble) => clearOf((CFG.nodeSize * K) / 2, sp, 1)
    const d1 = tx.wx >= tx.sx ? 1 : -1
    const d2 = tx.dx >= tx.wx ? 1 : -1
    const x1 = tx.sx + offLogo(clearBs) * d1
    const x2 = tx.wx + off(bubble) * d2
    const spawn1 = tx.sx + CFG.nodeSize * K * 0.26 * d1
    const tipStart1 = x1 - d1 * tipReach(clearBs, 1)
    const tipStart2 = x2 - d2 * tipReach(bubble, 1)
    const dissolve = (leg: 0 | 1, p: number) => {
      const tF = leg ? CFG.tFly2 : CFG.tFly1
      const tA = leg ? CFG.tAbsorb2 : CFG.tAbsorb1
      const from = CFG.fadeStart * tF
      const span = tF + tA - from
      const el = idx === at(leg ? "fly2" : "fly1") ? p * tF : tF + p * tA
      const u = clamp((el - from) / span, 0, 1)
      return { s: Math.max(0.001, 1 - Math.pow(u, CFG.shrinkBias)), a: 1 - u * u * u }
    }
    let bs: Bubble = clearBs
    let bx = tx.sx
    let by = tx.sy
    let bA = 0
    let bS = 1
    let tailSide = -d1
    if (idx === at("amountOut")) {
      const q = springOut(p)
      bx = spawn1 + (x1 - spawn1) * q
      by = tx.sy
      bA = smooth(p * 1.6)
      bS = 0.72 + 0.28 * q
    } else if (idx === at("hold1")) {
      bx = x1
      by = tx.sy
      bA = 1
    } else if (idx === at("fly1")) {
      const e = flyEase(p)
      const k = dissolve(0, p)
      bS = k.s
      bA = k.a
      bx = bez(tipStart1, tx.c1x, tx.wx, e) + d1 * tipReach(clearBs, bS)
      by = bez(tx.sy, tx.c1y, tx.wy, e)
      const t = tailTip(clearBs, bS, -d1, bx, by)
      pushTrail(tx, t[0], t[1], 0)
    } else if (idx === at("absorb1")) {
      const k = dissolve(0, p)
      bS = k.s
      bA = k.a
      bx = tx.wx + d1 * tipReach(clearBs, bS)
      by = tx.wy
    } else if (idx === at("shieldedOut")) {
      bs = bubble
      tailSide = -d2
      const q = springOut(p)
      bx = tx.wx + (x2 - tx.wx) * q
      by = tx.wy
      bA = smooth(p * 1.6)
      bS = 0.72 + 0.28 * q
    } else if (idx === at("hold2")) {
      bs = bubble
      tailSide = -d2
      bx = x2
      by = tx.wy
      bA = 1
    } else if (idx === at("fly2")) {
      bs = bubble
      tailSide = -d2
      const e = flyEase(p)
      const k = dissolve(1, p)
      bS = k.s
      bA = k.a
      bx = bez(tipStart2, tx.c2x, tx.dx, e) + d2 * tipReach(bubble, bS)
      by = bez(tx.wy, tx.c2y, tx.dy, e)
      const t = tailTip(bubble, bS, -d2, bx, by)
      pushTrail(tx, t[0], t[1], 1)
    } else if (idx === at("absorb2")) {
      bs = bubble
      tailSide = -d2
      const k = dissolve(1, p)
      bS = k.s
      bA = k.a
      bx = tx.dx + d2 * tipReach(bubble, bS)
      by = tx.dy
    }
    return { tx, wA, wS, dA, dS, bs, bx, by, bA, bS, tailSide }
  }

  function drawTrail(tx: Tx) {
    const pts = tx.trail
    if (pts.length < 2) return
    const cut = tx.age - CFG.trailLife
    let from = 0
    while (from < pts.length && pts[from].t < cut) from++
    const head = pts.length - 1
    if (from >= head) return
    const cum = [0]
    for (let k = from; k < head; k++) {
      cum.push(cum[cum.length - 1] + Math.hypot(pts[k + 1].x - pts[k].x, pts[k + 1].y - pts[k].y))
    }
    const L = cum[cum.length - 1]
    if (L <= 0) return
    const lw = Math.max(1, P * CFG.trailWidth)
    const pitch = P * CFG.trailPitch
    const dash = Math.max(0.01, pitch - lw)
    if (L < dash) return
    const sample = (s: number) => {
      let i = 0
      const hi = cum.length - 1
      while (i < hi && cum[i + 1] < s) i++
      const seg = cum[i + 1] - cum[i]
      const t = seg > 0 ? (s - cum[i]) / seg : 0
      const a = pts[from + i]
      const b = pts[from + i + 1]
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, leg: b.leg }
    }
    ctx!.save()
    ctx!.lineWidth = lw
    ctx!.lineCap = "round"
    ctx!.setLineDash([])
    for (let s1 = L; s1 - dash >= 0; s1 -= pitch * 2) {
      const s0 = s1 - dash
      const mid = (s0 + s1) / 2
      const f = mid / L
      const c = sample(mid)
      ctx!.strokeStyle =
        "rgba(" + (c.leg ? PAL.shieldGlow : PAL.walletGlow) + "," + (CFG.trailAlpha * f).toFixed(3) + ")"
      ctx!.beginPath()
      const a = sample(s0)
      ctx!.moveTo(a.x, a.y)
      for (let k = 0; k < cum.length; k++) {
        if (cum[k] > s0 && cum[k] < s1) {
          const v = pts[from + k]
          ctx!.lineTo(v.x, v.y)
        }
      }
      const b = sample(s1)
      ctx!.lineTo(b.x, b.y)
      ctx!.stroke()
    }
    ctx!.restore()
  }

  function drawBubble(st: TxState) {
    const { bs, bx, by, bA, bS, tailSide } = st
    if (bA > 0.01) {
      const w = bs.w * bS
      const h = bs.h * bS
      ctx!.save()
      ctx!.globalAlpha = bA
      ctx!.fillStyle = PAL.pill
      ctx!.translate(bx, by)
      const hw = (bs.bw * bS) / 2
      const tl = bs.bh * bS * 0.42
      const tw2 = bs.bh * bS * 0.34
      const ex = tailSide * (hw - bs.bh * bS * 0.1)
      ctx!.beginPath()
      ctx!.moveTo(ex, -tw2 / 2)
      ctx!.lineTo(ex + tailSide * tl, 0)
      ctx!.lineTo(ex, tw2 / 2)
      ctx!.closePath()
      ctx!.fill()
      ctx!.drawImage(bs.cv, -w / 2, -h / 2, w, h)
      ctx!.restore()
    }
  }

  function drawBlocks(st: TxState, S: number) {
    const { tx, wA, wS, dA, dS } = st
    if (wA > 0.01) {
      ctx!.save()
      ctx!.globalAlpha = wA
      const s = S * wS
      ctx!.shadowColor = "rgba(" + PAL.walletGlow + ",0.5)"
      ctx!.shadowBlur = P * 0.9
      blockPath(ctx!, tx.wx, tx.wy, s, s * 0.3, -1)
      ctx!.fillStyle = PAL.walletBlock
      ctx!.fill()
      ctx!.shadowBlur = 0
      walletMark(ctx!, tx.wx, tx.wy, s * 0.5)
      ctx!.restore()
    }
    if (dA > 0.01) {
      ctx!.save()
      ctx!.globalAlpha = dA
      const s = S * dS
      ctx!.shadowColor = "rgba(" + PAL.shieldGlow + ",0.8)"
      ctx!.shadowBlur = P * 1.6
      blockPath(ctx!, tx.dx, tx.dy, s, s * 0.3, -1)
      ctx!.fillStyle = PAL.shield
      ctx!.fill()
      ctx!.shadowBlur = 0
      shieldMark(ctx!, tx.dx, tx.dy, s * 0.58)
      ctx!.restore()
    }
    ctx!.globalAlpha = 1
  }

  function loop(ms: number) {
    if (destroyed || !running) return
    const dt = Math.min(0.05, (ms - last) / 1000 || 0.016)
    last = ms
    step(dt * CFG.speed)
    draw()
    raf = requestAnimationFrame(loop)
  }

  const start = () => {
    if (destroyed || running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  buildCells()
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  cv.addEventListener("pointermove", onPointerMove)
  cv.addEventListener("pointerleave", onPointerLeave)
  if (document.fonts) {
    // Ensure the mono face is actually fetched (it may not be used by any DOM
    // text yet), then re-rasterise sprites with it.
    const fontsReady = document.fonts.load("700 16px " + MONO).catch(() => undefined)
    fontsReady.then(() => {
      if (!destroyed) makeSprites()
    })
  }
  draw()
  raf = requestAnimationFrame(loop)

  // Pause the rAF loop while the stage is scrolled out of view.
  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          const visible = entries.some((e) => e.isIntersecting)
          if (visible) start()
          else stop()
        })
      : null
  io?.observe(host)

  return {
    destroy() {
      destroyed = true
      stop()
      ro.disconnect()
      io?.disconnect()
      cv.removeEventListener("pointermove", onPointerMove)
      cv.removeEventListener("pointerleave", onPointerLeave)
    },
    setPalette(palette) {
      PAL = { ...PAL, ...palette }
      if (!destroyed && P) {
        makeSprites()
        draw()
      }
    },
  }
}
