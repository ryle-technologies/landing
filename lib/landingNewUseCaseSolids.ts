/**
 * Unit solids for the use-case carousel. Vertices sit in a ~1-radius ball;
 * the renderer rotates and projects them.
 */

export type Vec3 = readonly [number, number, number]
export type Face = readonly number[]

export type UseCaseSolid = {
  vertices: readonly Vec3[]
  faces: readonly Face[]
  edges: readonly (readonly [number, number])[]
}

export type LandingNewUseCaseShapeKind =
  | "cube"
  | "tetrahedron"
  | "sphere"
  | "torus"
  | "hexPrism"
  | "octahedron"
  | "icosahedron"
  | "slab"

export type ShapeMotion = {
  restX: number
  restY: number
  restZ: number
  /** Radians per millisecond around Y. */
  spin: number
  tilt: number
  roll: number
  phase: number
}

export const SHAPE_MOTION: Record<LandingNewUseCaseShapeKind, ShapeMotion> = {
  cube: { restX: 0.52, restY: 0.64, restZ: 0.1, spin: 0.00068, tilt: 0.16, roll: 0.08, phase: 0.2 },
  tetrahedron: { restX: 0.18, restY: 0.55, restZ: 0.06, spin: 0.0008, tilt: 0.12, roll: 0.1, phase: 1.1 },
  sphere: { restX: 0.4, restY: 0.5, restZ: 0.08, spin: 0.00058, tilt: 0.14, roll: 0.07, phase: 2.4 },
  torus: { restX: 0.92, restY: 0.35, restZ: 0.04, spin: 0.00064, tilt: 0.1, roll: 0.06, phase: 0.7 },
  hexPrism: { restX: 0.98, restY: 0.22, restZ: 0.04, spin: 0.00062, tilt: 0.1, roll: 0.05, phase: 1.8 },
  octahedron: { restX: 0.38, restY: 0.72, restZ: 0.08, spin: 0.00074, tilt: 0.15, roll: 0.09, phase: 3.1 },
  icosahedron: { restX: 0.42, restY: 0.58, restZ: 0.07, spin: 0.00055, tilt: 0.13, roll: 0.07, phase: 2.0 },
  slab: { restX: 0.58, restY: -0.52, restZ: 0.14, spin: 0.00052, tilt: 0.11, roll: 0.06, phase: 0.4 },
}

function len(v: Vec3) {
  return Math.hypot(v[0], v[1], v[2])
}

function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function normalize(v: Vec3): Vec3 {
  const l = len(v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

function average(verts: readonly Vec3[]): Vec3 {
  let x = 0
  let y = 0
  let z = 0
  for (const v of verts) {
    x += v[0]
    y += v[1]
    z += v[2]
  }
  const n = verts.length || 1
  return [x / n, y / n, z / n]
}

function faceNormal(vertices: readonly Vec3[], face: Face): Vec3 {
  const a = vertices[face[0]]!
  const b = vertices[face[1]]!
  const c = vertices[face[2]]!
  return normalize(cross(sub(b, a), sub(c, a)))
}

/** Flip any face whose winding points inward. */
function ensureOutward(solid: UseCaseSolid): UseCaseSolid {
  const center = average(solid.vertices)
  const faces = solid.faces.map((face) => {
    const mid = average(face.map((i) => solid.vertices[i]!))
    const n = faceNormal(solid.vertices, face)
    const outward = n[0] * (mid[0] - center[0]) + n[1] * (mid[1] - center[1]) + n[2] * (mid[2] - center[2])
    return outward < 0 ? [...face].reverse() : face
  })
  return { vertices: solid.vertices, faces: solid.faces, edges: solid.edges }
}

function uniqueEdges(faces: readonly Face[]): readonly (readonly [number, number])[] {
  const seen = new Set<string>()
  const edges: (readonly [number, number])[] = []
  for (const face of faces) {
    for (let i = 0; i < face.length; i += 1) {
      const a = face[i]!
      const b = face[(i + 1) % face.length]!
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (seen.has(key)) continue
      seen.add(key)
      edges.push(a < b ? [a, b] : [b, a])
    }
  }
  return edges
}

function fit(solid: UseCaseSolid, radius = 1): UseCaseSolid {
  let max = 0
  for (const v of solid.vertices) max = Math.max(max, len(v))
  const s = radius / (max || 1)
  return {
    vertices: solid.vertices.map((v) => scale(v, s)),
    faces: solid.faces,
    edges: solid.edges,
  }
}

/** Walk unused edges, preferring a shared vertex so the sketch feels like one stroke. */
function connectedWalk(
  ranked: readonly (readonly [number, number])[],
): readonly (readonly [number, number])[] {
  if (ranked.length <= 1) return ranked
  const remaining = new Set<number>()
  const atVertex = new Map<number, number[]>()
  ranked.forEach((edge, index) => {
    remaining.add(index)
    for (const v of edge) {
      const list = atVertex.get(v) ?? []
      list.push(index)
      atVertex.set(v, list)
    }
  })
  const order: (readonly [number, number])[] = []
  let next = 0
  let tip = ranked[0]![1]
  while (remaining.size > 0) {
    remaining.delete(next)
    const edge = ranked[next]!
    if (edge[0] === tip) {
      order.push(edge)
      tip = edge[1]
    } else if (edge[1] === tip) {
      order.push([edge[1], edge[0]])
      tip = edge[0]
    } else {
      order.push(edge)
      tip = edge[1]
    }
    const cont = (atVertex.get(tip) ?? []).find((i) => remaining.has(i))
    if (cont !== undefined) {
      next = cont
      continue
    }
    next = remaining.values().next().value ?? -1
    if (next < 0) break
    tip = ranked[next]![0]
  }
  return order
}

function finish(solid: Omit<UseCaseSolid, "edges">) {
  const outward = ensureOutward({ ...solid, edges: [] })
  const fitted = fit(outward)
  const edges = uniqueEdges(fitted.faces)
  // Nearest the origin first, then a connected walk so the pen stays on the form.
  const ranked = [...edges].sort((a, b) => {
    const am = (len(fitted.vertices[a[0]]!) + len(fitted.vertices[a[1]]!)) / 2
    const bm = (len(fitted.vertices[b[0]]!) + len(fitted.vertices[b[1]]!)) / 2
    return am - bm
  })
  return { vertices: fitted.vertices, faces: fitted.faces, edges: connectedWalk(ranked) }
}

function cube(): UseCaseSolid {
  const s = 1
  const vertices: Vec3[] = [
    [-s, -s, -s],
    [s, -s, -s],
    [s, s, -s],
    [-s, s, -s],
    [-s, -s, s],
    [s, -s, s],
    [s, s, s],
    [-s, s, s],
  ]
  const faces: Face[] = [
    [0, 1, 2, 3],
    [5, 4, 7, 6],
    [4, 0, 3, 7],
    [1, 5, 6, 2],
    [3, 2, 6, 7],
    [4, 5, 1, 0],
  ]
  return finish({ vertices, faces })
}

function tetrahedron(): UseCaseSolid {
  const vertices: Vec3[] = (
    [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ] as const
  ).map((v) => normalize(v))
  const faces: Face[] = [
    [0, 2, 1],
    [0, 1, 3],
    [0, 3, 2],
    [1, 2, 3],
  ]
  return finish({ vertices, faces })
}

function octahedron(): UseCaseSolid {
  const vertices: Vec3[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]
  const faces: Face[] = [
    [0, 2, 4],
    [2, 1, 4],
    [1, 3, 4],
    [3, 0, 4],
    [2, 0, 5],
    [1, 2, 5],
    [3, 1, 5],
    [0, 3, 5],
  ]
  return finish({ vertices, faces })
}

function icosahedron(): UseCaseSolid {
  const t = (1 + Math.sqrt(5)) / 2
  const raw: Vec3[] = (
    [
      [-1, t, 0],
      [1, t, 0],
      [-1, -t, 0],
      [1, -t, 0],
      [0, -1, t],
      [0, 1, t],
      [0, -1, -t],
      [0, 1, -t],
      [t, 0, -1],
      [t, 0, 1],
      [-t, 0, -1],
      [-t, 0, 1],
    ] as const
  ).map((v) => normalize(v))
  const faces: Face[] = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ]
  return finish({ vertices: raw, faces })
}

function midEdge(a: Vec3, b: Vec3): Vec3 {
  return normalize([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2])
}

/** One subdivision of the octahedron — a faceted ball. */
function sphere(): UseCaseSolid {
  const base = octahedron()
  const vertices = [...base.vertices]
  const cache = new Map<string, number>()
  const midpoint = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    const hit = cache.get(key)
    if (hit !== undefined) return hit
    const idx = vertices.length
    vertices.push(midEdge(vertices[i]!, vertices[j]!))
    cache.set(key, idx)
    return idx
  }
  const faces: Face[] = []
  for (const face of base.faces) {
    const [a, b, c] = face
    const ab = midpoint(a, b)
    const bc = midpoint(b, c)
    const ca = midpoint(c, a)
    faces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
  }
  return finish({ vertices, faces })
}

function hexPrism(): UseCaseSolid {
  const vertices: Vec3[] = []
  const y = 0.38
  const r = 1
  for (const sign of [1, -1] as const) {
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6
      vertices.push([Math.cos(a) * r, sign * y, Math.sin(a) * r])
    }
  }
  const faces: Face[] = [
    [0, 1, 2, 3, 4, 5],
    [11, 10, 9, 8, 7, 6],
  ]
  for (let i = 0; i < 6; i += 1) {
    const n = (i + 1) % 6
    faces.push([i, n, n + 6, i + 6])
  }
  return finish({ vertices, faces })
}

function torus(major = 0.72, minor = 0.3, segsU = 12, segsV = 7): UseCaseSolid {
  const vertices: Vec3[] = []
  for (let i = 0; i < segsU; i += 1) {
    const u = (i / segsU) * Math.PI * 2
    for (let j = 0; j < segsV; j += 1) {
      const v = (j / segsV) * Math.PI * 2
      const cx = (major + minor * Math.cos(v)) * Math.cos(u)
      const cy = minor * Math.sin(v)
      const cz = (major + minor * Math.cos(v)) * Math.sin(u)
      vertices.push([cx, cy, cz])
    }
  }
  const faces: Face[] = []
  for (let i = 0; i < segsU; i += 1) {
    const i2 = (i + 1) % segsU
    for (let j = 0; j < segsV; j += 1) {
      const j2 = (j + 1) % segsV
      const a = i * segsV + j
      const b = i2 * segsV + j
      const c = i2 * segsV + j2
      const d = i * segsV + j2
      faces.push([a, b, c, d])
    }
  }
  return finish({ vertices, faces })
}

function slab(): UseCaseSolid {
  const x = 1.28
  const y = 0.82
  const z = 0.14
  const vertices: Vec3[] = [
    [-x, -y, -z],
    [x, -y, -z],
    [x, y, -z],
    [-x, y, -z],
    [-x, -y, z],
    [x, -y, z],
    [x, y, z],
    [-x, y, z],
  ]
  const faces: Face[] = [
    [0, 1, 2, 3],
    [5, 4, 7, 6],
    [4, 0, 3, 7],
    [1, 5, 6, 2],
    [3, 2, 6, 7],
    [4, 5, 1, 0],
  ]
  return finish({ vertices, faces })
}

const CACHE: Partial<Record<LandingNewUseCaseShapeKind, UseCaseSolid>> = {}

const BUILDERS: Record<LandingNewUseCaseShapeKind, () => UseCaseSolid> = {
  cube,
  tetrahedron,
  sphere,
  torus,
  hexPrism,
  octahedron,
  icosahedron,
  slab,
}

export function getUseCaseSolid(kind: LandingNewUseCaseShapeKind): UseCaseSolid {
  const hit = CACHE[kind]
  if (hit) return hit
  const solid = BUILDERS[kind]()
  CACHE[kind] = solid
  return solid
}

export type UseCaseSilhouette =
  | { type: "polygon"; points: readonly (readonly [number, number])[] }
  | { type: "circle"; r: number }
  | { type: "ring"; outer: number; inner: number }

function regularPolygon(sides: number, r: number, rot: number): (readonly [number, number])[] {
  return Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * Math.PI * 2
    return [Math.cos(a) * r, Math.sin(a) * r] as const
  })
}

/** Rotate so `normal` points toward the camera (+Z). */
function poseFacing(normal: Vec3): Pick<ShapeMotion, "restX" | "restY" | "restZ"> {
  const [nx, ny, nz] = normalize(normal)
  const restX = Math.atan2(ny, nz)
  const z1 = ny * Math.sin(restX) + nz * Math.cos(restX)
  return { restX, restY: Math.atan2(-nx, z1), restZ: 0 }
}

/**
 * Face-on rest pose so the 3D solid starts aligned with its 2D silhouette
 * (square, triangle, hex, rectangle, …) before it lifts into the tumble.
 */
export function getShapeFaceOn(
  kind: LandingNewUseCaseShapeKind,
): Pick<ShapeMotion, "restX" | "restY" | "restZ"> {
  switch (kind) {
    case "hexPrism":
    case "torus":
      return poseFacing([0, 1, 0])
    case "tetrahedron": {
      const solid = getUseCaseSolid("tetrahedron")
      const face = solid.faces[3] ?? solid.faces[0]!
      return poseFacing(faceNormal(solid.vertices, face))
    }
    case "icosahedron": {
      const solid = getUseCaseSolid("icosahedron")
      return poseFacing(solid.vertices[0]!)
    }
    default:
      return { restX: 0, restY: 0, restZ: 0 }
  }
}

/** Shared half-extent for every idle 2D plate (same bounding box). */
export const SILHOUETTE_EXTENT = 0.7

function fitToPlate(points: readonly (readonly [number, number])[]) {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const half = Math.max((maxX - minX) / 2, (maxY - minY) / 2, 1e-6)
  const s = SILHOUETTE_EXTENT / half
  return points.map(([x, y]) => [(x - cx) * s, (y - cy) * s] as const)
}

/**
 * Flat counterpart of each solid. Every plate is scaled into the same
 * bounding box so idle cards read at one size.
 */
export function getUseCaseSilhouette(kind: LandingNewUseCaseShapeKind): UseCaseSilhouette {
  switch (kind) {
    case "cube":
      return {
        type: "polygon",
        points: fitToPlate([
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]),
      }
    case "slab":
      return {
        type: "polygon",
        points: fitToPlate([
          [-1.28, -0.82],
          [1.28, -0.82],
          [1.28, 0.82],
          [-1.28, 0.82],
        ]),
      }
    case "tetrahedron":
      return { type: "polygon", points: fitToPlate(regularPolygon(3, 1, Math.PI / 2)) }
    case "octahedron":
      return {
        type: "polygon",
        points: fitToPlate([
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ]),
      }
    case "hexPrism":
      return { type: "polygon", points: fitToPlate(regularPolygon(6, 1, -Math.PI / 6)) }
    case "icosahedron":
      return { type: "polygon", points: fitToPlate(regularPolygon(5, 1, Math.PI / 2)) }
    case "sphere":
      return { type: "circle", r: SILHOUETTE_EXTENT }
    case "torus":
      return { type: "ring", outer: SILHOUETTE_EXTENT, inner: SILHOUETTE_EXTENT * 0.42 }
  }
}

export type UseCaseEdgeRole = "silhouette" | "shape" | "side"

export type ClassifiedUseCaseEdge = {
  edge: readonly [number, number]
  role: UseCaseEdgeRole
}

const EDGE_ROLE_CACHE: Partial<Record<LandingNewUseCaseShapeKind, ClassifiedUseCaseEdge[]>> = {}

/**
 * Face-on edge roles. The silhouette is the 2D plate (already drawn).
 * `shape` edges grow out of that plate; `side` edges wait until it turns.
 */
export function getUseCaseEdgeRoles(kind: LandingNewUseCaseShapeKind): ClassifiedUseCaseEdge[] {
  const hit = EDGE_ROLE_CACHE[kind]
  if (hit) return hit

  const solid = getUseCaseSolid(kind)
  const faceOn = getShapeFaceOn(kind)
  const rotated = solid.vertices.map((v) => rotateVec(v, faceOn.restX, faceOn.restY, faceOn.restZ))

  const frontCount = new Map<string, number>()
  const keyOf = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)
  for (const face of solid.faces) {
    // Camera looks toward +Z; faces that point back at it (n.z < 0) are the plate.
    if (faceNormal(rotated, face)[2] >= -0.02) continue
    for (let i = 0; i < face.length; i += 1) {
      const a = face[i]!
      const b = face[(i + 1) % face.length]!
      const key = keyOf(a, b)
      frontCount.set(key, (frontCount.get(key) ?? 0) + 1)
    }
  }

  const silKeys = new Set<string>()
  const silVerts = new Set<number>()
  const markSilhouette = (a: number, b: number) => {
    silKeys.add(keyOf(a, b))
    silVerts.add(a)
    silVerts.add(b)
  }
  for (const edge of solid.edges) {
    if ((frontCount.get(keyOf(edge[0], edge[1])) ?? 0) !== 1) continue
    markSilhouette(edge[0], edge[1])
  }
  if (silKeys.size === 0 && solid.faces.length > 0) {
    let closest = solid.faces[0]!
    let closestZ = Infinity
    for (const face of solid.faces) {
      const z = faceCentroid(rotated, face)[2]
      if (z >= closestZ) continue
      closestZ = z
      closest = face
    }
    for (let i = 0; i < closest.length; i += 1) {
      markSilhouette(closest[i]!, closest[(i + 1) % closest.length]!)
    }
  }

  const buckets: Record<UseCaseEdgeRole, (readonly [number, number])[]> = {
    silhouette: [],
    shape: [],
    side: [],
  }
  for (const edge of solid.edges) {
    const key = keyOf(edge[0], edge[1])
    const facing = frontCount.get(key) ?? 0
    const role: UseCaseEdgeRole = silKeys.has(key)
      ? "silhouette"
      : facing >= 2 || silVerts.has(edge[0]) || silVerts.has(edge[1])
        ? "shape"
        : "side"
    const fromSil = silVerts.has(edge[1]) && !silVerts.has(edge[0])
    buckets[role].push(fromSil ? [edge[1], edge[0]] : edge)
  }

  const classified: ClassifiedUseCaseEdge[] = [
    ...buckets.silhouette.map((edge) => ({ edge, role: "silhouette" as const })),
    ...connectedWalk(buckets.shape).map((edge) => ({ edge, role: "shape" as const })),
    ...connectedWalk(buckets.side).map((edge) => ({ edge, role: "side" as const })),
  ]
  EDGE_ROLE_CACHE[kind] = classified
  return classified
}

export function rotateVec(v: Vec3, rx: number, ry: number, rz: number): Vec3 {
  let [x, y, z] = v
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const y1 = y * cx - z * sx
  const z1 = y * sx + z * cx
  y = y1
  z = z1
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const x2 = x * cy + z * sy
  const z2 = -x * sy + z * cy
  x = x2
  z = z2
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)
  const x3 = x * cz - y * sz
  const y3 = x * sz + y * cz
  return [x3, y3, z]
}

export function faceCentroid(vertices: readonly Vec3[], face: Face): Vec3 {
  return average(face.map((i) => vertices[i]!))
}

export { faceNormal }
