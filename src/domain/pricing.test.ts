import { describe, expect, test } from 'vitest'
import { findColorway } from './catalog'
import { formatPrice, priceDesign } from './pricing'

const colorwayDesign = (id: string) => {
  const colorway = findColorway(id)
  if (!colorway) throw new Error(`missing colorway ${id}`)
  return colorway.parts
}

describe('priceDesign', () => {
  test('adds a leather upcharge for each leather part on the Chalk colorway', () => {
    const price = priceDesign(colorwayDesign('chalk'))

    expect(price.baseCents).toBe(12900)
    expect(price.totalCents).toBe(16500)
    expect(price.upcharges).toEqual([
      { partId: 'caps', label: 'Toe & heel caps · Leather', cents: 1200 },
      { partId: 'stripes', label: 'Side stripes · Leather', cents: 1200 },
      { partId: 'band', label: 'Heel band · Leather', cents: 1200 },
    ])
  })

  test('mixes suede and leather upcharges on the Sunset colorway', () => {
    expect(priceDesign(colorwayDesign('sunset')).totalCents).toBe(18000)
  })

  test('charges only the base price for an all-matte design', () => {
    const base = colorwayDesign('chalk')
    const allMatte = Object.fromEntries(
      Object.entries(base).map(([partId, style]) => [partId, { ...style, finishId: 'matte' }]),
    ) as typeof base

    const price = priceDesign(allMatte)

    expect(price.upcharges).toEqual([])
    expect(price.totalCents).toBe(12900)
  })
})

describe('formatPrice', () => {
  test('formats cents as US dollars', () => {
    expect(formatPrice(16500)).toBe('$165.00')
    expect(formatPrice(129050)).toBe('$1,290.50')
    expect(formatPrice(0)).toBe('$0.00')
  })
})
