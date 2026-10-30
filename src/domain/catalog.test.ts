import { describe, expect, test } from 'vitest'
import {
  COLORS,
  COLORWAYS,
  DEFAULT_COLORWAY_ID,
  FINISHES,
  PARTS,
  PRODUCT,
  SIZES,
  findColor,
  findFinish,
  findPart,
} from './catalog'

// Material names read from public/models/sneaker.glb. If the model changes, this list must too.
const GLB_MATERIAL_NAMES = ['laces', 'mesh', 'caps', 'inner', 'sole', 'stripes', 'band', 'patch']

const unique = (values: readonly string[]) => new Set(values).size === values.length

describe('catalog', () => {
  test('has one configurable part per material in the sneaker model', () => {
    expect(PARTS.map((part) => part.id).sort()).toEqual([...GLB_MATERIAL_NAMES].sort())
  })

  test('uses unique ids for parts, colors, finishes, colorways and sizes', () => {
    expect(unique(PARTS.map((p) => p.id))).toBe(true)
    expect(unique(COLORS.map((c) => c.id))).toBe(true)
    expect(unique(FINISHES.map((f) => f.id))).toBe(true)
    expect(unique(COLORWAYS.map((c) => c.id))).toBe(true)
    expect(unique(SIZES)).toBe(true)
  })

  test('stores every color as a 6-digit hex value', () => {
    for (const color of COLORS) {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  test('only offers finishes that exist', () => {
    for (const part of PARTS) {
      expect(part.finishIds.length).toBeGreaterThan(0)
      for (const finishId of part.finishIds) {
        expect(findFinish(finishId)).toBeDefined()
      }
    }
  })

  test('defines every colorway with a valid color and an allowed finish for each part', () => {
    for (const colorway of COLORWAYS) {
      for (const part of PARTS) {
        const style = colorway.parts[part.id]
        expect(style, `${colorway.id}.${part.id}`).toBeDefined()
        expect(findColor(style.colorId), `${colorway.id}.${part.id} color`).toBeDefined()
        expect(part.finishIds, `${colorway.id}.${part.id} finish`).toContain(style.finishId)
      }
    }
  })

  test('has a default colorway and a positive base price', () => {
    expect(COLORWAYS.some((c) => c.id === DEFAULT_COLORWAY_ID)).toBe(true)
    expect(PRODUCT.basePriceCents).toBeGreaterThan(0)
    expect(Number.isInteger(PRODUCT.basePriceCents)).toBe(true)
  })

  test('returns undefined for unknown ids instead of throwing', () => {
    expect(findPart('heel-spur')).toBeUndefined()
    expect(findColor('ultraviolet')).toBeUndefined()
    expect(findFinish('chrome-plated')).toBeUndefined()
  })
})
