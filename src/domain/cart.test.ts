import { describe, expect, test } from 'vitest'
import { findColorway } from './catalog'
import { EMPTY_CART, MAX_QUANTITY, cartReducer, cartTotals, parseStoredCart, serializeCart } from './cart'

const design = (colorwayId: string) => {
  const colorway = findColorway(colorwayId)
  if (!colorway) throw new Error(`missing colorway ${colorwayId}`)
  return colorway.parts
}

const addChalk = (sizeId = '10') =>
  ({ type: 'add', design: design('chalk'), colorwayId: 'chalk', sizeId }) as const

describe('cartReducer', () => {
  test('adds a configured pair at the configured price', () => {
    const cart = cartReducer(EMPTY_CART, addChalk())

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ sizeId: '10', quantity: 1, unitPriceCents: 16500, colorwayId: 'chalk' })
  })

  test('merges an identical design in the same size into one line', () => {
    const cart = [addChalk(), addChalk()].reduce(cartReducer, EMPTY_CART)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
  })

  test('keeps different sizes on separate lines', () => {
    const cart = [addChalk('9'), addChalk('10')].reduce(cartReducer, EMPTY_CART)

    expect(cart.items).toHaveLength(2)
  })

  test('refuses to add a pair without a valid size', () => {
    expect(cartReducer(EMPTY_CART, addChalk('22'))).toBe(EMPTY_CART)
  })

  test('caps quantity and removes a line when quantity drops below one', () => {
    const cart = cartReducer(EMPTY_CART, addChalk())
    const id = cart.items[0].id

    expect(cartReducer(cart, { type: 'setQuantity', id, quantity: 99 }).items[0].quantity).toBe(MAX_QUANTITY)
    expect(cartReducer(cart, { type: 'setQuantity', id, quantity: 0 }).items).toEqual([])
  })

  test('replaces the whole cart, e.g. when another tab saved a newer one', () => {
    const other = cartReducer(EMPTY_CART, addChalk('8'))

    expect(cartReducer(cartReducer(EMPTY_CART, addChalk()), { type: 'replace', cart: other })).toBe(other)
  })

  test('removes a line by id', () => {
    const cart = [addChalk('9'), addChalk('10')].reduce(cartReducer, EMPTY_CART)

    const next = cartReducer(cart, { type: 'remove', id: cart.items[0].id })

    expect(next.items.map((item) => item.sizeId)).toEqual(['10'])
  })
})

describe('cartTotals', () => {
  test('sums quantity and line totals', () => {
    const cart = [
      addChalk('10'),
      addChalk('10'),
      { type: 'add', design: design('sunset'), colorwayId: 'sunset', sizeId: '8' } as const,
    ].reduce(cartReducer, EMPTY_CART)

    expect(cartTotals(cart)).toEqual({ itemCount: 3, subtotalCents: 16500 * 2 + 18000 })
  })
})

describe('parseStoredCart', () => {
  test('round-trips a serialized cart', () => {
    const cart = [addChalk('9'), addChalk('9')].reduce(cartReducer, EMPTY_CART)

    expect(parseStoredCart(serializeCart(cart))).toEqual(cart)
  })

  test('returns an empty cart for missing or malformed data', () => {
    expect(parseStoredCart(null)).toEqual(EMPTY_CART)
    expect(parseStoredCart('{not json')).toEqual(EMPTY_CART)
    expect(parseStoredCart('{"items":"nope"}')).toEqual(EMPTY_CART)
  })

  test('drops an unknown colorway label instead of showing a blank name', () => {
    const cart = cartReducer(EMPTY_CART, addChalk())
    const stored = JSON.parse(serializeCart(cart))
    const tampered = JSON.stringify({ items: [{ ...stored.items[0], colorwayId: 'retired-colorway' }] })

    expect(parseStoredCart(tampered).items[0].colorwayId).toBeNull()
  })

  test('merges duplicate stored lines so each design and size appears once', () => {
    const cart = cartReducer(EMPTY_CART, addChalk())
    const stored = JSON.parse(serializeCart(cart))
    const duplicated = JSON.stringify({ items: [stored.items[0], { ...stored.items[0], quantity: 2 }] })

    const parsed = parseStoredCart(duplicated)

    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0].quantity).toBe(3)
  })

  test('drops tampered lines and reprices from the catalog', () => {
    const cart = cartReducer(EMPTY_CART, addChalk())
    const stored = JSON.parse(serializeCart(cart))
    const tampered = JSON.stringify({
      items: [
        { ...stored.items[0], unitPriceCents: 1 },
        { ...stored.items[0], sizeId: '99' },
        { ...stored.items[0], design: { ...stored.items[0].design, sole: { colorId: 'gold', finishId: 'matte' } } },
      ],
    })

    const parsed = parseStoredCart(tampered)

    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0].unitPriceCents).toBe(16500)
  })
})
