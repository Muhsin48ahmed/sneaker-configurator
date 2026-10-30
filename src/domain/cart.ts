import { PARTS, SIZES, findColor, findColorway, type Design, type PartStyle } from './catalog'
import { priceDesign } from './pricing'

export const MAX_QUANTITY = 10

export interface CartItem {
  /** Derived from design + size, so identical pairs share a line. */
  readonly id: string
  readonly design: Design
  readonly colorwayId: string | null
  readonly sizeId: string
  readonly quantity: number
  readonly unitPriceCents: number
}

export interface CartState {
  readonly items: readonly CartItem[]
}

export type CartAction =
  | { readonly type: 'add'; readonly design: Design; readonly colorwayId: string | null; readonly sizeId: string }
  | { readonly type: 'remove'; readonly id: string }
  | { readonly type: 'setQuantity'; readonly id: string; readonly quantity: number }
  | { readonly type: 'clear' }
  /** Adopt a cart saved elsewhere, e.g. by another open tab. */
  | { readonly type: 'replace'; readonly cart: CartState }

export const EMPTY_CART: CartState = { items: [] }

const itemId = (design: Design, sizeId: string): string =>
  [sizeId, ...PARTS.map(({ id }) => `${design[id].colorId}:${design[id].finishId}`)].join('|')

const clampQuantity = (quantity: number): number => Math.min(MAX_QUANTITY, Math.floor(quantity))

const createItem = (design: Design, colorwayId: string | null, sizeId: string, quantity: number): CartItem => ({
  id: itemId(design, sizeId),
  design,
  colorwayId,
  sizeId,
  quantity,
  unitPriceCents: priceDesign(design).totalCents,
})

const updateItem = (state: CartState, id: string, update: (item: CartItem) => CartItem | null): CartState => ({
  items: state.items.flatMap((item) => {
    if (item.id !== id) return [item]
    const next = update(item)
    return next ? [next] : []
  }),
})

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'add': {
      if (!SIZES.includes(action.sizeId)) return state
      const id = itemId(action.design, action.sizeId)
      if (state.items.some((item) => item.id === id)) {
        return updateItem(state, id, (item) => ({ ...item, quantity: clampQuantity(item.quantity + 1) }))
      }
      return { items: [...state.items, createItem(action.design, action.colorwayId, action.sizeId, 1)] }
    }

    case 'remove':
      return { items: state.items.filter((item) => item.id !== action.id) }

    case 'setQuantity':
      return updateItem(state, action.id, (item) =>
        action.quantity < 1 ? null : { ...item, quantity: clampQuantity(action.quantity) },
      )

    case 'clear':
      return EMPTY_CART

    case 'replace':
      return action.cart
  }
}

export const cartTotals = (state: CartState) => ({
  itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
  subtotalCents: state.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
})

export const serializeCart = (state: CartState): string => JSON.stringify(state)

// ---- Loading a saved cart: storage is user-editable, so validate everything and reprice. ----

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parsePartStyle = (raw: unknown, allowedFinishes: readonly string[]): PartStyle | null => {
  if (!isRecord(raw)) return null
  const { colorId, finishId } = raw
  if (typeof colorId !== 'string' || !findColor(colorId)) return null
  if (typeof finishId !== 'string' || !allowedFinishes.includes(finishId)) return null
  return { colorId, finishId: finishId as PartStyle['finishId'] }
}

const parseDesign = (raw: unknown): Design | null => {
  if (!isRecord(raw)) return null
  const entries = PARTS.map((part) => [part.id, parsePartStyle(raw[part.id], part.finishIds)] as const)
  if (entries.some(([, partStyle]) => partStyle === null)) return null
  return Object.fromEntries(entries) as unknown as Design
}

const parseItem = (raw: unknown): CartItem | null => {
  if (!isRecord(raw)) return null
  const design = parseDesign(raw.design)
  const { sizeId, quantity, colorwayId } = raw
  if (!design || typeof sizeId !== 'string' || !SIZES.includes(sizeId)) return null
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) return null
  const knownColorwayId = typeof colorwayId === 'string' && findColorway(colorwayId) ? colorwayId : null
  return createItem(design, knownColorwayId, sizeId, clampQuantity(quantity))
}

/** Identical design + size must share one line (unique React keys, remove() hits one line). */
const mergeDuplicates = (items: readonly CartItem[]): readonly CartItem[] =>
  items.reduce<readonly CartItem[]>((merged, item) => {
    const existing = merged.find((other) => other.id === item.id)
    if (!existing) return [...merged, item]
    return merged.map((other) =>
      other.id === item.id ? { ...other, quantity: clampQuantity(other.quantity + item.quantity) } : other,
    )
  }, [])

export const parseStoredCart = (raw: string | null): CartState => {
  if (!raw) return EMPTY_CART
  try {
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data) || !Array.isArray(data.items)) {
      console.warn('Saved cart has an unexpected shape; starting with an empty cart')
      return EMPTY_CART
    }
    const items = data.items.map(parseItem).filter((item): item is CartItem => item !== null)
    if (items.length < data.items.length) {
      console.warn(`Dropped ${data.items.length - items.length} invalid line(s) from the saved cart`)
    }
    return { items: mergeDuplicates(items) }
  } catch (error) {
    console.warn('Saved cart is not valid JSON; starting with an empty cart', error)
    return EMPTY_CART
  }
}
