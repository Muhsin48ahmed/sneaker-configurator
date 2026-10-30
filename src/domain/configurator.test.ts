import { describe, expect, test } from 'vitest'
import { configuratorReducer, createInitialState, describeDesign, type ConfiguratorState } from './configurator'

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

const initial = (): ConfiguratorState => deepFreeze(createInitialState())

describe('createInitialState', () => {
  test('starts on the Chalk colorway with the upper selected and no size', () => {
    const state = createInitialState()

    expect(state.colorwayId).toBe('chalk')
    expect(state.selectedPartId).toBe('mesh')
    expect(state.sizeId).toBeNull()
    expect(state.design.stripes).toEqual({ colorId: 'onyx', finishId: 'leather' })
  })
})

describe('configuratorReducer', () => {
  test('recolors only the targeted part and marks the design as custom', () => {
    const state = initial()

    const next = configuratorReducer(state, { type: 'setColor', partId: 'laces', colorId: 'crimson' })

    expect(next.design.laces).toEqual({ colorId: 'crimson', finishId: 'matte' })
    expect(next.design.mesh).toBe(state.design.mesh)
    expect(next.colorwayId).toBeNull()
    expect(state.design.laces.colorId).toBe('chalk')
  })

  test('changes a finish when the part allows it', () => {
    const next = configuratorReducer(initial(), { type: 'setFinish', partId: 'mesh', finishId: 'suede' })

    expect(next.design.mesh).toEqual({ colorId: 'chalk', finishId: 'suede' })
  })

  test('ignores a finish the part does not offer', () => {
    const state = initial()

    const next = configuratorReducer(state, { type: 'setFinish', partId: 'laces', finishId: 'suede' })

    expect(next).toBe(state)
  })

  test('ignores unknown colors and parts', () => {
    const state = initial()

    expect(configuratorReducer(state, { type: 'setColor', partId: 'laces', colorId: 'ultraviolet' })).toBe(state)
    expect(configuratorReducer(state, { type: 'selectPart', partId: 'heel-spur' as never })).toBe(state)
  })

  test('applies a full colorway and recognises it by name', () => {
    const next = configuratorReducer(initial(), { type: 'applyColorway', colorwayId: 'varsity' })

    expect(next.colorwayId).toBe('varsity')
    expect(next.design.sole).toEqual({ colorId: 'gum', finishId: 'matte' })
    expect(next.design.caps).toEqual({ colorId: 'royal', finishId: 'suede' })
  })

  test('recognises a colorway again when edits return to it', () => {
    const custom = configuratorReducer(initial(), { type: 'setColor', partId: 'laces', colorId: 'crimson' })

    const back = configuratorReducer(custom, { type: 'setColor', partId: 'laces', colorId: 'chalk' })

    expect(back.colorwayId).toBe('chalk')
  })

  test('selects a part and keeps the design untouched', () => {
    const state = initial()

    const next = configuratorReducer(state, { type: 'selectPart', partId: 'sole' })

    expect(next.selectedPartId).toBe('sole')
    expect(next.design).toBe(state.design)
  })

  test('accepts only sizes from the size run', () => {
    const state = initial()

    expect(configuratorReducer(state, { type: 'setSize', sizeId: '10.5' }).sizeId).toBe('10.5')
    expect(configuratorReducer(state, { type: 'setSize', sizeId: '22' })).toBe(state)
  })

  test('reset returns to the default design but keeps the chosen size', () => {
    const edited = [
      { type: 'applyColorway', colorwayId: 'sunset' },
      { type: 'setSize', sizeId: '9' },
      { type: 'selectPart', partId: 'sole' },
    ] as const
    const state = edited.reduce(configuratorReducer, initial())

    const next = configuratorReducer(state, { type: 'reset' })

    expect(next.colorwayId).toBe('chalk')
    expect(next.sizeId).toBe('9')
    expect(next.selectedPartId).toBe('mesh')
  })
})

describe('describeDesign', () => {
  test('lists each part with human-readable color and finish names in display order', () => {
    const lines = describeDesign(createInitialState().design)

    expect(lines).toHaveLength(8)
    expect(lines[0]).toEqual({
      partId: 'mesh',
      partLabel: 'Upper',
      colorName: 'Chalk White',
      colorHex: '#f4f4f2',
      finishName: 'Matte',
    })
    expect(lines.find((line) => line.partId === 'stripes')).toMatchObject({
      colorName: 'Onyx',
      finishName: 'Leather',
    })
  })
})
