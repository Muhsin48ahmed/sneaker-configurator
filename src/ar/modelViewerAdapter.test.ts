import { describe, expect, test } from 'vitest'
import { findColorway } from '../domain/catalog'
import { applyDesignToModelViewer, realWorldScale, type ModelViewerLike } from './modelViewerAdapter'

const varsity = () => {
  const colorway = findColorway('varsity')
  if (!colorway) throw new Error('missing colorway')
  return colorway.parts
}

/** Minimal stand-in for model-viewer's scene-graph Material API that records what was set. */
const fakeMaterial = (name: string) => {
  const calls: Record<string, unknown> = {}
  const record = (key: string) => (value: unknown) => {
    calls[key] = value
  }
  return {
    calls,
    material: {
      name,
      pbrMetallicRoughness: {
        setBaseColorFactor: record('baseColor'),
        setMetallicFactor: record('metallic'),
        setRoughnessFactor: record('roughness'),
        metallicRoughnessTexture: { setTexture: record('ormTexture') },
      },
      setClearcoatFactor: record('clearcoat'),
      setClearcoatRoughnessFactor: record('clearcoatRoughness'),
      setSheenColorFactor: record('sheenColor'),
      setSheenRoughnessFactor: record('sheenRoughness'),
    },
  }
}

describe('applyDesignToModelViewer', () => {
  test('pushes each part color and finish onto the material with the same name', () => {
    const caps = fakeMaterial('caps')
    const sole = fakeMaterial('sole')
    const viewer: ModelViewerLike = { model: { materials: [caps.material, sole.material] } }

    const applied = applyDesignToModelViewer(viewer, varsity())

    expect(applied).toBe(2)
    expect(caps.calls).toMatchObject({ baseColor: '#2346b8', roughness: 1, metallic: 0, ormTexture: null })
    expect(caps.calls.sheenColor).not.toBe('#000000')
    expect(sole.calls).toMatchObject({ baseColor: '#b9773e', roughness: 0.85, clearcoat: 0 })
  })

  test('leaves materials that are not configurable parts alone', () => {
    const decal = fakeMaterial('logo-decal')

    const applied = applyDesignToModelViewer({ model: { materials: [decal.material] } }, varsity())

    expect(applied).toBe(0)
    expect(decal.calls).toEqual({})
  })

  test('still applies color when the material has no clearcoat or sheen support', () => {
    const laces = fakeMaterial('laces')
    const unsupported = () => {
      throw new TypeError("Cannot read properties of undefined (reading 'set')")
    }
    const material = { ...laces.material, setSheenColorFactor: unsupported, setClearcoatFactor: unsupported }

    const applied = applyDesignToModelViewer({ model: { materials: [material] } }, varsity())

    expect(applied).toBe(1)
    expect(laces.calls).toMatchObject({ baseColor: '#f4f4f2', roughness: 0.85 })
  })

  test('does nothing before the model has loaded', () => {
    expect(applyDesignToModelViewer({ model: undefined }, varsity())).toBe(0)
  })
})

describe('realWorldScale', () => {
  test('scales the longest footprint side to a real shoe length', () => {
    expect(realWorldScale({ x: 2.9, y: 1.2, z: 1 }, 0.29)).toBeCloseTo(0.1)
    expect(realWorldScale({ x: 0.5, y: 0.4, z: 2.9 }, 0.29)).toBeCloseTo(0.1)
  })

  test('falls back to 1 for an empty or invalid bounding box', () => {
    expect(realWorldScale({ x: 0, y: 0, z: 0 }, 0.29)).toBe(1)
  })
})
