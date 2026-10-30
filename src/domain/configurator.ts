import {
  COLORWAYS,
  DEFAULT_COLORWAY_ID,
  PARTS,
  SIZES,
  findColor,
  findColorway,
  findFinish,
  findPart,
  type ColorId,
  type Design,
  type FinishId,
  type PartId,
} from './catalog'

export interface ConfiguratorState {
  readonly design: Design
  /** The colorway the design currently matches exactly, or null for a custom design. */
  readonly colorwayId: string | null
  readonly selectedPartId: PartId
  readonly sizeId: string | null
}

export type ConfiguratorAction =
  | { readonly type: 'selectPart'; readonly partId: PartId }
  | { readonly type: 'setColor'; readonly partId: PartId; readonly colorId: ColorId }
  | { readonly type: 'setFinish'; readonly partId: PartId; readonly finishId: FinishId }
  | { readonly type: 'applyColorway'; readonly colorwayId: string }
  | { readonly type: 'setSize'; readonly sizeId: string }
  | { readonly type: 'reset' }

export interface DesignLine {
  readonly partId: PartId
  readonly partLabel: string
  readonly colorName: string
  readonly colorHex: string
  readonly finishName: string
}

const FIRST_PART_ID: PartId = PARTS[0].id

const defaultDesign = (): Design => {
  const colorway = findColorway(DEFAULT_COLORWAY_ID)
  if (!colorway) throw new Error(`Default colorway "${DEFAULT_COLORWAY_ID}" is missing from the catalog`)
  return colorway.parts
}

const designsMatch = (a: Design, b: Design): boolean =>
  PARTS.every(({ id }) => a[id].colorId === b[id].colorId && a[id].finishId === b[id].finishId)

const matchColorway = (design: Design): string | null =>
  COLORWAYS.find((colorway) => designsMatch(colorway.parts, design))?.id ?? null

const withDesign = (state: ConfiguratorState, design: Design): ConfiguratorState => ({
  ...state,
  design,
  colorwayId: matchColorway(design),
})

export const createInitialState = (): ConfiguratorState => ({
  design: defaultDesign(),
  colorwayId: DEFAULT_COLORWAY_ID,
  selectedPartId: FIRST_PART_ID,
  sizeId: null,
})

/** Pure reducer. Invalid input returns the same state object so React skips the re-render. */
export const configuratorReducer = (
  state: ConfiguratorState,
  action: ConfiguratorAction,
): ConfiguratorState => {
  switch (action.type) {
    case 'selectPart':
      return findPart(action.partId) ? { ...state, selectedPartId: action.partId } : state

    case 'setColor': {
      if (!findPart(action.partId) || !findColor(action.colorId)) return state
      const current = state.design[action.partId]
      return withDesign(state, { ...state.design, [action.partId]: { ...current, colorId: action.colorId } })
    }

    case 'setFinish': {
      const part = findPart(action.partId)
      if (!part || !part.finishIds.includes(action.finishId)) return state
      const current = state.design[action.partId]
      return withDesign(state, { ...state.design, [action.partId]: { ...current, finishId: action.finishId } })
    }

    case 'applyColorway': {
      const colorway = findColorway(action.colorwayId)
      return colorway ? { ...state, design: colorway.parts, colorwayId: colorway.id } : state
    }

    case 'setSize':
      return SIZES.includes(action.sizeId) ? { ...state, sizeId: action.sizeId } : state

    case 'reset':
      return { ...createInitialState(), sizeId: state.sizeId }
  }
}

export const describeDesign = (design: Design): readonly DesignLine[] =>
  PARTS.map((part) => {
    const style = design[part.id]
    const color = findColor(style.colorId)
    const finish = findFinish(style.finishId)
    return {
      partId: part.id,
      partLabel: part.label,
      colorName: color?.name ?? style.colorId,
      colorHex: color?.hex ?? '#888888',
      finishName: finish?.name ?? style.finishId,
    }
  })
