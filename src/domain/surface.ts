import { FINISHES, findFinish, type FinishId } from './catalog'

/**
 * Everything a renderer needs to draw one part. Both the React Three Fiber scene and
 * the model-viewer AR view consume this, so what you configure is what you see in AR.
 */
export interface SurfaceSpec {
  readonly color: string
  readonly roughness: number
  readonly metalness: number
  readonly clearcoat: number
  readonly clearcoatRoughness: number
  readonly sheenColor: string
  readonly sheenRoughness: number
}

const SHEEN_WHITE_MIX = 0.5

const parseHex = (hex: string): readonly [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

const toHex = (channels: readonly number[]): string =>
  `#${channels.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

/** Sheen reads as a lighter, velvety version of the base color, scaled by the finish's sheen weight. */
const sheenTint = (hex: string, weight: number): string =>
  toHex(parseHex(hex).map((c) => (c + (255 - c) * SHEEN_WHITE_MIX) * weight))

export const surfaceSpec = (colorHex: string, finishId: FinishId): SurfaceSpec => {
  const { surface } = findFinish(finishId) ?? FINISHES[0]
  return {
    color: colorHex,
    roughness: surface.roughness,
    metalness: surface.metalness,
    clearcoat: surface.clearcoat,
    clearcoatRoughness: surface.clearcoatRoughness,
    sheenColor: sheenTint(colorHex, surface.sheen),
    sheenRoughness: surface.sheenRoughness,
  }
}
