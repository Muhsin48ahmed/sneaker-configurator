import { describe, expect, test } from 'vitest'
import { surfaceSpec } from './surface'

describe('surfaceSpec', () => {
  test('gives matte knit a rough, non-metallic surface with no coat or sheen', () => {
    expect(surfaceSpec('#2346b8', 'matte')).toEqual({
      color: '#2346b8',
      roughness: 0.85,
      metalness: 0,
      clearcoat: 0,
      clearcoatRoughness: 0,
      sheenColor: '#000000',
      sheenRoughness: 0,
    })
  })

  test('tints suede sheen halfway between the base color and white', () => {
    const spec = surfaceSpec('#000000', 'suede')

    expect(spec.sheenColor).toBe('#808080')
    expect(spec.roughness).toBe(1)
  })

  test('gives patent a full glossy clearcoat', () => {
    const spec = surfaceSpec('#b3202d', 'patent')

    expect(spec.clearcoat).toBe(1)
    expect(spec.clearcoatRoughness).toBe(0.05)
  })

  test('falls back to matte for an unknown finish', () => {
    expect(surfaceSpec('#ffffff', 'chrome' as never).roughness).toBe(0.85)
  })
})
