export type PercentPoint = { x: number; y: number }

/** Percent coordinates of hero nodes (same layout as `AlphaWebHeroImageAscii` / landing). */
export const HERO_IMAGE_NODES: PercentPoint[] = [
  { x: 22.36, y: 99.51 },
  { x: 42.78, y: 84.56 },
  { x: 47.5, y: 75 },
  { x: 45.97, y: 71.57 },
  { x: 49.31, y: 68.63 },
  { x: 49.31, y: 42.16 },
  { x: 47.22, y: 37.5 },
  { x: 51.67, y: 31.37 },
  { x: 52.5, y: 14.71 },
  { x: 50.97, y: 11.76 },
  { x: 55, y: 1.23 },
  { x: 63.89, y: 0 },
  { x: 71.11, y: 7.11 },
  { x: 70.14, y: 10.29 },
  { x: 69.58, y: 51.72 },
  { x: 70.28, y: 56.62 },
  { x: 70.14, y: 61.76 },
  { x: 73.19, y: 66.67 },
  { x: 72.78, y: 71.32 },
  { x: 74.44, y: 73.53 },
  { x: 77.36, y: 73.77 },
  { x: 80.56, y: 81.37 },
  { x: 83.19, y: 82.6 },
  { x: 87.64, y: 78.92 },
  { x: 90.69, y: 80.88 },
  { x: 98.89, y: 89.22 },
  { x: 99.72, y: 91.18 },
  { x: 99.86, y: 99.26 },
]

export function percentToPoint(
  point: PercentPoint,
  size: { w: number; h: number },
): { x: number; y: number } {
  return {
    x: (point.x / 100) * size.w,
    y: (point.y / 100) * size.h,
  }
}
