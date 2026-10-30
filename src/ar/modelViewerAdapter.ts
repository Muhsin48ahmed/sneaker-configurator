import { findColor, findPart, type Design } from '../domain/catalog'
import { surfaceSpec } from '../domain/surface'

/**
 * The slice of <model-viewer>'s scene-graph API we use. Declared structurally so the
 * adapter can be unit-tested without loading model-viewer (which needs WebGL).
 */
interface TextureSlot {
  setTexture: (texture: null) => void
}

export interface ModelViewerMaterialLike {
  readonly name: string
  readonly pbrMetallicRoughness: {
    setBaseColorFactor: (color: string) => void
    setMetallicFactor: (value: number) => void
    setRoughnessFactor: (value: number) => void
    readonly metallicRoughnessTexture: TextureSlot
  }
  setClearcoatFactor: (value: number) => void
  setClearcoatRoughnessFactor: (value: number) => void
  setSheenColorFactor: (color: string) => void
  setSheenRoughnessFactor: (value: number) => void
}

export interface ModelViewerLike {
  readonly model?: { readonly materials: readonly ModelViewerMaterialLike[] }
}

export interface Dimensions {
  readonly x: number
  readonly y: number
  readonly z: number
}

/** Average adult shoe length in meters; used so AR places a believable, true-to-size pair. */
export const SHOE_LENGTH_METERS = 0.29

/**
 * Applies the configured design to model-viewer's materials, matching by material name.
 * Mirrors what the R3F scene renders: same PBR numbers, and the baked roughness/metal map
 * is removed so the finish values are not multiplied by it. Returns how many parts were applied.
 */
export const applyDesignToModelViewer = (viewer: ModelViewerLike, design: Design): number => {
  const materials = viewer.model?.materials ?? []
  const configurable = materials.filter((material) => findPart(material.name) !== undefined)
  let hasUnsupportedExtension = false

  // Clearcoat and sheen only exist when the glTF declares KHR_materials_clearcoat/sheen;
  // otherwise model-viewer's setters throw. They are polish, so never let them block color.
  const applyOptional = (apply: () => void) => {
    try {
      apply()
    } catch {
      hasUnsupportedExtension = true
    }
  }

  configurable.forEach((material) => {
    const { colorId, finishId } = design[material.name as keyof Design]
    const spec = surfaceSpec(findColor(colorId)?.hex ?? '#888888', finishId)
    const pbr = material.pbrMetallicRoughness
    pbr.setBaseColorFactor(spec.color)
    pbr.setMetallicFactor(spec.metalness)
    pbr.setRoughnessFactor(spec.roughness)
    pbr.metallicRoughnessTexture.setTexture(null)
    applyOptional(() => {
      material.setClearcoatFactor(spec.clearcoat)
      material.setClearcoatRoughnessFactor(spec.clearcoatRoughness)
    })
    applyOptional(() => {
      material.setSheenColorFactor(spec.sheenColor)
      material.setSheenRoughnessFactor(spec.sheenRoughness)
    })
  })

  if (hasUnsupportedExtension) {
    console.warn('AR model lacks KHR_materials_clearcoat/sheen; gloss and suede sheen are approximated in AR.')
  }
  return configurable.length
}

/** Uniform scale that makes the model's longest footprint side equal to `targetLengthMeters`. */
export const realWorldScale = (dimensions: Dimensions, targetLengthMeters: number): number => {
  const footprint = Math.max(dimensions.x, dimensions.z)
  return footprint > 0 && Number.isFinite(footprint) ? targetLengthMeters / footprint : 1
}
