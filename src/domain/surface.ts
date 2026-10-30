import { FINISHES, findFinish, type FinishId, type FinishSurface, type Substrate } from './catalog'

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
  readonly specularIntensity: number
}

const SHEEN_WHITE_MIX = 0.5

/**
 * A plain "Matte" finish looks different depending on what it's applied to. Knit fabric
 * scatters light into a soft fuzz (sheen) and has almost no mirror highlight; rubber is
 * satin. Coated finishes (suede, leather, patent, metallic) define their own surface.
 */
const MATTE_BY_SUBSTRATE: Readonly<Record<Substrate, Partial<FinishSurface>>> = {
  knit: { roughness: 0.9, sheen: 0.55, sheenRoughness: 0.85, specularIntensity: 0.3 },
  rubber: { roughness: 0.7, specularIntensity: 0.5 },
  synthetic: {},
}

const parseHex = (hex: string): readonly [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

const toHex = (channels: readonly number[]): string =>
  `#${channels.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

/** Sheen reads as a lighter, velvety version of the base color, scaled by the finish's sheen weight. */
const sheenTint = (hex: string, weight: number): string =>
  toHex(parseHex(hex).map((c) => (c + (255 - c) * SHEEN_WHITE_MIX) * weight))

export const surfaceSpec = (colorHex: string, finishId: FinishId, substrate: Substrate): SurfaceSpec => {
  const finish = findFinish(finishId) ?? FINISHES[0]
  const surface = finish.id === 'matte' ? { ...finish.surface, ...MATTE_BY_SUBSTRATE[substrate] } : finish.surface
  return {
    color: colorHex,
    roughness: surface.roughness,
    metalness: surface.metalness,
    clearcoat: surface.clearcoat,
    clearcoatRoughness: surface.clearcoatRoughness,
    sheenColor: sheenTint(colorHex, surface.sheen),
    sheenRoughness: surface.sheenRoughness,
    specularIntensity: surface.specularIntensity,
  }
}
