import { describe, expect, test } from 'vitest'
import { surfaceSpec } from './surface'

describe('surfaceSpec', () => {
  test('gives matte synthetic a rough, non-metallic surface with no coat or sheen', () => {
    expect(surfaceSpec('#2346b8', 'matte', 'synthetic')).toEqual({
      color: '#2346b8',
      roughness: 0.85,
      metalness: 0,
      clearcoat: 0,
      clearcoatRoughness: 0,
      sheenColor: '#000000',
      sheenRoughness: 0,
      specularIntensity: 0.6,
    })
  })

  test('gives matte knit a soft fabric sheen and a low, non-plastic specular', () => {
    const spec = surfaceSpec('#000000', 'matte', 'knit')

    expect(spec.sheenColor).not.toBe('#000000')
    expect(spec.sheenRoughness).toBeGreaterThan(0.7)
    expect(spec.specularIntensity).toBeLessThanOrEqual(0.35)
  })

  test('gives a matte rubber sole a satin finish without fabric sheen', () => {
    const spec = surfaceSpec('#f4f4f2', 'matte', 'rubber')

    expect(spec.roughness).toBe(0.7)
    expect(spec.sheenColor).toBe('#000000')
  })

  test('tints suede sheen halfway between the base color and white', () => {
    const spec = surfaceSpec('#000000', 'suede', 'synthetic')

    expect(spec.sheenColor).toBe('#808080')
    expect(spec.roughness).toBe(1)
  })

  test('only lets the substrate change matte: patent stays glossy on any part', () => {
    const spec = surfaceSpec('#b3202d', 'patent', 'knit')

    expect(spec.clearcoat).toBe(1)
    expect(spec.clearcoatRoughness).toBe(0.05)
    expect(spec.specularIntensity).toBe(1)
  })

  test('falls back to matte for an unknown finish', () => {
    expect(surfaceSpec('#ffffff', 'chrome' as never, 'synthetic').roughness).toBe(0.85)
  })
})
