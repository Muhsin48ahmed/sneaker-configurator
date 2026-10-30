import { PARTS, PRODUCT, findFinish, type Design, type PartId } from './catalog'

export interface Upcharge {
  readonly partId: PartId
  readonly label: string
  readonly cents: number
}

export interface Price {
  readonly baseCents: number
  readonly upcharges: readonly Upcharge[]
  readonly totalCents: number
}

/** Prices are integer cents end to end so totals never pick up floating-point drift. */
export const priceDesign = (design: Design): Price => {
  const upcharges = PARTS.flatMap((part): Upcharge[] => {
    const finish = findFinish(design[part.id].finishId)
    if (!finish || finish.priceCents === 0) return []
    return [{ partId: part.id, label: `${part.label} · ${finish.name}`, cents: finish.priceCents }]
  })
  const totalCents = upcharges.reduce<number>((sum, upcharge) => sum + upcharge.cents, PRODUCT.basePriceCents)
  return { baseCents: PRODUCT.basePriceCents, upcharges, totalCents }
}

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: PRODUCT.currency })

export const formatPrice = (cents: number): string => CURRENCY_FORMAT.format(cents / 100)
